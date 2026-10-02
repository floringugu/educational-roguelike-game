# 02: Esqueleto que se abre en el móvil

**Qué construir:** una app React en TypeScript estricto con una sola pantalla. El texto de la pantalla sale del catálogo de textos en español. El dueño la abre en su móvil (Redmi Note 14 Pro) a través del servidor de desarrollo de su PC en la wifi de casa. A partir de este ticket, toda la infraestructura de calidad funciona en cada PR.

**Bloqueado por:** 01.

**Requisitos:** R-1, R-9, NFR-MNT-001, NFR-I18N-001, NFR-SEC-003 (adelantado de H2), NFR-MNT-004, NFR-PRF-004 (medición del build, adelantado de H2).

**Estado:** listo

- [x] El proyecto compila con `strict: true` y sin errores de tipos.
- [x] Hay reglas de lint que fallan:
  - [x] con un `any` que no lleve al lado un comentario que lo justifique;
  - [x] con un literal de texto visible dentro de un componente, porque todo texto sale del catálogo;
  - [x] con un uso de `dangerouslySetInnerHTML` o de `innerHTML`.
- [x] Hay un test que prueba cada una de esas reglas con un caso que debe fallar.
- [ ] La integración continua ejecuta en cada PR la comprobación de tipos, el lint, los tests y la compilación. Si cualquiera falla, el PR se bloquea. Debe caber en el plan gratuito (R-10).
- [x] La integración continua mide con gzip el tamaño del build de producción, lo muestra en el resumen del job y falla si el JavaScript inicial supera 150 kB (prov.).
- [x] Hay un único comando, documentado en el README, que arranca el servidor de desarrollo accesible desde la red local y muestra la dirección que se abre en el móvil.
- [ ] El dueño abre esa dirección en su móvil y ve la pantalla.
