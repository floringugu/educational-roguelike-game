# Glosario del dominio

<!-- markdownlint-disable MD060 -->

Estos son los términos canónicos del proyecto. El [SRS](SRS.md), los ADRs, la interfaz y el código los usan **tal cual**, sin sinónimos. En el código se usa el identificador en inglés de la columna "Código".

## Contenido de estudio

| Término | Código | Definición |
|---|---|---|
| **Asignatura** | `Subject` | Contenedor de estudio que crea un usuario (p. ej. "Cloud Computing"). Agrupa sus fuentes y solo la ve su dueño. |
| **Fuente** | `Source` | Fichero que se añade a una asignatura: un PDF (subido al servidor) o un CSV (importado en el dispositivo o subido). De ella se sacan los temas. |
| **Tema** | `Topic` | Bloque temático de una asignatura (p. ej. "Virtualización"). En un PDF lo extrae la IA; en un CSV sale de las etiquetas, o hay un tema por fuente. El usuario lo puede editar. Sirve para etiquetar los nodos del mapa. |
| **Concepto** | `Concept` | Idea evaluable dentro de un tema. Es la unidad con la que se mide la maestría y se programa la repetición espaciada. |
| **Pregunta** (variante) | `Question` | Forma concreta de evaluar un concepto. Un concepto tiene de 1 a 3 variantes (el objetivo en PDFs es 2-3). Tipos del MVP: test de 4 opciones, verdadero/falso y **cloze de elegir** (frase con un hueco y 4 opciones). |
| **Cita** | `Citation` | Fragmento literal de la fuente, con su página (PDF) o fila (CSV), que fundamenta una pregunta. Cada pregunta tiene exactamente una. |
| **Banco de preguntas** | `QuestionBank` | Conjunto de preguntas vigentes de una asignatura. |
| **Ampliación** | `TopUp` | Nueva tanda de preguntas generadas para un tema que se ha agotado o que se falla mucho. |
| **Reporte** | `QuestionReport` | Aviso del usuario de que "esta pregunta está mal". Retira la pregunta de su banco. |
| **Asignatura de demostración** | `DemoSubject` | Asignatura precargada con licencia libre. Es la que juega el invitado. |

> **"Mazo" NO es contenido de estudio.** Aquí *mazo* significa únicamente el mazo de cartas de acción del jugador. Una exportación de Anki es una **fuente** de tipo CSV.

## Juego

| Término | Código | Definición |
|---|---|---|
| **Partida** | `Run` | Recorrido por el mapa de un acto sobre una asignatura. Termina con victoria, derrota o abandono. |
| **Acto** | `Act` | Mapa de 8 a 10 nodos que acaba en un Jefe. El MVP tiene un único acto. |
| **Nodo** | `MapNode` | Paso del mapa. Puede ser de seis tipos: **Combate**, **Élite**, **Jefe**, **Tienda**, **Evento** y **Biblioteca**. |
| **Evento** (nodo) | `EventNode` | Nodo con una situación y varias opciones. Toda opción que da recompensa exige acertar. **No confundir con *evento de respuesta*.** |
| **Combate** | `Combat` | Enfrentamiento por turnos contra uno o varios enemigos. Es la unidad mínima de estudio útil (principio P2). |
| **Enemigo** | `Enemy` | Adversario de un combate, diseñado a mano. Los hay de tres categorías: normal, **élite** (más fuerte y con mejor recompensa) y **jefe** (el final del acto). |
| **Turno** | `Turn` | Fase del jugador (roba la mano y gasta energía jugando cartas) seguida de la fase de los enemigos. |
| **Energía** | `Energy` | Recurso de cada turno (3 al empezar) que se gasta para jugar cartas. |
| **Mano** | `Hand` | Cartas robadas en el turno (5). |
| **Pila de robo / Descarte** | `DrawPile` / `DiscardPile` | Cartas del mazo pendientes de robar y cartas ya usadas o descartadas en el combate. |
| **Mazo** | `Deck` | Cartas de acción que tiene el jugador durante la partida. Empieza con 10. |
| **Pool de cartas** | `CardPool` | Todas las cartas que pueden aparecer como recompensa o en la tienda (~20 en el MVP). |
| **Carta de acción** | `Card` | Carta jugable con un coste y unos efectos. **Solo tiene efecto si se acierta la pregunta asociada.** Cada una define en sus datos su versión mejorada. |
| **Carta de Estudio** | `StudyCard` | Carta de acción cuyo efecto depende del conocimiento: de dónde sale su pregunta o cómo se modifica al acertar (p. ej. *Repaso*, *Apuesta*). |
| **Carta fallida** | — | Carta jugada cuya pregunta se ha fallado. No aplica efecto, consume su energía y va al descarte. |
| **Mejorar carta** | `UpgradeCard` | Cambiar una carta del mazo por su versión mejorada, definida en los datos de la carta. |
| **Bloqueo** | `Block` | Valor que absorbe daño enemigo durante una fase enemiga. |
| **Estado** | `Status` | Efecto persistente sobre un combatiente: veneno, debilidad o vulnerabilidad en el MVP. |
| **Crítico por rapidez** | `SpeedCrit` | Multiplica por 1,5 los valores numéricos de un efecto cuando se acierta antes de un umbral, que depende de la longitud de la pregunta. |
| **Intención** | `Intent` | Acción que hará el enemigo en su siguiente fase. El jugador la ve de antemano. |
| **Reliquia** | `Relic` | Objeto pasivo que solo modifica efectos disparados por un acierto. Se consigue en Eventos y Élites. |
| **Oro** | `Gold` | Moneda de la partida que se gasta en la Tienda. |
| **Biblioteca** | `Library` | Nodo de descanso. Hay que elegir entre curarse (respondiendo preguntas) o estudiar: repasar las preguntas falladas con su cita, volver a responderlas y, si se aciertan, mejorar una carta. |
| **Ascensión** | `Ascension` | Nivel de dificultad que se desbloquea entre partidas. Fuera del MVP. |

## Aprendizaje

| Término | Código | Definición |
|---|---|---|
| **FSRS** | — | Algoritmo de repetición espaciada (*Free Spaced Repetition Scheduler*). |
| **Evento de respuesta** | `ReviewEvent` | Registro inmutable de una respuesta: pregunta, concepto, acierto o fallo, tiempo, momento, dispositivo y contexto de juego. |
| **Evento de cambio** | `ChangeEvent` | Registro inmutable de un cambio del usuario sobre su contenido (crear, importar, editar, renombrar, reportar). |
| **Lápida** | `Tombstone` | Evento de cambio que marca algo como borrado o anulado. Gana a cualquier otro cambio del mismo objeto y no se deshace al sincronizar. |
| **Registro de eventos** | `EventLog` | Secuencia *append-only* de eventos de respuesta y de cambio, ordenada por (momento, id). Es la fuente de verdad. |
| **Estado FSRS** | `ConceptMemoryState` | Estado de memoria de un concepto: estabilidad, dificultad y próximo repaso. **Se recalcula siempre** a partir del registro de eventos; nunca se edita a mano. |
| **Calificación objetiva** | — | Nota FSRS que se deduce del acierto y del tiempo: fallo = Again, acierto = Good, crítico = Easy. **Nunca la pone el usuario.** |
| **Paso de aprendizaje** | — | Respuesta a un concepto que ya ha salido en la misma partida. FSRS la trata como repaso del mismo día, no como repaso consolidado. |
| **Maestría** | `Mastery` | Grado de dominio de un tema o concepto, de 0 a 100%, calculado a partir del estado FSRS. |
| **Mapa de maestría** | `MasteryMap` | Vista del temario de una asignatura coloreada según la maestría. Es la meta-progresión del MVP. |

## Plataforma

| Término | Código | Definición |
|---|---|---|
| **Invitado** | `Guest` | Usuario sin cuenta, con los datos solo en su dispositivo. Puede jugar la asignatura de demostración e importar CSV en local. |
| **Cuota** | `Quota` | Límite mensual de generación con IA por usuario, definido por plan. |
| **Pipeline** | `IngestionPipeline` | Proceso en el servidor que convierte una fuente en preguntas: extracción → temas → conceptos → preguntas → verificación. |
| **Verificación** | `Verification` | Doble control de cada pregunta generada. **Capa 1 (código):** la cita aparece literalmente en la página indicada y la clave de respuesta es válida. **Capa 2 (LLM de otra familia):** la respuesta se deduce de la cita y los distractores son claramente falsos. |
| **Conjunto de evaluación** | `EvalSet` | Al menos 20 PDFs reales con resultados revisados. Se usa para comparar modelos y prompts antes de cualquier cambio. |
| **Paquete de contenido** | `ContentPack` | Conjunto de cartas, enemigos, eventos, reliquias y parámetros definidos como datos y validados por esquema. El juego base es uno de ellos. |
| **Vocabulario de efectos** | `EffectVocabulary` | Conjunto cerrado de efectos, condiciones y opciones de pregunta con el que se define todo el contenido. |
| **Hito** | — | Entrega verificable del MVP: H1 prototipo visual, H2 juego offline con CSV, H3 cuentas y sincronización, H4 pipeline de PDFs. |
