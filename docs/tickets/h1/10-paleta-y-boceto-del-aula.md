# 10: Paleta de 32 colores y boceto del aula

**Qué construir:** la paleta definitiva de 32 colores y un boceto del aula a baja resolución. El dueño aprueba los dos antes de que se dibuje nada a tamaño final. Es la puerta de entrada de los tickets de arte (11, 13 y 14).

**Bloqueado por:** 09.

**Requisitos:** FR-VIS-004, NFR-ACS-001, ADR-0013, guía de arte.

**Estado:** listo

- [ ] `src/theme/palette.ts` tiene 32 colores, ordenados en rampas de oscuro a claro.
  - Se conservan los 20 de la paleta original y los tres verdes de la formica (`olive`, `sage` y `khaki`), ajustados si hace falta.
  - Se añaden, como mínimo:
    - el verde salvia claro del pupitre y el verde azulado oscuro de la pizarra, sacados de la referencia;
    - la pared de dos tonos;
    - la rampa de luz cálida;
    - el gris pizarra de los paneles de la interfaz.
- [ ] Los roles de color nuevos (panel, borde del panel, texto del panel y barra de vida) están en `colorRoles`. Sus pares de texto pasan el test de contraste (NFR-ACS-001).
- [ ] Los tests de la paleta pasan con 32 colores. Los sprites y las texturas actuales siguen usando solo colores de la paleta, o se ajustan.
- [ ] Hay una **muestra de la paleta**: una imagen con los 32 colores en sus rampas, cada uno con su nombre.
- [ ] Hay un **boceto del aula** a la cuarta parte del tamaño final, con la composición de la referencia:
  - las persianas y la ventana a la izquierda;
  - la pizarra al fondo, en el centro;
  - el reloj, el horario de corcho y los altavoces a la derecha;
  - los fluorescentes en el techo;
  - pupitres con mochilas a los lados;
  - el pupitre verde en primer plano, con el estuche y el cuaderno de espiral.
- [ ] El boceto marca la zona segura y dos encuadres: el de un móvil de 412×915 y el de un PC de 1920×1080.
- [ ] El dueño aprueba la paleta y el boceto. *Lo marca el dueño.*

**Notas:**

- La muestra y el boceto no forman parte del build. Se guardan en `docs/arte/`, para que quede constancia de lo aprobado.
- El boceto ya usa solo colores de la paleta, así que sirve también para probarla.
