# Software de Cálculo de Notas Definitivas

Aplicación web académica para calcular promedios ponderados y consultar el
historial de resultados de un estudiante en el mismo navegador.

> **Estado del proyecto:** Fase 3 — IndexedDB, identificación y sesión local
> implementadas. La configuración, el cálculo y el historial siguen pendientes.

## Objetivo

Construir, por fases, una aplicación de una sola página que permita identificarse
por documento, registrar evaluaciones ponderadas, conocer la nota definitiva y
consultar el historial local.

## Funcionalidades previstas

- Identificación y registro local del estudiante por documento, sin contraseña.
- Sesión de pestaña mediante `sessionStorage`.
- Configuración de 1 a 20 evaluaciones.
- Validación de notas entre 0 y 5 y de porcentajes que sumen 100.
- Cálculo ponderado, redondeo a dos decimales y estado académico.
- Historial local, independiente por estudiante y de solo lectura.

La Fase 2 implementa IndexedDB; la Fase 3 añade identificación, registro
automático y sesión por pestaña. La configuración de evaluaciones, el cálculo
y el historial aún no están disponibles.

## Tecnologías y arquitectura

- HTML5 y CSS3.
- JavaScript Vanilla ES6 mediante módulos.
- IndexedDB para estudiantes y cálculos.
- `sessionStorage` únicamente para el documento de la sesión activa.
- Validación del documento de 5 a 15 dígitos.
- Recuperación de la sesión al recargar la misma pestaña.
- Vercel como destino de despliegue estático.

No se incorporan frameworks, librerías externas, backend ni almacenamiento
principal en `localStorage`.

La aplicación se organiza en capas: `js/ui/` para presentación,
`js/services/` para reglas y operaciones de negocio, `js/database/` para acceso
a IndexedDB, `js/utils/` para validaciones reutilizables y `js/main.js` para
inicialización y navegación.

## Estructura inicial

```text
calculo-notas-definitivas/
├── index.html
├── README.md
├── .gitignore
├── css/
│   └── styles.css
└── js/
    ├── main.js
    ├── database/
    ├── services/
    ├── ui/
    └── utils/
```

Los módulos de las capas se irán agregando en las fases aprobadas; las carpetas
vacías se conservan en Git mediante archivos `.gitkeep`.

## Requisitos para ejecutar

Se necesita un navegador moderno y un servidor HTTP estático. Los módulos ES6
deben servirse por HTTP; no se debe abrir `index.html` con una dirección
`file://`.

### Ejecución local en Visual Studio Code

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Usa una extensión de servidor estático disponible en tu entorno (por
   ejemplo, Live Server) y sirve `index.html`.
3. Abre en el navegador la dirección HTTP local que indique el servidor.

La extensión es solo una herramienta de desarrollo local; no es dependencia de
la aplicación ni se descarga al desplegarla.

## Modelo de datos implementado

La aplicación abre la base IndexedDB `NotasDefinitivasDB` (versión 1):

- `usuarios`: clave primaria `documento` y `fechaRegistro` en formato ISO 8601.
- `calculos`: clave autoincremental `id`, documento del estudiante, fecha,
  notas, definitiva y estado. El índice no único `idx_documento` consulta los
  registros asociados a un documento.
- Operaciones disponibles: abrir la base; consultar y registrar usuarios;
  insertar cálculos independientes; y consultar cálculos por documento.

Las escrituras se resuelven al completarse la transacción. No se exponen
operaciones de edición o borrado de cálculos.

Los datos permanecerán en el navegador de cada usuario; no se sincronizan entre
dispositivos.

## Identificación y sesión

El estudiante se identifica con un documento de 5 a 15 dígitos, sin espacios.
Si aún no existe en `usuarios`, se registra con `fechaRegistro` ISO 8601. La
sesión guarda únicamente el documento bajo la clave `documentoActivo` en
`sessionStorage`; al recargar se comprueba el registro en IndexedDB. Cerrar
sesión elimina esa clave, pero conserva al estudiante y los cálculos.

Si `sessionStorage` no está disponible, los estados que requieren sesión se
bloquean y se muestra el mensaje de almacenamiento. Esta identificación no es
autenticación segura.

## Reglas de negocio previstas

- Entre 1 y 20 evaluaciones enteras.
- Cada nota debe estar entre 0 y 5.
- Los porcentajes deben sumar exactamente 100.
- La definitiva será la suma de cada nota multiplicada por su porcentaje y
  dividida por 100.
- La nota se mostrará con dos decimales; se aprobará desde 3.00.
- Cada cálculo válido generará un registro independiente.
- El historial será de solo lectura y filtrado por documento.

## Plan de pruebas

El Documento Maestro define 32 pruebas funcionales (PR-01 a PR-32) para
identificación, sesión, entradas, cálculo, redondeo, persistencia, historial,
aislamiento y fallos de almacenamiento. En la Fase 2 se verificaron el esquema
IndexedDB, reapertura, operaciones de lectura/escritura, aislamiento por índice
y fallos de almacenamiento. En la Fase 3 se ejecutaron PR-01 a PR-07 y PR-09 a
PR-10; PR-08 se verificó parcialmente para cierre, recarga y reingreso. La
conservación del historial indicada por PR-08 queda pendiente hasta la Fase 5.
No se reportan aún como probadas las funcionalidades pendientes.

## Limitaciones conocidas

- La configuración, el registro de notas, el cálculo y el historial siguen
  como vistas estáticas hasta sus fases correspondientes.
- Los datos futuros dependerán del navegador y dispositivo donde se creen.
- Identificarse por documento no constituye autenticación segura.

## Despliegue

La aplicación se preparará para Vercel como sitio estático, con `index.html` en
la raíz del proyecto y rutas relativas. El despliegue y la verificación en
producción pertenecen a la Fase 6; no se ha publicado una URL.
