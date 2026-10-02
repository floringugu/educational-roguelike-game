# ADR-0006: Offline-first con registro de eventos append-only

- **Estado:** Aceptada
- **Fecha:** 2026-09-30
- **Origen:** Q21, Q26, Q17

## Contexto

Jugar sin conexión es innegociable (Q21). Un usuario puede responder o editar desde dos dispositivos sin red. Resolver conflictos sobre estado mutable, como el estado FSRS, es propenso a errores. Y esta es la parte de la arquitectura que más cuesta cambiar después.

## Decisión

- **Contenido generado por el servidor** (preguntas y temas): se descarga al dispositivo y se guarda en IndexedDB.
- **Todo lo que hace el usuario** se guarda como un **evento inmutable** con id generado en el cliente y se añade al registro local. Hay tres tipos:
  - eventos de respuesta;
  - eventos de cambio: crear, importar, editar, renombrar, reportar;
  - lápidas, para borrados y anulaciones.
- **Fusión entre dispositivos**, al subir el registro cuando hay conexión:
  - Los eventos de respuesta se unen por id, así que no hay conflictos.
  - Los cambios sobre un mismo campo se resuelven con "gana la última escritura" según (momento, id).
  - Una lápida gana a cualquier cambio del mismo objeto.
- **El estado FSRS se recalcula** siempre a partir del registro, en orden (momento, id) y respetando las lápidas. Nunca se sincroniza como estado.
- **La partida en curso** vive solo en el dispositivo. Se guarda después de cada acción (ADR-0003) y queda ligada a la versión del paquete de contenido con la que empezó. En el MVP no se sincroniza.
- Se pide al navegador **almacenamiento persistente** para reducir el riesgo de que borre los datos.

## Alternativas descartadas

- **Sincronizar el estado FSRS con "gana la última escritura":** se perderían los repasos hechos sin conexión en otro dispositivo.
- **Borrar eventos físicamente:** con la unión por id, reaparecerían desde otro dispositivo. Por eso se usan lápidas.
- **Solo online:** incumple Q21.

## Consecuencias

- El recálculo de FSRS debe ser determinista: con los mismos eventos se obtiene el mismo estado.
- El registro crece sin límite. Si hace falta, se añadirán instantáneas (*snapshots*) como optimización, nunca como fuente de verdad.
- Como la corrección ocurre en el cliente, las respuestas correctas están en el dispositivo (restricción R-6 del SRS).
