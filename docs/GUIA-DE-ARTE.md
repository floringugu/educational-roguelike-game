# Guía de arte

Reglas para que todo el arte de Empollatro parezca del mismo juego. Desarrolla [ADR-0013](adr/0013-aula-en-vista-baja-y-pupitre-verde.md) y se aplica a los sprites (`src/assets/sprites/`), a las texturas (`src/assets/textures/`) y a los fondos (`src/assets/backgrounds/`), todos de arte propio ([ADR-0011](adr/0011-arte-propio.md)).

Cada regla dice cómo se comprueba:

- con un **test**, que falla si se incumple. Si el test todavía no existe, se indica el ticket que lo añade;
- con una **revisión** a ojo antes de añadir el asset.

## 1. Vista baja

Todo se ve como lo vería un alumno sentado en su silla: los ojos quedan poco por encima del pupitre, a la altura de la parte baja de la pizarra. *Revisión.*

- **El aula** tiene una perspectiva suave de un punto, con el punto de fuga en el centro de la pizarra. La pared del fondo se ve de frente, y las paredes de los lados (persianas a la izquierda, corcho y reloj a la derecha) se ven un poco de lado.
- **El pupitre del primer plano** es lo que más cerca está: se ve casi toda su cara de arriba, la formica verde, y debajo una franja de su canto.
- **Los objetos sueltos** se ven de frente, con algo de su cara de arriba. Cuanto más por debajo de los ojos quedan, más se ve esa cara: de 1 a 3 píxeles en un objeto pequeño.
  - Un estuche es un rectángulo de tela visto de frente, con la cremallera en la franja de arriba.
  - Una pila de libros muestra los lomos de frente y una franja de la tapa del libro de arriba.
  - Una taza es un cilindro de frente, con la boca como un óvalo estrecho arriba.
- **Las cosas planas que están de pie** (la pizarra, los carteles, el horario, el reloj) se ven de frente, sin perspectiva.
- **Los enemigos** están de pie sobre el pupitre, de frente y mirando al jugador.
- **Los iconos de la interfaz** son símbolos y se dibujan de frente.

## 2. Tamaños

| Asset | Tamaño en píxeles del arte | En un móvil, a ×2 | Cómo se comprueba |
| --- | --- | --- | --- |
| Iconos de la interfaz | 16×16 | 32×32 px | test |
| Dibujo de las cartas | 24×24 | 48×48 px | test (ticket 14) |
| Enemigos | 96×128 | 192×256 px | test (ticket 13) |
| Retrato del enemigo, en el panel del enemigo | 24×24 (prov.) | 48×48 px | test (ticket 13) |
| Aula | unos 480×520, con una zona segura de 160×280 (prov.) | unos 960×1040 px, recortada | test (ticket 11) |
| Capa de luz | la misma que el aula | la misma que el aula | test (ticket 11) |
| Texturas | el tamaño con que las pinta el CSS, dividido entre la escala | según el CSS | test |

- **La zona segura** es la parte central del aula que siempre se ve entera, en cualquier pantalla. Toca el borde de abajo del aula, está centrada en horizontal y contiene lo que el jugador necesita ver: el pupitre del primer plano, el enemigo, las zonas de texto de la pizarra y del pósit, la mano de cartas y la barra inferior. El boceto del ticket 10 confirma su tamaño.
- **Fuera de la zona segura** solo va decoración: el techo, los fluorescentes, las ventanas, el corcho y los pupitres de los lados. Puede quedar recortada sin que se pierda nada del juego.

## 3. Escala entera

Todos los píxeles del juego miden lo mismo en pantalla: el aula, los sprites, los iconos, las cartas y sus texturas.

- **Una sola escala** para todo el pixel art, a través de un único valor compartido. Un píxel del arte mide siempre N×N píxeles CSS, con N entero. *Revisión*, con el tamaño que se pasa a `Sprite` (`src/components/Sprite.tsx`) y el del CSS.
- **Cómo se elige N:** la mayor escala entera, desde ×2, con la que la zona segura cabe entera en la pantalla. Si no cabe ni a ×2, se usa ×2. *Test (ticket 11).* Con la zona segura de 160×280:

  | Pantalla | Escala |
  | --- | --- |
  | 320×568 a 412×915 (móvil) | ×2 |
  | 820×1180 (tableta) | ×4 |
  | 1366×768 (PC) | ×2 |
  | 1920×1080 (PC) | ×3 |

- **La columna vertical:** el juego va en una columna centrada del ancho de la zona segura por la escala. En pantallas más anchas, el aula sigue a los lados de la columna y no quedan franjas vacías. *Revisión.*
- **El pupitre queda anclado abajo y centrado.** Según la pantalla, se recortan el techo y los lados. *Revisión.*
- Siempre con `image-rendering: pixelated`, para que el navegador no difumine los píxeles. *Revisión.*

## 4. Luz y sombra

- **La luz entra por las persianas de la izquierda.** Las caras que miran a la izquierda y hacia arriba llevan el tono claro, y las de la derecha y de abajo el oscuro. *Revisión.*
- **La sombra que proyecta un objeto cae a su derecha**, sobre lo que tenga debajo, como la sombra de las cartas (`box-shadow` de `src/cards/Card.css`). La sombra de un enemigo cae sobre el pupitre, a la derecha de donde pisa. *Revisión.*
- Los fluorescentes dan una luz general y no proyectan sombras propias.
- **La capa de luz** es la única excepción a la regla de píxeles opacos (§7):
  - Es el fichero `src/assets/backgrounds/classroom-light.png`, del mismo tamaño que el aula y encima de ella.
  - Dibuja los rayos de las persianas: bandas que bajan en diagonal desde la ventana, de izquierda a derecha, y los cuadros de luz que dejan en el suelo, la pared y el pupitre.
  - Solo usa colores de la rampa de luz (§6).
  - Cada píxel tiene una de estas transparencias, de 255: **0** (no pinta), **64**, **128** o **192**. *Test (ticket 11).*

## 5. Contorno

*Revisión.*

- **Enemigos e iconos de la interfaz:** contorno exterior de 1 píxel en `ink`. Así se separan del aula. Ya lo llevan los escudos, las neuronas, la trituradora y el Examen.
- **Dibujo de las cartas:** sin contorno. Sus bordes son de un tono claro, para que el dibujo destaque sobre la ventana oscura (`bark`) de la carta.
- **El aula y sus objetos animables:** sin contorno en `ink`. Cada forma se cierra con el tono más oscuro de su propia rampa, para que el aula quede detrás de los enemigos y de la interfaz.

## 6. Colores

- Solo colores de la paleta de `src/theme/palette.ts`, que tiene hasta 32 (FR-VIS-004). *Test.*
- **Máximo por sprite, contorno incluido.** El aula no tiene máximo. *Revisión.*

  | Asset | Colores |
  | --- | --- |
  | Iconos de 16×16 | 6 |
  | Dibujo de las cartas, 24×24 | 8 |
  | Retrato del enemigo | 8 |
  | Enemigos, 96×128 | 12 |

- **Sombreado por rampas.** Para aclarar u oscurecer una zona se pasa al color vecino de su rampa, sin saltar a otra rampa. *Revisión.* Las rampas, de oscuro a claro:
  - marrones y papel: `ink → bark → umber → leather → tan → sand → parchment → paper`
  - azules: `night → indigo → periwinkle → lavender`
  - rojos y amarillos: `wine → crimson → vermilion → amber → gold`
  - verdes: `forest → leaf → lime`
  - verdes apagados de la formica del pupitre: `olive → sage → khaki`
  - las rampas nuevas del aula (la pizarra, la pared, la luz y los paneles de la interfaz) las fija el ticket 10 y se añaden aquí.

## 7. Píxeles

- **Sin semitransparencias:** cada píxel es opaco o del todo transparente. La capa de luz es la única excepción (§4). *Test.*
- **Sin antialiasing:** los bordes no se suavizan con tonos intermedios. *Revisión.*
- **Tramado (dithering) solo en las texturas y en las superficies grandes del aula**, como la pared o el techo. Los sprites usan zonas de color lisas. *Revisión.*
- **En los enemigos, formas grandes:** pocas zonas de color y nada de líneas sueltas de 1 píxel. Deben leerse en el móvil igual de claro que los iconos. *Revisión.*

## 8. Textos

**Ningún asset lleva texto legible dibujado.** Un texto dibujado no se puede cambiar ni leer en voz alta. Los textos salen del catálogo de textos (NFR-I18N-001) y se pintan encima del dibujo, con las fuentes de FR-VIS-005. *Revisión.*

- **Los textos del aula** (FR-VIS-009):
  - la pizarra, a la izquierda: el nombre del tema del combate, que sale de los datos del tema y no del catálogo;
  - la pizarra, a la derecha: una frase del catálogo;
  - el pósit;
  - los avisos de la megafonía;
  - los bocadillos.
- Cada texto del aula tiene su zona en el dibujo, que exporta el ticket 11, y no se sale de ella a ninguna escala. *Test (ticket 15).*
- Sus colores imitan la tiza en la pizarra y el boli en el pósit, y cada par de texto y fondo pasa el test de contraste (NFR-ACS-001). *Test.*
- **Garabatos:** las casillas del horario, los dibujos del pupitre, la chuleta y el Examen solo llevan garabatos que sugieren escritura, sin letras que se lean.
- **Excepción:** la cabecera del horario de corcho lleva las iniciales de los días, «L M X J V», en letras de 3×5 píxeles. Son cinco letras sueltas que no dan información de la interfaz y que lo hacen reconocible como horario de un colegio español.

## 9. Referencias de la educación española

El aula está llena de cosas que reconoce cualquiera que haya estudiado en España. Una lista para empezar, que se puede ampliar:

- la pizarra verde de tiza, con su cajetín de tizas y el borrador;
- «Tema N» escrito en la pizarra (con el nombre del tema, §8);
- el horario de corcho con L M X J V;
- las persianas, con alguna lama rota;
- los fluorescentes del techo;
- los altavoces de la megafonía;
- el reloj de pared;
- el radiador de hierro;
- el estuche y el cuaderno de espiral;
- las mochilas colgadas de las sillas;
- la agenda escolar;
- el boletín de notas;
- la EBAU;
- la recuperación de septiembre.

## 10. Marcas

- Se pueden **parodiar los nombres** de marcas reales con un juego de palabras: una goma Zilan en vez de Milan. *Revisión.*
- **Nunca** se usan sus logotipos ni se copia su diseño (colores, tipografía o forma reconocible del envase). *Revisión.*

## 11. Tono de los textos

Los textos del aula son **gamberros e irónicos**, con referencias a la cultura y a la educación de España. Las preguntas, las correcciones y las citas no siguen este tono. *Revisión:* el dueño revisa cada frase antes de que entre en el catálogo.

- **Se puede satirizar** a colectivos, figuras genéricas e instituciones: el profe de guardia, el ministro de turno, los de letras, el grupo de WhatsApp de padres, las leyes educativas, la EBAU o PISA.
- **Palabrotas**, solo de vez en cuando y como remate de una frase.
- **No se puede:**
  - nombrar a personas reales con nombre y apellidos;
  - hacer burla por raza, religión, orientación sexual, discapacidad u origen.
- Ejemplos del tono:
  - «Nueva ley educativa. La anterior ni la leímos.»
  - «El ministro tampoco se lo sabe.»
  - «Copiar está mal. Que te pillen, peor.»
  - «Estudia o acabarás de tiktoker.»
  - «Se le recuerda a los estudiantes que no pueden usar los baños para esconderse de sus clases.»
  - «Profe, ¿hoy no hay deberes?»

## 12. Lista de comprobación de un asset nuevo

1. Se ve en la vista baja (§1).
2. Tiene el tamaño de su tipo (§2) y se pinta con la escala entera (§3).
3. La luz viene de la izquierda y la sombra cae a la derecha (§4).
4. El contorno es el de su tipo (§5).
5. Usa colores de la paleta, no pasa del máximo y sombrea por rampas (§6).
6. No tiene semitransparencias (salvo la capa de luz) ni antialiasing, y solo lleva tramado si es una textura o el aula (§7).
7. No lleva texto legible (§8).
8. Si parodia una marca, no usa su logotipo ni su diseño (§10).
9. Está en el catálogo (`src/assets/sprite-ids.ts`), si es un sprite, y en el registro de licencias (`src/data/licenses.ts`, R-4).
10. Es dibujo propio y no está copiado ni calcado de otro juego ni de las imágenes de referencia (R-3).
11. `npm test` pasa.

## Pendiente

Assets actuales que incumplen la guía y hay que redibujar, ajustar o retirar:

| Asset | Qué incumple | Ticket |
| --- | --- | --- |
| `card-art-*` | Miden 16×16 (§2) y no siguen la vista baja (§1) | 14 |
| `enemy-midterm` | Mide 96×96 y no está de pie (§1, §2); texto «EXAMEN» (§8) | 13 |
| `enemy-math-teacher` | Sin contorno (§5); 14 colores (§6); líneas finas (§7); texto «MATES» (§8). Se propone retirarlo | 13 |
| `health-cross-*` | La vida con filas de símbolos se retira | 12 |
| `health-neuron-*`, `block-shield-*`, `discard-shredder*`, `intent-attack` | Revisar con la vista baja (§1), el contorno (§5) y los colores (§6) | 12 |
| Texturas de las cartas | Se pintan a ×2 fijo: pasar a la escala entera (§3) | 14 |
| Fondo del pupitre en WebGL (`src/background/`) | Lo sustituye el aula en PNG (ADR-0013) | 11 |
