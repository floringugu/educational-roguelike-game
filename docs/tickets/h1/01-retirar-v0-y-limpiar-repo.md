# 01: Retirar la v0 y dejar el repo limpio

**Qué construir:** el repositorio queda listo para empezar Empollatro desde cero. La v0 sigue consultable a través de una etiqueta, pero su código ya no está en la rama de trabajo. Solo se conservan los activos que la auditoría marca como reutilizables.

**Bloqueado por:** ninguno; puede empezar ya.

**Requisitos:** ADR-0001, NFR-MNT-004, V0-D13, auditoría §4.

**Estado:** listo

- [x] Existe la etiqueta `v0-flask` sobre el último commit de la v0 (`33ffd83`) y apunta a ese commit.
- [x] El código Flask, las plantillas, los estáticos de la v0, las bases de datos SQLite y los `__pycache__` ya no están versionados.
- [x] Los CSV y PDFs de `data/` se conservan como datos de prueba, junto con una nota de su origen.
- [x] Hay un `.gitignore` que excluye bases de datos, artefactos de build, dependencias instaladas, ficheros de entorno con secretos y fuentes subidas por usuarios.
- [x] El README describe Empollatro y enlaza al SRS. Las instrucciones de la v0 ya no aparecen.
- [x] `git ls-files` no muestra ningún fichero binario generado ni ninguna base de datos.
- [x] Las reglas de trabajo ya no mencionan la v0 retirada.
- [x] Hay un `.gitattributes` que fija los finales de línea en LF, porque el proyecto se trabaja desde Windows y desde Fedora.
