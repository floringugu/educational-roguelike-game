# ADR-0004: Arquitectura visual híbrida DOM + WebGL (estética tipo Balatro)

- **Estado:** Aceptada, pendiente de validación en el hito H1
- **Fecha:** 2026-09-30
- **Origen:** Q5, Q24, Q24.1, Q28, Q28.1

## Contexto

Se busca una estética lo más cercana posible a *Balatro*. Su aspecto depende sobre todo de shaders (fondo en remolino, CRT, ediciones de carta), de animaciones con rebote y de una paleta estricta. En Safari/iOS no existe un post-procesado fiable sobre HTML. El texto de las preguntas tiene que leerse bien en el móvil.

## Decisión

- **Fondo:** un `<canvas>` WebGL a pantalla completa con un shader de remolino **escrito desde cero**. Se renderiza por debajo de la resolución nativa del dispositivo, se pausa cuando la pestaña está oculta y respeta `prefers-reduced-motion`.
- **Interfaz:** React + Motion para la inclinación 3D de las cartas, los muelles y el temblor de pantalla. Los efectos de edición (foil, holo) son CSS propio.
- **CRT:** superposición en CSS (scanlines + viñeta), que se puede desactivar. No se hace curvatura de pantalla.
- **Arte:** packs CC0 (Kenney, 0x72) recoloreados a una única paleta de 16-24 colores. Se cargan desde un catálogo, así que cambiar el arte no toca el código.
- **Fuentes:** m6x11 para títulos y cifras (si cubre tildes y ñ) y Pixelify Sans (OFL) para el texto de las preguntas.

## Alternativas descartadas

- **Todo en canvas con PixiJS:** más fiel, pero la maquetación del texto en el móvil y la accesibilidad salen mucho más caras. Queda como plan B si el prototipo H1 no convence. Solo afectaría a la capa visual (ADR-0003).
- **Usar ports de los shaders de Balatro** (Shadertoy, Godot Shaders, React Bits): dicen estar copiados del código original, así que su licencia no está clara.
- **Copiar código de pokemon-cards-css:** es GPL-3.0. Sirve como referencia de la técnica, pero no se copia código.

## Consecuencias

- El hito H1 valida esta decisión en un móvil real: una pantalla de combate falsa con una mano de 5 cartas, el fondo en marcha y una pregunta.
- Hace falta una pantalla de créditos, porque m6x11 y algunos packs piden atribución.
- La tasa de refresco mínima es un requisito medible (NFR-PRF-003).
