# 18: Tiza y pizarra

**Qué construir:** una tiza en el pupitre con la que el jugador escribe en la pizarra: la arrastra hasta ella y su punta deja un trazo por donde pasa (FR-VIS-011). Frotar la pizarra con el dedo borra lo escrito. Es un adorno, como los objetos del pupitre.

**Bloqueado por:** 17.

**Requisitos:** FR-VIS-011, FR-VIS-010, FR-VIS-001, FR-VIS-007, FR-VIS-008, NFR-PRF-003, NFR-USA-002, R-4, ADR-0014, ADR-0017, guía de arte.

**Estado:** listo

- [ ] **La tiza** es un sprite propio, `classroom-chalk`, de unos 9×3. Es blanca (`paper` y `sand`) y no lleva contorno, como el resto del aula (guía §5). Su sombra es un sprite aparte, como la de los objetos del ticket 17.
  - Está en el pupitre, a la derecha del enemigo y delante de la corona grabada, hacia x 137, y 199. El sitio exacto se fija en el navegador y se le enseña al dueño.
  - Está dentro de la zona segura, así que todas las pantallas la enseñan entera.
- [ ] Se coge, se mueve, se suelta y se lanza como los objetos del ticket 17, y el enemigo se mosquea igual.
- [ ] **Escribir:** al cogerla, la tiza se coloca con la punta unos 32 px CSS por encima del dedo (prov.), redondeados a píxeles enteros del arte, para que el dedo no tape lo que se escribe.
  - Mientras la punta está sobre el encerado de la pizarra (x 49-147, y 44-103), deja un trazo de 1 píxel del arte por donde pasa.
  - El trazo no tiene huecos aunque el dedo vaya rápido: entre dos posiciones del dedo se pinta la línea de píxeles que las une.
  - El trazo es `paper`, del color de la tiza.
- [ ] **Dónde se pinta:** en un canvas 2D del tamaño del encerado en píxeles del arte, ampliado con la escala entera y con `image-rendering: pixelated` (ADR-0014).
  - Va en el plano de la sala, así que se mueve con la pizarra cuando se mueve la cámara.
  - Queda encima de la pizarra y de sus textos (ticket 15), y debajo del enemigo, de su intención y del panel del enemigo.
  - No añade dependencias: el canvas 2D es del navegador.
- [ ] **Soltar:** si se suelta sobre la pizarra, o en cualquier sitio fuera del pupitre libre, la tiza vuelve de un salto a donde estaba en el pupitre.
- [ ] **Borrar:** frotar el encerado con el dedo, sin la tiza, borra lo escrito por donde pasa, en una franja de 5 píxeles del arte.
  - Los textos de la pizarra (ticket 15) no se borran.
  - Lo escrito también se borra al empezar cada combate, y no se guarda en ningún sitio.
- [ ] Con movimiento reducido o con el aula quieta, se escribe y se borra igual, porque el trazo sigue al dedo y no es una animación (FR-VIS-007).
- [ ] La pizarra no está en el orden del teclado, y tocarla no coge cartas ni objetos.
- [ ] La lógica del trazo está en un módulo sin código del navegador, probado en Node: la línea entre dos puntos, qué cae dentro del encerado y la franja que borra el dedo.
- [ ] La tiza y su sombra son sprites propios, siguen la lista de comprobación de la guía y están en el catálogo y en el registro de licencias (R-4). La guía de arte las recoge en §2.
- [ ] Comprobado en el navegador a 320×568, 360×640, 393×852, 412×915 y 1440×900:
  - se escribe y se borra con el ratón y con toques simulados;
  - el trazo es nítido, en píxeles enteros, y tiembla con la pizarra cuando tiembla la cámara;
  - la consola no muestra errores.
- [ ] En el móvil del dueño se escribe bien con el pulgar: la punta deja ver el trazo, y se mantienen ≥ 30 fps mientras se escribe (NFR-PRF-003).
  - *Lo comprueba el dueño con el contador de `?debug`, como explica el ticket 04.*

**Notas:**

- El dueño eligió arrastrar la tiza hasta la pizarra. Así el dedo taparía lo que se escribe, y por eso la punta va por encima del dedo.
- Se borra frotando con el dedo porque el borrador y las tizas del cajetín de la pizarra quedan detrás del enemigo.
- Usar la tiza para hacer cuentas durante una pregunta queda fuera, como idea para H2 (DP-19).
