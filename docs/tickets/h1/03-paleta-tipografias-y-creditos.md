# 03: Paleta, tipografías y créditos

**Qué construir:** la identidad visual básica de Empollatro, con su pantalla de Créditos:

- una paleta fija elegida por el dueño;
- las dos tipografías;
- un catálogo de assets con los primeros sprites recoloreados;
- la pantalla de Créditos, generada a partir de un registro de licencias.

**Bloqueado por:** 02.

**Requisitos:** FR-VIS-004, FR-VIS-005, FR-VIS-006, R-4, NFR-ACS-001.

**Estado:** hecho

- [x] Se presentan al dueño 2 o 3 paletas candidatas de 16 a 24 colores, con una muestra visual de cada una. El dueño elige una y la elección queda anotada en el ticket.
  - Paletas presentadas: A «Noche de estudio» (22 colores), B «Pizarra y tiza» (20) y C «Pergamino y tinta» (20).
  - **Elegida: C, «Pergamino y tinta»** (20 colores). Está en `src/theme/palette.ts`.
- [x] Todos los colores de la interfaz salen de esa paleta.
- [x] Hay una comprobación automática de que cada par de colores de texto y fondo que se usa tiene un contraste de al menos 4,5:1.
- [x] m6x11 y Pixelify Sans se sirven desde el propio proyecto, sin CDN de fuentes, para que funcionen sin conexión.
- [x] Se comprueba si m6x11 tiene los caracteres `áéíóúüñÁÉÍÓÚÜÑ¿¡`:
  - [x] Si los tiene, se usa para títulos y cifras.
  - [ ] Si no, se usa Pixelify Sans para todo.
  - [x] El resultado queda anotado en el ticket.
  - **Resultado:** m6x11 tiene `¿¡` pero le faltan las 14 letras con tilde, diéresis o eñe (`áéíóúüñÁÉÍÓÚÜÑ`). Por decisión del dueño se usa entonces **m6x11plus**, la variante del mismo autor, que sí tiene los 16 caracteres, para títulos y cifras. Pixelify Sans también los tiene y se usa para el resto del texto. La comprobación es `tests/assets/fonts.test.ts`.
- [x] El catálogo de assets tiene al menos los sprites que necesitan los tickets 05 y 06: arte de carta y un enemigo. Están recoloreados a la paleta y se cargan por identificador, de modo que cambiar un sprite no toca el código de los componentes.
- [x] Cada asset y cada fuente figura en un registro de licencias con su autor, su licencia y la atribución que exige.
- [x] La pantalla de Créditos se genera a partir de ese registro.
- [x] Ningún asset tiene una licencia que prohíba el uso comercial.
  - Kenney (CC0) y Pixelify Sans (OFL) lo permiten expresamente. La página de m6x11plus dice «free to use with attribution»; el dueño ha confirmado que esa licencia cubre el uso comercial.

**Notas:**

- Las fuentes se sirven en WOFF2: Pixelify Sans es el fichero que publican sus autores y m6x11plus se ha convertido desde el TTF del autor (el comando está en `src/styles/fonts.css`). El texto de la OFL viaja con la fuente y la pantalla de Créditos enlaza a esa copia, que funciona sin conexión.
- Los textos del registro de licencias (nombre de la licencia, atribución, cambios) se muestran en inglés, el idioma de las licencias, y no pasan por el catálogo de textos. Las etiquetas de la pantalla sí salen de `src/i18n/es.ts`.
- Cada pantalla se guarda en el historial del navegador, de modo que el gesto de atrás del móvil vuelve de Créditos a Inicio. Al cambiar de pantalla, el foco pasa al título de la nueva.
