import {
  guardarCalculo,
  obtenerCalculosPorDocumento,
  obtenerUsuario,
} from "../database/db.js";
import { obtenerCodigoErrorDocumento } from "../utils/validaciones.js";
import {
  resumirPorcentajes,
  validarCantidadEvaluaciones,
  validarNota,
  validarPorcentaje,
} from "./notaService.js";

function crearError(codigo, causa) {
  const error = new Error(codigo);
  error.code = codigo;
  if (causa) {
    error.cause = causa;
  }
  return error;
}

function obtenerEvaluacionesValidadas(evaluaciones) {
  if (!Array.isArray(evaluaciones)) {
    throw crearError("M-14");
  }

  const resultadoCantidad = validarCantidadEvaluaciones(evaluaciones.length);
  if (resultadoCantidad.codigoError) {
    throw crearError(resultadoCantidad.codigoError);
  }

  const notas = evaluaciones.map((evaluacion) => {
    const nota = validarNota(evaluacion?.nota);
    if (nota.codigoError) {
      throw crearError(nota.codigoError);
    }

    const porcentaje = validarPorcentaje(evaluacion?.porcentaje);
    if (porcentaje.codigoError) {
      throw crearError(porcentaje.codigoError);
    }

    return { nota: nota.valor, porcentaje: porcentaje.valor };
  });

  const resumen = resumirPorcentajes(
    notas.map(({ porcentaje }) => ({ porcentaje })),
  );
  if (resumen.totalCentesimas === null || resumen.hayValoresNoSumables) {
    throw crearError("M-14");
  }
  if (resumen.totalCentesimas < 10000) {
    throw crearError("M-10");
  }
  if (resumen.totalCentesimas > 10000) {
    throw crearError("M-11");
  }

  return notas;
}

export function calcularDefinitiva(evaluaciones) {
  const notas = obtenerEvaluacionesValidadas(evaluaciones);
  const resultadoSinRedondear =
    notas.reduce(
      (total, evaluacion) =>
        total + evaluacion.nota * evaluacion.porcentaje,
      0,
    ) / 100;

  if (
    !Number.isFinite(resultadoSinRedondear) ||
    resultadoSinRedondear < 0 ||
    resultadoSinRedondear > 5
  ) {
    throw crearError("M-14");
  }

  const definitiva =
    Math.round((resultadoSinRedondear + Number.EPSILON) * 100) / 100;
  if (!Number.isFinite(definitiva) || definitiva < 0 || definitiva > 5) {
    throw crearError("M-14");
  }

  return {
    notas,
    definitiva,
    estado: definitiva >= 3 ? "Aprobado" : "Reprobado",
    fecha: new Date().toISOString(),
  };
}

export async function calcularYGuardar(documento, evaluaciones) {
  const resultado = calcularDefinitiva(evaluaciones);
  if (obtenerCodigoErrorDocumento(documento)) {
    throw crearError("M-15");
  }

  let usuario;
  try {
    usuario = await obtenerUsuario(documento);
  } catch (error) {
    console.error(
      "No fue posible verificar al estudiante antes de guardar.",
      error,
    );
    throw crearError("M-15", error);
  }

  if (!usuario) {
    throw crearError("M-15");
  }

  try {
    await guardarCalculo({ documento, ...resultado });
  } catch (error) {
    console.error("No fue posible guardar el cálculo.", error);
    const errorGuardado = crearError("M-16", error);
    errorGuardado.resultado = resultado;
    throw errorGuardado;
  }

  return resultado;
}

export async function obtenerHistorial(documento) {
  if (obtenerCodigoErrorDocumento(documento)) {
    throw crearError("M-15");
  }

  try {
    const usuario = await obtenerUsuario(documento);
    if (!usuario) {
      throw crearError("M-15");
    }

    const calculos = await obtenerCalculosPorDocumento(documento);
    return calculos.sort(
      (primero, segundo) =>
        Date.parse(segundo.fecha) - Date.parse(primero.fecha) ||
        segundo.id - primero.id,
    );
  } catch (error) {
    console.error("No fue posible consultar el historial.", error);
    throw crearError("M-15", error);
  }
}
