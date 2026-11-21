import { obtenerHistorial } from "../services/calculoService.js";

const listaHistorial = document.querySelector("#history-list");
const mensajeHistorial = document.querySelector("#history-message");
const botonesHistorial = document.querySelectorAll('[data-action="history"]');
const botonVolver = document.querySelector("#history-back-button");

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) {
    elemento.className = clase;
  }
  elemento.textContent = texto;
  return elemento;
}

function crearRegistro(calculo) {
  const registro = document.createElement("article");
  registro.className = "history-record";

  const encabezado = document.createElement("div");
  encabezado.className = "history-record-heading";
  encabezado.append(
    crearElemento(
      "p",
      "history-record-date",
      new Date(calculo.fecha).toLocaleString("es-CO"),
    ),
    crearElemento(
      "p",
      "history-record-grade",
      `${calculo.definitiva.toFixed(2)} · ${calculo.estado}`,
    ),
  );

  const evaluaciones = document.createElement("ul");
  evaluaciones.className = "history-evaluations";
  calculo.notas.forEach((evaluacion, indice) => {
    evaluaciones.append(
      crearElemento(
        "li",
        "",
        `Evaluación ${indice + 1}: nota ${evaluacion.nota} · porcentaje ${evaluacion.porcentaje}%`,
      ),
    );
  });

  registro.append(encabezado, evaluaciones);
  return registro;
}

function mostrarMensaje(mensaje, esError, codigo = null) {
  mensajeHistorial.textContent = mensaje;
  mensajeHistorial.classList.toggle("notice-error", esError);
  mensajeHistorial.classList.toggle("notice-info", !esError);

  if (codigo) {
    mensajeHistorial.dataset.errorCode = codigo;
  } else {
    delete mensajeHistorial.dataset.errorCode;
  }
}

function mostrarHistorialVacio() {
  const estadoVacio = document.createElement("div");
  estadoVacio.className = "empty-state";
  estadoVacio.append(
    crearElemento("span", "empty-state-mark", "—"),
    crearElemento("p", "", "Aún no tienes cálculos guardados."),
  );
  listaHistorial.replaceChildren(estadoVacio);
  mostrarMensaje("Aún no tienes cálculos guardados.", false, "M-17");
}

async function cargarHistorial(mostrarVista, obtenerDocumentoActivo) {
  mostrarVista("view-history");
  listaHistorial.replaceChildren();
  mostrarMensaje("Consultando tu historial…", false);

  let calculos;
  try {
    calculos = await obtenerHistorial(obtenerDocumentoActivo());
  } catch (error) {
    listaHistorial.replaceChildren();
    mostrarMensaje(
      "No fue posible acceder al almacenamiento del navegador. Intenta recargar la página.",
      true,
      "M-15",
    );
    if (error.code !== "M-15") {
      console.error(
        "Ocurrió un error inesperado al mostrar el historial.",
        error,
      );
    }
    return;
  }

  if (calculos.length === 0) {
    mostrarHistorialVacio();
    return;
  }

  listaHistorial.replaceChildren(...calculos.map(crearRegistro));
  mostrarMensaje(
    `Se encontraron ${calculos.length} ${calculos.length === 1 ? "cálculo" : "cálculos"}.`,
    false,
  );
}

export function inicializarHistorial(mostrarVista, obtenerDocumentoActivo) {
  const abrir = () => cargarHistorial(mostrarVista, obtenerDocumentoActivo);
  botonesHistorial.forEach((boton) => {
    boton.addEventListener("click", () => {
      void abrir();
    });
  });
  botonVolver.addEventListener("click", () => {
    mostrarVista("view-configuration");
  });
  return abrir;
}
