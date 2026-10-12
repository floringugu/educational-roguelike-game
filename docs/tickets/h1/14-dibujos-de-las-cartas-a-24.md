# 14: Dibujos de las cartas a 24×24

**Qué construir:** los dibujos de dentro de las cartas, redibujados a 24×24 con más detalle, luz y volumen, como en la referencia. El diseño de la carta no cambia: la hoja de libreta, la foto pegada con celo, el coste en boli rojo, las ediciones arrugadas y las manchas de café siguen igual.

**Bloqueado por:** 10.

**Requisitos:** FR-VIS-002, FR-VIS-004, NFR-ACS-001, R-3, R-4, ADR-0011, ADR-0013, ADR-0014, guía de arte.

**Estado:** listo

- [ ] Los cinco dibujos actuales son sprites propios de 24×24, en la vista baja de la guía:
  - la tiza;
  - el pupitre vacío;
  - el café;
  - la chuleta;
  - los libros.
- [ ] Cumplen la lista de comprobación de la guía: paleta, máximo de colores, luz desde la izquierda y sin texto legible.
- [ ] La ventana de la foto de la carta crece hasta que cabe el dibujo de 24×24 a la escala entera. La carta mide unos 38×54 píxeles del arte (ADR-0014) y conserva el resto de su diseño.
- [ ] Los textos de la carta siguen cabiendo, con la carta en la mano y levantada, también en el título y el certificado.
- [ ] Los sellos de las ediciones y las manchas de café no tapan el dibujo ni los textos.
- [ ] Las cartas, sus texturas y sus sombras se pintan con la escala entera del ticket 11, en cuanto esté terminado.
- [ ] Los sprites están en el catálogo y en el registro de licencias, con licencia CC0. Los de 16×16 que sustituyen se retiran.
- [ ] Comprobado en el navegador a 320, 360, 393 y 412 px de ancho:
  - las 5 cartas caben;
  - la parte que se ve de cada carta mide al menos 44 px de ancho;
  - el dibujo se lee con la carta en la mano.
