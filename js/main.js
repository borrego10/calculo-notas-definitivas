import { abrirBaseDatos } from "./database/db.js";

const mensajeAcceso = document.querySelector("#access-message");

async function inicializarAplicacion() {
  try {
    await abrirBaseDatos();
    if (mensajeAcceso) {
      mensajeAcceso.textContent =
        "El almacenamiento local está listo. La identificación se habilitará en la Fase 3.";
    }
  } catch (error) {
    console.error("No fue posible inicializar el almacenamiento local.", error);
    if (mensajeAcceso) {
      mensajeAcceso.textContent =
        "No fue posible acceder al almacenamiento del navegador. Intenta recargar la página.";
      mensajeAcceso.classList.remove("notice-info");
      mensajeAcceso.classList.add("notice-error");
    }
  }
}

void inicializarAplicacion();