# 11: Aula en PNG y escala entera

**Qué construir:**

- el aula dibujada, como fondo de la pantalla de combate;
- la capa de luz de las persianas;
- la escala entera, que hace que todos los píxeles del juego midan lo mismo en el móvil, la tableta y el PC.

Sustituye al fondo actual.

**Bloqueado por:** 10.

**Requisitos:** FR-VIS-001, FR-VIS-004, FR-VIS-007, FR-VIS-008, NFR-PRF-003, R-4, ADR-0013.

**Estado:** listo

- [ ] El aula es un PNG propio de unos 480×520 píxeles en `src/assets/backgrounds/`. Sigue el boceto aprobado en el ticket 10 y la lista de comprobación de la guía.
  - Tiene licencia CC0 y su entrada en el registro de licencias (R-4).
- [ ] Lo que se va a animar en el ticket 15 se dibuja como **sprites aparte**, ya colocados en su sitio, y no dentro del PNG del aula: el estuche, el cuaderno, el boli, las agujas del reloj, una lama de la persiana, el árbol, la nube, el radiador con el bocadillo, la caja de móviles requisados y los altavoces.
- [ ] La capa de luz es un PNG aparte, con 2 o 3 niveles de transparencia en colores de la rampa de luz, encima del aula. El test de opacidad la admite a ella sola, como excepción escrita en la guía.
- [ ] **La escala entera:**
  - [ ] Se elige la mayor escala con la que la zona segura cabe en la pantalla: ×2 en el móvil, ×3 o ×4 en tableta y PC.
  - [ ] Esa escala la usan todos los elementos de pixel art (aula, sprites, iconos y cartas) a través de un único valor compartido.
  - [ ] Siempre con `image-rendering: pixelated`.
- [ ] El pupitre queda anclado abajo y centrado. Según la pantalla, se recortan el techo y los lados, y la zona segura siempre se ve entera.
- [ ] El juego va en una columna vertical centrada. En pantallas apaisadas, el aula sigue a los lados y no quedan franjas vacías.
- [ ] Se exportan las posiciones que necesitan otros tickets: dónde pisa el enemigo, las zonas de texto de la pizarra y el pósit, y dónde está cada sprite animable.
- [ ] Se retira el fondo actual y sus tests: el componente del remolino, su renderer, el shader, sus colores y su animación. Ya no hay respaldo para cuando falta WebGL, porque no se usa.
- [ ] Con `prefers-reduced-motion` y con la pestaña oculta, el aula no consume animación (FR-VIS-007).
- [ ] Comprobado en el navegador, con capturas, a:
  - [ ] 320×568, 360×800, 393×873 y 412×915 (móvil);
  - [ ] 820×1180 (tableta);
  - [ ] 1366×768 y 1920×1080 (PC).
- [ ] En el móvil del dueño, con el aula, la mano y la interfaz, se mantienen ≥ 30 fps (NFR-PRF-003). *Lo comprueba el dueño con el contador de `?debug`.*
- [ ] Se anota cuánto pesan los PNG nuevos, porque entran en la caché offline.
