# 17: Objetos del pupitre

**Qué construir:** que el jugador pueda coger los objetos del pupitre, moverlos y lanzárselos al enemigo, que se mosquea (FR-VIS-010). Son el estuche, la botella de agua, el cuaderno y el boli. La tiza llega en el ticket 18 y se mueve igual. Todo es un adorno: no cambia nada del combate.

**Bloqueado por:** 16.

**Requisitos:** FR-VIS-010, FR-VIS-001, FR-VIS-007, FR-VIS-008, FR-VIS-009, NFR-PRF-003, NFR-USA-002, NFR-I18N-001, P1, R-4, ADR-0014, ADR-0016, ADR-0017, guía de arte.

**Estado:** listo

- [x] **Siguen en su sitio del dibujo:** el estuche en la esquina izquierda (x -29, y 164), la botella a su lado (x 21, y 160) y el cuaderno en la esquina derecha (x 170, y 178), con el boli encima (x 180, y 193).
  - En un móvil de 9:16, que enseña solo la zona segura, se ven un tercio del estuche y un borde del cuaderno de 10 píxeles, y el boli no se ve.
  - Al cogerlos se ven enteros.
- [x] **El arte se separa para que los objetos se puedan mover:**
  - la botella deja de estar pintada en el plano del pupitre y pasa a ser un sprite propio, `classroom-water-bottle`;
  - las sombras del estuche, la botella y el cuaderno salen del plano del pupitre, y la del boli sale del dibujo del cuaderno. Cada objeto lleva su sombra como sprite aparte, como el enemigo (`classroom-pencil-case-shadow` y las demás);
  - debajo, el pupitre se repinta con su formica y su tramado;
  - la guía de arte (§7) dice qué capas de `art/classroom.aseprite` quedan fuera del plano del pupitre.
- [x] **El boli va con el cuaderno** mientras está encima de él: si se arrastra el cuaderno, el boli viaja con él. Así también se puede coger en un móvil de 9:16, sacando antes el cuaderno. Si se suelta el boli sobre el cuaderno, vuelve a ir con él.
- [x] **Coger:** se coge tocando la parte que se ve, con el dedo o con el ratón.
  - La zona táctil mide al menos 44×44 px CSS (NFR-USA-002) y crece hacia el centro de la pantalla, aunque se vea poco del objeto.
  - Al cogerlo, sube 2 píxeles del arte y su sombra se queda debajo, en el pupitre.
- [x] **Mover:** sigue al dedo a saltos de píxel entero del arte, con su sombra debajo.
  - Si se suelta en la parte del pupitre que no tapan la barra inferior ni la mano, se queda ahí.
  - Si se suelta en otro sitio, vuelve de un salto a donde estaba antes de cogerlo.
  - Suelto, se mueve con el pupitre cuando se mueve la cámara (ADR-0017).
- [x] **Delante o detrás del enemigo:**
  - cogido, se pinta encima del aula y del enemigo, pero debajo de la interfaz y de las cartas;
  - suelto, queda delante del enemigo si su base está más abajo que los pies del enemigo (y 188), y detrás si no.
- [x] **Lanzar:** si se suelta con un gesto rápido hacia arriba (0,8 px CSS por ms, prov.), sale volando en esa dirección.
  - Si su vuelo cruza al enemigo, le da, rebota y cae al pupitre.
  - Si no, choca con la pared o con la pizarra y cae al pupitre.
  - Si no hay enemigo de pie, porque está cayendo o se acaba de derrotar, el objeto pasa de largo.
  - El vuelo lo calcula un módulo sin código del navegador, probado en Node, como `camera.ts`. Se reproduce con la Web Animations API, a saltos de píxel entero y con `steps(1, end)` (ADR-0017).
- [x] **El enemigo se mosquea** cuando le da un objeto:
  - durante 1,5 s (prov.), tiembla de lado a lado, a saltos de píxel entero, de forma distinta a la inclinación de un golpe;
  - durante esos 1,5 s, le sale la **marca de enfado** junto a la cara: un sprite propio, `enemy-annoyance-mark`, de unos 9×9, con cuatro trazos curvos en `vermilion` y `crimson` y contorno en `ink`, como en el manga. Late en 2 fotogramas;
  - en el Examen, la marca va arriba a la derecha de la cara, junto a la ceja. Cada enemigo da en sus datos dónde va, porque depende de dónde tenga la cara;
  - dice una frase en el **bocadillo de su intención**, como si hablara:
    - el rotulador y el número se van, y el bocadillo se ensancha a saltos de píxel entero, en unos 120 ms, hasta el ancho de la frase. Solo se estira su tramo liso del centro: el contorno, la cola y la altura no cambian;
    - la frase se escribe letra a letra, una cada 35 ms (prov.), en 2 líneas como mucho;
    - se queda 1,2 s (prov.) después de escribirse entera. Luego se va, el bocadillo vuelve a su tamaño y vuelven el rotulador y el número;
    - los lectores de pantalla siguen leyendo la intención: la frase es un adorno y lleva `aria-hidden`;
  - si le da otro objeto antes de que acabe, el mosqueo vuelve a empezar con otra frase;
  - no cambia su vida, su intención ni nada del combate (P1).
- [ ] **Frases del mosqueo:** al menos 5 en el catálogo de textos (NFR-I18N-001), que salen al azar y sin repetir la anterior.
  - Siguen el tono de la guía (§11), y el dueño las revisa antes de que entren en el catálogo (FR-VIS-009).
  - Ninguna pasa de 2 líneas en el bocadillo ensanchado ni se sale de él a ninguna escala, y todas cumplen el contraste de NFR-ACS-001.
  - Propuesta:
    - «¡Al pasillo!»
    - «Esto va al parte.»
    - «Muy maduro, sí.»
    - «Se lo digo a tu tutor.»
    - «Con esa puntería, estudia.»
    - «Eso te baja un punto.»
    - «No soy una diana.»
- [x] **Al empezar cada combate**, los objetos vuelven a su sitio.
- [x] **No molestan al jugar:**
  - no están en el orden del teclado y llevan `aria-hidden`;
  - tocar una carta nunca coge un objeto, ni al revés;
  - con la hoja de una pregunta o el menú abiertos, no se pueden coger.
- [x] **Con movimiento reducido o con el aula quieta** (FR-VIS-007, NFR-PRF-003), se pueden arrastrar, porque siguen al dedo, pero no vuelan. Un lanzamiento hacia el enemigo lo mosquea sin temblor y con la marca quieta, y el objeto vuelve a donde estaba. El bocadillo sale ya ensanchado, con la frase entera, y se queda lo mismo que si se escribiera.
- [x] Los sprites nuevos (la botella, las sombras y la marca de enfado) son propios, siguen la lista de comprobación de la guía y están en el catálogo y en el registro de licencias (R-4). La guía de arte los recoge en §2.
- [ ] Comprobado en el navegador a 320×568, 360×640, 393×852, 412×915 y 1440×900:
  - coger, mover, soltar dentro y fuera del pupitre libre, y lanzar acertando y fallando;
  - sacar el cuaderno con el boli encima;
  - el bocadillo ensanchado y la marca no se salen del marco ni tapan los textos de la pizarra;
  - la consola no muestra errores.
- [ ] En el móvil del dueño, los objetos se cogen con el pulgar sin coger cartas sin querer, y al lanzarlos se mantienen ≥ 30 fps (NFR-PRF-003).
  - *Lo comprueba el dueño con el contador de `?debug`, como explica el ticket 04.*

**Notas:**

- Lo decidió el dueño el 2026-10-17 (DP-19).
- El dueño eligió que la frase salga en el bocadillo de la intención, que se adapta a ella, en lugar de en un bocadillo propio a la izquierda del enemigo. El estuche empieza en x -29 porque se completa hacia la izquierda.
- El dueño eligió el diseño del estuche entero entre tres propuestas: de tela azul, con un pompón en el tirador, una pegatina y garabatos de corrector (guía de arte, §1). Las otras dos eran el estuche sin adornos y uno con la cremallera abierta y lápices asomando.
- La cara de enfado del Examen se dibuja en el ticket 13, con el Examen nuevo. Aquí solo va la marca de enfado.
- La tiza se coge, se mueve y se lanza igual que estos objetos, pero se hace en el ticket 18.
