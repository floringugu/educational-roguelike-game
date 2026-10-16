# 13: Enemigo de pie

**Qué construir:** el Examen redibujado como personaje de pie sobre el pupitre, de frente y con su sombra. Tiene una animación de reposo y una reacción al recibir daño. También se hace su retrato para el panel del enemigo.

**Bloqueado por:** 10.

**Requisitos:** FR-VIS-004, FR-VIS-007, R-3, R-4, ADR-0013, ADR-0014, guía de arte.

**Estado:** listo

- [ ] El Examen es un sprite propio de 88×96 que sigue la lista de comprobación de la guía.
  - Conserva su diseño: la hoja con cara, la regla, el lápiz y las zapatillas rojas.
  - El encabezado «EXAMEN» y la nota pasan a ser garabatos y un círculo rojo, sin texto legible.
- [x] La pantalla de combate coloca al enemigo en la posición que exporta el ticket 11 (`ENEMY_RECT`): centrado en x 46-134 y con los pies en y 188, dentro del pupitre y no en su borde. Lo hace ya el ticket 12, con el sprite actual de 96×96 centrado en esos 88 de ancho.
- [x] Su sombra cae sobre el pupitre hacia la derecha y está justo donde pisa el enemigo, según la posición que exporta el ticket 11.
  - *Hecho en el ticket 16: es un sprite aparte de 59×7, `enemy-midterm-shadow`, que se queda en el pupitre cuando el enemigo cae o se inclina.*
- [ ] Tiene una animación de reposo de 2 a 4 fotogramas: respira y mueve la regla y el lápiz.
- [x] Al recibir daño, parpadea y retrocede, y después vuelve al reposo.
  - *Hecho en el ticket 16: se ilumina y se inclina hacia atrás en 3D desde los pies, y vuelve como un muelle (ADR-0017).*
- [ ] Con `prefers-reduced-motion`, el enemigo se queda quieto en su primer fotograma y la reacción al daño se reduce a un cambio mínimo.
  - *Desde el ticket 16 no cae ni se inclina. Faltan el primer fotograma, cuando haya animación de reposo, y el cambio mínimo al recibir daño.*
- [x] Hay un retrato del Examen para el panel del enemigo, como sprite propio de 16×16 (`enemy-midterm-portrait`, hecho en el ticket 12).
- [ ] Los fotogramas y el retrato están en el catálogo de sprites y en el registro de licencias, con licencia CC0. El retrato ya lo está (ticket 12); faltan los fotogramas.
- [ ] Comprobado en el navegador a tamaño de móvil y de PC: el enemigo se lee claro, pisa el pupitre y la intención no le tapa la cara.

**Notas:**

- El combate simulado ya solo tiene al Examen, que vuelve con la vida llena al ser derrotado. El Profe de Mates se retiró del catálogo, del registro y del catálogo de textos en el ticket 12. Los demás enemigos se diseñan en H2 o H3.
