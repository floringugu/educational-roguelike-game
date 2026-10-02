# 03: Paleta, tipografías y créditos

**Qué construir:** la identidad visual básica de Empollatro, con su pantalla de Créditos:

- una paleta fija elegida por el dueño;
- las dos tipografías;
- un catálogo de assets con los primeros sprites recoloreados;
- la pantalla de Créditos, generada a partir de un registro de licencias.

**Bloqueado por:** 02.

**Requisitos:** FR-VIS-004, FR-VIS-005, FR-VIS-006, R-4, NFR-ACS-001.

**Estado:** listo

- [ ] Se presentan al dueño 2 o 3 paletas candidatas de 16 a 24 colores, con una muestra visual de cada una. El dueño elige una y la elección queda anotada en el ticket.
- [ ] Todos los colores de la interfaz salen de esa paleta.
- [ ] Hay una comprobación automática de que cada par de colores de texto y fondo que se usa tiene un contraste de al menos 4,5:1.
- [ ] m6x11 y Pixelify Sans se sirven desde el propio proyecto, sin CDN de fuentes, para que funcionen sin conexión.
- [ ] Se comprueba si m6x11 tiene los caracteres `áéíóúüñÁÉÍÓÚÜÑ¿¡`:
  - [ ] Si los tiene, se usa para títulos y cifras.
  - [ ] Si no, se usa Pixelify Sans para todo.
  - [ ] El resultado queda anotado en el ticket.
- [ ] El catálogo de assets tiene al menos los sprites que necesitan los tickets 05 y 06: arte de carta y un enemigo. Están recoloreados a la paleta y se cargan por identificador, de modo que cambiar un sprite no toca el código de los componentes.
- [ ] Cada asset y cada fuente figura en un registro de licencias con su autor, su licencia y la atribución que exige.
- [ ] La pantalla de Créditos se genera a partir de ese registro.
- [ ] Ningún asset tiene una licencia que prohíba el uso comercial.
