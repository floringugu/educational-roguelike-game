# ADR-0011: Arte propio además de packs CC0

- **Estado:** Aceptada
- **Fecha:** 2026-10-04
- **Origen:** ticket H1-05; FR-VIS-004, R-4, R-10. Amplía ADR-0004.

## Contexto

ADR-0004 dice que el arte sale de packs CC0 (Kenney, 0x72) recoloreados a la paleta. Esos packs son de fantasía: espadas, escudos, pociones y monstruos. Las cartas de Empollatro tratan de la vida de estudiante (Tizazo, Chuleta, Faltar, Tocho, Cafelito) y necesitan dibujos de tiza, chuletas, pupitres, libros y cafés que esos packs no tienen.

## Decisión

- El catálogo de assets admite **sprites propios** del proyecto además de los de packs CC0.
- Los sprites propios se dibujan píxel a píxel, a 16×16 y solo con colores de la paleta (FR-VIS-004). No se copian ni se calcan de otros juegos (R-3).
- Se publican con licencia **CC0 1.0**, con el dueño como autor, y tienen su entrada en el registro de licencias (R-4).
- El fichero de cada sprite es su PNG en `src/assets/sprites/`. Para cambiarlo, se edita ese PNG con cualquier editor de pixel art.
- Las **texturas** propias (por ejemplo, las hojas arrugadas de las ediciones de las cartas y las manchas de café) siguen las mismas reglas, pero van en `src/assets/textures/`: no son sprites de 16×16, y el CSS las usa como fondo sin pasar por el catálogo de sprites.

## Alternativas descartadas

- **Solo packs CC0:** no hay material escolar con el estilo y el tamaño del resto del arte. Los nombres de las cartas no casarían con sus dibujos.
- **Arte con otra licencia (CC BY o todos los derechos reservados):** CC0 es lo mismo que el resto del arte y no obliga a nadie a nada al reutilizarlo.

## Consecuencias

- Los dibujos se ajustan a la temática del juego.
- Cada sprite nuevo es trabajo de dibujo, no solo de buscar y recolorear.
- El test de la paleta comprueba también los sprites propios, igual que los de Kenney, y las texturas.
