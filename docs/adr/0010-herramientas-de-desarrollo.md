# ADR-0010: Herramientas de desarrollo y estructura del repositorio

- **Estado:** Aceptada
- **Fecha:** 2026-10-02
- **Origen:** ticket H1-02; R-1, R-10, NFR-MNT-001, NFR-I18N-001, NFR-SEC-003, NFR-PRF-004

## Contexto

ADR-0002 fija TypeScript y ADR-0003 fija React, pero ninguno dice con qué se arranca el servidor de desarrollo, se compila, se pasan los tests y el lint, ni cómo se organiza el repositorio. El ticket H1-02 necesita todo eso:

- un servidor de desarrollo que se abra desde el móvil a través de la wifi de casa (DP-14);
- reglas de lint a medida: `any` justificado (NFR-MNT-001), ningún texto literal en los componentes (NFR-I18N-001) y ninguna inyección de HTML (NFR-SEC-003);
- tests e integración continua en cada PR;
- coste cero (R-10).

Más adelante harán falta un Service Worker para el modo offline (FR-OFF-004, H2), importar shaders como texto (FR-VIS-001), un paquete aparte para el motor (ADR-0003) y un worker Node (ADR-0005, H4).

## Decisión

- **Vite** como servidor de desarrollo y herramienta de compilación. `npm run dev:mobile` lo abre a la red local en el puerto fijo 5173.
- **Vitest** para los tests.
- **ESLint** con typescript-eslint para el lint. Las reglas de NFR-I18N-001 y NFR-SEC-003 se escriben con las reglas propias de ESLint `no-restricted-syntax` y `no-restricted-properties`, y cada una tiene tests que prueban que falla cuando debe.
- **GitHub Actions** para la integración continua: comprobación de tipos, lint, tests, compilación y tamaño del build en cada PR. El repositorio es público, así que no tiene coste.
- **Tamaño del build:** un script propio sin dependencias (`scripts/check-bundle-size.ts`) mide `dist/` con gzip. La integración continua falla si el JavaScript inicial supera 150 kB (prov.). Cada dependencia de ejecución aumenta la descarga inicial, el almacenamiento offline y el mantenimiento, así que solo se añade si aporta un beneficio claro.
- **Node 26** en local y en la integración continua (`.nvmrc`).
- **TypeScript 6.0**, no la 7.0, porque typescript-eslint solo admite versiones anteriores a la 6.1.
- **Estructura:** en H1 la app vive en la raíz del repositorio. Al empezar el motor en H2 se pasa a npm workspaces (`apps/web`, `packages/engine`), y el worker se añadirá como otro paquete en H4.

## Alternativas descartadas

- **Next.js:** está pensado para renderizar en un servidor. Una PWA estática y offline no lo necesita, y añade conceptos (componentes de servidor, rutas por carpetas) que complican el aprendizaje.
- **Rsbuild (Rspack):** rápido y viable, pero con menos plugins y documentación que Vite, y los tests necesitarían otra herramienta con su propia configuración.
- **Parcel:** se desarrolla con menos actividad y su soporte de PWA es menos cómodo.
- **webpack a mano:** mucha más configuración para el mismo resultado.
- **Bun:** sustituye a Node, y el worker de ADR-0005 es Node.
- **Jest:** necesita configuración aparte para TypeScript, JSX y módulos ES, y duplica parte de lo que ya hace Vite.
- **Biome:** más rápido, pero no permite reglas a medida tan flexibles, y las de NFR-I18N-001 y NFR-SEC-003 serían difíciles o imposibles de expresar.
- **eslint-plugin-react:** no admite ESLint 10. Sus reglas `jsx-no-literals` y `no-danger` se sustituyen por los selectores propios.
- **size-limit:** añade varias dependencias de desarrollo para algo que se resuelve con los módulos que ya trae Node.
- **Workspaces desde H1:** evitan mover ficheros en H2, pero añaden configuración que H1 no necesita.

## Consecuencias

- `vite-plugin-pwa` queda disponible para el Service Worker de H2, y los shaders se pueden importar como texto con `?raw`.
- Vitest reutiliza la configuración de Vite, así que no hay una segunda configuración que mantener.
- Al empezar H2 hay que mover la app a `apps/web` y crear `packages/engine`. Es una tarea que tiene que ir en un ticket propio, porque afecta a todas las ramas abiertas.
- Cada PR muestra cuánto pesa el build, así que una dependencia de ejecución nueva se ve antes de fusionarla. El presupuesto se recalibra al medir NFR-PRF-004 en H2.
- Hay que volver a valorar TypeScript 7 cuando typescript-eslint lo admita.
- Para que un fallo de la integración continua bloquee el PR, la rama `main` debe tener una regla en GitHub que exija el check `checks`.
