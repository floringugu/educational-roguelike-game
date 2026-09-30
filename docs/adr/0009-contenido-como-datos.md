# ADR-0009: Contenido de juego como datos con vocabulario cerrado de efectos

- **Estado:** Aceptada
- **Fecha:** 2026-09-30
- **Origen:** Q41, Q31, Q2

## Contexto

Se quieren mods en el futuro: cartas, enemigos y escenarios creados por usuarios. Que salga barato más adelante exige que el contenido sea **datos, no código**. En una app pública, ejecutar código de terceros es un agujero de seguridad. Además, ningún contenido debe poder romper el principio P1 ("imposible ganar sin saber").

## Decisión

- Las cartas, los enemigos, los eventos, las reliquias y la composición del mapa se definen como **datos** con esquema validado (p. ej. con Zod), agrupados en **paquetes de contenido**.
- Los efectos solo se componen a partir de un **vocabulario cerrado** que interpreta el motor. El contenido nunca ejecuta código propio.
- **Invariante del validador (P1):** toda carta jugable exige una pregunta, y todo efecto con valor positivo para el jugador depende de un acierto (SRS FR-DAT-003). Si un paquete lo incumple, se rechaza.
- El contenido del juego base es el primer paquete y usa exactamente el mismo formato.

## Alternativas descartadas

- **Cartas como clases o funciones TS:** es más rápido al principio, pero impide tener mods seguros y obliga a reescribir el motor después.
- **Mods con scripts (Lua/JS en sandbox):** demasiada superficie de ataque para una app pública.

## Consecuencias

- Añadir una carta es añadir datos. Añadir un *tipo* de efecto nuevo es cambiar el motor y el vocabulario.
- Hoja de ruta de mods:
  - **MVP:** solo el formato interno.
  - **Después (Could):** mods locales y privados.
  - **Won't mientras no haya moderación:** compartir mods públicamente.
