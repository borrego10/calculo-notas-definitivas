import { obtenerUsuario, registrarUsuario } from "../database/db.js";
import { obtenerCodigoErrorDocumento } from "../utils/validaciones.js";

export const CLAVE_SESION = "documentoActivo";

function crearErrorValidacion(codigo) {
  const error = new Error(codigo);
  error.code = codigo;
  return error;
}

function crearErrorAlmacenamiento(causa) {
  const error = new Error(
    "No fue posible acceder al almacenamiento del navegador.",
  );
  error.code = "M-15";
  error.cause = causa;
  return error;
}

function obtenerAlmacenamientoSesion() {
  try {
    const almacenamiento = globalThis.sessionStorage;
    if (!almacenamiento) {
      throw new Error("sessionStorage no está disponible.");
    }
    return almacenamiento;
  } catch (error) {
    throw crearErrorAlmacenamiento(error);
  }
}

function eliminarDocumentoSesion(almacenamiento) {
  try {
    almacenamiento.removeItem(CLAVE_SESION);
  } catch (error) {
    throw crearErrorAlmacenamiento(error);
  }
}

export async function identificarEstudiante(documento) {
  const codigoError = obtenerCodigoErrorDocumento(documento);
  if (codigoError) {
    throw crearErrorValidacion(codigoError);
  }

  const almacenamiento = obtenerAlmacenamientoSesion();
  const usuario = await registrarUsuario(documento);

  try {
    almacenamiento.setItem(CLAVE_SESION, documento);
  } catch (error) {
    throw crearErrorAlmacenamiento(error);
  }

  return usuario;
}

export async function recuperarSesion() {
  const almacenamiento = obtenerAlmacenamientoSesion();
  let documento;

  try {
    documento = almacenamiento.getItem(CLAVE_SESION);
  } catch (error) {
    throw crearErrorAlmacenamiento(error);
  }

  if (documento === null) {
    return null;
  }

  if (obtenerCodigoErrorDocumento(documento)) {
    eliminarDocumentoSesion(almacenamiento);
    return null;
  }

  const usuario = await obtenerUsuario(documento);
  if (usuario) {
    return usuario;
  }

  eliminarDocumentoSesion(almacenamiento);
  return null;
}

export function cerrarSesion() {
  eliminarDocumentoSesion(obtenerAlmacenamientoSesion());
}
