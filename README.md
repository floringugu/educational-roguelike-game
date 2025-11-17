**Transform your study sessions into epic roguelike adventures!**

An interactive, pixel-art styled roguelike game that gamifies learning by generating educational questions from your PDF study materials using GrokAI. Answer questions correctly to defeat enemies, progress through dungeons, and track your learning statistics.

---

## ✨ Features

### 🎯 Core Gameplay
- **Turn-based roguelike combat** - Answer questions to attack enemies
- **10 progressive encounters** per dungeon run
- **6 enemy types** with varying difficulty
- **Power-ups system** - Shields, health potions, damage boosts
- **Save/Load system** - Continue your adventure anytime
- **Death and victory** - Classic roguelike experience

### 🤖 AI-Powered Question Generation
- **Automatic question generation** using Claude API (Anthropic)
- **Multiple question types**:
  - Multiple choice (4 options)
  - True/False
- **Intelligent difficulty scaling** - Easy, Medium, Hard
- **Plausible distractors** - Tests real understanding
- **Detailed explanations** - Learn from mistakes
- **Topic categorization** - Organized by subject

### 📊 Learning Analytics
- **Comprehensive statistics** - Accuracy, time studied, score
- **Topic performance tracking** - Identify strengths and weaknesses
- **Weak area identification** - Focus your study efforts
- **Exportable reports** - JSON, CSV, and Markdown formats
- **Learning insights** - Personalized recommendations

### 🎨 Pixel Art Aesthetic
- **Retro pixel art design** - Press Start 2P font
- **Smooth animations** - Attack, damage, victory effects
- **Particle effects** - Visual feedback for actions
- **Responsive UI** - Works on desktop and mobile
- **Battle log** - Track your combat history

---

## 📋 Table of Contents

- [Installation](#-installation)
- [Configuration](#-configuration)
- [Quick Start](#-quick-start)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [API Costs](#-api-costs)
- [Customization](#-customization)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Installation

### Prerequisites

- **Python 3.10+**
- **Anthropic API Key** (Claude AI) - Get it from [console.anthropic.com](https://console.anthropic.com/)

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd educational-roguelike-game
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# .env file
ANTHROPIC_API_KEY=your_api_key_here
FLASK_DEBUG=True
SECRET_KEY=your_secret_key_here
```

**Important:** Never commit your `.env` file to version control!

---

## ⚙️ Configuration

### Environment Variables

All configuration is in `config.py`, but you can override with environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | *Required* | Your Claude API key |
| `FLASK_DEBUG` | `True` | Enable debug mode |
| `SECRET_KEY` | `dev-secret-key` | Flask session secret |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `5000` | Server port |

---

## 🎮 Quick Start

### 1. Start the Server

```bash
python app.py
```

The server will start at `http://localhost:5000`

### 2. Upload a PDF

1. Open `http://localhost:5000` in your browser
2. Click **"📤 Upload New PDF"**
3. Select a PDF file (text-based, max 16MB)
4. Click **"🚀 Upload & Process"**

### 3. Generate Questions

After uploading:

1. Click **"🤖 Generate Questions"**
2. Wait for AI to generate ~30 questions
3. Review cost estimate (usually $0.01-0.05)
4. Questions are saved to database

### 4. Play the Game

1. Click **"⚔️ Play"** on your PDF
2. Click **"⚔️ Start New Game"**
3. Answer questions to attack enemies
4. Wrong answers = you take damage
5. Survive 10 encounters to win!

### 5. Track Your Progress

- Click **"📊 Stats"** to view learning analytics
- Export statistics as JSON, CSV, or Markdown
- Identify weak areas and focus your study

---

## 📖 Usage Guide

### PDF Upload Best Practices

✅ **Good PDFs:**
- Text-based documents (not scanned images)
- Clear structure with sections/chapters
- Educational content (textbooks, notes, guides)
- 5-200 pages (optimal)

❌ **Avoid:**
- Scanned images without OCR
- Password-protected PDFs
- Poorly formatted documents
- Files over 16MB

### Game Mechanics

#### Combat System
- **Correct answer** → Deal 20 damage to enemy
- **Incorrect answer** → Take damage from enemy (10-30 HP)
- **Enemy defeated** → Gain score, possible power-up, next encounter
- **Player dies** → Game over, stats saved

#### Power-Ups
- 💚 **Health Potion** - Restore 30 HP
- 🛡️ **Shield** - Absorb 20 damage
- ⚔️ **Double Damage** - 2x attack power
- 💰 **Lucky Coin** - 1.5x score multiplier

#### Progression
- 10 encounters per run
- Difficulty scales automatically
- Enemies get stronger each level
- Question difficulty matches enemy tier

---

## 📁 Project Structure

```
opscraft-platform/
├── app.py                 # Flask server & API routes
├── config.py             # Game configuration
├── database.py           # SQLite database models
├── game_engine.py        # Roguelike game logic
├── pdf_processor.py      # PDF text extraction
├── question_generator.py # Claude AI integration
├── stats_exporter.py     # Statistics export
├── requirements.txt      # Python dependencies
├── README.md            # This file
│
├── data/                # Data storage
│   ├── pdfs/           # Uploaded PDFs
│   ├── exports/        # Exported statistics
│   └── questions.db    # SQLite database
│
├── static/             # Frontend assets
│   ├── css/
│   │   └── pixel-style.css    # Pixel art styling
│   └── js/
│       ├── game.js            # Game frontend logic
│       ├── animations.js      # Visual effects
│       └── stats.js           # Statistics visualization
│
└── templates/          # HTML templates
    ├── index.html      # Home page
    ├── game.html       # Game interface
    ├── upload.html     # PDF upload
    ├── stats.html      # Statistics dashboard
    └── saves.html      # Saved games
```

---

## 💰 API Costs

### Claude API Pricing (as of 2025)

- **Input tokens:** $3.00 / 1M tokens
- **Output tokens:** $15.00 / 1M tokens

### Estimated Costs Per PDF

| PDF Size | Questions | Est. Cost |
|----------|-----------|-----------|
| 10 pages | 10-15 | $0.01-0.02 |
| 50 pages | 30-40 | $0.03-0.05 |
| 100 pages | 50-70 | $0.05-0.10 |
| 200 pages | 80-100 | $0.10-0.20 |

**Cost Optimization:**
- Questions are generated once and cached
- Batch processing reduces API calls
- Estimate cost before generating

---

## 🎨 Customization

### Modify Enemy Types

Edit `config.py`:

```python
ENEMY_TYPES = {
    'my_enemy': {
        'name': 'My Enemy',
        'emoji': '👾',
        'hp': 60,
        'damage': 18,
        'score': 250,
        'difficulty': 3
    }
}
```

### Change Color Scheme

Edit `static/css/pixel-style.css`:

```css
:root {
    --color-primary: #00ff00;
    --color-secondary: #ff00ff;
    --color-accent: #00ffff;
}
```

### Adjust Game Difficulty

Edit `config.py`:

```python
PLAYER_MAX_HP = 150          # More HP = easier
PLAYER_BASE_DAMAGE = 30      # More damage = easier
DIFFICULTY_SCALING = 1.1     # Lower = easier
TOTAL_ENCOUNTERS = 15        # More encounters = longer
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **"ANTHROPIC_API_KEY not found"**

```bash
# Create .env file
echo "ANTHROPIC_API_KEY=your_key_here" > .env
```

#### 2. **"PDF has no extractable text"**

Use text-based PDFs, not scanned images.

#### 3. **"Failed to generate questions"**

Check API key validity and credits.

#### 4. **Port 5000 already in use**

```bash
export PORT=8000
python app.py
```

---

## 📜 License

This project is licensed under the MIT License.

---

**Happy Learning! May your studies be epic! 🎮📚**
