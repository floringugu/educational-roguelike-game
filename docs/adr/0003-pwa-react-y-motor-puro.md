# ADR-0003: PWA mobile-first con React y motor de juego en TS puro y determinista

- **Estado:** Aceptada
- **Fecha:** 2026-09-30
- **Origen:** Q1, Q8, Q24, Q40

## Contexto

El producto es público y se usa sobre todo desde el móvil, con la opción de publicarlo en las tiendas más adelante (Q8 b). El juego es de cartas por turnos y tiene mucho texto (las preguntas). El criterio de terminado exige simular 1.000 partidas (Q40).

## Decisión

1. **PWA** instalable, *mobile-first*, jugable en vertical con una mano. Queda preparada para envolverla con Capacitor más adelante.
2. **Interfaz en React.**
3. **Motor de juego** en un paquete TypeScript puro, sin dependencias de interfaz, navegador ni red. Es una función de estado `(estado, acción) → estado`, y todo el azar sale de un generador pseudoaleatorio con semilla que forma parte del estado.

## Alternativas descartadas

- **App nativa desde el inicio:** dos tiendas y más trabajo sin haber validado el producto.
- **Godot exportado a web:** pesa bastante, integra mal la PWA offline y usa otro lenguaje.
- **Lógica mezclada con los componentes de React:** imposible de simular y difícil de testear. Repetiría el defecto V0-D12 de la v0.

## Consecuencias

- Cualquier partida se puede reproducir a partir de su semilla y su lista de acciones. Esto permite simulaciones, tests y depuración de bugs.
- La capa visual se puede sustituir (ADR-0004) sin tocar las reglas.
- El guardado automático consiste en serializar el estado después de cada acción.
