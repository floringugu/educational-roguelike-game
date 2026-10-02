# 05: Mano de 5 cartas

**Qué construir:** en la parte de abajo de la pantalla en vertical, una mano de 5 cartas en abanico. Las cartas tienen arte del catálogo. Al tocarlas o arrastrarlas se inclinan en 3D con un movimiento de muelle, y al menos una carta lleva acabado foil y otra holo.

**Bloqueado por:** 03.

**Requisitos:** FR-VIS-002, FR-VIS-004, NFR-USA-002, NFR-ACS-001.

**Estado:** listo

- [ ] Se ven 5 cartas en abanico y se pueden usar con el pulgar de una mano en vertical.
- [ ] Cada carta muestra su nombre, su coste y su descripción con las tipografías y la paleta del ticket 03. Los textos salen del catálogo de textos.
- [ ] La carta se inclina en 3D siguiendo el dedo y vuelve a su sitio con un movimiento de muelle.
- [ ] Al menos una carta tiene acabado foil y otra holo, hechos con CSS propio y sin copiar código GPL (R-3).
- [ ] La zona táctil de cada carta mide al menos 44×44 px.
- [ ] Las cartas son datos de prueba en un JSON, no componentes escritos uno a uno.
- [ ] Con el fondo del ticket 04 activo y la mano en pantalla, el móvil del dueño mantiene ≥ 30 fps. El valor queda anotado en el ticket, si el 04 ya está terminado.
