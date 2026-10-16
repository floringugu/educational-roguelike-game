# ADR-0015: Aula con margen y sin franjas en el móvil

- **Estado:** Aceptada. La colocación de la mano la modifica [ADR-0016](0016-interfaz-del-combate-de-papeleria.md).
- **Fecha:** 2026-10-13
- **Origen:** FR-VIS-008, ticket 11 de H1. Modifica ADR-0014.

## Contexto

ADR-0014 pinta el juego en un marco fijo de 9:16, con un aula de 180×320 píxeles del arte, y deja franjas lisas de `ink` fuera del marco.

Casi todos los móviles de hoy son más alargados que 9:16, de 9:19,5 a 9:20. Por eso, al pintar el aula en PNG (ticket 11), el marco dejaba en el móvil una franja arriba y otra abajo de 80 a 90 px CSS cada una. En un juego pensado para el móvil (NFR-USA-002), eso es casi una quinta parte de la pantalla sin usar.

## Decisión

- **El aula es un PNG de 216×432 píxeles del arte.** En el centro está la **zona segura** de 180×320, con la disposición de la imagen de referencia de ADR-0014. Alrededor hay un **margen** de 18 píxeles del arte a cada lado y de 56 arriba y abajo, que continúa el aula: el techo, la ventana, el corcho, los pupitres del fondo, el suelo y el pupitre verde.
- **La escala entera se elige con la zona segura**: es la mayor con la que caben los 180×320, contada en píxeles físicos, como en ADR-0014.
- **El marco es la parte de la pantalla que cubre el aula** a esa escala: tanto como quepa, hasta los 216×432. El aula se centra en el marco, y lo que no cabe del margen se queda fuera, a partes iguales a cada lado.
- **En el móvil, el aula llena la pantalla**, sin franjas. En tableta y PC, que son más anchos, quedan **franjas lisas de `ink`** a los lados, con el marco centrado.
- **Las posiciones se cuentan desde la esquina de la zona segura.** Un sprite del margen tiene una x o una y menor que 0, o mayor que 180 o 320.
- **El enemigo, los textos y la interfaz van dentro de la zona segura**, porque es lo único que se ve en todas las pantallas. Lo que vaya pegado al borde de la pantalla, como la barra inferior, se coloca respecto al borde del marco, que cambia según el móvil. Modificado por [ADR-0016](0016-interfaz-del-combate-de-papeleria.md): la mano se coloca desde el borde inferior del marco y puede salir de la zona segura por abajo.
- **El estuche, el cuaderno y el boli** se desplazan 18 píxeles del arte hacia fuera, con los bordes del pupitre, sin cambiar de tamaño. Un móvil que solo enseña la zona segura ve su punta, como en la referencia; uno más ancho ve un poco más.

El resto de ADR-0014 sigue igual: la escala en píxeles físicos, los tamaños de los sprites y los textos a media escala.

## Alternativas descartadas

- **Marco fijo de 9:16 con franjas (ADR-0014):** pierde casi una quinta parte de la pantalla del móvil.
- **Escala no entera para llenar la pantalla:** los píxeles del arte medirían distinto unos de otros.
- **Estirar o repetir el fondo en las franjas:** no se parece a un aula, y en un juego de pixel art se nota.
- **Margen solo arriba y abajo:** los móviles cuyo ancho no es múltiplo de 180 píxeles físicos, como un iPhone de 1179, dejarían franjas a los lados.
- **Margen arriba más grande que abajo:** encaja mejor con la barra de estado del móvil, pero mueve la composición de la referencia en las pantallas que enseñan todo el margen.
- **Ampliar el estuche y el cuaderno con el pupitre:** cambian de tamaño respecto al resto del aula y dejan de parecer el mismo objeto.

## Consecuencias

- FR-VIS-008 cambia: el marco ya no es fijo de 9:16, y en el móvil no hay franjas.
- La guía de arte (§1, §2 y §3) cambia sus medidas.
- El margen hace que el PNG del aula pese unos 3 kB más.
- La interfaz del combate (ticket 12) debe colocar la mano y la barra respecto a los bordes del marco, no a una altura fija del aula, y mantenerlas dentro de la zona segura.
- Cuánto margen se ve depende de la pantalla. En un móvil de 1080 píxeles físicos de ancho se ven 180×400 píxeles del arte; en un iPhone 15, unos 196×426; en uno de 640×1136, unos 213×379.
- En un móvil más alargado que el aula entero, de 2:1, siguen quedando franjas finas arriba y abajo. Por ejemplo, un iPhone 11 de 414×896 px CSS a pantalla completa deja 16 px CSS arriba y otros 16 abajo. En el navegador, la barra de direcciones quita alto y no quedan.
- Para que el aula se vea nítida con densidades como 2,625, el navegador la pinta en una capa propia (`will-change: transform`). En un móvil de 1080×2400 píxeles físicos esa capa ocupa unos 13 MB de memoria de vídeo.
