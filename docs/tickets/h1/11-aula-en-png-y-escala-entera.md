# 11: Aula en PNG y escala entera

**Qué construir:**

- el aula dibujada, como fondo de la pantalla de combate;
- la capa de luz de las persianas;
- la escala entera, que hace que todos los píxeles del juego midan lo mismo en el móvil, la tableta y el PC.

Sustituye al fondo actual.

**Bloqueado por:** 10.

**Requisitos:** FR-VIS-001, FR-VIS-004, FR-VIS-007, FR-VIS-008, NFR-PRF-003, NFR-USA-002, R-4, ADR-0013, ADR-0014, ADR-0015.

**Estado:** listo

- [x] El aula es un PNG propio de 216×432 píxeles en `src/assets/backgrounds/`: la zona segura de 180×320 y un margen alrededor (ADR-0015). Sigue el boceto aprobado en el ticket 10 y la lista de comprobación de la guía.
  - Tiene licencia CC0 y su entrada en el registro de licencias (R-4).
  - La ciudad que se ve por la ventana es de un paquete CC0 de terceros (*City Mega Pack*, de GrafxKid), pasada a la paleta. Va en una capa aparte, `classroom-city.png`, que se pinta debajo del aula y asoma por el hueco del cristal, con su propia entrada en el registro.
- [x] Lo que se va a animar en el ticket 15 se dibuja como **sprites aparte**, ya colocados en su sitio, y no dentro del PNG del aula: el estuche, el cuaderno, el boli, las agujas del reloj, una lama de la persiana, el árbol, la nube, el radiador con el bocadillo, la caja de móviles requisados y los altavoces.
- [x] La capa de luz es un PNG aparte, con 2 o 3 niveles de transparencia en colores de la rampa de luz, encima del aula. El test de opacidad la admite a ella sola, como excepción escrita en la guía.
- [ ] **La escala entera:**
  - [x] Se elige la mayor escala entera con la que la zona segura de 180×320 cabe en la pantalla, contada en píxeles físicos (guía de arte, §3): ×6 en un móvil de 1080 píxeles físicos de ancho, ×4 en uno de 720 y ×3 en un PC de 1920×1080.
  - [ ] Esa escala la usan todos los elementos de pixel art (aula, sprites, iconos y cartas) a través de un único valor compartido.
    - *La usan el aula, los sprites y los iconos, a través de `--art-scale` y `--art-pixel`. Las cartas siguen a 32 píxeles CSS fijos hasta que el ticket 14 redibuje su arte, por decisión del dueño.*
  - [x] Siempre con `image-rendering: pixelated`.
- [x] El juego va en un marco centrado, la parte de la pantalla que cubre el aula, con la zona segura entera dentro (ADR-0015). En el móvil el marco llena la pantalla, sin franjas; en tableta y PC quedan franjas lisas de `ink` a los lados.
  - *Al principio el marco era fijo de 9:16, como decía ADR-0014, y en el móvil dejaba franjas arriba y abajo. El dueño pidió quitarlas en el móvil, y el aula pasó a 216×432 con margen.*
- [x] Se exportan las posiciones que necesitan otros tickets: dónde pisa el enemigo, las zonas de texto de la pizarra y el pósit, y dónde está cada sprite animable.
- [x] Se retira el fondo actual y sus tests: el componente del remolino, su renderer, el shader, sus colores y su animación. Ya no hay respaldo para cuando falta WebGL, porque no se usa.
- [x] Con `prefers-reduced-motion` y con la pestaña oculta, el aula no consume animación (FR-VIS-007).
- [x] Comprobado en el navegador, con capturas, a:
  - [x] 320×568, 360×800, 393×873 y 412×915 (móvil);
  - [x] 820×1180 (tableta);
  - [x] 1366×768 y 1920×1080 (PC).
- [ ] En el móvil del dueño, con el aula, la mano y la interfaz, se mantienen ≥ 30 fps (NFR-PRF-003). *Lo comprueba el dueño con el contador de `?debug`.*
- [x] Se anota cuánto pesan los PNG nuevos, porque entran en la caché offline.
  - *El aula pesa 10,7 kB, la ciudad 2,3 kB y la capa de luz 1,3 kB. Los 13 sprites del aula suman 3,1 kB. En total son unos 17 kB.*
