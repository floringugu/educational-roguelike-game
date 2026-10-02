# ADR-0001: Rehacer desde cero en el mismo repositorio

- **Estado:** Aceptada
- **Fecha:** 2026-09-30
- **Origen:** Q27, Q15, Q23, Q24

## Contexto

La v0 es una aplicación Flask con plantillas de servidor. Implementa otro juego (flashcards con autoevaluación), no tiene tests y arrastra bugs de base y código muerto ([auditoría](../00-auditoria-estado-actual.md)). El nuevo producto es una PWA *offline-first* en TypeScript con un modelo de dominio distinto.

## Decisión

Se empieza de cero en este mismo repositorio. La v0 se etiqueta como `v0-flask`, su código se retira de `main` y el trabajo nuevo empieza limpio.

## Alternativas descartadas

- **Refactorizar la v0:** no se reutilizaría casi nada del stack, del modelo ni del bucle de juego, y sí se heredarían los defectos.
- **Repo nuevo:** se pierden la historia y el nombre sin ganar nada a cambio.

## Consecuencias

- Solo se reaprovechan activos que no son código: la dirección de arte, las ideas de enemigos y objetos, y los CSV y PDFs como datos de prueba (auditoría §4).
- La v0 sigue consultable mediante la etiqueta.
