import { obtenerCodigoErrorDocumento } from "../utils/validaciones.js";

const MENSAJES_ACCESO = {
  "M-01": "Ingresa tu número de documento.",
  "M-02": "El número de documento no tiene un formato válido.",
  "M-15":
    "No fue posible acceder al almacenamiento del navegador. Intenta recargar la página.",
};

const formulario = document.querySelector("#form-access");
const campoDocumento = document.querySelector("#student-document");
const botonIngresar = formulario.querySelector('button[type="submit"]');
const mensajeAcceso = document.querySelector("#access-message");

function actualizarMensajeAcceso(mensaje, esError = false, codigo = null) {
  mensajeAcceso.textContent = mensaje;
  mensajeAcceso.classList.toggle("notice-error", esError);
  mensajeAcceso.classList.toggle("notice-info", !esError);

  if (codigo) {
    mensajeAcceso.dataset.errorCode = codigo;
  } else {
    delete mensajeAcceso.dataset.errorCode;
  }
}

export function mostrarEstadoAcceso(mensaje) {
  campoDocumento.removeAttribute("aria-invalid");
  campoDocumento.classList.remove("input-error");
  actualizarMensajeAcceso(mensaje);
}

export function mostrarErrorAcceso(codigo) {
  const codigoConocido = MENSAJES_ACCESO[codigo] ? codigo : "M-15";
  const esErrorDocumento = codigoConocido === "M-01" || codigoConocido === "M-02";

  if (esErrorDocumento) {
    campoDocumento.setAttribute("aria-invalid", "true");
    campoDocumento.classList.add("input-error");
    campoDocumento.focus();
  }

  actualizarMensajeAcceso(
    MENSAJES_ACCESO[codigoConocido],
    true,
    codigoConocido,
  );
}

export function inicializarLogin(identificar) {
  campoDocumento.addEventListener("input", () => {
    if (campoDocumento.getAttribute("aria-invalid") === "true") {
      campoDocumento.removeAttribute("aria-invalid");
      campoDocumento.classList.remove("input-error");
      actualizarMensajeAcceso(
        "Ingresa entre 5 y 15 dígitos, sin espacios.",
      );
    }
  });

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const codigoError = obtenerCodigoErrorDocumento(campoDocumento.value);
    if (codigoError) {
      mostrarErrorAcceso(codigoError);
      return;
    }

    botonIngresar.disabled = true;
    try {
      await identificar(campoDocumento.value);
      formulario.reset();
      campoDocumento.removeAttribute("aria-invalid");
      campoDocumento.classList.remove("input-error");
    } catch (error) {
      console.error("No fue posible completar la identificación.", error);
      mostrarErrorAcceso(error.code);
    } finally {
      botonIngresar.disabled = false;
    }
  });
}
