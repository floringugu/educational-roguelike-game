# Empollatro

**Empollatro** es un roguelike deckbuilder educativo: una PWA pensada ante todo para el móvil.

1. Subes tus apuntes en PDF o tus exportaciones de Anki en CSV.
2. El sistema genera un banco de preguntas verificadas y ligadas a la fuente.
3. Juegas partidas de cartas por turnos en las que una carta solo tiene efecto si aciertas una pregunta.

La repetición espaciada (FSRS) decide qué se pregunta, así que cada partida es también un repaso del temario.

## Estado

En construcción desde cero, empezando por el hito H1 (prototipo visual).

## Arrancar el proyecto

Hace falta Node.js 26 o posterior (la versión de la integración continua está en [.nvmrc](.nvmrc)).

```sh
npm install
```

### Abrirlo en el móvil

Con el PC y el móvil conectados a la misma wifi:

```sh
npm run dev:mobile
```

El servidor de desarrollo arranca accesible desde la red local y muestra dos direcciones:

```text
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.0.6:5173/
```

En el móvil se abre la dirección de la línea `Network`. Si aparecen varias, es la de la interfaz de la wifi (en Fedora, `wlp…`). El puerto es siempre el 5173; si está ocupado, el servidor no arranca, para que la dirección no cambie.

Si el móvil no carga la página, el cortafuegos del PC está bloqueando el puerto:

- **Fedora:** la zona por defecto de Fedora Workstation ya permite los puertos 1025-65535. Si se usa otra zona, se abre hasta el siguiente reinicio con `sudo firewall-cmd --add-port=5173/tcp`.
- **Windows:** la primera vez, Windows pregunta si Node.js puede usar la red. Hay que permitirlo en redes privadas, y la wifi de casa tiene que estar marcada como red privada.

### Otros comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo solo para el propio PC |
| `npm run typecheck` | Comprobación de tipos con TypeScript estricto |
| `npm run lint` | Reglas de lint del proyecto |
| `npm test` | Tests |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run bundle-size` | Mide el tamaño de `dist/` y falla si el JavaScript inicial supera su presupuesto |
| `npm run check` | Todo lo anterior seguido, como en la integración continua |

## Reglas de calidad

La integración continua ([.github/workflows/ci.yml](.github/workflows/ci.yml)) ejecuta la comprobación de tipos, el lint, los tests, la compilación y la medición del tamaño en cada pull request. El lint hace fallar:

- un `any` sin un comentario que lo justifique (NFR-MNT-001). Se justifica así:

  ```ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- motivo
  ```

- un texto visible escrito dentro de un componente (NFR-I18N-001). Todos los textos de la interfaz están en el catálogo [src/i18n/es.ts](src/i18n/es.ts);
- cualquier uso de `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML` o `insertAdjacentHTML` (NFR-SEC-003). Esta regla no se puede desactivar con un comentario.

## Documentación

- [SRS](docs/SRS.md): la especificación de requisitos. Es la referencia obligatoria del proyecto.
- [Glosario](docs/GLOSARIO.md): el vocabulario del dominio.
- [ADRs](docs/adr/): las decisiones de arquitectura.
- [Tickets](docs/tickets/): el trabajo de cada hito.
- [Datos de prueba](data/README.md): los CSV y PDF que se usan en los tests y en la evaluación.

Cada dependencia de ejecución aumenta lo que el móvil descarga la primera vez y lo que la PWA guarda para funcionar sin conexión. Por eso [scripts/check-bundle-size.ts](scripts/check-bundle-size.ts) mide el build con gzip y hace fallar la integración continua si el JavaScript que se carga al arrancar supera 150 kB (valor provisional). El resultado aparece en el resumen de cada ejecución en GitHub.
