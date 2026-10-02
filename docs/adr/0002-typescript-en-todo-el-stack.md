# ADR-0002: TypeScript estricto en todo el stack

- **Estado:** Aceptada
- **Fecha:** 2026-09-30
- **Origen:** Q7, Q15, Q23

## Contexto

Una PWA obliga a que el cliente sea JavaScript/TypeScript. El dueño del proyecto aún no domina ningún lenguaje y revisará todo el código (Q7 c). La extracción de PDF en Python (PyMuPDF) tiene licencia AGPL.

## Decisión

Cliente, lógica de juego, worker y scripts se escriben en TypeScript con `strict: true`. La interfaz de usuario está en español; el código y sus comentarios, en inglés.

## Alternativas descartadas

- **Cliente TS + backend Python:** obliga a aprender dos lenguajes a la vez, y la mejor librería de PDF en Python es AGPL.

## Consecuencias

- Un solo lenguaje para aprender y revisar en cliente, motor, worker y scripts.
- La extracción de PDF usa `unpdf`/pdf.js, y el orden de lectura hay que reconstruirlo por posición (y, x).
- Si una pieza aislada del pipeline necesitara Python, se evaluará en otro ADR.
