# 16: Aula en planos y cámara

**Qué construir:** profundidad en el aula, según la maqueta aprobada por el dueño (ADR-0017):

- el aula partida en cinco planos, cada uno en su PNG;
- una cámara que mueve los planos a saltos de píxel entero: tiembla con cada golpe, se sienta en el pupitre al empezar el combate y se hunde cuando el enemigo aterriza;
- la caída del enemigo sobre el pupitre, su sombra y su inclinación en 3D al recibir daño;
- los bucles lentos del aula.

Sustituye al temblor de la pantalla entera. La interfaz no se mueve.

**Bloqueado por:** 11, 12.

**Requisitos:** FR-VIS-001, FR-VIS-002, FR-VIS-007, NFR-PRF-003, R-4, ADR-0013, ADR-0014, ADR-0017.

**Estado:** listo

- [x] El aula son cinco PNG propios en `src/assets/backgrounds/`, uno por plano, que sustituyen a `classroom.png`: `classroom-city.png`, `classroom-room.png`, `classroom-back-desks.png`, `classroom-light.png` y `classroom-desk.png`.
  - Los planos opacos miden 240×456: el aula de 216×432 con su borde repetido 12 píxeles alrededor. La luz mide 216×432 y sigue siendo el único con transparencia.
  - Todos están en el registro de licencias (R-4). La entrada de la ciudad anota que crece 3 píxeles.
- [x] La guía de arte (§7) dice qué capas de `art/classroom.aseprite` forman cada plano y cómo se exporta.
- [x] **La cámara** mueve cada plano una fracción de lo que se mueve el pupitre: la ciudad 0, la sala 1/3, los pupitres del fondo 2/3, la luz 1/3 y el pupitre 1.
  - Se mueve en píxeles enteros del arte, con `steps(1, end)`.
  - Sus fotogramas clave salen de `src/classroom/camera.ts`, que se prueba en Node.
- [x] Con cada golpe, la cámara tiembla: 380 ms y como mucho 5 píxeles del arte.
  - El enemigo, su sombra y su intención se mueven con el pupitre.
  - Los recortes, los pósits y la mano no se mueven.
- [x] Al empezar el combate, la cámara se sienta en el pupitre en 800 ms. Al final, el enemigo cae sobre el pupitre, 170 píxeles en 300 ms, y el pupitre se hunde 3 píxeles y vuelve.
  - Su sombra aparece al aterrizar, y su intención, 120 ms después.
  - Cada enemigo siguiente cae en cuanto se derrota al anterior.
- [x] Al recibir daño, el enemigo se ilumina, se inclina hacia atrás en 3D y vuelve al reposo como un muelle. En reposo, la perspectiva no cambia ningún píxel del enemigo.
- [x] La sombra del Examen es un sprite propio de 59×7, `enemy-midterm-shadow`, en el catálogo y en el registro de licencias. Cae sobre el pupitre, a la derecha de donde pisa.
- [x] **Bucles lentos:**
  - la nube cruza la ventana;
  - el árbol se mece;
  - el segundero avanza;
  - una lama de la persiana tiembla de vez en cuando;
  - motas de polvo suben por la luz.
- [x] Ningún movimiento deja ver un hueco: un test comprueba que los planos cubren el marco en reposo y en cada paso de cada movimiento de la cámara.
- [x] **Cuándo se para:**
  - con la pestaña oculta, los bucles esperan donde están;
  - si la media baja de 30 fps durante 5 s, el aula se queda quieta;
  - con `prefers-reduced-motion` no se mueve nada: ni los bucles, ni la cámara, ni la caída, ni la inclinación (FR-VIS-007).
- [x] Comprobado en el navegador a 320×568, 360×640, 393×852, 412×915, 820×1180 y 1440×900:
  - no se ve ningún hueco en reposo ni en ningún paso del asiento, la caída, el aterrizaje o el temblor;
  - la consola no muestra errores;
  - el panel del enemigo queda por encima del enemigo cuando este cae.
- [ ] En el móvil del dueño se mantienen ≥ 30 fps durante el asiento, la caída, el temblor y los bucles (NFR-PRF-003).
  - *Lo comprueba el dueño con el contador de `?debug`, como explica el ticket 04.*
  - *Hay que jugar varias cartas acertando, para ver temblores.*
  - *Si el aula se queda quieta, es que la media ha bajado de 30 fps.*

**Notas:**

- Hace también la sombra del ticket 13 y, del ticket 15, los bucles lentos y las reglas de cuándo se paran. Se han marcado allí.
- La lama de la persiana que tiembla no la pide el ticket 15, pero venía en la maqueta aprobada. No es el suceso de la persiana rota, que sigue pendiente.
- Las animaciones nuevas del aula se paran solas en esos casos si van dentro de `.classroom--animated`, que pone el aula solo mientras se mueve.
