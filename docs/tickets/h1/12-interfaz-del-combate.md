# 12: Interfaz del combate

**Qué construir:** la interfaz de la pantalla de combate con la distribución de la referencia:

- el panel del enemigo arriba;
- la intención sobre su cabeza;
- la mano de cartas;
- encima de la mano, una fila de contadores con la pila de robo, la energía, la vida, el bloqueo, el descarte y terminar turno (ADR-0016);
- un menú de tres rayas arriba a la izquierda.

**Bloqueado por:** 09.

**Requisitos:** FR-CMB-005, FR-VIS-006, NFR-ACS-001, NFR-I18N-001, NFR-USA-002, §5.1, ADR-0013, ADR-0014, ADR-0015, ADR-0016.

**Estado:** listo

- [x] La pantalla de combate ya no lleva la cabecera con «Empollatro» y «Créditos»: el aula ocupa toda la pantalla.
- [x] **El menú:**
  - [x] Hay un botón de tres rayas arriba a la izquierda: un pósit de 21×21 con las rayas dibujadas (ADR-0016).
  - [x] Al tocarlo se despliega una lista con **Ajustes** y **Créditos**, y desde cada uno se puede volver al combate.
  - [x] La lista se puede usar con el teclado, cierra con Escape y los lectores de pantalla la anuncian.
- [x] **El panel del enemigo** está arriba, en una tira de libreta pegada en la pared (ADR-0016). Lleva:
  - [x] el retrato del enemigo;
  - [x] su nombre;
  - [x] una barra de vida con «actual/máxima».
- [x] La intención del enemigo se ve sobre su cabeza, en un bocadillo de papel, con su tipo y su valor (FR-CMB-005).
- [x] **Los contadores** van de pie sobre el pupitre, por encima de las cartas, en recortes de libreta sujetos con celo de colores (ADR-0016). Llevan:
  - [x] la **pila de robo**, con el número de cartas;
  - [x] la **energía**, con un icono y su número;
  - [x] la **vida** del jugador, como neurona con «actual/máxima»;
  - [x] el **bloqueo**, con el escudo y su número;
  - [x] el **descarte**, con la trituradora y su número;
  - [x] el botón **Terminar turno**, en un pósit.
- [x] En H1, Terminar turno y la energía se dibujan pero no funcionan. El botón queda marcado como no disponible para los lectores de pantalla. Su comportamiento llega en H2.
- [x] Se retira la vida hecha con filas de símbolos. Se conservan los sprites de la neurona, los escudos, la trituradora y la intención de ataque, redibujados a 16×16 con la guía nueva (ADR-0016).
- [x] Los iconos nuevos (pila de robo y energía) son sprites propios de 16×16, y la papelería (los recortes, los pósits y el bocadillo), sprites propios del tamaño de la guía de arte (§2). Todos tienen su entrada en el catálogo y en el registro de licencias.
- [x] Todos los textos salen del catálogo, van a media escala (guía de arte, §3) y los nuevos pares de texto y fondo pasan el test de contraste.
- [x] Cada elemento que se puede tocar mide al menos 44×44 px.
- [x] Comprobado en el navegador a 320, 360, 393 y 412 px de ancho:
  - la fila de contadores cabe sin scroll;
  - las cartas no tapan los contadores;
  - el panel del enemigo no tapa la pizarra en la zona de texto.

**Notas:**

- Mientras el ticket 10 no esté terminado, los paneles usan los colores de la paleta actual que más se parezcan. Cuando llegue la paleta, se cambian sus roles de color.
- La pantalla de Ajustes y su interruptor del CRT son del ticket 07. Este ticket solo pone la entrada en el menú.
- Las cartas no cambian de diseño.
- El anuncio del menú se ha comprobado con el árbol de accesibilidad del navegador (botón «Menú» con su estado de desplegado), no con un lector de pantalla real. Falta probarlo con TalkBack en Android y VoiceOver en iOS.
- La mano se separa de la barra de gestos del móvil con `safe-area-inset-bottom`. En el navegador de escritorio ese margen vale 0; se comprueba en un móvil real con la PWA instalada.
- La interfaz es de papelería (ADR-0016), en vez de los paneles oscuros de la referencia. Terminar turno no se ve atenuado, para que se lea como botón; sigue marcado como no disponible.
- Los textos van a media escala, y con una escala impar salen algo más anchos (guía de arte, §3). Se ha comprobado en el navegador que caben en su papel y se ven nítidos a ×3 (320×568 y 320×640 a densidad 2), ×4 (375×667 a densidad 2), ×5 (360×640 a densidad 2,5), ×6 (360×640, 360×800 y 393×852 a densidad 3) y ×7 (430×932 a densidad 3).
- Las cartas conservan su tamaño en px CSS, así que la fila de contadores sube en las pantallas cortas para dejarles sitio: en una de 360×640 va de y 207 a 240, y en una de 320×568, de y 209 a 242. Siempre queda entre los pies del enemigo (y 188) y la mano.
