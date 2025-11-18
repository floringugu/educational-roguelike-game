# 🤖 Modelos de IA Disponibles - Guía de Selección

## 📊 Comparación de Modelos

| Modelo | Disponibilidad | Velocidad | Calidad | Recomendado |
|--------|----------------|-----------|---------|-------------|
| **HuggingFaceH4/zephyr-7b-beta** | ✅ Siempre | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ SÍ |
| **microsoft/Phi-3-mini-4k-instruct** | ✅ Siempre | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ SÍ |
| **mistralai/Mistral-7B-Instruct-v0.2** | ✅ Siempre | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ SÍ |
| **mistralai/Mixtral-8x7B-Instruct-v0.1** | ⚠️ Variable | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ⚠️ A veces |

---

## 🎯 Modelo Recomendado: Zephyr-7b-beta

### ✅ Ventajas

- **Siempre disponible**: Funciona 24/7 en la API serverless de Hugging Face
- **Muy rápido**: Genera preguntas en 2-5 segundos
- **Excelente calidad**: Optimizado para seguir instrucciones
- **Gratis**: 100% gratuito con tu API key
- **Confiable**: No falla por "modelo no disponible"

### 📝 Configuración

Ya está configurado por defecto en tu `.env`:

```bash
HUGGINGFACE_MODEL=HuggingFaceH4/zephyr-7b-beta
```

---

## 🔄 Modelos Alternativos

### 1. Microsoft Phi-3 Mini (Más Rápido)

Si necesitas máxima velocidad:

```bash
HUGGINGFACE_MODEL=microsoft/Phi-3-mini-4k-instruct
```

**Características:**
- ⚡ El más rápido de todos
- 🎯 Muy eficiente
- ✅ Siempre disponible
- 📝 Calidad muy buena

---

### 2. Mistral-7B (Balance)

Si prefieres Mistral pero más ligero que Mixtral:

```bash
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

**Características:**
- 🎯 Excelente balance calidad/velocidad
- ✅ Siempre disponible
- 📝 Muy buena calidad de respuestas
- 🔧 De los creadores de Mixtral

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

### Para uso general:
```bash
HUGGINGFACE_MODEL=HuggingFaceH4/zephyr-7b-beta
```

### Si necesitas velocidad máxima:
```bash
HUGGINGFACE_MODEL=microsoft/Phi-3-mini-4k-instruct
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
| Phi-3-mini | ~3 segundos |
| Zephyr-7b | ~5 segundos |
| Mistral-7B | ~6 segundos |
| Mixtral-8x7B | ~15 segundos (si está disponible) |

### Calidad de preguntas:

Todos los modelos recomendados generan preguntas de alta calidad para propósitos educativos. Las diferencias son mínimas en la práctica.

---

## ✅ Conclusión

**Usa Zephyr-7b-beta** (configuración actual) - Es el mejor balance de:
- ✅ Disponibilidad garantizada
- ✅ Velocidad excelente
- ✅ Calidad muy alta
- ✅ 100% gratis
- ✅ Confiable

**Solo cambia si:**
- Necesitas máxima velocidad → Phi-3-mini
- Mixtral funciona consistentemente para ti → Mixtral-8x7B
- Prefieres la familia Mistral → Mistral-7B

---

**Fecha:** 2025-11-18
**Versión:** 1.0
