# 08: Validación en el móvil (criterio de salida de H1)

**Qué construir:** nada nuevo. Este ticket decide si la arquitectura visual de ADR-0004 se mantiene o si se pasa al plan B (PixiJS) antes de empezar H2.

**Bloqueado por:** 01, 02, 03, 04, 05, 06, 07.

**Requisitos:** §7.1 (criterio de salida de H1), NFR-PRF-003, S-4, ADR-0004.

**Estado:** lo hace el dueño en persona.

- [ ] El dueño juega el combate simulado en su Redmi Note 14 Pro, en vertical y con una mano, con el CRT activado y desactivado.
- [ ] Con todo activado (fondo, mano, pregunta y CRT), los fps medidos se mantienen en ≥ 30. El valor queda anotado.
- [ ] Se anota la variante exacta del móvil (4G o 5G) y queda fijada como dispositivo de referencia en S-4 del SRS.
- [ ] El dueño dice si el estilo le convence, con un comentario breve de qué funciona y qué no.
- [ ] Resultado:
  - [ ] **Si convence y llega a 30 fps:** ADR-0004 pasa a "Aceptada (validada en H1)" y empieza H2.
  - [ ] **Si no:** se abre un ADR que activa el plan B y se planifica la sustitución de la capa visual antes de H2.
