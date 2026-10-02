# ADR-0005: Supabase (UE) y worker Node con cola para el pipeline

- **Estado:** Aceptada
- **Fecha:** 2026-09-30
- **Origen:** Q16, Q25, Q10

## Contexto

Hace falta autenticación con Google, Apple y enlace mágico, una base de datos, almacenamiento temporal de PDFs y trabajos largos (PDF → LLM). Construir el login y la base de datos a mano es arriesgado para quien está aprendiendo. Las Edge Functions de Supabase tienen un límite de 2 s de CPU y de 150-400 s de reloj, así que no sirven para el pipeline.

## Decisión

- **Supabase** en la región UE de Frankfurt (`eu-central-1`) para autenticación, Postgres y almacenamiento, con RLS activado en **todas** las tablas.
- Un **worker Node** en TypeScript consume trabajos de una cola en **Supabase Queues** (pgmq) y ejecuta el pipeline.
- Las claves de los proveedores de LLM viven **solo** en el worker.

## Alternativas descartadas

- **Servidor y Postgres propios en un VPS:** hay que mantener la seguridad, las copias de seguridad y el login.
- **Firebase:** NoSQL y más dependencia de un proveedor, sin ventajas para este caso.

## Consecuencias

- El plan gratuito basta para desarrollar, pero pausa el proyecto tras 1 semana de inactividad. **El lanzamiento público requiere el plan Pro** (25 $/mes a 2026-09-30).
- Queda por decidir dónde se aloja el worker (SRS §10.1, DP-7).
