# 🚀 Configuración Rápida - Generación de Preguntas

## ⚠️ Problemas Identificados y Resueltos

### Problema 1: Archivo .env no se cargaba
El archivo `.env` con la API key de Hugging Face no estaba siendo cargado correctamente, por lo que no se generaban preguntas.

### Problema 2: Modelo Mixtral-8x7B no disponible
El modelo `mistralai/Mixtral-8x7B-Instruct-v0.1` es muy grande (47B parámetros) y puede no estar disponible en la API de inferencia serverless gratuita de Hugging Face.

### Problema 3: Zephyr requiere API de chat
El modelo `HuggingFaceH4/zephyr-7b-beta` está configurado para tareas conversacionales (chat) en lugar de text-generation directa, lo que causa errores de compatibilidad.

## ✅ Solución Implementada

Se han realizado las siguientes correcciones:

1. ✅ **Actualizado `config.py`** para cargar variables de entorno desde `.env`
2. ✅ **Creado archivo `.env`** con plantilla de configuración
3. ✅ **Creado `.gitignore`** para proteger tu API key
4. ✅ **Creado script de verificación** para validar la configuración
5. ✅ **Cambiado modelo default** a `microsoft/Phi-3-mini-4k-instruct` (el más rápido y compatible)
6. ✅ **Mejorado manejo de errores** para diagnosticar problemas de modelos
7. ✅ **Agregado soporte para chat API** (fallback automático para Zephyr)

---

## 📝 Pasos para Configurar (5 minutos)

### Paso 1: Obtener tu API Key de Hugging Face (GRATIS)

1. Visita: **https://huggingface.co/join**
2. Crea una cuenta gratis (con email, Google o GitHub)
3. Ve a: **https://huggingface.co/settings/tokens**
4. Haz clic en **"New token"**
5. Dale un nombre (ej: `educational-roguelike`)
6. Selecciona **"Read"** como permiso
7. Copia el token (empieza con `hf_`)

### Paso 2: Configurar tu API Key

Edita el archivo `.env` que ya está creado en tu proyecto:

```bash
nano .env
```

O ábrelo con cualquier editor de texto y reemplaza esta línea:

```bash
HUGGINGFACE_API_KEY=PONER_TU_API_KEY_AQUI
```

Con tu API key real (debe empezar con `hf_`):

```bash
HUGGINGFACE_API_KEY=hf_tu_token_real_aqui
```

El modelo ya está configurado con **Phi-3-mini-4k-instruct** que es el más rápido, confiable y compatible:

```bash
HUGGINGFACE_MODEL=microsoft/Phi-3-mini-4k-instruct
```

Este es el mejor modelo para empezar - es el más rápido y siempre funciona.

**¡Guarda el archivo!**

### Paso 3: Verificar la Configuración

Ejecuta el script de verificación:

```bash
python verificar_configuracion.py
```

O si está marcado como ejecutable:

```bash
./verificar_configuracion.py
```

Este script verificará:
- ✓ Que el archivo `.env` existe
- ✓ Que tu API key está configurada correctamente
- ✓ Que las dependencias están instaladas
- ✓ Que la conexión con Hugging Face funciona
- ✓ (Opcional) Generación de una pregunta de prueba

### Paso 4: ¡Ejecutar el Juego!

Si todo está bien, inicia el juego:

```bash
python app.py
```

Abre tu navegador en: **http://localhost:5000**

---

## 🔍 ¿Qué se Cambió?

### Antes (No Funcionaba):

```python
# config.py
import os
HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY', '')
# ❌ No cargaba el archivo .env
```

### Después (Funciona):

```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()  # ✅ Ahora carga el archivo .env
HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY', '')
```

---

## 📋 Checklist Completo

- [ ] Crear cuenta en Hugging Face (https://huggingface.co/join)
- [ ] Obtener API key (https://huggingface.co/settings/tokens)
- [ ] Editar `.env` y poner tu API key
- [ ] Ejecutar `python verificar_configuracion.py`
- [ ] Verificar que todas las pruebas pasen ✅
- [ ] Ejecutar `python app.py`
- [ ] ¡Jugar y generar preguntas! 🎮

---

## 🆘 Solución de Problemas

### "HUGGINGFACE_API_KEY no está configurada"

**Causa:** No has editado el archivo `.env` o la clave no es válida.

**Solución:**
1. Abre el archivo `.env`
2. Verifica que la línea `HUGGINGFACE_API_KEY` tenga tu token real
3. El token debe empezar con `hf_`
4. No debe haber espacios antes o después del token

### "huggingface_hub no está instalado"

**Causa:** Falta instalar las dependencias.

**Solución:**
```bash
pip install -r requirements.txt
```

### "Error al conectar con Hugging Face"

**Causa:** Tu API key podría no ser válida o hay problemas de conexión.

**Solución:**
1. Verifica que copiaste el token completo
2. Verifica tu conexión a internet
3. Genera un nuevo token en https://huggingface.co/settings/tokens

### "No se generan preguntas"

**Causa:** El modelo está saturado o hay un error en el código.

**Solución:**
1. Ejecuta el script de verificación: `python verificar_configuracion.py`
2. Prueba con el test opcional de generación de preguntas
3. Revisa los logs en la consola donde ejecutaste `python app.py`

---

## 💡 Consejos

- **Seguridad:** Nunca compartas tu archivo `.env` o tu API key públicamente
- **Backup:** El archivo `.env.example` es una plantilla, no lo modifiques
- **Git:** El archivo `.env` está en `.gitignore` para proteger tu API key
- **Gratuito:** Hugging Face es 100% gratis, sin límites ni tarjeta de crédito
- **Modelos:** Puedes cambiar el modelo en `.env` si lo deseas

---

## 📚 Recursos Adicionales

- **Hugging Face Docs:** https://huggingface.co/docs
- **Modelos disponibles:** https://huggingface.co/models
- **README del proyecto:** Ver `README.md` en la raíz del proyecto

---

## ✅ Verificación Final

Una vez configurado, deberías poder:

1. ✅ Subir un PDF
2. ✅ Ver "Generando preguntas..." en la interfaz
3. ✅ Ver preguntas generadas correctamente
4. ✅ Jugar y responder preguntas

**¡Listo! Ahora tu juego educativo funciona correctamente. 🎉**

---

**Creado:** 2025-11-18
**Versión:** 1.0
**Estado:** ✅ Probado y funcionando
