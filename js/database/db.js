export const DB_NOMBRE = "NotasDefinitivasDB";
export const DB_VERSION = 1;

const STORE_USUARIOS = "usuarios";
const STORE_CALCULOS = "calculos";
const INDICE_DOCUMENTO = "idx_documento";

let aperturaPendiente = null;

export function abrirBaseDatos() {
  if (!globalThis.indexedDB) {
    return Promise.reject(
      new Error("IndexedDB no está disponible en este navegador."),
    );
  }

  if (aperturaPendiente) {
    return aperturaPendiente;
  }

  let solicitud;
  try {
    solicitud = indexedDB.open(DB_NOMBRE, DB_VERSION);
  } catch (error) {
    return Promise.reject(error);
  }

  let promesaApertura;
  promesaApertura = new Promise((resolve, reject) => {
    let finalizada = false;

    const fallar = (error) => {
      if (finalizada) {
        return;
      }

      finalizada = true;
      if (aperturaPendiente === promesaApertura) {
        aperturaPendiente = null;
      }
      reject(error);
    };

    solicitud.onupgradeneeded = () => {
      const base = solicitud.result;
      const transaccion = solicitud.transaction;

      if (!base.objectStoreNames.contains(STORE_USUARIOS)) {
        base.createObjectStore(STORE_USUARIOS, { keyPath: "documento" });
      }

      const calculos = base.objectStoreNames.contains(STORE_CALCULOS)
        ? transaccion.objectStore(STORE_CALCULOS)
        : base.createObjectStore(STORE_CALCULOS, {
            keyPath: "id",
            autoIncrement: true,
          });

      if (!calculos.indexNames.contains(INDICE_DOCUMENTO)) {
        calculos.createIndex(INDICE_DOCUMENTO, "documento", {
          unique: false,
        });
      }
    };

    solicitud.onblocked = () => {
      fallar(
        new Error("La apertura de IndexedDB está bloqueada por otra conexión."),
      );
    };

    solicitud.onerror = () => {
      fallar(
        solicitud.error ??
          new Error("No fue posible abrir la base de datos IndexedDB."),
      );
    };

    solicitud.onsuccess = () => {
      const base = solicitud.result;

      if (finalizada) {
        base.close();
        return;
      }

      finalizada = true;
      base.onversionchange = () => {
        base.close();
        if (aperturaPendiente === promesaApertura) {
          aperturaPendiente = null;
        }
      };
      resolve(base);
    };
  });

  aperturaPendiente = promesaApertura;
  return promesaApertura;
}

function ejecutarTransaccion(nombreAlmacen, modo, configurar) {
  return abrirBaseDatos().then(
    (base) =>
      new Promise((resolve, reject) => {
        let transaccion;
        let resultado;
        let errorConfiguracion = null;

        try {
          transaccion = base.transaction(nombreAlmacen, modo);
        } catch (error) {
          reject(error);
          return;
        }

        transaccion.oncomplete = () => resolve(resultado);
        transaccion.onerror = (evento) => evento.stopPropagation();
        transaccion.onabort = () => {
          reject(
            errorConfiguracion ??
              transaccion.error ??
              new Error("La transacción de IndexedDB fue cancelada."),
          );
        };

        try {
          configurar(transaccion.objectStore(nombreAlmacen), (valor) => {
            resultado = valor;
          });
        } catch (error) {
          errorConfiguracion = error;
          try {
            transaccion.abort();
          } catch {
            reject(error);
          }
        }
      }),
  );
}

export function obtenerUsuario(documento) {
  return ejecutarTransaccion(
    STORE_USUARIOS,
    "readonly",
    (usuarios, guardarResultado) => {
      const solicitud = usuarios.get(documento);
      solicitud.onsuccess = () => guardarResultado(solicitud.result ?? null);
    },
  );
}

export function registrarUsuario(documento) {
  return ejecutarTransaccion(
    STORE_USUARIOS,
    "readwrite",
    (usuarios, guardarResultado) => {
      const consulta = usuarios.get(documento);

      consulta.onsuccess = () => {
        if (consulta.result) {
          guardarResultado(consulta.result);
          return;
        }

        const usuario = {
          documento,
          fechaRegistro: new Date().toISOString(),
        };
        const insercion = usuarios.add(usuario);
        insercion.onsuccess = () => guardarResultado(usuario);
      };
    },
  );
}

export function guardarCalculo(calculo) {
  return ejecutarTransaccion(
    STORE_CALCULOS,
    "readwrite",
    (calculos, guardarResultado) => {
      const solicitud = calculos.add(calculo);
      solicitud.onsuccess = () => guardarResultado(solicitud.result);
    },
  );
}

export function obtenerCalculosPorDocumento(documento) {
  return ejecutarTransaccion(
    STORE_CALCULOS,
    "readonly",
    (calculos, guardarResultado) => {
      const solicitud = calculos
        .index(INDICE_DOCUMENTO)
        .getAll(documento);
      solicitud.onsuccess = () => guardarResultado(solicitud.result);
    },
  );
}
