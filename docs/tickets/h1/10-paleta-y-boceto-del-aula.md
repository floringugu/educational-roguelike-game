# 10: Paleta de 32 colores y boceto del aula

**Qué construir:** la paleta definitiva de 32 colores y un boceto del aula a baja resolución. El dueño aprueba los dos antes de que se dibuje nada a tamaño final. Es la puerta de entrada de los tickets de arte (11, 13 y 14).

**Bloqueado por:** 09.

**Requisitos:** FR-VIS-004, FR-VIS-008, NFR-ACS-001, ADR-0013, ADR-0014, guía de arte.

**Estado:** hecho

- [x] `src/theme/palette.ts` tiene 32 colores, ordenados en rampas de oscuro a claro.
  - Se conservan los 20 de la paleta original y los tres verdes de la formica (`olive`, `sage` y `khaki`), ajustados si hace falta.
  - Se añaden, como mínimo:
    - el verde salvia claro del pupitre y el verde azulado oscuro de la pizarra, sacados de la referencia;
    - la pared de dos tonos;
    - la rampa de luz cálida;
    - el gris pizarra de los paneles de la interfaz.
- [x] Los roles de color nuevos (panel, borde del panel, texto del panel y barra de vida) están en `colorRoles`. Sus pares de texto pasan el test de contraste (NFR-ACS-001).
- [x] Los tests de la paleta pasan con 32 colores. Los sprites y las texturas actuales siguen usando solo colores de la paleta, o se ajustan.
- [x] Hay una **muestra de la paleta**: una imagen con los 32 colores en sus rampas, cada uno con su nombre.
- [x] Hay un **boceto del aula** a tamaño final (180×320, ADR-0014), con la composición de la referencia:
  - la ventana con persianas en la pared de la izquierda, vista de lado, y el radiador debajo;
  - la pizarra al fondo, en el centro;
  - el reloj, el horario de corcho y los altavoces a la derecha;
  - los fluorescentes en el techo;
  - pupitres con mochilas a los lados;
  - el pupitre verde en primer plano, con las puntas del estuche y del cuaderno de espiral asomando por las esquinas, en diagonal siguiendo la perspectiva, y garabatos a los dos lados;
- [x] El boceto marca las zonas de la interfaz, del enemigo y de los textos, y enseña cómo queda el marco de 9:16 en un móvil de 412×915 y en un PC de 1920×1080.
- [x] El dueño aprueba la paleta y el boceto. *Lo marca el dueño.*

**Notas:**

- La muestra y el boceto no forman parte del build. Se guardan en `docs/arte/`, para que quede constancia de lo aprobado.
- El boceto ya usa solo colores de la paleta, así que sirve también para probarla.
- Resultado: la muestra está en `docs/arte/paleta.png` y el boceto en `docs/arte/boceto-aula.png`. Al bocetar el aula de 704×520 con zona segura, la disposición dejaba de parecerse a la referencia, así que el juego pasa a un marco fijo de 9:16 con un aula de 180×320 (ADR-0014). Las rampas, la composición, los tamaños y la escala quedan escritos en la guía de arte (§1, §2, §3 y §6).
- Al dibujar el aula, la paleta se retoca: cambian los valores de los 32 colores, pero no sus nombres ni sus rampas. Los sprites, las texturas, la muestra y el boceto se pasan a los valores nuevos color a color, cada uno al color del mismo nombre. Con los valores nuevos, la tinta sobre `olive` baja de 4,5:1, así que la sombra del pupitre del fondo animado (ticket 04) pasa a `fern` (NFR-ACS-001).
