# ADR-0017: Aula en planos y cámara

- **Estado:** Propuesta
- **Fecha:** 2026-10-17
- **Origen:** FR-VIS-001, FR-VIS-007, NFR-PRF-003, R-4, ticket 16 de H1. Modifica ADR-0013.

## Contexto

ADR-0013 dibuja el aula como un solo PNG, con la capa de luz encima y sprites del DOM animados con CSS. Así el aula queda plana: nada se mueve con un golpe, y el temblor de un golpe movía la pantalla entera, la interfaz incluida, como una imagen que se agita.

El dueño aprobó una maqueta con profundidad. Una cámara mueve el aula por planos, los cercanos más que los lejanos. El enemigo cae sobre el pupitre y se inclina en 3D cuando le aciertan. Y el aula tiene animaciones lentas en bucle, como la nube o el segundero.

## Decisión

- **El aula son cinco PNG, uno por plano**, del más lejano al más cercano:
  - **la ciudad**, la que se ve por la ventana;
  - **la sala:** las paredes con el hueco del cristal, la ventana y su marco, la pizarra, el corcho y la luz del reloj;
  - **los pupitres del fondo**, con sus mochilas;
  - **la luz** de las persianas, semitransparente;
  - **el pupitre**, con sus marcas, sus sombras y sus objetos.
- Los planos opacos repiten su borde 12 píxeles del arte alrededor y miden 240×456. Así ningún movimiento de la cámara deja ver un hueco en el borde del marco. La luz mide 216×432, como el aula.
- **La cámara solo desplaza los planos**: no gira ni hace zoom. Cada plano se mueve una fracción de lo que se mueve el pupitre:

  | Plano | Fracción |
  | --- | --- |
  | ciudad | 0 |
  | sala | 1/3 |
  | pupitres del fondo | 2/3 |
  | luz | 1/3 |
  | pupitre | 1 |

  La luz va con la sala, porque cae sobre sus paredes.
- **La cámara hace tres movimientos:**
  - **un temblor con cada golpe:** 380 ms, como mucho 5 píxeles del arte, más fuerte cuanto más daño hace;
  - **el asiento, al empezar el combate:** los planos suben desde abajo y se frenan al llegar, en 800 ms. El pupitre parte de 12 píxeles más abajo y la ciudad, que por lo demás no se mueve, de 2;
  - **el aterrizaje:** el pupitre se hunde 3 píxeles bajo el enemigo que cae en él y vuelve en 220 ms, de píxel en píxel.
- **Todo se mueve en píxeles enteros del arte, a saltos.** Los fotogramas clave salen de `camera.ts`, que no tiene código del navegador y se prueba en Node. Se calculan cada 8 ms y se redondean al píxel. El navegador los reproduce con la Web Animations API (`Element.animate`) y `steps(1, end)`, de modo que un plano nunca queda entre dos píxeles físicos y el arte no se emborrona (ADR-0014). Un movimiento nuevo sustituye al anterior.
- **Lo que está sobre un plano se mueve con él.** El enemigo, su sombra y su intención van con el pupitre. **La interfaz no se mueve**: los recortes, los pósits y la mano se quedan quietos, para que se lean y se toquen bien durante el temblor.
- **El enemigo entra cayendo sobre el pupitre:** baja 170 píxeles del arte en 300 ms, cada vez más rápido, a saltos de píxel entero. Hasta que aterriza, no se ven ni su sombra ni su intención. El primero cae cuando la cámara casi se ha sentado, a los 560 ms; los siguientes, en cuanto cae el anterior.
- **Cuando le aciertan, el enemigo se inclina en 3D:** se echa hacia atrás desde los pies, girando un poco, y vuelve al reposo como un muelle, en 460 ms. Es una perspectiva de CSS, como la de las cartas (FR-VIS-002). En reposo no cambia ningún píxel del enemigo.
- **El aula tiene bucles lentos:**
  - la nube cruza la ventana;
  - el árbol se mece;
  - el segundero avanza;
  - una lama de la persiana tiembla de vez en cuando;
  - motas de polvo suben por la luz.

  Son sprites del DOM y se animan con CSS: o cambian de fotograma, o se desplazan a saltos de píxel entero.
- **Cuándo se para todo** (FR-VIS-007, NFR-PRF-003):
  - con la pestaña oculta, los bucles esperan donde están;
  - si la media baja de 30 fps durante 5 s, el aula se queda quieta hasta que se vuelve a abrir la app;
  - con `prefers-reduced-motion`, el aula está quieta desde el principio, la cámara no se mueve, el enemigo no cae ni se inclina, y su derrota no dura nada.
- **Sin WebGL**, como en ADR-0013.

## Alternativas descartadas

- **Mover la pantalla entera con el golpe**, como hasta ahora: el aula no tiene profundidad, y la interfaz tiembla justo cuando hay que leerla.
- **Planos en WebGL o en un canvas:** más código, un fondo de respaldo para cuando falta WebGL y más gasto de batería. Con el DOM bastan unos `transform`.
- **Movimiento continuo, sin saltos de píxel:** a una escala entera, un plano desplazado medio píxel del arte se emborrona.
- **Un solo PNG**, como en ADR-0013: no se pueden mover los planos por separado.
- **Mover también la interfaz con la cámara:** se lee y se toca peor durante el temblor.
- **Zoom de la cámara:** con una escala entera no hay pasos intermedios. De ×3 a ×4, el aula crece un tercio de golpe.

## Consecuencias

- Cambia ADR-0013: el aula ya no es un PNG, sino cinco planos con una cámara, y sus animaciones pueden usar la Web Animations API además de CSS. También cambia el texto de FR-VIS-001.
- Cada plano opaco es la fusión de unas capas de `art/classroom.aseprite`, con el borde repetido 12 píxeles. La guía de arte (§7) dice qué capas van en cada uno.
- La ciudad crece 3 píxeles, repitiendo su borde, para seguir llenando la ventana cuando la cámara se mueve. Está anotado en el registro de licencias (R-4).
- Los fondos pesan 14 068 bytes, frente a los 13 027 de antes (10 705 del aula y 2 322 de la ciudad), y entran en la caché offline de la PWA.
- Un test comprueba que los planos cubren el marco en reposo y en cada paso de cada movimiento de la cámara.
- Cada enemigo tiene un sprite de sombra aparte, que se queda en el pupitre aunque el enemigo caiga o se incline (ticket 13).
- El panel del enemigo se pinta por encima del enemigo, que pasa por detrás de él al caer.
