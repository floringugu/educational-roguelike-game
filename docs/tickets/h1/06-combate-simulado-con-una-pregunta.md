# 06: Combate simulado con una pregunta

**Qué construir:** una pantalla de combate de prueba en la que se puede jugar una carta. Hay un enemigo con su vida y su intención. Al tocar una carta aparece una pregunta de test:

- si se acierta, el efecto se ve: el enemigo pierde vida y la pantalla tiembla;
- si se falla, aparecen la respuesta correcta y la cita, que se despliega con un toque.

Es una maqueta para juzgar el aspecto y la sensación de juego. El motor de reglas llega en H2.

**Bloqueado por:** 05.

**Requisitos:** §7.1 H1, FR-CMB-001 y FR-CMB-005 (como maqueta), FR-ANS-002, FR-ANS-003, NFR-ACS-001, NFR-USA-002.

**Estado:** listo

- [x] Un enemigo con sprite del catálogo, barra de vida e intención visible (tipo de acción y valor).
  - El enemigo es un sprite propio de 96×96 a 192 px, con su nombre y su barra de vida debajo (40/40). Encima lleva su intención: un boli rojo propio de 16×16 (`intent-attack`, en el registro de licencias) y el valor en m6x11plus a 36 px. Un lector de pantalla oye «Va a atacar con 8».
  - La intención cambia con cada mano nueva (8, 12, 6), para que se vea cambiar. En la maqueta el enemigo nunca llega a atacar.
- [x] Al tocar una carta aparece una pregunta de test de 4 opciones:
  - Se juega con un toque corto (menos de 300 ms y menos de 10 px de movimiento) o arrastrándola más de 120 px hacia arriba. Mantenerla pulsada solo la levanta para leerla. Con el teclado se juega con Intro o Espacio.
  - La pregunta sale en una hoja de examen que sube desde abajo y tapa la mano. El enemigo se sigue viendo encima.
  - [x] el texto de la pregunta mide al menos 16 px y usa Pixelify Sans;
    - Medido en el navegador: Pixelify Sans a 18 px. Las opciones van a 16 px.
  - [x] las opciones se barajan cada vez que se presenta.
    - `shuffledOptions` las baraja con Fisher-Yates cada vez que se juega una carta. Nunca sale dos veces seguidas la misma pregunta.
- [x] Si se acierta, el enemigo pierde vida con animación, la pantalla tiembla y la carta va al descarte.
  - La opción se pone verde con «¡Bien!» y, 0,7 s después, la hoja baja. El enemigo destella y retrocede, sale un «-6» flotando y la barra baja con una estela más clara que la sigue con retraso. La pantalla tiembla más cuanto más daño hace la carta.
  - Solo tiemblan los ataques. Las cartas de defensa suman bloqueo y Cafelito recupera vida, con un «+5» o un «+4» sobre la vida del jugador.
  - Con movimiento reducido no hay temblor ni movimientos: las barras y las etiquetas cambian sin animación.
- [x] Si se falla:
  - [x] la carta no tiene efecto y va al descarte;
    - La nota en rojo dice «Fallo: la carta no hace nada y va al descarte.». El contador de descarte sube igual.
  - [x] se ven la respuesta correcta y la cita (texto y página), que se despliega con un toque;
    - La opción elegida se pone roja con «Tu respuesta» y la correcta verde con «Correcta», así que el color no es la única pista. «Ver la cita» despliega el texto de la cita y su página.
  - [x] el botón "esta pregunta está mal" está presente aunque todavía no haga nada.
    - La hoja se cierra con «Continuar».
- [x] Las preguntas y las cartas son un JSON de prueba con al menos 5 preguntas en español, cada una con su cita.
  - Las preguntas están en `src/prototype/questions.json`: 8 preguntas de temas variados, con `id`, `prompt`, `answer`, 3 `distractors` y `citation` (`text` y `page`). `parseQuestions` las valida al cargar y dice cuál falla. Las cartas siguen en `src/prototype/cards.json`.
- [x] La lógica de este ticket es de usar y tirar: está aislada en la carpeta del prototipo y no se reutiliza en H2 (ADR-0003).
  - Todo está en `src/prototype/`: la pantalla, la hoja de examen, el enemigo, las barras, las preguntas y las reglas simuladas (`mockCombat.ts`). Fuera de esa carpeta solo cambian la carta (los gestos para jugarla) y la mano (las claves de cada carta).
- [x] Todos los botones miden al menos 44×44 px.
  - Medido en el navegador a 320, 360 y 393 px: las opciones miden 48 px de alto, y los botones de la cita, de informar y de continuar, 44 px.

**Notas:**

- **Reglas de la maqueta.** No hay energía ni turnos: el coste de las cartas se ve, pero no se gasta. Cuando se juega la última carta, la mano se queda vacía un segundo, para que se vea lo que ha hecho esa carta (por ejemplo, el bloqueo total). Después el descarte se reparte como mano nueva, el bloqueo vuelve a 0 y el enemigo muestra su siguiente intención. Cuando el enemigo cae, entra el otro con la vida llena y el jugador vuelve a 26 de 40, para que siempre haya algo que curar.
- **Enemigos.** Hay dos, que se turnan cada vez que uno cae, para ver cómo quedan los enemigos dibujados (FR-CMB-006):
  - **El Parcial** (`enemy-midterm`), un garabato sobre el propio examen: una hoja algo arrugada, con un 3 en rojo rodeado y casillas tachadas, a la que el estudiante le ha pintado a boli una cara furiosa con dientes de grapa, brazos, piernas y zapatillas rojas. Lleva una regla en una mano y un boli rojo en la otra. Es línea de boli negro, como los garabatos del pupitre, y color plano, sin volumen ni sombra, como Don Ramiro. Los enemigos normales serán así: agobios del estudiante convertidos en garabato.
    - Al principio era un monstruo en píxel art con volumen y sombra en el suelo, pero desentonaba con el pupitre y con Don Ramiro, que son papel y tinta. Queda para H2 cómo distinguir de un vistazo los enemigos normales de los Élites y el Jefe, ahora que todos son garabatos.
  - **Don Ramiro, el de Mates** (`enemy-math-teacher`), un garabato a boli coloreado: la caricatura de un profesor despeinado, con gafas enormes, bigote, la lengua fuera, bata manchada de tinta, un libro con «MATES» en la tapa y el dedo en alto. Está dibujado con trazo añil sobre un trozo de hoja cuadriculada con margen rojo, manchas de café y unas pocas fórmulas. Los Élites y el Jefe serán personajes así: caricaturas con nombre inventado.
  - Los dos son 96×96 y se ven a 192 px (×2), como las cartas (16×16 a 32 px), así que el píxel mide lo mismo en todo el combate. Solo usan colores de la paleta (FR-VIS-004) y son dibujo propio (ADR-0011), en el registro de licencias (R-4).
  - El nombre va encima de la barra de vida, desde el catálogo de textos. Cabe en una línea a 320 px.
  - El sprite de Kenney (Tiny Dungeon) que había antes se ha quitado, junto con su entrada en el registro de licencias y el script que lo recortaba.
- **Efectos de las cartas.** Están en `src/prototype/mockCombat.ts`: Tizazo hace 6 de daño, Chuleta 10, Faltar da 5 de bloqueo, Tocho 9 y Cafelito recupera 4 de vida. Un test comprueba que la descripción de cada carta dice el mismo número.
- **La hoja se parece a la carta que pregunta.** Así se ve qué carta se está jugando:
  - La línea de margen tiene el color del tipo de la carta: granate para Ataque, añil para Defensa y verde para Habilidad. El nombre de la carta, en la cabecera, va en el mismo color.
  - Una carta foil (título) da una hoja de pergamino arrugado, y una holo (certificado), una de papel arrugado, dibujadas como la hoja de la carta pero con píxeles el doble de grandes (2 px por píxel):
    - Los pliegues son pequeños triángulos planos sombreados por la luz, como en la carta. Están en dos losas propias de 128×128 en `src/assets/textures/` (`crumpled-parchment-tile.png` y `crumpled-paper-tile.png`), con los colores de las hojas de la carta. Encajan consigo mismas al repetirse, así que sirven para cualquier alto de hoja.
    - La hoja no es un rectángulo. Arriba, a la izquierda y a la derecha, unas tiras que se repiten (`crumpled-sheet-top.png`, `-left.png` y `-right.png`) dibujan el contorno irregular, el borde marrón y, a la derecha, la sombra. Una máscara con las tiras «cut» quita la hoja fuera del contorno. Abajo no hay borde, porque la hoja apoya en el borde de la pantalla.
    - La hoja arrugada no lleva línea de margen ni renglones: la carta tampoco los tiene.
  - Una carta manchada mancha la hoja con el mismo café, a 4 px por píxel. Los cercos van en la esquina de arriba a la derecha, saliéndose un poco, porque abajo los taparían las opciones y los botones. La esquina empapada se queda abajo a la izquierda, como en la carta, y solo asoma por el margen.
  - El texto en tinta pasa de 4,5:1 sobre todos los colores de los pliegues y de las manchas (NFR-ACS-001).
- **Pantallas estrechas.** Con la cita abierta tras un fallo, la hoja ocupa casi toda la pantalla y a 320 o 360 px tapa al enemigo. Mientras se responde, el enemigo se ve entero.
