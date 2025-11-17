"""
Configuration file for Educational Roguelike Game
Contains game constants, API settings, and game balance parameters
"""

import os
from pathlib import Path

# ═══════════════════════════════════════════════════════════════════
# 🔑 API CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

# Grok API Configuration (xAI) - FREE TIER AVAILABLE!
XAI_API_KEY = os.environ.get('XAI_API_KEY', '')
GROK_MODEL = 'grok-beta'  # or 'grok-2-latest' for more advanced
MAX_TOKENS = 4096
TEMPERATURE = 0.7

# Legacy Claude support (optional - can still use Claude if preferred)
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')
CLAUDE_MODEL = 'claude-sonnet-4-20250514'

# ═══════════════════════════════════════════════════════════════════
# 📁 PATHS
# ═══════════════════════════════════════════════════════════════════

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
PDF_DIR = DATA_DIR / 'pdfs'
EXPORT_DIR = DATA_DIR / 'exports'
DATABASE_PATH = DATA_DIR / 'questions.db'

# Create directories if they don't exist
for directory in [DATA_DIR, PDF_DIR, EXPORT_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# ═══════════════════════════════════════════════════════════════════
# 🎮 GAME CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

# Player Stats
PLAYER_MAX_HP = 100
PLAYER_BASE_DAMAGE = 20
PLAYER_STARTING_LEVEL = 1

# Game Progression
TOTAL_ENCOUNTERS = 10
DIFFICULTY_SCALING = 1.2  # Multiplier per level

# Power-ups
POWERUPS = {
    'health_potion': {
        'name': '💚 Health Potion',
        'effect': 'heal',
        'value': 30,
        'chance': 0.3
    },
    'shield': {
        'name': '🛡️ Shield',
        'effect': 'shield',
        'value': 20,
        'chance': 0.25
    },
    'double_damage': {
        'name': '⚔️ Double Damage',
        'effect': 'damage_boost',
        'value': 2,
        'chance': 0.2
    },
    'lucky_coin': {
        'name': '💰 Lucky Coin',
        'effect': 'score_boost',
        'value': 1.5,
        'chance': 0.25
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
        'difficulty': 1
    },
    'skeleton': {
        'name': 'Skeleton',
        'emoji': '💀',
        'hp': 50,
        'damage': 15,
        'score': 200,
        'difficulty': 2
    },
    'ghost': {
        'name': 'Ghost',
        'emoji': '👻',
        'hp': 40,
        'damage': 20,
        'score': 250,
        'difficulty': 2
    },
    'zombie': {
        'name': 'Zombie',
        'emoji': '🧟',
        'hp': 70,
        'damage': 18,
        'score': 300,
        'difficulty': 3
    },
    'demon': {
        'name': 'Demon',
        'emoji': '👹',
        'hp': 90,
        'damage': 25,
        'score': 400,
        'difficulty': 4
    },
    'dragon': {
        'name': 'Dragon',
        'emoji': '🐉',
        'hp': 120,
        'damage': 30,
        'score': 500,
        'difficulty': 5
    }
}

# ═══════════════════════════════════════════════════════════════════
# ❓ QUESTION GENERATION CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

# Question Types
QUESTION_TYPES = ['multiple_choice', 'true_false']

# Question Difficulty Levels
DIFFICULTY_LEVELS = ['easy', 'medium', 'hard']

# Number of questions to generate per batch
QUESTIONS_PER_BATCH = 30

# Minimum questions before starting game
MIN_QUESTIONS_TO_START = 10

# Question repeat prevention (how many questions before repeating)
QUESTION_BUFFER = 20

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

# Spaced repetition settings
SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30]  # Days
MINIMUM_CORRECT_STREAK = 3

# ═══════════════════════════════════════════════════════════════════
# 🔧 FLASK CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
HOST = os.environ.get('HOST', '0.0.0.0')
PORT = int(os.environ.get('PORT', 5000))

# Upload settings
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'pdf'}

# ═══════════════════════════════════════════════════════════════════
# 💰 COST ESTIMATION
# ═══════════════════════════════════════════════════════════════════

# Approximate Claude API costs (update based on current pricing)
COST_PER_1M_INPUT_TOKENS = 3.00  # USD
COST_PER_1M_OUTPUT_TOKENS = 15.00  # USD

# Average tokens per question generation
AVG_INPUT_TOKENS_PER_QUESTION = 1000
AVG_OUTPUT_TOKENS_PER_QUESTION = 300
