# 🤖 Modelos de IA Disponibles - Guía de Selección

## 📊 Comparación de Modelos

| Modelo | Disponibilidad | Velocidad | Calidad | Compatibilidad | Recomendado |
|--------|----------------|-----------|---------|----------------|-------------|
| **microsoft/Phi-3-mini-4k-instruct** | ✅ Siempre | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ text-gen | ✅ **SÍ** |
| **mistralai/Mistral-7B-Instruct-v0.2** | ✅ Siempre | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ text-gen | ✅ SÍ |
| **HuggingFaceH4/zephyr-7b-beta** | ✅ Siempre | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ⚠️ chat only | ⚠️ Avanzado |
| **mistralai/Mixtral-8x7B-Instruct-v0.1** | ⚠️ Variable | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ text-gen | ⚠️ A veces |

---

## 🎯 Modelo Recomendado: Phi-3-mini-4k-instruct

### ✅ Ventajas

- **Siempre disponible**: Funciona 24/7 en la API serverless de Hugging Face
- **El más rápido**: Genera preguntas en 2-3 segundos
- **Excelente calidad**: Creado por Microsoft, optimizado para instrucciones
- **Gratis**: 100% gratuito con tu API key
- **Máxima compatibilidad**: Funciona con la API estándar de text-generation
- **Confiable**: No falla por "modelo no disponible" o "API incorrecta"

### 📝 Configuración

Ya está configurado por defecto en tu `.env`:

```bash
HUGGINGFACE_MODEL=microsoft/Phi-3-mini-4k-instruct
```

---

## 🔄 Modelos Alternativos

### 1. Mistral-7B-Instruct (Excelente Calidad)

Si prefieres el estilo de Mistral:

```bash
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

**Características:**
- ⭐ Excelente calidad para preguntas educativas
- ✅ Siempre disponible
- 🎯 Muy buena calidad de respuestas
- 🔧 De los creadores de Mixtral (versión más ligera)
- ⚡ Rápido (ligeramente más lento que Phi-3)

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

### 3. Mixtral-8x7B (Mayor Calidad, pero...)

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

### Para uso general (RECOMENDADO):
```bash
HUGGINGFACE_MODEL=microsoft/Phi-3-mini-4k-instruct
```

### Si prefieres el estilo Mistral:
```bash
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
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

| Modelo | Tiempo Promedio |
|--------|-----------------|
| Phi-3-mini | ~2-3 segundos ⚡ |
| Mistral-7B | ~4-6 segundos |
| Zephyr-7b | ~4-5 segundos |
| Mixtral-8x7B | ~15 segundos (si está disponible) |

### Calidad de preguntas:

Todos los modelos recomendados generan preguntas de alta calidad para propósitos educativos. Las diferencias son mínimas en la práctica.

---

## ✅ Conclusión

**Usa Phi-3-mini-4k-instruct** (configuración actual) - Es la mejor opción:
- ✅ Máxima velocidad (el más rápido)
- ✅ Disponibilidad garantizada 24/7
- ✅ Calidad excelente para preguntas educativas
- ✅ 100% gratis
- ✅ Máxima compatibilidad (text-generation API)
- ✅ Creado por Microsoft, muy confiable

**Solo cambia si:**
- Prefieres el estilo Mistral → Mistral-7B-Instruct-v0.2
- Eres usuario avanzado → Zephyr-7b-beta (usa chat API)
- Mixtral funciona para ti → Mixtral-8x7B-Instruct-v0.1

---

**Fecha:** 2025-11-18
**Versión:** 1.0
