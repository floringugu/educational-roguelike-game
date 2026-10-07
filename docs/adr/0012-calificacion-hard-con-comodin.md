# ADR-0012: Calificación *Hard* para los aciertos con comodín

- **Estado:** Aceptada. Amplía la calificación de [ADR-0008](0008-fsrs-calificacion-objetiva.md)
- **Fecha:** 2026-10-07
- **Origen:** DP-17, a partir de Q19 y Q30

## Contexto

El **comodín** (FR-ANS-008) es un objeto de un solo uso que quita 2 de los 3 distractores de una pregunta de 4 opciones. Con él, quien no sabe la respuesta acierta 1 de cada 2 veces en lugar de 1 de cada 4.

ADR-0008 solo distingue tres notas: fallo = *Again*, acierto lento = *Good* y acierto rápido = *Easy*. Si un acierto con comodín contara como *Good*, FSRS creería que el concepto se recuerda igual de bien que sin ayuda. Alargaría el intervalo de repaso de algo que quizá se ha acertado por descarte. Eso contradice el objetivo de que cada partida sea estudio útil (P2).

## Decisión

- Un acierto con comodín se califica *Hard*.
- Un acierto con comodín nunca activa el crítico por rapidez, así que nunca puede ser *Easy*.
- El evento de respuesta guarda en su contexto de juego que se usó un comodín, para que el estado FSRS se pueda recalcular desde el registro (ADR-0006).
- El resto de ADR-0008 no cambia: FSRS por concepto, calificación objetiva sin autoevaluación y pasos de aprendizaje dentro de la partida.

## Alternativas descartadas

- **Contarlo como *Good*:** sobrestima la memoria del concepto y alarga los repasos sin motivo.
- **Contarlo como *Again*:** castiga un acierto que puede ser real. El jugador aprendería que usar un comodín le perjudica el estudio y no lo usaría nunca.
- **No registrar la respuesta en FSRS:** se pierde información. Además, el concepto se podría "esconder" de los repasos usando comodines.

## Consecuencias

- FR-SRS-002 pasa a tener cuatro notas, y DP-5 deja de decir que *Hard* no se usa.
- La simulación de NFR-QLT-002 debe incluir los comodines: el jugador que responde al azar usa todos los que consigue, y aun así no debe ganar al Jefe en más del 1% de las partidas.
