# ADR-0013: Perspectiva cenital y guía de arte

- **Estado:** Sustituida por ADR-0014
- **Fecha:** 2026-10-08
- **Origen:** FR-VIS-004, R-3, R-4. Amplía ADR-0004 y ADR-0011.

## Contexto

La paleta fija (FR-VIS-004) es la única regla de estilo escrita, y no basta para que el arte parezca de un mismo juego. Los sprites actuales mezclan vistas: el fondo es un pupitre visto desde arriba, pero la taza, los libros y el pupitre de las cartas se ven de lado. También mezclan densidades de detalle: los enemigos de 96x96 tienen líneas finas, 14 colores y texto dibujado, y los iconos de 16x16 son formas grandes con pocos colores.

## Decisión

- **Todo el arte se ve desde arriba**, como objetos apoyados en el pupitre del fondo.
- Lo que es plano (papeles, fotos, exámenes, las cartas y los símbolos de la interfaz) puede tener un **dibujo interior frontal**, porque al estar tumbado sobre el pupitre se ve entero.
- Las reglas de detalle (escala, tamaños, luz, contorno, colores, tramado y texto) viven en [`docs/GUIA-DE-ARTE.md`](../GUIA-DE-ARTE.md). La guía puede cambiar sin un ADR nuevo mientras no contradiga esta decisión.

## Alternativas descartadas

- **Cenital estricto, incluido el contenido de los papeles:** obliga a dibujar a los enemigos vistos desde arriba, sin cara, y se pierde su carácter.
- **Aplicar la regla solo al arte nuevo:** la mezcla de vistas seguiría en las cartas que ya existen.
- **Sin regla de perspectiva:** cada sprite elige su vista y el conjunto no encaja con el fondo.

## Consecuencias

- El arte encaja con el fondo del pupitre y con la sombra de las cartas, que ya cae abajo a la derecha.
- Hay sprites actuales que incumplen la regla o la guía y que deben redibujarse. Su lista está en la guía, en «Pendiente».
- Antes de añadir un sprite al catálogo se revisa con la lista de comprobación de la guía.
