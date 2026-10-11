# 09: Dirección de arte del aula (documentación)

**Qué construir:** nada de código. Este ticket deja escrita la nueva dirección de arte para que el resto de tickets de H1 se puedan trazar a ella:

- un ADR nuevo, «Aula en vista baja y pupitre verde»;
- la guía de arte (`docs/GUIA-DE-ARTE.md`), reescrita desde cero;
- los cambios en el SRS que la dirección exige.

La dirección vale para todo el juego, no solo para el combate.

**Bloqueado por:** nada.

**Requisitos:** FR-VIS-001, FR-VIS-004, FR-VIS-007, NFR-ACS-001, NFR-I18N-001, R-3, R-4, R-10, ADR-0004, ADR-0011.

**Estado:** hecho

- [x] Existe `docs/adr/0013-aula-en-vista-baja-y-pupitre-verde.md`, con este contenido:
  - [x] **Vista baja, casi de frente**, como la de un alumno sentado. El pupitre de formica verde salvia ocupa el primer plano, el enemigo está de pie sobre él y detrás se ve el aula.
  - [x] **El aula es un PNG** dibujado píxel a píxel, con animaciones de sprites en el DOM y CSS. **Sin WebGL.**
  - [x] **Escala entera según la pantalla**, la misma para todo: ×2 en el móvil y ×3 o ×4 en tableta y PC. El juego va en una columna vertical centrada.
  - [x] **Paleta de 32 colores.**
  - [x] **Capa de luz** semitransparente, con 2 o 3 niveles de transparencia, como única excepción a la regla de píxeles opacos.
  - [x] **Ningún texto dibujado.** Los textos del aula salen del catálogo y se pintan encima del dibujo.
  - [x] **Alternativas descartadas:** la vista cenital, la vista de tres cuartos alta con el pupitre pintado en código, el pupitre de madera, mantener el shader de WebGL, la paleta de 24 colores y usar como assets las imágenes de referencia, que no son pixel art de rejilla y tienen una licencia dudosa para R-4.
  - [x] Amplía ADR-0004 (el fondo deja de ser un shader) y ADR-0011 (los tamaños de los sprites los fija la guía, no siempre 16×16). Las dos llevan una línea que remite al ADR nuevo.
- [x] La guía de arte está reescrita y cada regla dice si se comprueba con un test o a ojo. Cubre:
  - [x] **La vista baja.** Los objetos se ven de frente, con algo de su cara de arriba. Las cosas planas que están de pie (pizarra, carteles) se ven de frente.
  - [x] **Los tamaños de cada tipo de asset:**
    - iconos de interfaz, 16×16;
    - dibujo de las cartas, 24×24;
    - enemigos, 96×128;
    - aula, unos 480×520, con una zona segura central.
  - [x] **La escala entera** y cómo se elige según la pantalla.
  - [x] **La luz**, que entra por las persianas de la izquierda, y la sombra, que cae a la derecha. La capa de luz es la excepción: dice qué niveles de transparencia admite y qué fichero es.
  - [x] **El contorno, los 32 colores, las rampas y el máximo de colores por sprite.**
  - [x] **Los textos.** Ningún texto se dibuja. La pizarra, el pósit, la megafonía y los bocadillos llevan texto del catálogo. El horario y los dibujos del pupitre solo llevan garabatos.
  - [x] **Las referencias de la educación española.** Una lista para empezar: pizarra verde de tiza, horario de corcho con L M X J V, «Tema N» en la pizarra, persianas, fluorescentes, altavoces, estuche, cuaderno de espiral, mochilas en las sillas, radiador de hierro, EBAU, agenda escolar, boletín de notas y recuperación de septiembre.
  - [x] **Las marcas.** Se pueden parodiar sus nombres (Zilan en vez de Milan), pero nunca se usan sus logotipos ni su diseño.
  - [x] **El tono de los textos: gamberro e irónico.**
    - Se puede satirizar a colectivos, figuras genéricas e instituciones: el profe de guardia, el ministro de turno, los de letras, el grupo de WhatsApp de padres, las leyes educativas, la EBAU o PISA.
    - Palabrotas, solo de vez en cuando y como remate.
    - No se nombra a personas reales con nombre y apellidos, ni se hace burla por raza, religión, orientación sexual, discapacidad u origen.
  - [x] **Una lista de comprobación** de cada asset nuevo, como la de la guía anterior.
- [x] El SRS recoge la dirección:
  - [x] **FR-VIS-001** describe el fondo como el aula en PNG con animaciones del DOM. Se pausa con la pestaña oculta, y las animaciones se paran si la media baja de 30 fps durante 5 s. Ya no menciona el remolino ni WebGL.
  - [x] **FR-VIS-004** dice «una única paleta fija de hasta 32 colores».
  - [x] **Un requisito nuevo de escala entera y columna vertical** cubre PC y tableta.
  - [x] **Un requisito nuevo de textos del aula** cubre la pizarra con el nombre del tema del combate, las frases del catálogo y el tono.
  - [x] §7.1, §9 (el riesgo «No se consigue el look Balatro») y el Apéndice A quedan al día.
- [x] El glosario incluye los términos nuevos con su identificador en inglés:
  - **aula** (el fondo);
  - **capa de luz**;
  - **panel del enemigo**;
  - **barra inferior**;
  - **guiño** (una animación ocasional del aula).

**Notas:**

- Los ADR de la vista cenital y del pupitre en tres cuartos alta, que llegaron a `main` con el commit de estos tickets, se han borrado. Por eso el ADR nuevo toma el número 0013.
- Los requisitos nuevos son FR-VIS-008 (escala entera y columna vertical) y FR-VIS-009 (textos del aula).
- Valores que fija la guía como provisionales y confirma el ticket 10: la zona segura del aula, de 160×280 píxeles del arte, y el retrato del enemigo, de 24×24.
- Las imágenes de referencia son solo de aspecto. Los nombres y efectos de las cartas que aparecen en ellas no son contenido del juego.
