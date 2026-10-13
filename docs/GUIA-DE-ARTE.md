# Guía de arte

Reglas para que todo el arte de Empollatro parezca del mismo juego. Desarrolla [ADR-0013](adr/0013-aula-en-vista-baja-y-pupitre-verde.md), [ADR-0014](adr/0014-pantalla-fija-de-9-16.md) y [ADR-0015](adr/0015-aula-con-margen-sin-franjas-en-el-movil.md), y se aplica a los sprites (`src/assets/sprites/`), a las texturas (`src/assets/textures/`) y a los fondos (`src/assets/backgrounds/`), todos de arte propio ([ADR-0011](adr/0011-arte-propio.md)). La única excepción es la ciudad que se ve por la ventana, un trozo del paquete CC0 *City Mega Pack* de GrafxKid pasado a la paleta ([ADR-0004](adr/0004-arquitectura-visual-hibrida.md)): es una capa aparte, `classroom-city.png`, debajo del aula, con su propia entrada en el registro de licencias (R-4).

Cada regla dice cómo se comprueba:

- con un **test**, que falla si se incumple. Si el test todavía no existe, se indica el ticket que lo añade;
- con una **revisión** a ojo antes de añadir el asset.

## 1. Vista baja

Todo se ve como lo vería un alumno sentado en su silla: los ojos quedan poco por encima del pupitre, a la altura de la parte baja de la pizarra. *Revisión.*

- **El aula** tiene una perspectiva suave de un punto, con el punto de fuga en el centro de la pizarra. La pared del fondo se ve de frente, con la pizarra en el centro y el reloj y el corcho a la derecha. La pared de la izquierda se ve de lado, en perspectiva, con la ventana con persiana y el radiador debajo (§2): sus líneas horizontales van hacia el punto de fuga y las verticales siguen verticales.
- **El pupitre del primer plano** es lo que más cerca está: se ve casi toda su cara de arriba, la formica verde, y debajo una franja de su canto.
- **Los objetos sueltos** se ven de frente, con algo de su cara de arriba. Cuanto más por debajo de los ojos quedan, más se ve esa cara: de 1 a 3 píxeles en un objeto pequeño.
  - Los objetos que están sobre el pupitre del primer plano, como el estuche, el cuaderno y el boli, están solo un poco girados hacia el punto de fuga. No siguen del todo la perspectiva de la pared de la ventana: sus lados largos se inclinan bastante menos. Se ve su cara de arriba y el lado que mira al centro. El estuche y el cuaderno están en los bordes del aula entera, cortados por ellos. En un móvil que solo enseña la zona segura (§2) asoma su punta por una esquina del pupitre; en una pantalla más ancha se ve un poco más. El estuche lleva la cremallera a lo largo de la cara de arriba.
  - Una pila de libros muestra los lomos de frente y una franja de la tapa del libro de arriba.
  - Una taza es un cilindro de frente, con la boca como un óvalo estrecho arriba.
- **Las cosas planas que están de pie** (la pizarra, los carteles, el horario, el reloj) se ven de frente, sin perspectiva.
- **Los enemigos** están de pie sobre el pupitre, de frente y mirando al jugador.
- **Los iconos de la interfaz** son símbolos y se dibujan de frente.

## 2. Tamaños

| Asset | Tamaño en píxeles del arte | En un móvil de 1080 píxeles físicos de ancho, a ×6 | Cómo se comprueba |
| --- | --- | --- | --- |
| Iconos de la interfaz | 12×12 | 72×72 | test (ticket 12) |
| Dibujo de las cartas | 24×24 | 144×144 | test (ticket 14) |
| Enemigos | 88×96 | 528×576 | test (ticket 13) |
| Retrato del enemigo, en el panel del enemigo | 16×16 | 96×96 | test (ticket 13) |
| Aula | 216×432, con la zona segura de 180×320 en el centro | 1296×2592 | test (ticket 11) |
| Capa de luz | la misma que el aula | la misma que el aula | test (ticket 11) |
| Texturas | el tamaño con que las pinta el CSS, dividido entre la escala | según el CSS | test |

- **La zona segura** son los 180×320 del centro del aula, y todas las pantallas la enseñan entera (ADR-0015). El enemigo, los textos y la interfaz van dentro de ella. *Test (ticket 11).*
- **El margen** rodea la zona segura: 18 píxeles del arte a cada lado y 56 arriba y abajo. Continúa el aula (el techo con otro fluorescente, la ventana con su marco, el corcho con una foto de clase, los pupitres del fondo, el suelo y el pupitre verde) y se ve más o menos según la pantalla (§3). No lleva nada que haga falta para jugar. *Revisión.*
- **La composición** de la zona segura es la de la imagen de referencia. De arriba abajo, en píxeles del arte (x e y desde la esquina de arriba a la izquierda de la zona segura; en el margen son menores que 0 o mayores que 180 y 320):
  - el techo con un fluorescente, y el botón del menú arriba a la izquierda, de 22×22;
  - la pared de la izquierda, vista de lado hasta la esquina con la pared del fondo (x 34), con la ventana con persiana (x 0-33, y 0-113 con el alféizar) y la luz que entra por ella (§4). Por la ventana se ven la ciudad, con torres grises y marrones, y delante unos árboles de copa redonda, y debajo el radiador de hierro con el bocadillo en papel de aluminio encima (x 2-26, desde y 112 hasta el pupitre verde);
  - el panel del enemigo arriba, en el centro (x 47-133, y 18-36), entre los dos altavoces, que están a la misma altura (y 22-32), y el reloj arriba a la derecha;
  - la pizarra (x 46-150, y 41-108), con sus dos zonas de texto, y a su derecha el horario de corcho con el pósit (x 152-180, y 42-100);
  - la pared de dos tonos, que cambia de color en y 86, los pupitres del fondo con mochilas a los lados y el suelo, hasta y 157;
  - el pupitre verde del primer plano, desde y 157, con la punta del estuche asomando por la esquina de la izquierda y la del cuaderno de espiral, con el boli, por la de la derecha, en diagonal hacia el punto de fuga, y garabatos escritos en la formica a los dos lados (x 14-46 y x 136-154, y 184-216), que están por definir;
  - repartidas por todo el pupitre, hasta su borde de delante, cosas de estudiante pintadas en el aula, que no se mueven: una botella de agua (x 21-30, y 160-182), una chuleta doblada medio escondida bajo el cuaderno (x 158-174, y 186-197), un chicle (x 102-111, y 226-230), un taco de pósits (x 13-22, y 233-241), una calculadora (x 146-157, y 234-250) y una regla de madera (x 42-83, y 254-268). La mano de cartas tapa en parte las de abajo;
  - el enemigo de pie en el centro del pupitre, no en su borde (x 46-134, y 92-188), con los pies en y 188;
  - la mano de cartas (y 217-281);
  - la barra inferior (y 285-320), con botones de al menos 22 píxeles del arte de alto (§3).
- El boceto [`docs/arte/boceto-aula.png`](arte/boceto-aula.png) es la zona segura a tamaño final, ampliada ×3, con las zonas de la interfaz, del enemigo y de los textos. Al lado enseña cómo quedaba el marco fijo de 9:16 de ADR-0014 en un móvil de 412×915 y en un PC de 1920×1080, antes de añadir el margen. El aula final está en `art/classroom.aseprite`.

## 3. Escala entera

Todos los píxeles del juego miden lo mismo en pantalla: el aula, los sprites, los iconos, las cartas y sus texturas.

- **Una sola escala** para todo el pixel art, a través de un único valor compartido. Un píxel del arte mide siempre N×N píxeles físicos de la pantalla, con N entero. *Revisión*, con el tamaño que se pasa a `Sprite` (`src/components/Sprite.tsx`) y el del CSS.
- **Cómo se elige N:** la mayor escala entera con la que la zona segura de 180×320 cabe entera en la pantalla, contada en píxeles físicos (los píxeles CSS por la densidad de la pantalla, `devicePixelRatio`). *Test (ticket 11).*
- **El marco** es la parte de la pantalla que cubre el aula a esa escala: tanto como quepa, hasta los 216×432. El aula va centrada en el marco, y lo que no cabe del margen se queda fuera, a partes iguales a cada lado. *Test (ticket 11).* Por ejemplo:

  | Pantalla | Píxeles físicos | Escala | El marco mide, en px CSS | Se ve del aula, en píxeles del arte |
  | --- | --- | --- | --- | --- |
  | Móvil de 360×800 a densidad 3 | 1080×2400 | ×6 | 360×800 | 180×400 |
  | Móvil de 412×915 a densidad 2,625 | 1081×2401 | ×6 | 412×915 | 180×400 |
  | iPhone 15, de 393×852 a densidad 3 | 1179×2556 | ×6 | 393×852 | 196×426 |
  | Móvil de 320×568 a densidad 2 | 640×1136 | ×3 | 320×568 | 213×379 |
  | Móvil de 360×640 a densidad 2 | 720×1280 | ×4 | 360×640 | 180×320 |
  | Tableta de 820×1180 a densidad 2 | 1640×2360 | ×7 | 756×1180 | 216×337 |
  | PC de 1920×1080 a densidad 1 | 1920×1080 | ×3 | 648×1080 | 216×360 |

- **En el móvil, el marco llena la pantalla**, sin franjas. En tableta y PC, que son más anchos que el aula, el marco va centrado y lo que sobra son **franjas lisas de `ink`** a los lados. Solo un móvil más alargado que el aula entero, de 2:1, deja franjas finas arriba y abajo. *Revisión.*
- **Botones táctiles:** miden al menos 44×44 px CSS (NFR-USA-002). En un móvil de 1080 píxeles físicos, un píxel del arte mide unos 2 px CSS, así que un botón mide al menos 22×22 píxeles del arte. *Revisión.*
- **Los textos van a media escala:** cada píxel de la fuente mide la mitad que un píxel del arte, como en la referencia. Con una escala impar, se redondea hacia arriba al píxel físico entero: a ×3, cada píxel de la fuente mide 2 píxeles físicos. *Revisión.*
- Siempre con `image-rendering: pixelated`, para que el navegador no difumine los píxeles. *Revisión.*

## 4. Luz y sombra

- **La luz entra por la izquierda.** Las caras que miran a la izquierda y hacia arriba llevan el tono claro, y las de la derecha y de abajo el oscuro. *Revisión.*
- **El aula tiene dos ventanas**, las dos en la pared de la izquierda:
  - **la ventana del fondo**, con persiana, que se ve en la pared lateral (§1, §2) y da el sol del fondo;
  - **una ventana delantera que no se ve**, más cerca del jugador y fuera del dibujo, que ilumina el pupitre del primer plano.
- **La sombra que proyecta un objeto cae a su derecha**, sobre lo que tenga debajo, como la sombra de las cartas (`box-shadow` de `src/cards/Card.css`). La sombra de un enemigo cae sobre el pupitre, a la derecha de donde pisa. *Revisión.*
- Los fluorescentes dan una luz general y no proyectan sombras propias.
- **El fondo está en penumbra.** Todo lo que hay detrás del pupitre del primer plano (paredes, suelo, pizarra, pupitres del fondo) se dibuja un tono más oscuro de su rampa (§6), de forma uniforme. Solo recupera su tono claro donde le da el sol de la ventana del fondo. *Revisión.*
- **La mancha de sol** es la luz de la ventana del fondo proyectada sobre la parte baja de la pared del fondo y sobre el suelo:
  - Tiene la forma de la ventana: se ven los cristales separados por los marcos y el hueco de la lama rota de la persiana.
  - Cae en paralelogramos inclinados, de izquierda a derecha, que se doblan donde la pared se junta con el suelo y siguen por el suelo con la perspectiva del aula.
  - Pasa también por detrás del enemigo y asoma a los dos lados de él, así que se ve aunque el enemigo tape el centro.
  - No sube a la pizarra, para que sus textos se sigan leyendo, ni llega al pupitre del primer plano.
  - Sus bordes no tienen una línea marcada: se funden con la penumbra con un tramado, y son más difusos cuanto más lejos de la ventana caen.
- **El pupitre del primer plano** recibe la luz de la ventana delantera, que no se ve. Está más claro en la esquina de delante a la izquierda y se va oscureciendo hacia el fondo y hacia la derecha, en una transición suave, con tramado y sin líneas. Es luz opaca, dibujada en el PNG del aula con los tonos de su rampa, no en la capa de luz.
- **La pared de la ventana** está en penumbra, sin rayos ni manchas de sol encima. El radiador y el bocadillo de papel de aluminio se dibujan ya en penumbra, para que se lean bien.
- **La capa de luz** es la única excepción a la regla de píxeles opacos (§7):
  - Es el fichero `src/assets/backgrounds/classroom-light.png`, del mismo tamaño que el aula y encima de ella.
  - Aclara la mancha de sol y dibuja, muy tenue y plano, el haz de luz que cruza el aire desde la ventana hasta la mancha. El haz no pasa por encima de la pizarra ni de la pared de la ventana.
  - Acaba en el suelo, detrás del pupitre del primer plano: no llega al pupitre, a las cartas ni a la interfaz.
  - Solo usa colores de la rampa de luz (§6): `gold` en el haz y en los bordes de la mancha, y `sunbeam` en el centro de la mancha.
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
  | Iconos de 12×12 | 6 |
  | Dibujo de las cartas, 24×24 | 8 |
  | Retrato del enemigo | 8 |
  | Enemigos, 88×96 | 12 |

- **Sombreado por rampas.** Para aclarar u oscurecer una zona se pasa al color vecino de su rampa, sin saltar a otra rampa. *Revisión.* Las rampas, de oscuro a claro:
  - marrones y papel: `ink → bark → umber → leather → tan → sand → parchment → paper`
  - azules: `night → indigo → periwinkle → lavender`
  - rojos, amarillos y la luz: `wine → crimson → vermilion → amber → gold → sunbeam`. **La rampa de luz** de la capa de luz (§4) es `amber → gold → sunbeam`.
  - verdes: `forest → leaf → lime`
  - verdes apagados de la formica antigua: `olive → sage → khaki`
  - el pupitre verde y la parte de abajo de la pared: `spruce → moss → fern → celadon`
  - la pizarra: `spruce → teal`, la tiza borrada
  - la parte de arriba de la pared: `umber → taupe → sand`
  - los paneles de la interfaz y el metal: `ink → slate → steel`
- La muestra [`docs/arte/paleta.png`](arte/paleta.png) enseña los 32 colores en estas rampas, cada uno con su nombre. Un color con el borde discontinuo ya ha salido en una rampa de más arriba.

## 7. Píxeles

- **Sin semitransparencias:** cada píxel es opaco o del todo transparente. La capa de luz es la única excepción (§4). *Test.*
- **Sin antialiasing:** los bordes no se suavizan con tonos intermedios. *Revisión.*
- **Tramado (dithering) solo en las texturas y en las superficies grandes del aula**, como la pared o el techo. Los sprites usan zonas de color lisas. *Revisión.*
- **En los enemigos, formas grandes:** pocas zonas de color y nada de líneas sueltas de 1 píxel. Deben leerse en el móvil igual de claro que los iconos. *Revisión.*

## 8. Textos

**Ningún asset lleva texto legible dibujado.** Un texto dibujado no se puede cambiar ni leer en voz alta. Los textos salen del catálogo de textos (NFR-I18N-001) y se pintan encima del dibujo, con las fuentes de FR-VIS-005 y a media escala (§3). *Revisión.*

- **Los textos del aula** (FR-VIS-009):
  - la pizarra, a la izquierda: el nombre del tema del combate, que sale de los datos del tema y no del catálogo;
  - la pizarra, a la derecha: una frase del catálogo;
  - el pósit del corcho;
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
| `enemy-midterm` | Mide 96×96 en vez de 88×96 y no está de pie (§1, §2); texto «EXAMEN» (§8) | 13 |
| `enemy-math-teacher` | Sin contorno (§5); 14 colores (§6); líneas finas (§7); texto «MATES» (§8). Se propone retirarlo | 13 |
| `health-cross-*` | La vida con filas de símbolos se retira | 12 |
| `health-neuron-*`, `block-shield-*`, `discard-shredder*`, `intent-attack` | Miden 16×16 en vez de 12×12 (§2). Revisar con la vista baja (§1), el contorno (§5) y los colores (§6) | 12 |
| Texturas de las cartas | Se pintan a ×2 fijo: pasar a la escala entera (§3) | 14 |
