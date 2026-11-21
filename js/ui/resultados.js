const valorResultado = document.querySelector("#result-value");
const estadoResultado = document.querySelector("#result-status");
const fechaResultado = document.querySelector("#result-date");
const detalleResultado = document.querySelector("#result-evaluations");
const mensajeResultado = document.querySelector("#result-message");
const botonNuevoCalculo = document.querySelector("#new-calculation-button");
const botonHistorial = document.querySelector("#result-history-button");

function crearDetalleEvaluacion(evaluacion, indice) {
  const elemento = document.createElement("li");
  elemento.className = "evaluation-detail";
  elemento.textContent =
    `Evaluación ${indice + 1}: nota ${evaluacion.nota} · porcentaje ${evaluacion.porcentaje}%`;
  return elemento;
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString("es-CO");
}

export function inicializarResultados(
  mostrarVista,
  iniciarNuevoCalculo,
  abrirHistorial,
) {
  botonNuevoCalculo.addEventListener("click", iniciarNuevoCalculo);
  botonHistorial.addEventListener("click", () => {
    void abrirHistorial();
  });

  return (resultado, codigoAviso = null) => {
    valorResultado.textContent = resultado.definitiva.toFixed(2);
    estadoResultado.textContent = resultado.estado;
    estadoResultado.className = `result-status ${
      resultado.estado === "Aprobado"
        ? "result-status-approved"
        : "result-status-failed"
    }`;
    fechaResultado.textContent =
      `Calculada el ${formatearFecha(resultado.fecha)}`;
    detalleResultado.replaceChildren(
      ...resultado.notas.map(crearDetalleEvaluacion),
    );

    if (codigoAviso === "M-16") {
      mensajeResultado.textContent =
        "Tu nota fue calculada, pero no se pudo guardar en el historial.";
      mensajeResultado.classList.remove("notice-info");
      mensajeResultado.classList.add("notice-error");
      mensajeResultado.dataset.errorCode = "M-16";
    } else {
      mensajeResultado.textContent =
        "El cálculo se guardó correctamente en tu historial.";
      mensajeResultado.classList.remove("notice-error");
      mensajeResultado.classList.add("notice-info");
      delete mensajeResultado.dataset.errorCode;
    }

    mostrarVista("view-result");
  };
}
