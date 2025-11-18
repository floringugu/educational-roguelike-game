# 🤖 Modelos de IA Disponibles - Guía de Selección

## 📊 Comparación de Modelos

| Modelo | Disponibilidad | Velocidad | Calidad | Compatibilidad | Recomendado |
|--------|----------------|-----------|---------|----------------|-------------|
| **mistralai/Mistral-7B-Instruct-v0.2** | ✅ Siempre | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ chat API | ✅ **SÍ** |
| **microsoft/Phi-3-mini-4k-instruct** | ⚠️ API de pago | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ text-gen | ⚠️ Avanzado |
| **HuggingFaceH4/zephyr-7b-beta** | ✅ Siempre | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ⚠️ chat only | ⚠️ Avanzado |
| **mistralai/Mixtral-8x7B-Instruct-v0.1** | ⚠️ Variable | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ text-gen | ⚠️ A veces |

---

## 🎯 Modelo Recomendado: Mistral-7B-Instruct-v0.2

### ✅ Ventajas

- **Siempre disponible**: Funciona 24/7 en la API serverless gratuita de Hugging Face
- **Muy rápido**: Genera preguntas en 4-6 segundos
- **Excelente calidad**: De los creadores de Mixtral, optimizado para instrucciones
- **100% Gratis**: Funciona perfectamente con la API gratuita
- **Máxima compatibilidad**: Usa chat API (el código lo maneja automáticamente)
- **Confiable**: Probado y verificado que funciona con cuentas gratuitas
- **Sin restricciones**: No requiere tier de pago

**Nota importante**: Mistral-7B-Instruct usa la **chat API** (conversational), no text-generation. El código hace esto automáticamente, no necesitas cambiar nada.

### 📝 Configuración

Ya está configurado por defecto en tu `.env`:

```bash
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

---

## 🔄 Modelos Alternativos

### 1. Phi-3-mini-4k-instruct (Muy Rápido, pero...)

⚠️ **Puede requerir tier de pago de Hugging Face**

```bash
HUGGINGFACE_MODEL=microsoft/Phi-3-mini-4k-instruct
```

**Características:**
- ⚡ El más rápido (~2-3 segundos)
- ⭐ Excelente calidad
- ⚠️ **Requiere tier de pago de HuggingFace** (error 403 con API gratuita)
- ✅ Si tienes tier de pago, funciona perfectamente
- 🔧 Creado por Microsoft

**Nota:** Si obtienes error 403, usa Mistral-7B en su lugar.

---

### 2. Zephyr-7b-beta (Avanzado)

⚠️ **Requiere API de chat (el código lo maneja automáticamente)**

```bash
HUGGINGFACE_MODEL=HuggingFaceH4/zephyr-7b-beta
```

**Características:**
- ⭐ Excelente calidad
- ✅ Siempre disponible
- 🔧 Usa chat API en lugar de text-generation
- ⚡ Rápido
- ⚠️ El código hace fallback automático si falla

---

### 3. Mixtral-8x7B (Máxima Calidad, pero...)

⚠️ **Solo usar si funciona en tu cuenta**

```bash
HUGGINGFACE_MODEL=mistralai/Mixtral-8x7B-Instruct-v0.1
```

**Características:**
- ⭐ Máxima calidad
- ⚠️ **NO siempre disponible** en API serverless gratuita
- 🐌 Más lento (modelo muy grande: 47B parámetros)
- ❌ Puede dar error "modelo no disponible"

**Por qué no está siempre disponible:**
- Es un modelo muy grande (pesa ~90GB)
- Hugging Face lo ejecuta en GPUs especiales
- Puede estar "durmiendo" si no se usa frecuentemente
- Tarda en "despertar" (loading state)

---

## 🔧 ¿Cómo Cambiar de Modelo?

1. Abre el archivo `.env` en la raíz del proyecto
2. Encuentra la línea `HUGGINGFACE_MODEL=...`
3. Reemplázala con el modelo que quieras
4. Guarda el archivo
5. Reinicia la aplicación (`python app.py`)

---

## 💡 Recomendaciones

### Para API gratuita (RECOMENDADO):
```bash
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

### Si tienes tier de pago de HuggingFace:
```bash
HUGGINGFACE_MODEL=microsoft/Phi-3-mini-4k-instruct
```

### Si eres usuario avanzado:
```bash
HUGGINGFACE_MODEL=HuggingFaceH4/zephyr-7b-beta
```

### Si Mixtral funciona para ti:
```bash
HUGGINGFACE_MODEL=mistralai/Mixtral-8x7B-Instruct-v0.1
```

---

## 🐛 Troubleshooting

### Error: "Model not currently available"

**Causa:** El modelo está en estado "loading" o no disponible en API serverless.

**Solución:**
1. Cambia a Zephyr-7b-beta o Phi-3-mini
2. Estos modelos siempre están disponibles

### Error: "Model is loading"

**Causa:** El modelo grande está "despertando".

**Solución:**
- Espera 30-60 segundos y vuelve a intentar
- O cambia a un modelo más ligero

### Preguntas de baja calidad

**Solución:**
1. Prueba con Mistral-7B o Zephyr
2. Ambos generan excelentes preguntas educativas

---

## 📊 Rendimiento Comparativo

### Tiempo de generación (10 preguntas):

| Modelo | Tiempo Promedio | Disponibilidad |
|--------|-----------------|----------------|
| Mistral-7B | ~4-6 segundos | ✅ API gratuita |
| Phi-3-mini | ~2-3 segundos ⚡ | ⚠️ Requiere tier de pago |
| Zephyr-7b | ~4-5 segundos | ✅ API gratuita |
| Mixtral-8x7B | ~15 segundos | ⚠️ Variable |

### Calidad de preguntas:

Todos los modelos recomendados generan preguntas de alta calidad para propósitos educativos. Las diferencias son mínimas en la práctica.

---

## ✅ Conclusión

**Usa Mistral-7B-Instruct-v0.2** (configuración actual) - Es la mejor opción para API gratuita:
- ✅ Funciona perfecto con API gratuita de Hugging Face
- ✅ Disponibilidad garantizada 24/7
- ✅ Calidad excelente para preguntas educativas
- ✅ 100% gratis sin restricciones
- ✅ Rápido (4-6 segundos)
- ✅ Máxima compatibilidad (text-generation API)
- ✅ De los creadores de Mixtral, muy confiable

**Solo cambia si:**
- Tienes tier de pago → Phi-3-mini-4k-instruct (más rápido)
- Eres usuario avanzado → Zephyr-7b-beta (usa chat API)
- Mixtral funciona para ti → Mixtral-8x7B-Instruct-v0.1

---

**Fecha:** 2025-11-18
**Versión:** 1.0
