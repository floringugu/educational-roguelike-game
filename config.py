"""
Configuration file for Educational Roguelike Game - Anki System
Contains game constants and game balance parameters
"""

import os
from pathlib import Path

# ═══════════════════════════════════════════════════════════════════
# 📁 PATHS
# ═══════════════════════════════════════════════════════════════════

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
CSV_DIR = DATA_DIR / 'anki_decks'  # Directorio para CSVs de Anki
EXPORT_DIR = DATA_DIR / 'exports'
DATABASE_PATH = DATA_DIR / 'anki_game.db'

# Create directories if they don't exist
for directory in [DATA_DIR, CSV_DIR, EXPORT_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# ═══════════════════════════════════════════════════════════════════
# 🃏 ANKI CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

# Upload settings para CSVs
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB max file size
ALLOWED_EXTENSIONS = {'csv'}

# Repetición espaciada
NEW_CARDS_PER_SESSION = 20  # Máximo de tarjetas nuevas por sesión
REVIEW_AHEAD_MINUTES = 20  # Minutos adelante para considerar revisiones

# ═══════════════════════════════════════════════════════════════════
# 🎮 GAME CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

# Player Stats
PLAYER_MAX_HP = 100
PLAYER_BASE_DAMAGE = 20  # Daño base (usado con Good)
PLAYER_STARTING_LEVEL = 1

# Damage multipliers para las 4 opciones Anki
# AGAIN: 0 daño (0%)
# HARD: 30% del daño base
# GOOD: 100% del daño base
# EASY: 200% del daño base (crítico)

# Game Progression
TOTAL_ENCOUNTERS = 10
DIFFICULTY_SCALE_FACTOR = 0.2  # 20% más difícil por encuentro

# Power-ups (se aplican automáticamente al obtenerlos)
POWERUPS = {
    'health_potion': {
        'name': '💚 Health Potion',
        'emoji': '💚',
        'effect': {'heal': 30},
        'drop_chance': 50.0,
        'auto_use': True
    },
    'mega_potion': {
        'name': '💗 Mega Potion',
        'emoji': '💗',
        'effect': {'heal': 50},
        'drop_chance': 25.0,
        'auto_use': True
    },
    'shield': {
        'name': '🛡️ Shield',
        'emoji': '🛡️',
        'effect': {'shield': 20},
        'drop_chance': 45.0,
        'auto_use': True
    },
    'iron_shield': {
        'name': '🔰 Iron Shield',
        'emoji': '🔰',
        'effect': {'shield': 35},
        'drop_chance': 30.0,
        'auto_use': True
    },
    'double_damage': {
        'name': '⚔️ Double Damage',
        'emoji': '⚔️',
        'effect': {'damage_boost': 2.0, 'duration': 3},
        'drop_chance': 40.0,
        'auto_use': True
    },
    'triple_damage': {
        'name': '🗡️ Triple Damage',
        'emoji': '🗡️',
        'effect': {'damage_boost': 3.0, 'duration': 2},
        'drop_chance': 20.0,
        'auto_use': True
    },
    'lucky_coin': {
        'name': '💰 Lucky Coin',
        'emoji': '💰',
        'effect': {'score_boost': 1.5, 'duration': 3},
        'drop_chance': 40.0,
        'auto_use': True
    },
    'golden_coin': {
        'name': '🪙 Golden Coin',
        'emoji': '🪙',
        'effect': {'score_boost': 2.0, 'duration': 3},
        'drop_chance': 25.0,
        'auto_use': True
    },
    'energy_drink': {
        'name': '🧃 Energy Drink',
        'emoji': '🧃',
        'effect': {'heal': 20, 'shield': 10},
        'drop_chance': 35.0,
        'auto_use': True
    },
    'max_restore': {
        'name': '✨ Max Restore',
        'emoji': '✨',
        'effect': {'heal': 999},
        'drop_chance': 15.0,
        'auto_use': True
    }
}

# ═══════════════════════════════════════════════════════════════════
# 👹 ENEMY CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

ENEMY_TYPES = {
    'slime': {
        'name': 'Slime',
        'emoji': '🟢',
        'hp': 30,
        'damage': 10,
        'score': 100,
        'difficulty': 1,
        'is_boss': False
    },
    'skeleton': {
        'name': 'Skeleton',
        'emoji': '💀',
        'hp': 50,
        'damage': 15,
        'score': 200,
        'difficulty': 2,
        'is_boss': False
    },
    'ghost': {
        'name': 'Ghost',
        'emoji': '👻',
        'hp': 40,
        'damage': 20,
        'score': 250,
        'difficulty': 2,
        'is_boss': False
    },
    'zombie': {
        'name': 'Zombie',
        'emoji': '🧟',
        'hp': 70,
        'damage': 18,
        'score': 300,
        'difficulty': 3,
        'is_boss': False
    },
    'demon': {
        'name': 'Demon',
        'emoji': '👹',
        'hp': 90,
        'damage': 25,
        'score': 400,
        'difficulty': 4,
        'is_boss': False
    },
    'dragon': {
        'name': 'Dragon',
        'emoji': '🐉',
        'hp': 120,
        'damage': 30,
        'score': 500,
        'difficulty': 5,
        'is_boss': False
    }
}

# Boss enemies - appear at the end of runs
BOSS_TYPES = {
    'lich_king': {
        'name': 'Lich King',
        'emoji': '👑💀',
        'hp': 200,
        'damage': 35,
        'score': 1000,
        'difficulty': 6,
        'is_boss': True
    },
    'ancient_dragon': {
        'name': 'Ancient Dragon',
        'emoji': '🐲',
        'hp': 250,
        'damage': 40,
        'score': 1200,
        'difficulty': 6,
        'is_boss': True
    },
    'demon_lord': {
        'name': 'Demon Lord',
        'emoji': '😈',
        'hp': 220,
        'damage': 38,
        'score': 1100,
        'difficulty': 6,
        'is_boss': True
    },
    'void_beast': {
        'name': 'Void Beast',
        'emoji': '🌑',
        'hp': 240,
        'damage': 42,
        'score': 1300,
        'difficulty': 6,
        'is_boss': True
    }
}

# ═══════════════════════════════════════════════════════════════════
# 🎨 UI CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

# Animation durations (milliseconds)
ANIMATION_DURATIONS = {
    'attack': 600,
    'damage': 400,
    'heal': 500,
    'enemy_idle': 2000,
    'victory': 1000,
    'defeat': 1200
}

# Color Palette (Retro Pixel Art)
COLORS = {
    'primary': '#00ff00',      # Green
    'secondary': '#ff00ff',    # Magenta
    'accent': '#00ffff',       # Cyan
    'warning': '#ffff00',      # Yellow
    'danger': '#ff0000',       # Red
    'background': '#1a1a2e',   # Dark blue
    'text': '#ffffff',         # White
    'border': '#00ff00'        # Green
}

# ═══════════════════════════════════════════════════════════════════
# 📊 STATISTICS CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

# Stats tracking
TRACK_STATS = True
EXPORT_FORMATS = ['json', 'csv', 'markdown']

# ═══════════════════════════════════════════════════════════════════
# 🔧 FLASK CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
HOST = os.environ.get('HOST', '0.0.0.0')
PORT = int(os.environ.get('PORT', 5000))
