# Datos de prueba

Ficheros heredados de la v0 que se conservan como datos de prueba ([auditoría §4](../docs/00-auditoria-estado-actual.md#4-qué-se-reutiliza), [ADR-0001](../docs/adr/0001-rehacer-desde-cero.md)). No son contenido del juego.

## Origen

Entraron en el repositorio durante la v0, que se conserva en la etiqueta `v0-flask`:

| Fichero | Commit | Fecha | Qué es |
|---|---|---|---|
| `anki_decks/examen_dhcp_anki.csv` | `704f188` | 2025-11-20 | Exportación de Anki sobre DHCP: 68 filas separadas por `,`, con cabecera `front,back,tags` |
| `anki_decks/Tarjetas_Cloud.csv` | `704f188` | 2025-11-20 | Exportación de Anki sobre Cloud Computing: 215 filas separadas por `;`, con cabecera `Frente;Reverso;Tags`; algunas tienen 4 campos |
| `pdfs/1._Centro_de_datos.pdf` | `00281c4` | 2025-11-18 | Apuntes de una asignatura real (34 páginas) |
| `pdfs/2._Contenedores.pdf` | `00281c4` | 2025-11-18 | Apuntes de una asignatura real (15 páginas) |
| `pdfs/7._Cloud_Computing.pdf` | `00281c4` | 2025-11-18 | Apuntes de una asignatura real (43 páginas) |
| `pdfs/Guia_Pesca_Cuenca.pdf` | `00281c4` | 2025-11-18 | Documento de 1 página ajeno a cualquier asignatura |

Los dos CSV tienen finales de línea CRLF, como las exportaciones hechas en Windows. `.gitattributes` los excluye de la conversión a LF para que lleguen intactos a los tests.

Se eliminó `pdfs/1._Centro_de_datos_1.pdf` porque era una copia exacta (mismo MD5) de `pdfs/1._Centro_de_datos.pdf` (V0-D13).

## Uso

- **CSV:** casos de prueba del importador CSV, incluido el separado por `;` (FR-SUB-005 en el [SRS](../docs/SRS.md)).
- **PDF:** parte del conjunto de evaluación del pipeline de IA (FR-GEN-009).

## Privacidad

Los PDF son apuntes privados del dueño. Se usan solo para desarrollar y evaluar; no se publican ni se muestran fuera de este repositorio.
