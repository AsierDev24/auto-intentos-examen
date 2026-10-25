# AutoExamen

Aplicación de escritorio para Windows 10/11, basada en Vue 3 y Tauri 2.

Aplicación web para practicar exámenes tipo test a partir de dos archivos PDF:
el PDF con las preguntas y el PDF con la plantilla de respuestas.

La aplicación extrae el texto con PDF.js y utiliza OCR con Tesseract.js cuando el PDF está escaneado. Después detecta las preguntas, fusiona sus respuestas correctas y permite realizar el examen y calcular la nota.

El worker de PDF.js, el worker de Tesseract y el core WASM se empaquetan
localmente. Los modelos comprimidos `spa.traineddata.gz` y
`eng.traineddata.gz` deben estar disponibles en `public/tesseract-data/` para
cerrar la distribución OCR sin conexión; este checkout todavía no los incluye
y por eso esa validación queda pendiente.

## Funciones

- Importación de examen y plantilla de respuestas en PDF.
- OCR para documentos escaneados.
- Corrección automática con penalización configurable.
- Configuración del número de preguntas por página.
- Navegación por páginas y barra de progreso.
- Revisión de respuestas acertadas, falladas y solución correcta.
- Modo claro y modo oscuro.
- Procesamiento local en el navegador: los PDFs no se suben a ningún servidor.

## Cómo usarlo

1. Abre la aplicación y entra en **Importar**.
2. Selecciona el PDF del examen.
3. Selecciona el PDF de la plantilla de respuestas.
4. Pulsa **Preparar examen** y espera a que termine el procesamiento.
5. Entra en **Mi examen** y responde las preguntas.
6. Usa **Siguiente** y **Anterior** para moverte por las páginas.
7. Pulsa **Entregar y corregir** para obtener la nota.
8. Consulta el detalle en **Resultados**.
9. En **Configuración** puedes cambiar la penalización y el número de preguntas por página.
10. Pulsa el icono de luna o sol para cambiar el tema visual.

## Ejecutarlo con Docker

Necesitas tener Docker Desktop instalado y abierto.

Desde la carpeta del proyecto ejecuta:

```bash
docker build -t auto-intentos-examen .
docker run --rm -p 8080:80 auto-intentos-examen
```

Después abre [http://localhost:8080](http://localhost:8080) en el navegador.

Para detenerlo, pulsa `Ctrl+C` si está en primer plano o ejecuta:

```bash
docker ps
docker stop <ID_DEL_CONTENEDOR>
```

## Ejecutarlo sin Docker

Necesitas Node.js 22 o una versión compatible:

```bash
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente [http://localhost:5173](http://localhost:5173).

Para crear la versión de producción:

```bash
npm run build
npm run preview
```

## Generar el instalador de Windows

La compilación del instalador requiere Node.js, Rust (stable con MSVC), las
herramientas de compilación de Visual Studio y WebView2 en el equipo de
compilación. Ejecuta:

```powershell
npm install
npm run tauri:build
```

El instalador NSIS se genera en `src-tauri/target/release/bundle/nsis/`.
La configuración usa `embedBootstrapper` para que el instalador pueda
descargar WebView2 si el equipo no lo tiene. Para una instalación totalmente
aislada hay que distribuir previamente el instalador Evergreen Offline de
WebView2 de Microsoft; la aplicación en sí no realiza peticiones de red para
leer PDFs ni para OCR.

La compilación Tauri no se puede validar en un equipo sin `rustc` y `cargo`.
En ese caso, la validación pendiente es ejecutar `npm run tauri:build` en
Windows con el toolchain instalado y probar el `.exe` resultante sin red.

## Formato esperado

El parser funciona mejor cuando las preguntas siguen un formato similar a:

```text
1. Enunciado de la pregunta
A) Primera opción
B) Segunda opción
C) Tercera opción
D) Cuarta opción
```

## Pruebas

```powershell
npm test
```

Y la plantilla de respuestas contiene entradas como:

```text
1. A
2. C
3. D
```

## Tecnologías

- Vue 3 y Composition API
- Vite
- TypeScript
- Pinia
- Vue Router
- PDF.js
- Tesseract.js
- Docker y Nginx

## Autor y licencia

Desarrollado por Asier. Licencia MIT.
