# ADR-0008: FSRS por concepto con calificación objetiva

- **Estado:** Aceptada
- **Fecha:** 2026-09-30
- **Origen:** Q2, Q19, Q30, Q36

## Contexto

La v0 usaba SM-2 con autoevaluación. Bastaba con pulsar siempre "Easy" para ganar (defecto V0-D1), y además tenía bugs propios (V0-D5, V0-D6). En el nuevo modelo, cada concepto tiene varias variantes de pregunta.

## Decisión

- **Algoritmo:** FSRS mediante una librería mantenida (p. ej. `ts-fsrs`), no una implementación propia.
- **Unidad:** los repasos se programan **por concepto**, no por pregunta.
- **Calificación objetiva:** fallo = *Again*; acierto lento = *Good*; acierto rápido = *Easy*. El umbral de rapidez es el mismo que el del crítico por rapidez.
- **Repeticiones en la misma partida:** las respuestas repetidas a un concepto dentro de una partida se registran como **pasos de aprendizaje** (repasos del mismo día).

## Alternativas descartadas

- **SM-2:** menos preciso, y su implementación en la v0 tenía bugs.
- **Autoevaluación:** rompe el principio P1.

## Consecuencias

- El estado FSRS se deriva del registro de eventos (ADR-0006).
- La maestría de un tema se calcula a partir del estado FSRS de sus conceptos.
