# ADR-0014: Pantalla fija de 9:16

- **Estado:** Aceptada
- **Fecha:** 2026-10-12
- **Origen:** FR-VIS-008, NFR-USA-002, ticket 10 de H1. Modifica ADR-0013.

## Contexto

ADR-0013 dibujaba el aula en un PNG de 704×520 píxeles con una zona segura central de 160×320 que siempre se veía. Fuera de la zona segura, el aula seguía hacia los lados y hacia arriba según la pantalla, para que no quedaran franjas vacías.

Al bocetarla (ticket 10) salieron dos problemas:

- La imagen de referencia es la pantalla de un móvil en 9:16. Para que la ventana, la pizarra, el enemigo, la mano y la barra cupieran a la vez en la zona segura, había que estrechar la pizarra y mover la ventana, y la disposición dejaba de parecerse a la referencia.
- Un aula que cambia según la pantalla obliga a decidir qué se ve en cada una, y cada decisión aleja la composición de la referencia.

## Decisión

- **El juego se pinta en un marco fijo de 9:16.** Dentro, el aula y la interfaz siguen la disposición de la imagen de referencia, sin cambios según la pantalla.
- **El aula es un PNG de 180×320 píxeles**, que es todo el marco. No hay zona segura: todo el aula se ve siempre.
- **La escala entera se calcula en píxeles físicos** de la pantalla, no en píxeles CSS: es la mayor con la que el marco cabe entero. Un móvil de 1080 píxeles físicos de ancho pinta cada píxel del arte a 6×6 y llena el ancho; uno de 720 lo pinta a 4×4 y uno de 1440 a 8×8.
- **Fuera del marco, franjas lisas de `ink`**, con el marco centrado. En un móvil más alargado que 9:16 quedan arriba y abajo; en tableta y PC, a los lados.
- **Tamaños de los sprites**, que fija la guía de arte: enemigos de 88×96, retrato del enemigo de 16×16, iconos de 12×12 y dibujos de las cartas de 24×24.
- **Los textos se pintan a media escala:** cada píxel de la fuente mide la mitad que un píxel del arte, como en la referencia.

El resto de ADR-0013 sigue igual: la vista baja, el pupitre verde, el PNG con sprites en el DOM sin WebGL, la paleta de 32 colores, la capa de luz y los textos del catálogo.

## Alternativas descartadas

- **Aula de 704×520 con zona segura (ADR-0013):** la zona segura no deja mantener la disposición de la referencia, y el aula se ve distinta en cada pantalla.
- **El aula continúa fuera del marco:** evita las franjas, pero es mucho más arte que dibujar para algo que no se juega. Se puede añadir más adelante sin tocar el marco.
- **Aula de 270×480:** más detalle, pero un móvil de 720 píxeles físicos la pintaría a ×2 y dejaría franjas a los lados.
- **Escala no entera para llenar la pantalla:** los píxeles del arte medirían distinto unos de otros.
- **Textos a la escala del arte:** las letras quedan el doble de grandes y en una carta solo caben unas 5 por línea.

## Consecuencias

- FR-VIS-008 cambia: la escala entera, el marco de 9:16 y las franjas. Desaparece el valor de la zona segura de la §10.2 del SRS.
- La guía de arte (§1, §2, §3 y §8) y los tickets 10 a 14 de H1 cambian sus medidas.
- Hay que redibujar los iconos actuales a 12×12 (ticket 12). El Examen se redibuja a 88×96 (ticket 13).
- Los botones táctiles miden al menos 44 px CSS (NFR-USA-002). En un móvil de 1080 píxeles físicos, un píxel del arte mide unos 2 px CSS, así que los botones tienen al menos 22 píxeles del arte de alto.
- En los móviles más alargados que 9:16, que hoy son casi todos, se pierde parte de la pantalla en las franjas: unos 180 px CSS de alto en un móvil de 412×915.
