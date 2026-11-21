export function obtenerCodigoErrorDocumento(documento) {
  if (typeof documento !== "string" || documento.trim() === "") {
    return "M-01";
  }

  if (!/^[0-9]{5,15}$/.test(documento)) {
    return "M-02";
  }

  return null;
}
