import { analizarValorNumerico } from "../utils/validaciones.js";

export const MIN_EVALUACIONES = 1;
export const MAX_EVALUACIONES = 20;
export const NOTA_MIN = 0;
export const NOTA_MAX = 5;
export const PORCENTAJE_MIN = 0;
export const PORCENTAJE_MAX = 100;
export const MAX_DECIMALES_PORCENTAJE = 2;

function convertirACentesimas(texto) {
  const signoNegativo = texto.startsWith("-");
  const valorSinSigno = texto.replace(/^[+-]/, "").replace(",", ".");
  const [parteEntera, parteDecimal = ""] = valorSinSigno.split(".");
  const entero = Number(parteEntera || "0");

  if (!Number.isSafeInteger(entero)) {
    return null;
  }

  const centesimas =
    entero * 100 + Number(parteDecimal.padEnd(2, "0").slice(0, 2) || "0");
  if (!Number.isSafeInteger(centesimas)) {
    return null;
  }

  return signoNegativo ? -centesimas : centesimas;
}

export function validarCantidadEvaluaciones(entrada) {
  const resultado = analizarValorNumerico(entrada);
  if (resultado.codigoError) {
    return resultado;
  }

  if (!Number.isInteger(resultado.valor)) {
    return { ...resultado, codigoError: "M-05" };
  }

  if (resultado.valor < MIN_EVALUACIONES) {
    return { ...resultado, codigoError: "M-03" };
  }

  if (resultado.valor > MAX_EVALUACIONES) {
    return { ...resultado, codigoError: "M-04" };
  }

  return resultado;
}

export function validarNota(entrada) {
  const resultado = analizarValorNumerico(entrada);
  if (resultado.codigoError) {
    return resultado;
  }

  if (resultado.valor < NOTA_MIN) {
    return { ...resultado, codigoError: "M-06" };
  }

  if (resultado.valor > NOTA_MAX) {
    return { ...resultado, codigoError: "M-07" };
  }

  return resultado;
}

export function validarPorcentaje(entrada) {
  const resultado = analizarValorNumerico(entrada);
  if (resultado.codigoError) {
    return resultado;
  }

  if (resultado.decimales > MAX_DECIMALES_PORCENTAJE) {
    return { ...resultado, codigoError: "M-13", centesimas: null };
  }

  const centesimas = convertirACentesimas(resultado.texto);
  if (resultado.valor < PORCENTAJE_MIN) {
    return { ...resultado, codigoError: "M-08", centesimas };
  }

  if (resultado.valor > PORCENTAJE_MAX) {
    return { ...resultado, codigoError: "M-09", centesimas };
  }

  return { ...resultado, codigoError: null, centesimas };
}

export function resumirPorcentajes(evaluaciones) {
  let totalCentesimas = 0;
  let hayValoresNoSumables = false;

  for (const evaluacion of evaluaciones) {
    const resultado = validarPorcentaje(evaluacion.porcentaje);
    if (Number.isSafeInteger(resultado.centesimas)) {
      totalCentesimas += resultado.centesimas;
    } else if (
      String(evaluacion.porcentaje ?? "").trim() !== "" &&
      resultado.codigoError !== "M-12"
    ) {
      hayValoresNoSumables = true;
    }

    if (!Number.isSafeInteger(totalCentesimas)) {
      return { totalCentesimas: null, hayValoresNoSumables: true };
    }
  }

  return { totalCentesimas, hayValoresNoSumables };
}
