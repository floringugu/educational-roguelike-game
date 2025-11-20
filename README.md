# 🎮 Educational Roguelike - Anki Flashcard System

> **¡Aprende mientras juegas!** Un juego roguelike que utiliza tarjetas Anki para crear una experiencia de aprendizaje activa y divertida mediante repetición espaciada.

---

## 🌟 ¿Qué es este proyecto?

Este es un **juego educativo tipo roguelike** que combina:
- 🃏 **Tarjetas Anki** (formato CSV) para el contenido de aprendizaje
- 🧠 **Repetición espaciada** (algoritmo SM-2 simplificado)
- ⚔️ **Combate roguelike** donde tus respuestas determinan el daño
- 📊 **Tracking de progreso** para optimizar tu aprendizaje

---

## 🚀 Quick Start

### 1. Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/floringugu/educational-roguelike-game.git
cd educational-roguelike-game

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 3. Instalar dependencias (¡solo Flask!)
pip install -r requirements.txt

# 4. Ejecutar aplicación
python app.py
```

### 2. Acceder al juego
Abre tu navegador en: `http://localhost:5000`

---

## 🎯 Cómo funciona

### Paso 1: Importar tu mazo de Anki

Exporta tus tarjetas desde Anki en formato CSV:
```csv
Front,Back,Tags
¿Qué es Python?,Un lenguaje de programación,programación python
¿Qué significa HTML?,HyperText Markup Language,web html
¿Capital de Francia?,París,geografía europa
```

**Formatos soportados:**
- `Front,Back` (básico)
- `Front,Back,Tags` (recomendado)
- `Front,Back,Tags,NoteType` (completo)

### Paso 2: Jugar y aprender

**Mecánica del juego:**
1. **Aparece un enemigo** con HP y daño
2. **Se muestra una tarjeta** (Front/pregunta)
3. **Piensas la respuesta** mentalmente
4. **Presionas "Revelar"** para ver el Back/respuesta
5. **Evalúas tu conocimiento** con 4 opciones:

#### 🎮 Sistema de 4 Opciones (estilo Anki)

| Opción | Significado | Daño al enemigo | Efecto en aprendizaje |
|--------|-------------|-----------------|----------------------|
| **🔴 AGAIN** | No recordé | **0 HP** | Enemigo te ataca. Tarjeta marcada para revisión inmediata |
| **🟡 HARD** | Recordé con dificultad | **30% daño** | Daño mínimo. Tarjeta se revisa pronto |
| **🟢 GOOD** | Recordé correctamente | **100% daño** | Daño normal. Tarjeta sigue intervalo estándar |
| **🔵 EASY** | Recordé fácilmente | **200% daño** | ¡Daño crítico! Tarjeta se revisa en mucho tiempo |

### Paso 3: Progresión

- **Derrota enemigos** respondiendo correctamente
- **Gana powerups** (pociones, escudos, multiplicadores)
- **Completa 10 encuentros** para ganar el juego
- **Enfrenta un boss final** en el último encuentro

---

## 🧠 Repetición Espaciada

El juego utiliza un **algoritmo SM-2 simplificado** (el mismo de Anki) para:
- 📅 Determinar cuándo revisar cada tarjeta
- 🎯 Priorizar tarjetas difíciles
- 📈 Aumentar intervalos para tarjetas fáciles
- 💾 Guardar tu progreso de aprendizaje

**Estadísticas trackeadas:**
- Precisión por tarjeta
- Total de revisiones
- Tarjetas dominadas (>80% precisión)
- Tiempo de estudio
- Tarjetas nuevas vs. revisiones

---

## 📁 Estructura del Proyecto

```
educational-roguelike-game/
├── 🃏 Sistema Anki
│   ├── anki_csv_parser.py         # Parser de CSVs de Anki
│   ├── spaced_repetition.py       # Algoritmo SM-2
│   └── card_manager.py            # Gestión de tarjetas
│
├── 🎮 Motor del Juego
│   ├── game_engine.py             # Lógica de combate
│   ├── database.py                # Persistencia (SQLite)
│   └── config.py                  # Configuración
│
├── 🌐 Web App
│   ├── app.py                     # Servidor Flask
│   ├── templates/                 # HTML (Jinja2)
│   └── static/                    # CSS + JavaScript
│
└── 📦 Configuración
    ├── requirements.txt           # Dependencias
    └── README.md                  # Este archivo
```

---

## 🎨 Características

### ✅ Sistema de tarjetas Anki
- Importación de CSVs exportados desde Anki
- Soporte de tags para categorización
- Validación automática de formato

### ✅ Repetición espaciada
- Algoritmo SM-2 (base de Anki)
- Priorización inteligente de tarjetas
- Intervalos adaptativos según rendimiento

### ✅ Combate roguelike
- 6 tipos de enemigos normales
- 4 tipos de bosses épicos
- Sistema de powerups estratégico
- Escalado de dificultad progresivo

### ✅ Estadísticas detalladas
- Precisión por tarjeta y global
- Tarjetas difíciles identificadas
- Progreso de aprendizaje visualizado
- Exportación de datos

### ✅ UI retro pixel-art
- Diseño nostálgico de 8-bits
- Animaciones suaves
- Responsive design

---

## 🔧 Tecnologías

**Backend:**
- Python 3.8+
- Flask (web framework)
- SQLite (base de datos)

**Frontend:**
- HTML5 + CSS3
- JavaScript vanilla
- Pixel-art styling

**Sin dependencias pesadas:**
- ❌ No OCR
- ❌ No APIs de IA
- ❌ No procesamiento de PDFs
- ✅ Solo Flask y módulos estándar de Python

---

## 📊 Base de Datos

**Tablas:**
- `anki_decks` - Mazos importados
- `anki_cards` - Tarjetas individuales
- `card_review_states` - Estado de repetición espaciada
- `card_reviews` - Historial de revisiones
- `game_saves` - Partidas guardadas
- `statistics` - Sesiones de juego

---

## 🚧 Estado del Proyecto

**✅ Completado:**
- [x] Sistema de importación de CSV Anki
- [x] Algoritmo de repetición espaciada
- [x] Gestor de estado de tarjetas
- [x] Motor de combate adaptado
- [x] Base de datos actualizada
- [x] Configuración simplificada
- [x] Eliminación de dependencias OCR/IA

**🚧 En Progreso (WIP):**
- [ ] Actualización de app.py con rutas para CSV
- [ ] Templates HTML para sistema Anki
- [ ] JavaScript para botón "Revelar" y 4 opciones
- [ ] Testing completo del flujo

---

## 🎓 Casos de Uso

**Perfecto para:**
- 📚 Estudiantes que usan Anki y quieren gamificar su estudio
- 🌍 Aprendizaje de idiomas con flashcards
- 🧪 Memorización de conceptos (ciencia, historia, etc.)
- 💻 Repaso de términos técnicos (programación, medicina, etc.)

---

## 🤝 Contribuciones

Este proyecto es de código abierto. Las contribuciones son bienvenidas:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push y crea un Pull Request

---

## 📝 Licencia

MIT License - Ver archivo LICENSE para detalles

---

## 🙏 Créditos

**Inspirado por:**
- [Anki](https://apps.ankiweb.net/) - Sistema de repetición espaciada
- [SuperMemo](https://www.supermemo.com/) - Algoritmo SM-2
- Juegos roguelike clásicos (Rogue, NetHack, etc.)

**Desarrollado por:** @floringugu

---

## 📞 Soporte

- 🐛 **Issues:** [GitHub Issues](https://github.com/floringugu/educational-roguelike-game/issues)
- 📧 **Email:** (floringugu4@gmail.com)

---

<div align="center">

**¡Aprende, juega, mejora!** 🎮🧠

</div>
