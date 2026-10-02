# 07: CRT, ajustes y movimiento reducido

**Qué construir:**

- la capa CRT (líneas de barrido y viñeta) por encima de toda la app;
- una pantalla de Ajustes con un interruptor que la desactiva y que se recuerda al volver a abrir la app;
- con movimiento reducido activo en el sistema, el fondo parado y las animaciones al mínimo.

Este ticket también pone en marcha los primeros tests de extremo a extremo.

**Bloqueado por:** 04, 06.

**Requisitos:** FR-VIS-003, FR-VIS-007, §5.1 (pantallas de Ajustes y Créditos).

**Estado:** listo

- [ ] La capa CRT se hace solo con CSS: líneas de barrido y viñeta, sin curvatura (ADR-0004).
- [ ] La capa no tapa los toques; se puede tocar la interfaz que hay debajo.
- [ ] Desde el combate se llega a Ajustes y a Créditos, y se puede volver.
- [ ] El interruptor del CRT se recuerda al recargar. En H1 basta con almacenamiento del navegador.
- [ ] Con `prefers-reduced-motion` activo:
  - [ ] el fondo queda estático;
  - [ ] la inclinación, el muelle y el temblor se sustituyen por transiciones mínimas.
- [ ] Hay tests de extremo a extremo que comprueban:
  - [ ] que el interruptor oculta la capa CRT y que la elección sobrevive a una recarga;
  - [ ] que con movimiento reducido emulado el fondo no se anima.
- [ ] La integración continua ejecuta esos tests.
