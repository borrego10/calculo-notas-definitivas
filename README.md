# Software de Cálculo de Notas Definitivas

Aplicación web académica para calcular promedios ponderados y consultar el
historial de resultados de un estudiante en el mismo navegador.

> **Estado del proyecto:** Fase 5 — cálculo ponderado, resultados y consulta
> del historial implementados. La publicación y regresión en Vercel corresponden
> a la Fase 6.

## Objetivo

Construir, por fases, una aplicación de una sola página que permita identificarse
por documento, registrar evaluaciones ponderadas, conocer la nota definitiva y
consultar el historial local.

## Funcionalidades

- Identificación y registro local del estudiante por documento, sin contraseña.
- Sesión de pestaña mediante `sessionStorage`.
- Configuración de 1 a 20 evaluaciones y generación dinámica de campos.
- Validación de notas entre 0 y 5 y porcentajes entre 0 y 100.
- Suma porcentual en centésimas, con faltantes y sobrantes informados.
- Cálculo ponderado, definitiva a dos decimales y estado académico.
- Guardado independiente de cada cálculo e historial inmutable por estudiante.
- Resultado con detalle de evaluaciones y opciones para un nuevo cálculo o
  consultar el historial.

## Tecnologías y arquitectura

- HTML5 y CSS3.
- JavaScript Vanilla ES6 mediante módulos.
- IndexedDB para estudiantes y cálculos.
- `sessionStorage` únicamente para el documento de la sesión activa.
- Validación del documento de 5 a 15 dígitos.
- Recuperación de la sesión al recargar la misma pestaña.
- Evaluaciones de 1 a 20, notas de 0 a 5 y porcentajes entre 0 y 100.
- Notas con decimales sin límite propio; porcentajes con hasta dos decimales.
- Acepta punto o coma como separador decimal en los campos numéricos.
- Vercel como destino de despliegue estático.

No se incorporan frameworks, librerías externas, backend ni almacenamiento
principal en `localStorage`.

La aplicación se organiza en capas: `js/ui/` para presentación,
`js/services/` para reglas y operaciones de negocio, `js/database/` para acceso
a IndexedDB, `js/utils/` para validaciones reutilizables y `js/main.js` para
inicialización y navegación. Las reglas de entrada residen en
`js/services/notaService.js`; el cálculo, redondeo, guardado y consulta en
`js/services/calculoService.js`. Las pantallas se encuentran en
`js/ui/evaluaciones.js`, `js/ui/resultados.js` y `js/ui/historial.js`.

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
    │   └── db.js
    ├── services/
    │   ├── calculoService.js
    │   ├── notaService.js
    │   └── usuarioService.js
    ├── ui/
    │   ├── evaluaciones.js
    │   ├── historial.js
    │   ├── login.js
    │   └── resultados.js
    └── utils/
        └── validaciones.js
```

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
  notas como objetos `{ nota, porcentaje }`, definitiva y estado. El índice no
  único `idx_documento` consulta los registros asociados a un documento.
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

## Reglas de negocio

- Entre 1 y 20 evaluaciones enteras.
- Cada nota debe estar entre 0 y 5.
- Los porcentajes deben sumar exactamente 100.
- La definitiva será la suma de cada nota multiplicada por su porcentaje y
  dividida por 100.
- No se redondean las notas individuales; la definitiva se redondea una vez a
  dos decimales con el método de referencia de JavaScript.
- El estado se determina sobre la definitiva redondeada: Aprobado desde 3.00;
  Reprobado por debajo de 3.00.
- Cada cálculo válido generará un registro independiente.
- El historial será de solo lectura y filtrado por documento.

## Plan de pruebas

El Documento Maestro define PR-01 a PR-32. En Fase 3 se ejecutaron PR-01 a
PR-07 y PR-09 a PR-10; PR-08 quedó parcial. En Fase 4 se ejecutaron PR-11 a
PR-14 y las validaciones de campos de PR-18. En Fase 5 se validaron
sintácticamente los módulos JavaScript y se probaron el cálculo de ejemplo
(4.05), los tres casos de redondeo PR-17, el límite de aprobación, el bloqueo de
porcentajes distintos de 100, el guardado/consulta del historial y el
aislamiento entre estudiantes. No todas las PR-01 a PR-32 han sido ejecutadas
en producción; la regresión completa en la URL pública corresponde a la Fase 6.

## Limitaciones conocidas

- Los datos futuros dependerán del navegador y dispositivo donde se creen.
- Identificarse por documento no constituye autenticación segura.
- La persistencia local depende de IndexedDB y del almacenamiento disponible
  en el navegador; no se sincroniza entre dispositivos.

## Despliegue

La aplicación se despliega como sitio estático, con `index.html` en la raíz y
rutas relativas. La publicación y verificación en Vercel corresponden a la
Fase 6.
