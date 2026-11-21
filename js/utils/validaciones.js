export function obtenerCodigoErrorDocumento(documento) {
  if (typeof documento !== "string" || documento.trim() === "") {
    return "M-01";
  }

  if (!/^[0-9]{5,15}$/.test(documento)) {
    return "M-02";
  }

  return null;
}

export function analizarValorNumerico(entrada) {
  if (typeof entrada !== "string" && typeof entrada !== "number") {
    return { codigoError: "M-13" };
  }

  const texto = String(entrada).trim();
  if (texto === "") {
    return { codigoError: "M-12" };
  }

  const formatoNumerico = /^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/;
  if (!formatoNumerico.test(texto)) {
    return { codigoError: "M-13" };
  }

  const valor = Number(texto.replace(",", "."));
  if (!Number.isFinite(valor)) {
    return { codigoError: "M-13" };
  }

  const separadorDecimal = /[.,]/.exec(texto);
  const decimales = separadorDecimal
    ? texto.length - separadorDecimal.index - 1
    : 0;

  return { texto, valor, decimales, codigoError: null };
}
