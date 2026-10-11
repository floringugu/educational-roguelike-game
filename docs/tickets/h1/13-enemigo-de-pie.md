# 13: Enemigo de pie

**Qué construir:** el Examen redibujado como personaje de pie sobre el pupitre, de frente y con su sombra. Tiene una animación de reposo y una reacción al recibir daño. También se hace su retrato para el panel del enemigo.

**Bloqueado por:** 10.

**Requisitos:** FR-VIS-004, FR-VIS-007, R-3, R-4, ADR-0013, guía de arte.

**Estado:** listo

- [ ] El Examen es un sprite propio de 96×128 que sigue la lista de comprobación de la guía.
  - Conserva su diseño: la hoja con cara, la regla, el lápiz y las zapatillas rojas.
  - El encabezado «EXAMEN» y la nota pasan a ser garabatos y un círculo rojo, sin texto legible.
- [ ] Su sombra cae sobre el pupitre hacia la derecha y está justo donde pisa el enemigo, según la posición que exporta el ticket 11.
- [ ] Tiene una animación de reposo de 2 a 4 fotogramas: respira y mueve la regla y el lápiz.
- [ ] Al recibir daño, parpadea y retrocede, y después vuelve al reposo.
- [ ] Con `prefers-reduced-motion`, el enemigo se queda quieto en su primer fotograma y la reacción al daño se reduce a un cambio mínimo.
- [ ] Hay un retrato del Examen para el panel del enemigo, como sprite propio con el tamaño que fije la guía.
- [ ] Los fotogramas y el retrato están en el catálogo de sprites y en el registro de licencias, con licencia CC0.
- [ ] Comprobado en el navegador a tamaño de móvil y de PC: el enemigo se lee claro, pisa el pupitre y la intención no le tapa la cara.

**Notas:**

- El combate simulado alterna hoy dos enemigos: el Examen y el Profe de Mates. Se propone dejar solo el Examen, que vuelve con la vida llena al ser derrotado, y retirar el Profe de Mates del catálogo y del registro. Los demás enemigos se diseñan en H2 o H3. *Pendiente de confirmar por el dueño.*
