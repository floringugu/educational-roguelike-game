# 15: Animaciones y textos del aula

**Qué construir:** lo que hace que el aula esté viva:

- las animaciones continuas;
- los sucesos de vez en cuando;
- las reacciones al combate;
- los guiños a la educación española;
- los textos de la pizarra, el pósit, la megafonía y los bocadillos, con el tono gamberro de la guía.

**Bloqueado por:** 11, 12.

**Requisitos:** FR-VIS-001, FR-VIS-007, NFR-PRF-003, NFR-I18N-001, FR-VIS-009, ADR-0013, guía de arte.

**Estado:** listo

- [ ] **Textos del aula:** todos salen del catálogo, menos el tema, y se pintan encima del dibujo, con la fuente pixel y en color tiza o boli.
  - [ ] La pizarra, a la izquierda, muestra el **nombre del tema** del combate. En H1 sale de los datos de prueba.
  - [ ] La pizarra, a la derecha, muestra una frase al azar de un conjunto de al menos 15 frases, distinta en cada combate.
  - [ ] El pósit lleva una frase del catálogo.
  - [ ] Ninguna frase se sale de su zona, a ninguna escala.
- [x] **Siempre, en bucle lento** (hecho en el ticket 16):
  - [x] el polvo flotando en la capa de luz;
  - [x] el árbol de la ventana moviéndose;
  - [x] una nube que pasa;
  - [x] el segundero del reloj.
- [ ] **De vez en cuando**, al azar, cada 20 a 40 s (prov.), y **nunca dos a la vez**:
  - [ ] una mosca que cruza;
  - [ ] un avión de papel;
  - [ ] una bola de papel que alguien tira;
  - [ ] un aviso por **megafonía**: los altavoces crujen y sale un bocadillo con una frase de un conjunto de al menos 8 («Se le recuerda a los estudiantes que no pueden usar los baños para esconderse de sus clases»);
  - [ ] el **reloj de la última hora**: si el combate dura más de unos minutos (prov.), el minutero va hacia atrás un momento;
  - [ ] la **persiana rota**: se le cae una lama torcida y entra un rayo de luz más;
  - [ ] los **móviles requisados**: un móvil vibra en su caja;
  - [ ] el **radiador**: el bocadillo en papel de aluminio da un destello de vez en cuando (los rayos de la ventana no llegan hasta él);
  - [ ] la **pelota de la clase**: desde un pupitre del fondo sube una mano con un bocadillo («Profe, ¿hoy no hay deberes?», de un conjunto de al menos 5). Le tiran una bola de papel y la mano baja.
- [ ] **Reacciones al combate:**
  - [ ] el estuche, el cuaderno y el boli saltan cuando el enemigo golpea al jugador;
  - [ ] sale polvo de tiza cuando se juega Tizazo;
  - [ ] el **timbre** suena al derrotar al enemigo: el altavoz tiembla y sale «¡Recreo!».
- [x] Las animaciones solo mueven `transform` y `opacity`, o cambian de fotograma con CSS, para no repintar la pantalla.
  - *Lo cumplen los bucles y la cámara del ticket 16. Las animaciones que faltan deben seguirlo.*
- [x] Todo se para con la pestaña oculta. Con `prefers-reduced-motion`, nada se mueve y los textos siguen visibles (FR-VIS-007).
  - *Hecho en el ticket 16 para todo lo que va dentro de `.classroom--animated`. Los textos siguen visibles porque no se animan.*
- [x] Si la media baja de 30 fps durante 5 s, las animaciones del aula se paran (FR-VIS-001).
  - *Hecho en el ticket 16: el aula pierde `.classroom--animated` y se queda quieta hasta que se vuelve a abrir la app.*
- [ ] Los sprites nuevos son propios, están en el catálogo y en el registro de licencias y siguen la guía: mosca, avión, bola, mano, móvil, polvo de tiza, bocadillos y las piezas que faltan del ticket 11.
- [ ] Las frases siguen el tono y los límites de la guía de arte. *Las revisa el dueño.*
- [ ] En el móvil del dueño se mantienen ≥ 30 fps con todo activo (NFR-PRF-003). *Lo comprueba el dueño con el contador de `?debug`.*

**Notas:**

- El ticket 16 hizo los bucles lentos y las reglas de cuándo se para el aula. Añadió además una lama de la persiana que tiembla de vez en cuando, que no es el suceso de la persiana rota.
- El combate simulado no tiene fase enemiga: el enemigo nunca golpea. En H1, el salto de los objetos y cada suceso se pueden disparar a mano desde el modo `?debug`. En H2 el salto se conecta a la fase enemiga.
- Ejemplos de tono para la pizarra: «Nueva ley educativa. La anterior ni la leímos.», «El ministro tampoco se lo sabe.», «Copiar está mal. Que te pillen, peor.», «Estudia o acabarás de tiktoker.».
