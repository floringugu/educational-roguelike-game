# ADR-0016: Interfaz del combate de papelería

- **Estado:** Propuesta
- **Fecha:** 2026-10-16
- **Origen:** FR-CMB-005, FR-VIS-004, NFR-ACS-001, NFR-USA-002, R-4, ticket 12 de H1. Modifica ADR-0014 y ADR-0015.

## Contexto

La imagen de referencia de ADR-0013 lleva la interfaz del combate en paneles oscuros, y ADR-0014 fija sus iconos en 12×12 píxeles del arte. El ticket 12 la hizo así, y después probó otras dos versiones:

- paneles oscuros con borde de píxel para el enemigo y para la barra inferior;
- marcos de papel con borde dorado, sacados del paquete CC0 *Tiny RPG - Mana Soul GUI*, para el panel del enemigo, el menú y Terminar turno;
- sin recuadros, con los textos y los iconos directamente sobre el aula y un contorno alrededor de las letras.

Ninguna funcionaba: ni el estilo, ni la colocación, ni el tamaño, ni lo bien que se leía. Los paneles oscuros y los marcos dorados no se parecen a nada de un aula, y las cartas, que son hojas de libreta, quedaban como de otro juego. Sin recuadros, los textos se perdían sobre el detalle del aula. Y los iconos de 12×12 se quedan pequeños en el móvil: a ×6, en un móvil de 360 px CSS de ancho, miden 24 px CSS.

Además, con una escala impar los textos no van exactamente a media escala: el píxel de la fuente se redondea hacia arriba al píxel físico entero (guía de arte, §3), y a ×3 las letras salen un 33 % más anchas. Con las piezas medidas para una escala par, «26/40», «40/40» y «Terminar» se salían de su papel a ×3.

## Decisión

- **La interfaz del combate es material escolar pegado en el aula**: sprites propios, en la paleta, con contorno de 1 píxel en `ink` (guía de arte, §5).
  - **Los contadores** (pila de robo, energía, vida, bloqueo y descarte) son recortes de libreta de 23×33 píxeles del arte, y el de la vida de 27×33, porque «26/40» es su número más largo. Cada uno lleva su dibujo encima del número y va sujeto con un trozo de celo del color de su dibujo: `lime` la pila de robo, `gold` la energía, `vermilion` la vida, `periwinkle` el bloqueo y `amber` el descarte.
  - **El panel del enemigo** es una tira de libreta de 87×28, pegada en la pared con celo `vermilion`, con el retrato a la izquierda del margen rojo y el nombre y la vida sobre las rayas. Su barra de vida es un recuadro de boli relleno de fosforito rojo.
  - **Terminar turno** es un pósit de 41×28 con el texto del catálogo en dos líneas, y **el menú**, un pósit de 21×21 con tres rayas. **La lista del menú** es una hoja de libreta, dibujada con CSS.
  - **La intención** es un bocadillo de papel de 31×21 sobre la cabeza del enemigo, con una cola corta que no tapa su cabecera.
- **Iconos de 16×16**, con contorno en `ink` y como mucho 6 colores.
- **Colocación:**
  - el menú, arriba a la izquierda, en x 5 e y 5 de la zona segura;
  - el panel del enemigo, arriba en el centro, en x 47-133 e y 11-38, encima de la pizarra y sin tapar sus zonas de texto;
  - los contadores, de pie sobre el pupitre verde, en una fila de 180 píxeles del arte, con la base como mucho en y 275 y siempre por encima de la mano. En una pantalla que solo enseña la zona segura suben lo que haga falta para que la mano quepa debajo;
  - la mano, abajo del todo, colocada desde el borde inferior del marco y no desde la zona segura. Puede entrar en el margen de abajo del aula.
- **Los textos siguen a media escala** (FR-VIS-008). Las piezas son lo bastante anchas para sus textos también con una escala impar, que es donde la fuente sale más ancha. El interlineado de los textos de dos líneas es de un número par de píxeles del arte, para que las letras caigan siempre en píxeles físicos enteros.
- **Cada texto pinta detrás el color de su papel**, que coincide con el del sprite y no se nota: `paper` en la libreta y `gold` en los pósits. Así el test de contraste sabe sobre qué fondo se lee (NFR-ACS-001). Los colores tienen sus roles en la paleta: `note…` para la libreta y `postIt…` para los pósits.
- **Lo que se toca mide al menos 44×44 px CSS** (NFR-USA-002). Si el dibujo es más pequeño, como el menú a ×3, una capa vacía alrededor amplía la zona que recibe el toque.

El resto de ADR-0014 y ADR-0015 sigue igual.

## Alternativas descartadas

- **Paneles oscuros con borde de píxel, como en la referencia de ADR-0013:** no encajan con el aula ni con las cartas.
- **Marcos de papel con borde dorado del paquete *Mana Soul*:** parecen de un juego de fantasía, no de un aula, y mezclan arte ajeno con el propio.
- **Sin recuadros, con los textos contorneados sobre el aula:** se leen mal sobre el detalle del dibujo.
- **Textos a escala entera:** «Terminar» mide 53 píxeles del arte, más que el pósit, y la fila de contadores no cabe en los 180 de la zona segura.
- **Contadores abajo, en la franja de y 285 a 320, con la mano sobre el pupitre:** era la colocación del ticket 12. Se comparó en maquetas con la elegida.
- **Iconos de 12×12 (ADR-0014):** se quedan pequeños en el móvil.
- **Piezas medidas solo para las escalas pares:** a ×3 y ×7 los textos se salen del papel.

## Consecuencias

- Cambia ADR-0014: los iconos pasan de 12×12 a 16×16.
- Cambia ADR-0015: la mano ya no tiene que quedar dentro de la zona segura; se coloca desde el borde inferior del marco y puede salir de ella por abajo.
- La guía de arte (§2, §5 y §6) y el ticket 12 cambian sus medidas.
- Hay 9 sprites de papelería y 2 iconos nuevos, el de la pila de robo y el de la energía, todos de arte propio, con su entrada en el catálogo y en el registro de licencias (R-4). Los demás iconos de la interfaz se redibujan a 16×16.
- La paleta gana los roles `note`, `noteText`, `noteRule`, `noteMargin`, `noteEdge`, `postIt` y `postItText`. Los de los paneles oscuros (`panel`, `panelEdge`, `panelText` y `healthBarTrack`) y los textos del pupitre (`deskText` y `deskTitle`) dejan de usarse; se pueden retirar cuando ninguna otra pantalla los necesite.
- Los contadores tapan en parte los objetos pintados en el pupitre: el chicle, el taco de pósits, la calculadora y la regla.
- Las cartas conservan su tamaño en px CSS, así que la altura de la fila de contadores depende de la pantalla. En una de 360×640 la fila va de y 207 a 240; en una de 360×800, de y 242 a 275.
