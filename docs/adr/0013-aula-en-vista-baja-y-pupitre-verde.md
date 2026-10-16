# ADR-0013: Aula en vista baja y pupitre verde

- **Estado:** Aceptada. El tamaño del aula, la escala y los tamaños de los sprites los modifica [ADR-0014](0014-pantalla-fija-de-9-16.md), y el PNG único, [ADR-0017](0017-aula-en-planos-y-camara.md).
- **Fecha:** 2026-10-11
- **Origen:** FR-VIS-001, FR-VIS-004, FR-VIS-007, NFR-ACS-001, NFR-I18N-001, R-3, R-4. Amplía ADR-0004 y ADR-0011.

## Contexto

El fondo del prototipo es un shader de WebGL que pinta un pupitre visto desde arriba (ticket 04 de H1). Los sprites mezclan vistas y densidades de detalle: unos se ven de lado, otros desde arriba, y los iconos de 16×16 tienen mucho menos detalle que los enemigos. Además, la escena no cuenta dónde está el jugador: un pupitre suelto no se reconoce como un aula.

El dueño quiere que la pantalla de combate se parezca a dos imágenes de referencia: un aula española en pixel art, vista desde la silla de un alumno, con el enemigo de pie sobre un pupitre verde y la interfaz en paneles oscuros. Esas imágenes solo dan el aspecto: no son pixel art de rejilla, sus colores no son de la paleta y no se sabe con qué licencia se podrían usar.

## Decisión

- **Vista baja, casi de frente**, como la de un alumno sentado. El pupitre de formica verde salvia ocupa el primer plano, el enemigo está de pie sobre él y detrás se ve el aula: la pizarra verde, las persianas, los fluorescentes, el reloj, el horario de corcho, los altavoces y otros pupitres con mochilas. La dirección vale para todo el juego, no solo para el combate.
- **El aula es un PNG** dibujado píxel a píxel, de unos 480×520 píxeles, con una zona segura central que siempre se ve. Lo que se mueve son **sprites en el DOM animados con CSS**. **Sin WebGL.** Modificado por [ADR-0014](0014-pantalla-fija-de-9-16.md): el aula mide 180×320, es un marco fijo de 9:16 y no tiene zona segura. Modificado por [ADR-0017](0017-aula-en-planos-y-camara.md): el aula son cinco PNG, uno por plano, que mueve una cámara; sus animaciones pueden usar también la Web Animations API.
- **Escala entera según la pantalla**, la misma para todo el pixel art: ×2 en el móvil y ×3 o ×4 en tableta y PC. El juego va en una **columna vertical centrada**; en pantallas anchas el aula sigue a los lados. Modificado por [ADR-0014](0014-pantalla-fija-de-9-16.md): la escala se calcula en píxeles físicos y fuera del marco quedan franjas lisas.
- **Paleta de 32 colores** (FR-VIS-004), que conserva los 23 actuales y añade los del aula: el verde claro del pupitre, el verde azulado de la pizarra, la pared, la luz cálida y el gris de los paneles.
- **Capa de luz:** la luz que entra por las persianas es un PNG aparte, encima del aula, con 2 o 3 niveles de transparencia. Es la **única excepción** a la regla de píxeles opacos.
- **Ningún texto dibujado.** Los textos del aula (la pizarra, el pósit, la megafonía y los bocadillos) salen del catálogo de textos (NFR-I18N-001) y se pintan encima del dibujo. La única excepción son las iniciales de los días en el horario de corcho, «L M X J V», que la guía de arte admite como letras sueltas sin información de la interfaz.
- **Los tamaños de cada tipo de sprite los fija la guía de arte**, no siempre 16×16: iconos de 16×16, dibujos de las cartas de 24×24 y enemigos de 96×128. Modificado por [ADR-0014](0014-pantalla-fija-de-9-16.md): iconos de 12×12, retrato del enemigo de 16×16 y enemigos de 88×96.
- Las reglas de detalle (vista, tamaños, escala, luz, contorno, colores, textos, tono y referencias) viven en [`docs/GUIA-DE-ARTE.md`](../GUIA-DE-ARTE.md). La guía puede cambiar sin un ADR nuevo mientras no contradiga esta decisión.

## Alternativas descartadas

- **Vista cenital:** el pupitre visto desde arriba es una superficie plana que no se reconoce como pupitre, y los enemigos pierden la cara.
- **Vista de tres cuartos alta con el pupitre pintado en código:** se reconoce mejor, pero no deja ver el aula, y pintar la escena en código y en un shader es mucho más difícil de cambiar que editar un PNG.
- **Pupitre de madera:** el verde de formica es el que se reconoce como pupitre de un colegio español.
- **Mantener el shader de WebGL:** con un PNG y sprites del DOM hay menos código que mantener, no hace falta un fondo de respaldo cuando falta WebGL y el dibujo lo puede retocar el dueño con cualquier editor de pixel art.
- **Paleta de 24 colores:** no caben la pared, la pizarra, la luz y los paneles sin quitar colores que ya usan las cartas.
- **Usar como assets las imágenes de referencia:** no son pixel art de rejilla, no usan la paleta y su licencia es dudosa para R-4.

## Consecuencias

- El fondo de ADR-0004 deja de ser un shader: se retiran el renderer, el shader, sus colores y el fondo estático de respaldo (ticket 11 de H1).
- FR-VIS-001 y FR-VIS-004 cambian, y hay dos requisitos nuevos: la escala entera con la columna vertical (FR-VIS-008) y los textos del aula (FR-VIS-009).
- Hay que redibujar el arte actual con la vista baja: el Examen pasa a 96×128 y de pie, y los dibujos de las cartas a 24×24 (tickets 13 y 14). El diseño de las cartas no cambia.
- La paleta y un boceto del aula se aprueban antes de dibujar nada a tamaño final (ticket 10).
- Los PNG del aula y de la capa de luz entran en la caché offline de la PWA, así que su peso se anota.
- Los textos del aula tienen un tono propio, gamberro e irónico, con los límites que fija la guía de arte. El dueño revisa las frases.
