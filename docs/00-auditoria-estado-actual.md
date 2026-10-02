# Auditoría del estado actual (v0-flask)

**Fecha:** 2026-09-30
**Alcance:** código en `main` en el commit `33ffd83`, antes de empezar de cero ([ADR-0001](adr/0001-rehacer-desde-cero.md)).
**Propósito:** conservar lo aprendido de la v0. Este documento es una entrada del [SRS](SRS.md), no forma parte de él.

## 1. Historia del proyecto

| Fecha | Commit | Estado |
|---|---|---|
| 2025-09-24 → 11-17 | … `83a7640` | PDF → preguntas con LLM (Grok/xAI mediante el SDK de OpenAI; la configuración también referenciaba Claude) |
| 2025-11-18 | `ba02c39`, `00281c4` | Cambio a Hugging Face (Mixtral/Mistral) y OCR con Tesseract/OpenCV |
| 2025-11-20 | `704f188` | **Pivote** a un juego de flashcards Anki (importa CSV) con SM-2. Se reescriben `app.py`, `database.py`, `game_engine.py` y `config.py` |

La idea original (PDF → roguelike) quedó abandonada: el pipeline de LLM nunca guardó ninguna pregunta (`data/questions.db` tiene 2 PDFs procesados y 0 preguntas).

## 2. Qué hay

- **Stack:** Python 3.12, Flask 3.0, SQLite y plantillas Jinja2 con JS vanilla. Estilo pixel en CSS con la fuente Press Start 2P. Los personajes son emoji.
- **Bucle de juego:** se muestra el anverso de la tarjeta, se revela el reverso y el jugador se autoevalúa (Again/Hard/Good/Easy). La nota determina el daño (0 / 30% / 100% / 200%). Son 10 encuentros lineales con un jefe en el 10.
- **Contenido:** 6 enemigos, 4 jefes y 14 objetos en `config.py:55-262`.
- **Persistencia:** SQLite (`data/anki_game.db`). Las partidas activas viven en memoria (`app.py:30`) y se pierden al reiniciar.
- **Uso real:** la base de datos registra 329 repasos en 15 sesiones. El bucle principal llegó a jugarse.

## 3. Defectos que el nuevo diseño debe evitar

Cada defecto de esta sección se traduce en un requisito, una restricción o un ADR del SRS.

| # | Defecto | Evidencia | Requisito que lo previene |
|---|---|---|---|
| V0-D1 | **Se gana sin saber.** Con autoevaluación basta pulsar siempre "Easy" | `spaced_repetition.py:51`, `game_engine.py:268` | P1, FR-ANS-001, FR-SRS-002 |
| V0-D2 | La victoria y el guardado lanzan un KeyError (`state['deck_id']` no existe en `to_dict()`) | `database.py:472`, `spaced_repetition.py:120-138` | NFR-MNT-002 (tests del motor) |
| V0-D3 | El CSV separado por `;` se importó como basura (125 cartas corruptas) | `anki_csv_parser.py:111` (`delimiter=','` fijo) | FR-SUB-005 |
| V0-D4 | La fila de cabecera del CSV se guardó como carta ("front"/"back") | carta id 126 en `anki_game.db` | FR-SUB-005 |
| V0-D5 | El estado *lapsed* nunca se activa (`is_lapsed = not is_learning` justo tras `is_learning = True`) | `spaced_repetition.py:199-200` | FR-SRS-001 (FSRS con librería probada) |
| V0-D6 | El límite de cartas nuevas nunca se aplica; las cartas en aprendizaje salen aunque no toque | `card_manager.py:115-118` | FR-SRS-003 |
| V0-D7 | Los boosts con `duration` son permanentes | `game_engine.py:549-561` | NFR-MNT-002 |
| V0-D8 | Matar a un enemigo con un hechizo no hace avanzar el encuentro | `game_engine.py:571` | NFR-MNT-002 |
| V0-D9 | La respuesta llega al cliente antes de revelarla | respuesta de `/api/game/status` | Restricción R-6 (aceptado en offline-first) |
| V0-D10 | Vector XSS: el texto de las tarjetas se inserta con `innerHTML` | `static/js/game.js` | NFR-SEC-003 |
| V0-D11 | La partida se pierde al reiniciar el servidor; todos los usuarios comparten sesión (`user_id` nunca se asigna) | `app.py:30` | FR-OFF-003, FR-ACC-* |
| V0-D12 | Ni un test | todo el repo | NFR-MNT-002 |
| V0-D13 | El repo no tiene `.gitignore`: se commitean `__pycache__`, las bases de datos y un PDF duplicado (mismo MD5) | raíz, `data/pdfs/` | NFR-MNT-004 |
| V0-D14 | Hay código muerto que fallaría al importarse (`pdf_processor.py`, `question_generator.py`, `stats_exporter.py`, `setup_demo.py`) | importan `pdf_manager`/`question_manager`, que ya no existen | [ADR-0001](adr/0001-rehacer-desde-cero.md) |
| V0-D15 | La interfaz mezcla inglés y español; los textos están incrustados en las plantillas y en el JS | `templates/`, `static/js/game.js` | NFR-I18N-001 |

## 4. Qué se reutiliza

| Activo | Uso en el nuevo proyecto |
|---|---|
| `static/css/pixel-style.css` y Press Start 2P | Solo como referencia de dirección de arte (el SRS fija las fuentes m6x11 y Pixelify Sans) |
| Enemigos y objetos de `config.py:55-262` | Ideas de partida para el catálogo de contenido ([ADR-0009](adr/0009-contenido-como-datos.md)) |
| `data/anki_decks/*.csv` | Casos de prueba del importador CSV (incluido el separado por `;`) |
| `data/pdfs/*.pdf` (asignaturas reales) | Parte del conjunto de evaluación del pipeline de IA (FR-GEN-009). Son privados: no se publican |

La v0 se conserva en la etiqueta git `v0-flask`.
