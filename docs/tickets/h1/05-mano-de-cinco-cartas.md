# 05: Mano de 5 cartas

**Qué construir:** en la parte de abajo de la pantalla en vertical, una mano de 5 cartas en abanico. Las cartas tienen arte del catálogo. Al tocarlas o arrastrarlas se inclinan en 3D con un movimiento de muelle, y al menos una carta lleva acabado foil y otra holo.

**Bloqueado por:** 03.

**Requisitos:** FR-VIS-002, FR-VIS-004, NFR-USA-002, NFR-ACS-001.

**Estado:** listo

- [x] Se ven 5 cartas en abanico y se pueden usar con el pulgar de una mano en vertical.
  - La mano está abajo de la pantalla de Inicio. Cada carta gira 4° más que la anterior, y las de los lados quedan más bajas, así que los bordes de arriba dibujan un arco. A 320 y a 393 px de ancho caben las 5 sin scroll.
- [x] Cada carta muestra su nombre, su coste y su descripción con las tipografías y la paleta del ticket 03. Los textos salen del catálogo de textos.
  - La carta es una hoja de libreta (ver «Diseño de las cartas» en las notas). Muestra también su tipo: Ataque, Defensa o Habilidad.
  - Nombre, coste y cifras de la descripción en m6x11plus a 18 px. La descripción va en Pixelify Sans a 12 px y se lee a 18 px con la carta levantada, que crece ×1,5. La etiqueta del tipo va a 10 px en mayúsculas.
  - Los textos están en `es.ts`: `cards.<id>.name`, `cards.<id>.description` y `cardTypes.<tipo>`. La palabra «Coste» solo la oyen los lectores de pantalla.
  - Colores nuevos de la paleta: `card` (papel), `cardText` (tinta), `cardRule` (renglones), `cardFrame` (borde), `cardShadow` (sombra y agujeros), `cardArt` (ventana del arte), `cardPhotoEdge` (canto de la foto), `cardCost` (boli rojo), los de cada tipo (`cardAttack`, `cardDefense`, `cardSkill` y sus versiones `…Light` para el celo) y los de las ediciones (`cardDiploma`, `cardCrease`, `cardSheetEdge`, `cardSealEdge`, `foilSeal`, `foilSealRing`, `foilShine`, `holoSeal`, `holoSealRing`, `holoEmblem` y `holoBand1` a `holoBand4`) y los de las manchas de café (`cardCoffee` y `cardCoffeeEdge`). Los pares de texto nuevos están en el test de contraste (NFR-ACS-001).
- [x] La carta se inclina en 3D siguiendo el dedo y vuelve a su sitio con un movimiento de muelle.
  - Al tocarla, sube 56 px, crece ×1,5 y se inclina hacia el punto que pisa el dedo. Al arrastrarla, sigue al dedo y se ladea según la velocidad. Al soltarla, vuelve con un muelle que se pasa un poco y rebota.
- [x] Al menos una carta tiene acabado foil y otra holo, hechos con CSS propio y sin copiar código GPL (R-3).
  - Faltar es foil y Chuleta es holo (ver «Ediciones» en las notas). El brillo de los sellos es CSS propio; las hojas arrugadas y las manchas de café son PNG propios (ADR-0011).
- [x] La zona táctil de cada carta mide al menos 44×44 px.
  - Medido en el navegador: la parte que se ve de cada carta mide al menos 47 px de ancho a 320 px de pantalla, 57 px a 360 px y 65 px a 393 px. Las cartas miden 84×118 px.
- [x] Las cartas son datos de prueba en un JSON, no componentes escritos uno a uno.
  - Están en `src/prototype/cards.json`, con `id`, `type`, `cost`, `art`, `edition` y, si la tiene, `stain` (la mancha de café). `parseCards` los valida al cargar y dice qué carta falla.
- [ ] Con el fondo del ticket 04 activo y la mano en pantalla, el móvil del dueño mantiene ≥ 30 fps. El valor queda anotado en el ticket, si el 04 ya está terminado.
  - Falta medirlo en el móvil (ver «Cómo medir los fps en el móvil» en las notas).

**Notas:**

- **Diseño de las cartas.** Cada carta es una hoja de libreta, en un estilo propio:
  - Papel con renglones, agujeros de espiral arriba, línea de margen, marco de cuero y una sombra de tinta dura.
  - El arte es una foto pegada con celo y algo girada. El coste va rodeado con boli rojo.
  - El color del tipo marca la línea del margen, el celo, el nombre, la etiqueta del tipo y las cifras de la descripción: granate para Ataque, añil para Defensa y verde para Habilidad.
  - Los textos en el color del tipo llevan el papel de fondo, así que los renglones se cortan bajo ellos: esos colores no llegan a 4,5:1 sobre el lavanda de los renglones (NFR-ACS-001). El texto en tinta sí puede ir sobre los renglones.
  - Las cartas miden siempre 84 px de ancho, el tamaño para el que está dibujado su interior. En pantallas estrechas se solapan más, en lugar de encogerse.
- **Cartas de prueba.** Tizazo (Ataque, 1), Faltar (Defensa, 1, foil), Cafelito (Habilidad, 2, cerco con salpicón), Chuleta (Ataque, 2, holo) y Tocho (Defensa, 2, esquina y cerco).
- **Arte propio** (ADR-0011). Los dibujos de las cartas son sprites propios de 16×16 con colores de la paleta, con licencia CC0 y su entrada en el registro de licencias: tiza, pupitre vacío, café, chuleta doblada y pila de libros. Sustituyen a la espada, el escudo y la poción de Kenney.
- **Muelles.** Se usan con Motion (ADR-0004) en su forma ligera: componentes `m` dentro de `LazyMotion` con `domMin`, que es el conjunto de funciones más pequeño con el que se mueven. Los valores van directos al `transform` de la carta sin volver a pintar el componente con React.
- **Ediciones.** Una carta especial no es una hoja de libreta sino un documento académico arrugado, como si hubiera pasado el curso en el fondo de la mochila. Lleva un sello cuyo brillo se mueve cuando la carta gira.
  - **Foil: un título.** Pergamino arrugado con el canto tostado y un sello dorado con dos lazos del color del tipo. Una banda de luz cruza el sello.
  - **Holo: un certificado.** Papel arrugado con el canto tostado, como el título, y el sello marrón de la universidad, con un birrete. El sello no es azul, porque el azul es el color de las cartas de Defensa. Una banda de cuatro colores holográficos cruza el sello.
  - El sello va en la esquina de abajo a la izquierda de la foto. Es la parte de la carta que no tapa su vecina en la mano, así que se ve también a 320 px.
  - Una hoja arrugada no es un rectángulo: su contorno está doblado y dentado. Cada hoja es un PNG propio de 87×122 en `src/assets/textures/`, con un píxel por cada píxel de la carta (84×118, más 3 y 4 px de sombra). Lleva todo dentro: el contorno, el canto, la sombra de tinta y muchas facetas triangulares de los pliegues en papel, pergamino y arena. La carta ya no tiene fondo, color de borde ni sombra propios: la hoja se pinta detrás de sus textos.
  - Por dentro, la hoja solo usa papel, pergamino y arena, y el texto en tinta pasa de 4,5:1 sobre los tres. Los textos en el color del tipo siguen con su fondo de papel (NFR-ACS-001). El canto queda fuera del relleno de la carta, así que ningún texto llega a él. Un test comprueba los colores, el tamaño y que la zona de los textos no toca el canto.
- **Manchas de café** (campo `stain` de la carta). Un guiño en las cartas que parecen de mucho estudiar: ahora Tocho y Cafelito; más adelante, Repaso y Trasnochar. Solo las lleva una hoja de libreta: una carta es arrugada o manchada, nunca las dos cosas, y `parseCards` rechaza una mancha en un título o un certificado. Hay cuatro:
  - `ring`: el cerco grueso de una taza, más oscuro en el borde, donde se seca el café;
  - `ring-splash`: el cerco con un salpicón y unas gotas al lado;
  - `corner`: la esquina de abajo a la izquierda empapada, como si se hubiera derramado el café;
  - `corner-ring`: la esquina empapada y un cerco a la derecha.
  - Son PNG propios en `src/assets/textures/`, dibujados a la mitad del tamaño con el que se pintan, como los sprites. Solo usan arena y tostado, y el texto en tinta pasa de 4,5:1 sobre los dos.
  - Van abajo, bajo la descripción y saliéndose en parte de la carta. El cerco solo va a la izquierda, la parte que no tapa la carta vecina. Las manchas quedan bajo los renglones.
  - Todo es de colores de la paleta, opacos y con bordes duros (FR-VIS-004).
- **Comprobado en un navegador** (Firefox sin interfaz, con el build de producción y un dedo simulado), a 320, 360 y 393 px de ancho:
  - las 5 cartas están dentro de la pantalla, sin scroll horizontal ni vertical;
  - los textos caben dentro de cada carta, también en el título y el certificado;
  - los sellos no tapan ningún texto y se ven en la mano;
  - tocar cada tira visible da en su propia carta;
  - al tocar, la carta crece ×1,5, sube 56 px, se inclina en 3D y pasa por encima de las demás;
  - al arrastrar, sigue al dedo y se ladea con la velocidad;
  - al soltar, se pasa un poco de su sitio y vuelve exactamente a él.
- Cada carta lleva `data-type` (`attack`, `defense` o `skill`) y `data-edition` (`base`, `foil` o `holo`), para los tests de extremo a extremo del ticket 07.
- Las cartas aún no respetan `prefers-reduced-motion`. Queda para el ticket 07.
- **Cómo medir los fps en el móvil** (último criterio):
  1. En el PC, `npm run build` y después `npx vite preview --host`.
  2. En el móvil, abrir la dirección `Network` (puerto 4173) con `?debug` al final.
  3. Durante unos 10 s, tocar y arrastrar cartas sin parar, y anotar el valor del contador.
  4. Si el remolino se queda quieto, es que la media ha bajado de 30 fps durante 5 s.
