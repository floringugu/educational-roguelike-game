# ADR-0014: Vista de tres cuartos alta y pupitre verde

- **Estado:** Aceptada
- **Fecha:** 2026-10-10
- **Origen:** FR-VIS-001, FR-VIS-004, FR-VIS-007, NFR-ACS-001, R-3, R-4. Sustituye a ADR-0013; amplía ADR-0004 y ADR-0011.

## Contexto

ADR-0013 fijó una vista cenital estricta: todo se dibuja como si se mirara desde justo encima del pupitre. Al probarla en el fondo, el pupitre de madera visto desde arriba se quedaba en una superficie plana: no se reconocía como un pupitre de clase y los objetos apoyados en él parecían pegatinas. Las maquetas del fondo con la referencia de un pupitre escolar verde se reconocían mucho mejor cuando se ve algo del frente de las cosas: el canto del tablero, las patas, la silla y el lateral de los objetos.

Ese pupitre es de formica verde claro. La paleta de 20 colores no tenía verdes apagados, y con el fondo claro los textos claros de la interfaz dejan de leerse sobre él.

## Decisión

- **Todo el arte se ve en tres cuartos alta:** desde arriba y un poco por delante, como lo vería un alumno sentado. Se ve sobre todo la cara de arriba de cada cosa y una franja estrecha de su frente. La luz sigue viniendo de arriba a la izquierda.
- Lo que es plano (papeles, fotos, exámenes, las cartas y los símbolos de la interfaz) puede seguir teniendo un **dibujo interior frontal**.
- **El fondo es un pupitre verde con su silla**, sobre el suelo de la clase. Se anima con detalles pequeños y lentos: una mosca, un avión de papel, una bolita de papel que alguien tira y una hormiga que cruza el pupitre con una miga. Los objetos del pupitre saltan un poco cuando el enemigo golpea al jugador.
- **La paleta pasa a 23 colores** con una rampa de verdes apagados para la formica: `olive → sage → khaki`. Sigue dentro del límite de FR-VIS-004.
- **Los textos dibujados directamente sobre el pupitre son oscuros:** `ink` para el nombre del enemigo y los números de la vida, y `wine` para el título. Sus colores son los roles `deskText` y `deskTitle`, y un test comprueba su contraste con cada color del fondo que puede quedar debajo (NFR-ACS-001).
- **Excepción de texto:** las iniciales talladas en el pupitre (un corazón con «F+D») están permitidas. Son grabados de 1 píxel que solo sugieren escritura, como los garabatos de la chuleta, y no transmiten información de la interfaz.
- Las reglas de detalle siguen en [`docs/GUIA-DE-ARTE.md`](../GUIA-DE-ARTE.md), que puede cambiar sin un ADR nuevo mientras no contradiga esta decisión.

## Alternativas descartadas

- **Mantener la vista cenital de ADR-0013:** el pupitre no se reconoce y los objetos parecen planos.
- **Vista de tres cuartos baja, casi de frente:** el tablero se acorta tanto que no deja sitio al enemigo y a los objetos, y obliga a redibujar las cosas planas.
- **Pupitre de madera oscura con textos claros:** no se parece a la referencia y el verde se reconoce mucho mejor como pupitre escolar.
- **Mantener 20 colores y pintar la formica con `leaf` y `lime`:** son verdes saturados de planta y el pupitre parecía césped.

## Consecuencias

- Los sprites vistos de lado que ADR-0013 marcaba como pendientes (la taza, los libros, el pupitre de las cartas) se acercan a la nueva vista y hay que revisarlos de nuevo con la guía.
- El fondo pasa a componerse de una escena fija pintada en la CPU y unas pocas capas animadas en el shader (ver el ticket 04 de H1).
- La pantalla de créditos, de textos largos, se dibuja sobre un panel oscuro propio para no depender del fondo.
- Cualquier texto nuevo que vaya directamente sobre el pupitre debe usar `deskText` o `deskTitle` y quedar lejos de las marcas talladas y de los objetos.
