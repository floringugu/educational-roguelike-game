# Guía de arte

Reglas para que todo el arte de Empollatro parezca del mismo juego. Desarrolla [ADR-0014](adr/0014-vista-tres-cuartos-alta-y-pupitre-verde.md) y se aplica a los sprites (`src/assets/sprites/`) y a las texturas (`src/assets/textures/`) de [ADR-0011](adr/0011-arte-propio.md).

Cada regla dice cómo se comprueba: con un **test**, que ya existe y falla si se incumple, o con una **revisión** a ojo antes de añadir el asset.

## 1. Vista de tres cuartos alta

Todo se ve desde arriba y un poco por delante, como lo vería un alumno sentado ante el pupitre del fondo (ADR-0014). *Revisión.*

- **Objetos sueltos:** se dibuja sobre todo su cara de arriba y, debajo, una franja estrecha de su frente, de 1 a 3 píxeles según su altura.
  - Una taza de café es un óvalo con el café dentro, el asa asomando por un lado y una franja de su costado debajo.
  - Un libro es un rectángulo, con el canto de las hojas en una franja delgada por delante.
  - Una tiza o un lápiz son una barra tumbada, con una fila más oscura de su cara de abajo.
- **Cosas planas:** papeles, fotos, exámenes, las cartas y los símbolos de la interfaz (cruces de vida, escudos, neuronas). Su dibujo interior puede ser frontal, porque están tumbadas y se ven enteras. Un enemigo es una hoja o una foto sobre el pupitre, y la cara dibujada en ella mira al jugador.

## 2. Tamaños y escala

| Asset | Tamaño | En pantalla | Cómo se comprueba |
| --- | --- | --- | --- |
| Iconos de interfaz y arte de las cartas | 16x16 | 32x32 px | test |
| Enemigos | 96x96 | 192x192 px | test |
| Texturas | el que dibuja el CSS, dividido entre 2 | según el CSS | test |

- **Escala única ×2:** un píxel del arte mide siempre 2x2 píxeles CSS. Así todos los píxeles del juego tienen el mismo tamaño. *Revisión*, con el tamaño que se pasa a `Sprite` (`src/components/Sprite.tsx`) y el del CSS.
- Siempre con `image-rendering: pixelated`, para que el navegador no difumine los píxeles. *Revisión.*

## 3. Luz y sombra

- La luz viene de **arriba a la izquierda** de la pantalla. *Revisión.*
- Las caras que miran hacia arriba y a la izquierda llevan el tono claro, y las de abajo a la derecha el oscuro.
- La sombra que un objeto proyecta sobre el pupitre cae **abajo a la derecha**, como la de las cartas (`box-shadow` de `src/cards/Card.css`).

## 4. Contorno

*Revisión.*

- **Iconos de interfaz y enemigos:** contorno exterior de 1 píxel en `ink`. Ya lo llevan los escudos, las cruces, las neuronas, la trituradora y el examen.
- **Arte de las cartas:** sin contorno. Sus bordes son de un tono claro, para que el dibujo destaque sobre la ventana oscura (`bark`) de la carta.

## 5. Colores

- Solo colores de la paleta de `src/theme/palette.ts` (FR-VIS-004). *Test.*
- **Máximo por sprite, contorno incluido:** 6 colores en los de 16x16 y 10 en los de 96x96. *Revisión.*
- **Sombreado por rampas.** Para aclarar u oscurecer una zona se pasa al color vecino de su rampa, sin saltar a otra rampa. *Revisión.* Las rampas, de oscuro a claro:
  - marrones y papel: `ink → bark → umber → leather → tan → sand → parchment → paper`
  - azules: `night → indigo → periwinkle → lavender`
  - rojos y amarillos: `wine → crimson → vermilion → amber → gold`
  - verdes: `forest → leaf → lime`
  - verdes apagados de la formica del pupitre: `olive → sage → khaki`

## 6. Píxeles

- **Sin semitransparencias:** cada píxel es opaco o del todo transparente. *Test.*
- **Sin antialiasing:** los bordes no se suavizan con tonos intermedios. *Revisión.*
- **Tramado (dithering) solo en las texturas.** Los sprites usan zonas de color lisas. *Revisión.*
- **En los enemigos, formas grandes:** pocas zonas de color y nada de detalle de líneas de 1 píxel sueltas. Deben leerse en el móvil igual de claro que los iconos. *Revisión.*

## 7. Texto

Ningún sprite lleva texto legible dibujado. Los textos de la interfaz salen del catálogo de textos (NFR-I18N-001), y uno dibujado no se puede cambiar ni leer en voz alta. Los garabatos que solo sugieren escritura, como los de la chuleta, sí valen. También las iniciales talladas en el pupitre del fondo (el corazón con «F+D»), que son grabados de 1 píxel y no dan información de la interfaz (ADR-0014). *Revisión.*

## 8. Lista de comprobación de un asset nuevo

1. Se ve en tres cuartos alta, o es una cosa plana (§1).
2. Tiene el tamaño de su tipo y se pinta a ×2 (§2).
3. La luz viene de arriba a la izquierda (§3).
4. El contorno es el de su tipo (§4).
5. Usa colores de la paleta, no pasa del máximo y sombrea por rampas (§5).
6. No tiene semitransparencias, antialiasing ni tramado (§6).
7. No lleva texto legible (§7).
8. Está en el catálogo (`src/assets/sprite-ids.ts`) y en el registro de licencias (`src/data/licenses.ts`, R-4).
9. Es dibujo propio y no está copiado ni calcado de otro juego (R-3).
10. `npm test` pasa.

## Pendiente

Assets actuales que incumplen la guía y hay que redibujar o ajustar:

| Asset | Qué incumple |
| --- | --- |
| `card-art-coffee` | Taza y plato vistos de lado: revisar con la vista de tres cuartos alta (§1) |
| `card-art-books` | Pila de libros vista de lado: revisar con la vista de tres cuartos alta (§1); 7 colores (§5) |
| `card-art-empty-desk` | Pupitre visto de lado: revisar con la vista de tres cuartos alta (§1) |
| `discard-shredder` y `discard-shredder-strips` | Trituradora vista de frente: revisar con la vista de tres cuartos alta (§1); se pintan a 48 px, ×3 (§2) |
| `enemy-math-teacher` | Sin contorno (§4); 14 colores (§5); líneas finas (§6); texto «MATES» (§7) |
| `enemy-midterm` | Texto «EXAMEN» (§7) |
| Texturas de las hojas arrugadas | Se estiran al tamaño de la carta (`background-size: 100% 100%`): falta comprobar que van a ×2 (§2) |
