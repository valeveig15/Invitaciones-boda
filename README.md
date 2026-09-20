# Invitación Valentina & Santiago — V11

## Estructura
- `index.html`
- `style.css`
- `script.js`
- `manifest.json`
- `assets/` (imágenes, textura y música)

## Publicación en GitHub Pages
1. Subí el contenido de esta carpeta a la raíz del repositorio.
2. En GitHub: Settings → Pages.
3. Elegí `Deploy from a branch`, rama `main`, carpeta `/ (root)`.
4. Guardá y esperá a que GitHub publique la URL.

## Sección de canciones
El botón **PROPONER CANCIÓN** abre un formulario modal. En esta versión está configurado como demostración en navegador: confirma la sugerencia, pero no la almacena en un servidor.
Para recibir las propuestas de todos los invitados hay que conectarlo a un backend o servicio de formularios.


## Cambios V12
- Se agregó una sección de Instagram de la pareja.
- `@instagram_de_la_pareja` es un placeholder: reemplazalo en `index.html` por el usuario real.
- Se agregó una sección **Info útil** con horarios, ubicaciones y un bloque editable para información adicional.
- El cierre final incluye:
  - `¡Gracias por acompañarnos en este momento tan importante!`
  - `¿TE GUSTÓ NUESTRO DEMO?`
  - `Contactanos · Invitaciones personalizadas`
  - `SEGUINOS EN INSTAGRAM`
  - `@artedecostudio`


## Cambio V13
La música del sitio fue reemplazada por el archivo proporcionado:
`Die With a Smile (JLAY EDITED)(1).mp3`.

Dentro del proyecto sigue guardada como `assets/track-02.mp3`, por lo que no fue necesario cambiar el código de reproducción.

## Cambios V14
- Reproductor musical reforzado y nuevo control visual.
- Instagram de la pareja sin corazón superpuesto.
- Regalo reemplazado por `assets/gift_box_animated.svg`.
- Info útil sin reloj general; cada tarjeta tiene su propia microanimación.
- Footer final más grande y dividido en dos lados en escritorio.

## Cambios V15
- La caja de regalo está embebida directamente en `index.html`; ya no depende de un archivo de imagen.
- La invitación abre con un botón **ABRIR INVITACIÓN**. Ese clic habilita la reproducción musical en navegadores que bloquean autoplay.
- El control flotante ahora es solamente texto: **MÚSICA ON/OFF**, sin logo.
- Se ampliaron los cuatro textos del cierre de ArteDeco Studio.

## Cambios V16
- `script.js` fue rehecho para eliminar código musical duplicado.
- La canción está ahora en la raíz como `wedding-music-v16.mp3`.
- Se recuperó el ícono de parlante, sin barras ni superposiciones.
- Se simplificaron los íconos de regalo y sugerencia de canciones.

## Cambios V17
- Se eliminó la pantalla inicial de música.
- El sitio intenta iniciar la música automáticamente.
- Si el navegador bloquea autoplay con sonido, comienza con la primera interacción del visitante.
- El control flotante ahora es una nota musical animada; al mutear aparece tachada y queda quieta.
- Se amplió de forma importante la escala de la versión de escritorio.
- Se oscurecieron textos de ceremonia/fiesta e Instagram.
- Todas las fotos tienen bordes redondeados desde el inicio.
- La tapa del regalo queda claramente separada del cuerpo.
- El mensaje final de agradecimiento es más grande.

## Cambios V18
- Nuevo ícono musical: una sola corchea, más simple y legible.
- Cuenta regresiva más grande en computadora.
- Peso de fuente ligeramente mayor en toda la invitación para facilitar la lectura.

## Cambios V19
- Cuenta regresiva todavía más grande en computadora.
- Sección **Info útil** ampliada por completo: título, introducción, tarjetas, íconos y textos.
- Sección de regalo un poco más grande.
- **¡NOS CASAMOS!** más grande en escritorio.
- Nuevo control musical con un símbolo `♪` limpio y simple.

## Cambios V20
- Nota musical un poco más grande.
- La tapa de la caja abre parcialmente hacia un costado: un extremo se levanta más que el otro.
- Los destellos ahora nacen desde el interior de la caja y se ven con más claridad.
