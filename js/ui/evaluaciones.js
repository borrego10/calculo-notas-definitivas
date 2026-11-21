import {
  MAX_EVALUACIONES,
  MIN_EVALUACIONES,
  resumirPorcentajes,
  validarCantidadEvaluaciones,
  validarNota,
  validarPorcentaje,
} from "../services/notaService.js";

const MENSAJES = {
  "M-03": `La cantidad de evaluaciones debe ser al menos ${MIN_EVALUACIONES}.`,
  "M-04": `La cantidad máxima de evaluaciones es ${MAX_EVALUACIONES}.`,
  "M-05": "La cantidad de evaluaciones debe ser un número entero.",
  "M-06": "La nota no puede ser menor que 0.0. Corrige este campo.",
  "M-07": "La nota no puede ser mayor que 5.0. Corrige este campo.",
  "M-08": "El porcentaje no puede ser negativo.",
  "M-09": "El porcentaje no puede ser mayor que 100.",
  "M-12": "Completa este campo.",
  "M-13": "Ingresa un valor numérico válido.",
};

const formConfiguracion = document.querySelector("#form-configuration");
const campoCantidad = document.querySelector("#evaluation-count");
const mensajeConfiguracion = document.querySelector("#configuration-message");
const listaEvaluaciones = document.querySelector("#evaluations-list");
const resumenPorcentajes = document.querySelector("#percentage-summary");
const botonCambiarCantidad = document.querySelector("#change-quantity-button");

const camposEvaluaciones = [];
let cantidadActual = 0;
let intentoConfigurar = false;

function mostrarAviso(elemento, mensaje, esError, codigoError = null) {
  elemento.textContent = mensaje;
  elemento.classList.toggle("notice-error", esError);
  elemento.classList.toggle("notice-info", !esError);

  if (codigoError) {
    elemento.dataset.errorCode = codigoError;
  } else {
    delete elemento.dataset.errorCode;
  }
}

function obtenerMensajeCampo(resultado, tipo) {
  if (
    tipo === "porcentaje" &&
    resultado.codigoError === "M-13" &&
    resultado.decimales > 2
  ) {
    return "El porcentaje admite máximo dos decimales.";
  }

  return MENSAJES[resultado.codigoError] ?? "";
}

function mostrarErrorCampo(campo, resultado, tipo) {
  const { entrada, mensaje } = campo;
  const codigoError = resultado.codigoError;
  const tieneError = Boolean(codigoError);

  entrada.classList.toggle("input-error", tieneError);
  if (tieneError) {
    entrada.setAttribute("aria-invalid", "true");
  } else {
    entrada.removeAttribute("aria-invalid");
  }
  mensaje.textContent = obtenerMensajeCampo(resultado, tipo);

  if (codigoError) {
    mensaje.dataset.errorCode = codigoError;
  } else {
    delete mensaje.dataset.errorCode;
  }
}

function limpiarErrorConfiguracion() {
  campoCantidad.classList.remove("input-error");
  campoCantidad.removeAttribute("aria-invalid");
  mostrarAviso(
    mensajeConfiguracion,
    `Escribe un número entero entre ${MIN_EVALUACIONES} y ${MAX_EVALUACIONES}.`,
    false,
  );
}

function validarCantidadEnPantalla(enviarFoco = false) {
  const resultado = validarCantidadEvaluaciones(campoCantidad.value);
  const tieneError = Boolean(resultado.codigoError);
  campoCantidad.classList.toggle("input-error", tieneError);

  if (tieneError) {
    campoCantidad.setAttribute("aria-invalid", "true");
  } else {
    campoCantidad.removeAttribute("aria-invalid");
  }

  if (tieneError) {
    mostrarAviso(
      mensajeConfiguracion,
      MENSAJES[resultado.codigoError],
      true,
      resultado.codigoError,
    );
    if (enviarFoco) {
      campoCantidad.focus();
    }
    return null;
  }

  limpiarErrorConfiguracion();
  return resultado.valor;
}

function crearCampo(numero, tipo) {
  const esNota = tipo === "nota";
  const grupo = document.createElement("div");
  grupo.className = "evaluation-field";

  const etiqueta = document.createElement("label");
  etiqueta.htmlFor = `evaluation-${tipo}-${numero}`;
  etiqueta.textContent = esNota ? "Nota (0 a 5)" : "Porcentaje (%)";

  const entrada = document.createElement("input");
  entrada.id = etiqueta.htmlFor;
  entrada.name = entrada.id;
  entrada.type = "text";
  entrada.inputMode = "decimal";
  entrada.autocomplete = "off";
  entrada.spellcheck = false;
  entrada.placeholder = esNota ? "Ej. 4.0" : "Ej. 30.00";
  entrada.dataset.tipo = tipo;
  entrada.setAttribute(
    "aria-describedby",
    `${entrada.id}-help ${entrada.id}-error`,
  );

  const ayuda = document.createElement("p");
  ayuda.id = `${entrada.id}-help`;
  ayuda.className = "field-help evaluation-help";
  ayuda.textContent = esNota
    ? "Admite decimales sin límite de dígitos."
    : "Admite hasta dos decimales.";

  const mensaje = document.createElement("p");
  mensaje.id = `${entrada.id}-error`;
  mensaje.className = "field-error";
  mensaje.setAttribute("role", "status");
  mensaje.setAttribute("aria-live", "polite");

  grupo.append(etiqueta, entrada, ayuda, mensaje);
  return { grupo, entrada, mensaje, tipo };
}

function crearFila(numero) {
  const fila = document.createElement("article");
  fila.className = "evaluation-row";
  fila.setAttribute("aria-labelledby", `evaluation-title-${numero}`);

  const titulo = document.createElement("h2");
  titulo.id = `evaluation-title-${numero}`;
  titulo.className = "evaluation-title";
  titulo.textContent = `Evaluación ${numero}`;

  const campos = document.createElement("div");
  campos.className = "evaluation-fields";

  const nota = crearCampo(numero, "nota");
  const porcentaje = crearCampo(numero, "porcentaje");
  camposEvaluaciones.push(nota, porcentaje);
  campos.append(nota.grupo, porcentaje.grupo);
  fila.append(titulo, campos);

  for (const campo of [nota, porcentaje]) {
    campo.entrada.addEventListener("input", () => {
      const resultado =
        campo.tipo === "nota"
          ? validarNota(campo.entrada.value)
          : validarPorcentaje(campo.entrada.value);
      mostrarErrorCampo(campo, resultado, campo.tipo);
      actualizarResumenPorcentajes();
    });
  }

  return fila;
}

function formatearCentesimas(centesimas) {
  const signo = centesimas < 0 ? "-" : "";
  const valorAbsoluto = Math.abs(centesimas);
  const parteEntera = Math.floor(valorAbsoluto / 100);
  const parteDecimal = String(valorAbsoluto % 100).padStart(2, "0");
  return `${signo}${parteEntera}.${parteDecimal}`;
}

function actualizarResumenPorcentajes() {
  const camposPorcentaje = camposEvaluaciones.filter(
    (campo) => campo.tipo === "porcentaje",
  );
  const resumen = resumirPorcentajes(
    camposPorcentaje.map((campo) => ({ porcentaje: campo.entrada.value })),
  );
  const { totalCentesimas: total, hayValoresNoSumables } = resumen;

  if (total === null) {
    mostrarAviso(
      resumenPorcentajes,
      "No fue posible sumar los porcentajes. Corrige los valores ingresados.",
      true,
    );
    return;
  }

  if (hayValoresNoSumables) {
    mostrarAviso(
      resumenPorcentajes,
      `Suma parcial: ${formatearCentesimas(total)}%. Corrige los porcentajes no válidos para completar la suma.`,
      true,
    );
    return;
  }

  const textoSuma = `${formatearCentesimas(total)}%`;
  if (total < 10000) {
    const faltante = formatearCentesimas(10000 - total);
    mostrarAviso(
      resumenPorcentajes,
      `Los porcentajes suman ${textoSuma}. Faltan ${faltante}% para completar el 100%.`,
      true,
      "M-10",
    );
    return;
  }

  if (total > 10000) {
    const sobrante = formatearCentesimas(total - 10000);
    mostrarAviso(
      resumenPorcentajes,
      `Los porcentajes suman ${textoSuma}. Sobran ${sobrante}% para llegar al 100%.`,
      true,
      "M-11",
    );
    return;
  }

  const todosValidos = camposPorcentaje.every(
    (campo) =>
      campo.entrada.value.trim() !== "" &&
      validarPorcentaje(campo.entrada.value).codigoError === null,
  );
  mostrarAviso(
    resumenPorcentajes,
    todosValidos
      ? `Los porcentajes suman ${textoSuma} exactamente.`
      : `La suma parcial es ${textoSuma}. Completa y corrige los porcentajes restantes.`,
    !todosValidos,
  );
}

function generarEvaluaciones(cantidad, mostrarVista) {
  cantidadActual = cantidad;
  camposEvaluaciones.length = 0;
  const filas = Array.from({ length: cantidad }, (_, indice) =>
    crearFila(indice + 1),
  );
  listaEvaluaciones.replaceChildren(...filas);
  actualizarResumenPorcentajes();
  mostrarVista("view-evaluations");
}

function manejarConfiguracion(evento, mostrarVista) {
  evento.preventDefault();
  intentoConfigurar = true;

  const cantidad = validarCantidadEnPantalla(true);
  if (cantidad === null) {
    return;
  }

  intentoConfigurar = false;
  generarEvaluaciones(cantidad, mostrarVista);
}

function manejarCambioCantidad(mostrarVista) {
  campoCantidad.value = String(cantidadActual);
  limpiarErrorConfiguracion();
  mostrarVista("view-configuration");
  campoCantidad.focus();
}

function reiniciarFlujoNotas() {
  cantidadActual = 0;
  intentoConfigurar = false;
  formConfiguracion.reset();
  limpiarErrorConfiguracion();
  camposEvaluaciones.length = 0;

  const mensajeVacio = document.createElement("p");
  mensajeVacio.className = "empty-state";
  mensajeVacio.textContent =
    "Los campos de evaluación se generarán dinámicamente.";
  listaEvaluaciones.replaceChildren(mensajeVacio);
  mostrarAviso(
    resumenPorcentajes,
    "Ingresa los porcentajes para revisar su suma.",
    false,
  );
}

export function inicializarEvaluaciones(mostrarVista) {
  limpiarErrorConfiguracion();
  formConfiguracion.addEventListener("submit", (evento) => {
    manejarConfiguracion(evento, mostrarVista);
  });
  campoCantidad.addEventListener("input", () => {
    if (intentoConfigurar) {
      validarCantidadEnPantalla();
    }
  });
  botonCambiarCantidad.addEventListener("click", () => {
    manejarCambioCantidad(mostrarVista);
  });

  return reiniciarFlujoNotas;
}
