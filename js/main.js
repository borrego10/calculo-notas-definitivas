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
import { inicializarEvaluaciones } from "./ui/evaluaciones.js";

const vistas = document.querySelectorAll(".view");
const documentosActivos = document.querySelectorAll("[data-active-document]");
const mensajesSesion = document.querySelectorAll("[data-session-message]");
const botonesCerrarSesion = document.querySelectorAll('[data-action="logout"]');

function mostrarVista(idVista) {
  vistas.forEach((vista) => {
    vista.hidden = vista.id !== idVista;
  });
}

const reiniciarFlujoNotas = inicializarEvaluaciones(mostrarVista);

function mostrarPanelPrincipal(usuario) {
  documentosActivos.forEach((elemento) => {
    elemento.textContent = usuario.documento;
  });
  mensajesSesion.forEach((mensaje) => {
    mensaje.textContent = "Tu sesión está activa en esta pestaña.";
    mensaje.classList.remove("notice-error");
    mensaje.classList.add("notice-info");
  });
  mostrarVista("view-configuration");
}

async function identificar(documento) {
  const usuario = await identificarEstudiante(documento);
  mostrarPanelPrincipal(usuario);
}

function manejarCierreSesion() {
  try {
    cerrarSesion();
    reiniciarFlujoNotas();
    documentosActivos.forEach((elemento) => {
      elemento.textContent = "";
    });
    mensajesSesion.forEach((mensaje) => {
      mensaje.textContent = "";
      mensaje.classList.remove("notice-error");
      mensaje.classList.add("notice-info");
      delete mensaje.dataset.errorCode;
    });
    mostrarVista("view-access");
    mostrarEstadoAcceso("Sesión cerrada. Ingresa tu documento para continuar.");
  } catch (error) {
    console.error("No fue posible cerrar la sesión.", error);
    mensajesSesion.forEach((mensaje) => {
      mensaje.textContent =
        "No fue posible acceder al almacenamiento del navegador. Intenta recargar la página.";
      mensaje.classList.remove("notice-info");
      mensaje.classList.add("notice-error");
      mensaje.dataset.errorCode = "M-15";
    });
  }
}

async function inicializarAplicacion() {
  inicializarLogin(identificar);
  botonesCerrarSesion.forEach((boton) => {
    boton.addEventListener("click", manejarCierreSesion);
  });

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