# ADR-0007: Pipeline de IA (extracción, generación y verificación)

- **Estado:** Aceptada. Los modelos concretos pueden cambiar sin ADR nuevo si pasan el conjunto de evaluación
- **Fecha:** 2026-09-30
- **Origen:** Q9, Q9.1, Q9.2, Q10, Q12, Q14, Q36

## Contexto

Una pregunta incorrecta enseña algo falso. Cada PDF subido cuesta dinero y hay una cuota gratuita. Los modelos y sus precios cambian cada semana: GPT-6 Luna salió el 2026-09-22 y Gemini 3.8 Flash dobla su precio el 2027-01-01. Se prioriza el coste sobre la residencia de datos en la UE (Q9.1 a).

## Decisión

1. **Extracción sin LLM** con `unpdf`: texto por página y orden de lectura reconstruido por posición. Solo las páginas escaneadas, con poco texto o con diagramas se renderizan como imagen y pasan por un modelo con visión.
2. **Generación** (modelo inicial: GPT-6 Luna, con esfuerzo de razonamiento bajo y salida JSON con esquema estricto). Va por pasos: temas → conceptos → 2-3 variantes de pregunta por concepto, cada una con su cita y su página. **El primer tema se genera antes que el resto**, para que el usuario empiece a jugar cuanto antes.
3. **Verificación en dos capas:**
   - **Capa 1, código:** la cita, normalizada, aparece literalmente en la página indicada, y la clave de respuesta es válida.
   - **Capa 2, LLM de otra familia** (modelo inicial: Gemini 3.1 Flash-Lite): la respuesta se deduce de la cita y los distractores son claramente falsos.

   Si falla cualquiera de las dos, la pregunta se descarta.
4. **Abstracción:** una interfaz interna mínima (`generate(schema, prompt, files)` más un adaptador de batch) implementada con el **Vercel AI SDK**. Las ampliaciones que no corren prisa van por la API de batch, a mitad de precio.
5. **Conjunto de evaluación:** ≥ 20 PDFs reales en español con resultados revisados. Ningún cambio de modelo llega a producción sin pasarlo.
6. **Privacidad:**
   - El PDF se borra en cuanto se extrae el texto.
   - El procesamiento se hace fuera de la UE: OpenAI para generar y Google para verificar, cada uno con su DPA. Así se declara en la política de privacidad.
   - El contenido de los usuarios no se usa para ningún otro fin.

## Alternativas descartadas

- **Generación en vivo durante la partida:** latencia y coste por pregunta, y no permite verificar antes de mostrar.
- **Jev (TypeSafe AI) como verificador:** no genera texto y su documentación reconoce fallos en la lectura literal y en cifras y fechas.
- **Residencia estricta en la UE (Mistral o Vertex UE):** se aplaza por coste (Q9.1 a). Con la abstracción, el cambio es barato.
- **OpenRouter:** cobra una comisión del 5,5% y el enrutado por la UE solo existe en su plan empresa.
- **Revisión humana obligatoria antes de jugar:** mata la experiencia en el móvil (Q12).

## Consecuencias

- Coste estimado a 2026-09-30, que se medirá en H4: unos 0,009 $ por PDF de 40 diapositivas con solo texto, y unos 0,018 $ con visión en todas las páginas.
- Como generador y verificador son de familias distintas, es menos probable que compartan el mismo error.
- Antes de abrir al público tienen que estar aceptados los DPA de OpenAI y de Google y publicada la política de privacidad.
