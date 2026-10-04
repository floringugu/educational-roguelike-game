# 04: Fondo de remolino WebGL

**Qué construir:** el fondo animado en remolino al estilo Balatro, que se ve detrás de cualquier pantalla. Lleva un contador de fps de depuración para medir NFR-PRF-003 en el móvil.

**Bloqueado por:** 02. Se puede hacer en paralelo con el 03.

**Requisitos:** FR-VIS-001, FR-VIS-007 (la parte del fondo), NFR-PRF-003, R-3.

**Estado:** hecho

- [x] El shader está escrito desde cero. No se basa en ports de los shaders de Balatro ni en código GPL o AGPL (R-3). El PR explica en un párrafo la técnica que usa.
  - El párrafo para el PR está en las notas, en «Técnica del shader».
- [x] Los colores del remolino son parámetros, y cuando exista la paleta del ticket 03 se toman de ella.
  - Son `bark` (base), `umber` e `ink` (vetas), en `src/background/swirlColors.ts`. Se probó antes con `night`, `indigo` y `wine`, pero se prefirieron los marrones de tinta. Un test comprueba que todos los colores de texto mantienen 4,5:1 sobre cada uno (NFR-ACS-001).
- [x] Se dibuja por debajo de la resolución nativa y la escala es configurable.
  - Por defecto, a 1/4 del tamaño en píxeles CSS: cada píxel del fondo mide 4×4 px CSS, como un píxel de los sprites. Se cambia con la prop `resolutionScale` de `SwirlBackground`.
- [x] Se pausa cuando la pestaña está oculta y se reanuda al volver a ella.
- [x] Se sustituye por un fondo estático:
  - [x] si no hay WebGL;
  - [x] si la media baja de 30 fps durante 5 s;
  - [x] si el usuario tiene `prefers-reduced-motion` activo.
  - En los dos últimos casos, el fondo estático es un fotograma congelado del propio remolino. Sin WebGL no se puede dibujar ese fotograma, así que se usa un degradado CSS (ver «Fondo estático» en las notas).
- [x] Hay un contador de fps que solo aparece en modo depuración y que muestra la media de los últimos segundos.
  - Se activa con `?debug` en la dirección y muestra la media de los últimos 5 s.
- [x] En el móvil del dueño, el fondo solo mantiene ≥ 30 fps. El valor medido queda anotado en el ticket.
  - Medido en el Redmi Note 14 Pro con el contador de `?debug`: 60 fps de media.

**Notas:**

- **Técnica del shader.** El fondo es un fragment shader de WebGL 1 escrito desde cero que se dibuja sobre un único triángulo que cubre la pantalla. Para cada píxel hace tres pasos. Primero, un giro: rota la posición alrededor del centro con un ángulo que crece hacia el centro, de modo que unas franjas rectas se convierten en una espiral. Después, una deformación del dominio (*domain warping*): desplaza varias veces esa posición con ondas senoidales de frecuencia creciente y amplitud decreciente, y la espiral se rompe en vetas de pintura irregulares. Por último, unas bandas: un valor continuo calculado a partir de la posición deformada elige uno de los tres colores sin mezclarlos, así que cada píxel es exactamente un color de la paleta (FR-VIS-004). La animación es un bucle de 60 s: todo lo que se mueve depende de un ángulo de fase entre 0 y 2π multiplicado solo por números enteros, así que el final enlaza con el principio y los números se mantienen pequeños para la precisión baja de las GPU de los móviles. La imagen se dibuja a 1/4 de la resolución CSS y se amplía sin suavizar (`image-rendering: pixelated`).
- **Comprobado en un navegador** (Firefox sin interfaz, con el build de producción):
  - el canvas se dibuja a 1/4 de su tamaño CSS y sus píxeles son solo los tres colores de la paleta;
  - la animación avanza a 60 fps y el contador lo muestra solo con `?debug`;
  - con la pestaña oculta no se dibuja ningún fotograma; al volver, sigue a 60 fps sin pasar al fondo estático;
  - si cada fotograma tarda unos 60 ms (17 fps), a los 5 s el remolino se congela;
  - con movimiento reducido se ve el remolino congelado, solo con los tres colores de la paleta;
  - congelado, no dibuja ningún fotograma hasta que cambia el tamaño de la ventana, y entonces dibuja uno;
  - sin WebGL se ve el degradado CSS.
- **Fondo estático:** hay dos formas, según el motivo.
  - **Fotograma congelado**, con movimiento reducido o con fps bajos. Es el primer fotograma del bucle, dibujado con el mismo shader, así que se ve el remolino quieto. Solo se vuelve a dibujar cuando cambia el tamaño de la pantalla (por ejemplo, al girar el móvil), porque eso borra el canvas, y al volver a la pestaña. Si los fps bajan con el remolino en marcha, salta a ese primer fotograma una sola vez.
  - **Degradado CSS**, sin WebGL o si el navegador quita la GPU a la página. Son dos franjas diagonales de los mismos colores, con bordes duros, sobre el color base.
  - Por fps bajos o por perder WebGL, el fondo se queda así hasta recargar la app. Con movimiento reducido vuelve a animarse si el usuario lo desactiva.
- **Sin aceleración gráfica:** si el navegador solo puede hacer WebGL con la CPU, se trata como si no hubiera WebGL (`failIfMajorPerformanceCaveat`).
- El elemento del fondo lleva `data-background="animated"`, `"frozen"` (fotograma congelado) o `"static"` (degradado CSS), para los tests de extremo a extremo del ticket 07.
- **Cómo medir los fps en el móvil** (último criterio):
  1. En el PC, `npm run build` y después `npx vite preview --host`.
  2. En el móvil, abrir la dirección `Network` (puerto 4173) con `?debug` al final.
  3. Esperar al menos 10 s y anotar el valor del contador. Si el remolino se queda quieto, es que la media ha bajado de 30 fps.
  4. La pantalla del Redmi Note 14 Pro puede ir a 120 Hz, así que el contador puede pasar de 60.
