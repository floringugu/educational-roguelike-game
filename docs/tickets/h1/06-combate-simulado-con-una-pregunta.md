# 06: Combate simulado con una pregunta

**Qué construir:** una pantalla de combate de prueba en la que se puede jugar una carta. Hay un enemigo con su vida y su intención. Al tocar una carta aparece una pregunta de test:

- si se acierta, el efecto se ve: el enemigo pierde vida y la pantalla tiembla;
- si se falla, aparecen la respuesta correcta y la cita, que se despliega con un toque.

Es una maqueta para juzgar el aspecto y la sensación de juego. El motor de reglas llega en H2.

**Bloqueado por:** 05.

**Requisitos:** §7.1 H1, FR-CMB-001 y FR-CMB-005 (como maqueta), FR-ANS-002, FR-ANS-003, NFR-ACS-001, NFR-USA-002.

**Estado:** listo

- [ ] Un enemigo con sprite del catálogo, barra de vida e intención visible (tipo de acción y valor).
- [ ] Al tocar una carta aparece una pregunta de test de 4 opciones:
  - [ ] el texto de la pregunta mide al menos 16 px y usa Pixelify Sans;
  - [ ] las opciones se barajan cada vez que se presenta.
- [ ] Si se acierta, el enemigo pierde vida con animación, la pantalla tiembla y la carta va al descarte.
- [ ] Si se falla:
  - [ ] la carta no tiene efecto y va al descarte;
  - [ ] se ven la respuesta correcta y la cita (texto y página), que se despliega con un toque;
  - [ ] el botón "esta pregunta está mal" está presente aunque todavía no haga nada.
- [ ] Las preguntas y las cartas son un JSON de prueba con al menos 5 preguntas en español, cada una con su cita.
- [ ] La lógica de este ticket es de usar y tirar: está aislada en la carpeta del prototipo y no se reutiliza en H2 (ADR-0003).
- [ ] Todos los botones miden al menos 44×44 px.
