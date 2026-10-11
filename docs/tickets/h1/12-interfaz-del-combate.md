# 12: Interfaz del combate

**Qué construir:** la interfaz de la pantalla de combate con la distribución de la referencia:

- el panel del enemigo arriba;
- la intención sobre su cabeza;
- la mano de cartas;
- debajo, una barra inferior con la pila de robo, la energía, la vida, el bloqueo, el descarte y terminar turno;
- un menú de tres rayas arriba a la izquierda.

**Bloqueado por:** 09.

**Requisitos:** FR-CMB-005, FR-VIS-006, NFR-ACS-001, NFR-I18N-001, NFR-USA-002, §5.1, ADR-0013.

**Estado:** listo

- [ ] La pantalla de combate ya no lleva la cabecera con «Empollatro» y «Créditos»: el aula ocupa toda la pantalla.
- [ ] **El menú:**
  - [ ] Hay un botón de tres rayas arriba a la izquierda. Su icono es un sprite de 16×16.
  - [ ] Al tocarlo se despliega una lista con **Ajustes** y **Créditos**, y desde cada uno se puede volver al combate.
  - [ ] La lista se puede usar con el teclado, cierra con Escape y los lectores de pantalla la anuncian.
- [ ] **El panel del enemigo** está arriba, sobre un panel oscuro con borde de píxel. Lleva:
  - [ ] el retrato del enemigo;
  - [ ] su nombre;
  - [ ] una barra de vida con «actual/máxima».
- [ ] La intención del enemigo se ve sobre su cabeza, con su tipo y su valor (FR-CMB-005).
- [ ] **La barra inferior** va por debajo de las cartas, en paneles oscuros como el del enemigo. Lleva:
  - [ ] la **pila de robo**, con el número de cartas;
  - [ ] la **energía**, con un icono y su número;
  - [ ] la **vida** del jugador, como neurona con «actual/máxima»;
  - [ ] el **bloqueo**, con el escudo y su número;
  - [ ] el **descarte**, con la trituradora y su número;
  - [ ] el botón **Terminar turno**.
- [ ] En H1, Terminar turno y la energía se dibujan pero no funcionan. El botón queda marcado como no disponible para los lectores de pantalla. Su comportamiento llega en H2.
- [ ] Se retira la vida hecha con filas de símbolos. Se conservan los sprites de la neurona, los escudos y la trituradora, revisados con la guía nueva.
- [ ] Los iconos nuevos (menú, pila de robo y energía) son sprites propios de 16×16, con su entrada en el catálogo y en el registro de licencias.
- [ ] Todos los textos salen del catálogo y los nuevos pares de texto y fondo pasan el test de contraste.
- [ ] Cada elemento que se puede tocar mide al menos 44×44 px.
- [ ] Comprobado en el navegador a 320, 360, 393 y 412 px de ancho:
  - la barra inferior cabe sin scroll;
  - las cartas no tapan la barra;
  - el panel del enemigo no tapa la pizarra en la zona de texto.

**Notas:**

- Mientras el ticket 10 no esté terminado, los paneles usan los colores de la paleta actual que más se parezcan. Cuando llegue la paleta, se cambian sus roles de color.
- La pantalla de Ajustes y su interruptor del CRT son del ticket 07. Este ticket solo pone la entrada en el menú.
- Las cartas no cambian de diseño.
