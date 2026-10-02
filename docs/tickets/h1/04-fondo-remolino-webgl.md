# 04: Fondo de remolino WebGL

**Qué construir:** el fondo animado en remolino al estilo Balatro, que se ve detrás de cualquier pantalla. Lleva un contador de fps de depuración para medir NFR-PRF-003 en el móvil.

**Bloqueado por:** 02. Se puede hacer en paralelo con el 03.

**Requisitos:** FR-VIS-001, FR-VIS-007 (la parte del fondo), NFR-PRF-003, R-3.

**Estado:** listo

- [ ] El shader está escrito desde cero. No se basa en ports de los shaders de Balatro ni en código GPL o AGPL (R-3). El PR explica en un párrafo la técnica que usa.
- [ ] Los colores del remolino son parámetros, y cuando exista la paleta del ticket 03 se toman de ella.
- [ ] Se dibuja por debajo de la resolución nativa y la escala es configurable.
- [ ] Se pausa cuando la pestaña está oculta y se reanuda al volver a ella.
- [ ] Se sustituye por un fondo estático:
  - [ ] si no hay WebGL;
  - [ ] si la media baja de 30 fps durante 5 s;
  - [ ] si el usuario tiene `prefers-reduced-motion` activo.
- [ ] Hay un contador de fps que solo aparece en modo depuración y que muestra la media de los últimos segundos.
- [ ] En el móvil del dueño, el fondo solo mantiene ≥ 30 fps. El valor medido queda anotado en el ticket.
