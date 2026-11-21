import { abrirBaseDatos } from "./database/db.js";
import {
  cerrarSesion,
  identificarEstudiante,
  recuperarSesion,
} from "./services/usuarioService.js";
import {
  inicializarLogin,
  mostrarErrorAcceso,
  mostrarEstadoAcceso,
} from "./ui/login.js";

const vistas = document.querySelectorAll(".view");
const documentoActivo = document.querySelector("#active-document");
const mensajeSesion = document.querySelector("#session-message");
const botonCerrarSesion = document.querySelector("#logout-button");

function mostrarVista(idVista) {
  vistas.forEach((vista) => {
    vista.hidden = vista.id !== idVista;
  });
}

function mostrarPanelPrincipal(usuario) {
  documentoActivo.textContent = usuario.documento;
  mensajeSesion.textContent = "Tu sesión está activa en esta pestaña.";
  mensajeSesion.classList.remove("notice-error");
  mensajeSesion.classList.add("notice-info");
  mostrarVista("view-configuration");
}

async function identificar(documento) {
  const usuario = await identificarEstudiante(documento);
  mostrarPanelPrincipal(usuario);
}

function manejarCierreSesion() {
  try {
    cerrarSesion();
    documentoActivo.textContent = "";
    mensajeSesion.textContent = "";
    mensajeSesion.classList.remove("notice-error");
    mensajeSesion.classList.add("notice-info");
    mostrarVista("view-access");
    mostrarEstadoAcceso("Sesión cerrada. Ingresa tu documento para continuar.");
  } catch (error) {
    console.error("No fue posible cerrar la sesión.", error);
    mensajeSesion.textContent =
      "No fue posible acceder al almacenamiento del navegador. Intenta recargar la página.";
    mensajeSesion.classList.remove("notice-info");
    mensajeSesion.classList.add("notice-error");
  }
}

async function inicializarAplicacion() {
  inicializarLogin(identificar);
  botonCerrarSesion.addEventListener("click", manejarCierreSesion);

  try {
    await abrirBaseDatos();
    const usuario = await recuperarSesion();

    if (usuario) {
      mostrarPanelPrincipal(usuario);
      return;
    }

    mostrarVista("view-access");
    mostrarEstadoAcceso(
      "El almacenamiento local está listo. Ingresa tu documento para continuar.",
    );
  } catch (error) {
    console.error("No fue posible inicializar la aplicación.", error);
    mostrarVista("view-access");
    mostrarErrorAcceso("M-15");
  }
}

void inicializarAplicacion();