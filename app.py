"""
Flask Application for Educational Roguelike Game - Anki System
Main server with routes for Anki CSV upload, game, and statistics
"""

from flask import Flask, render_template, request, jsonify, send_file, session
from werkzeug.utils import secure_filename
import logging
from pathlib import Path
import os

import config
from database import deck_manager, card_db_manager, save_manager, stats_manager, review_state_manager
from anki_csv_parser import AnkiCSVParser
from game_engine import GameEngine

# ═══════════════════════════════════════════════════════════════════
# 🚀 FLASK APP INITIALIZATION
# ═══════════════════════════════════════════════════════════════════

app = Flask(__name__)
app.secret_key = config.SECRET_KEY
app.config['MAX_CONTENT_LENGTH'] = config.MAX_CONTENT_LENGTH

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Store active game sessions (in-memory)
# In production, use Redis or database
game_sessions = {}


# ═══════════════════════════════════════════════════════════════════
# 🔧 HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in config.ALLOWED_EXTENSIONS


def save_uploaded_file(file):
    """Save uploaded CSV file to disk"""
    filename = secure_filename(file.filename)
    filepath = config.CSV_DIR / filename

    # Handle duplicates
    counter = 1
    base_name = filepath.stem
    while filepath.exists():
        filepath = config.CSV_DIR / f"{base_name}_{counter}.csv"
        counter += 1

    file.save(str(filepath))
    return filepath


# ═══════════════════════════════════════════════════════════════════
# 🏠 PAGE ROUTES
# ═══════════════════════════════════════════════════════════════════

@app.route('/')
def index():
    """Home page - show available Anki decks"""
    decks = deck_manager.get_all_decks()

    # Enrich with card counts
    for deck in decks:
        card_count = card_db_manager.get_card_count(deck['id'])
        deck['card_count'] = card_count
        deck['ready_to_play'] = card_count > 0

    return render_template('index.html', decks=decks)


@app.route('/upload')
def upload_page():
    """CSV upload page"""
    return render_template('upload.html')


@app.route('/game/<int:deck_id>')
def game_page(deck_id):
    """Game page for a specific deck"""
    deck_info = deck_manager.get_deck(deck_id)

    if not deck_info:
        return "Deck not found", 404

    card_count = card_db_manager.get_card_count(deck_id)

    return render_template(
        'game.html',
        deck=deck_info,
        ready=card_count > 0,
        card_count=card_count
    )


@app.route('/stats/<int:deck_id>')
def stats_page(deck_id):
    """Statistics page for a specific deck"""
    deck_info = deck_manager.get_deck(deck_id)

    if not deck_info:
        return "Deck not found", 404

    # Get overall stats
    overall = stats_manager.get_overall_stats(deck_id)
    progress = stats_manager.get_deck_progress(deck_id)

    return render_template(
        'stats.html',
        deck=deck_info,
        overall=overall,
        progress=progress
    )


@app.route('/saves/<int:deck_id>')
def saves_page(deck_id):
    """Saved games page"""
    deck_info = deck_manager.get_deck(deck_id)

    if not deck_info:
        return "Deck not found", 404

    saves = save_manager.get_saves_for_deck(deck_id)

    return render_template('saves.html', deck=deck_info, saves=saves)


# ═══════════════════════════════════════════════════════════════════
# 📤 CSV UPLOAD & PROCESSING API
# ═══════════════════════════════════════════════════════════════════

@app.route('/api/upload', methods=['POST'])
def upload_csv():
    """Upload and process an Anki CSV file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'Only CSV files are allowed'}), 400

        # Read file content
        file_content = file.read()

        # Parse CSV
        parser = AnkiCSVParser()

        # Validate first
        is_valid, validation_msg = parser.validate_file_content(file_content)
        if not is_valid:
            return jsonify({'error': validation_msg}), 400

        # Parse cards
        success, parse_msg = parser.parse_file(file_content)
        if not success:
            return jsonify({'error': parse_msg}), 400

        # Save file
        file.seek(0)  # Reset file pointer
        filepath = save_uploaded_file(file)

        # Get deck name from filename
        deck_name = filepath.stem

        # Get stats
        stats = parser.get_stats()

        # Create deck in database
        deck_id = deck_manager.add_deck(
            deck_name=deck_name,
            filename=filepath.name,
            filepath=str(filepath),
            total_cards=stats['total_cards'],
            tags=stats['unique_tags']
        )

        # Add cards to database
        cards_data = []
        for card in parser.get_cards():
            cards_data.append({
                'deck_id': deck_id,
                'front': card.front,
                'back': card.back,
                'tags': card.tags,
                'note_type': card.note_type
            })

        cards_saved = card_db_manager.add_cards_batch(cards_data)

        logger.info(f"Deck {deck_id} created with {cards_saved} cards")

        return jsonify({
            'success': True,
            'deck_id': deck_id,
            'deck_name': deck_name,
            'cards_imported': cards_saved,
            'total_tags': stats['total_tags'],
            'message': parse_msg
        })

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
# 🎮 GAME API
# ═══════════════════════════════════════════════════════════════════

@app.route('/api/game/new/<int:deck_id>', methods=['POST'])
def new_game(deck_id):
    """Start a new game with an Anki deck"""
    try:
        # Check if deck has cards
        card_count = card_db_manager.get_card_count(deck_id)
        if card_count == 0:
            return jsonify({'error': 'Deck has no cards'}), 400

        # Create game engine
        game = GameEngine(deck_id)
        state = game.new_game()

        # Store in session
        session_key = f"game_{deck_id}_{session.get('user_id', 'default')}"
        game_sessions[session_key] = game

        # Get first card data
        card_data = {
            'card': {
                'id': state.current_card['id'],
                'front': state.current_card['front'],
                'tags': state.current_card.get('tags', [])
            },
            'revealed': False
        }

        return jsonify({
            'success': True,
            'state': state.to_dict(),
            'card': card_data,
            'message': 'New game started!'
        })

    except Exception as e:
        logger.error(f"New game error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/game/status/<int:deck_id>', methods=['GET'])
def game_status(deck_id):
    """Get current game status"""
    try:
        session_key = f"game_{deck_id}_{session.get('user_id', 'default')}"

        if session_key not in game_sessions:
            return jsonify({'active': False})

        game = game_sessions[session_key]
        state = game.get_state()

        if not state:
            return jsonify({'active': False})

        response_data = {
            'active': True,
            'state': state.to_dict(),
            'deck_stats': game.get_deck_stats(),
            'progress': game.get_progress()
        }

        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Game status error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/game/reveal/<int:deck_id>', methods=['POST'])
def reveal_card(deck_id):
    """Reveal the answer of the current card"""
    try:
        session_key = f"game_{deck_id}_{session.get('user_id', 'default')}"

        if session_key not in game_sessions:
            return jsonify({'error': 'No active game'}), 400

        game = game_sessions[session_key]
        result = game.reveal_card()

        if not result['success']:
            return jsonify(result), 400

        return jsonify(result)

    except Exception as e:
        logger.error(f"Reveal card error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/game/answer/<int:deck_id>', methods=['POST'])
def answer_card(deck_id):
    """Submit user's self-assessment (again/hard/good/easy)"""
    try:
        session_key = f"game_{deck_id}_{session.get('user_id', 'default')}"

        if session_key not in game_sessions:
            return jsonify({'error': 'No active game'}), 400

        data = request.get_json()
        response = data.get('response')  # 'again', 'hard', 'good', 'easy'

        if not response:
            return jsonify({'error': 'Missing response'}), 400

        if response not in ['again', 'hard', 'good', 'easy']:
            return jsonify({'error': 'Invalid response. Must be: again, hard, good, or easy'}), 400

        # Process answer
        game = game_sessions[session_key]
        result = game.answer_card(response)

        if not result['success']:
            return jsonify(result), 400

        # Debug logging
        logger.info(f"Answer processed: game_won={result.get('game_won')}, player_defeated={result.get('player_defeated')}")

        # Add next card data if game continues
        state = game.get_state()
        if state and state.current_card and not result.get('game_won') and not result.get('player_defeated'):
            result['next_card'] = {
                'id': state.current_card['id'],
                'front': state.current_card['front'],
                'tags': state.current_card.get('tags', [])
            }

        # Add updated state
        result['state'] = state.to_dict() if state else None

        logger.info(f"Returning response with game_won={result.get('game_won')}, has_next_card={'next_card' in result}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Answer card error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/game/use-powerup/<int:deck_id>', methods=['POST'])
def use_powerup(deck_id):
    """Use a powerup from inventory"""
    try:
        session_key = f"game_{deck_id}_{session.get('user_id', 'default')}"

        if session_key not in game_sessions:
            return jsonify({'error': 'No active game'}), 400

        data = request.get_json()
        powerup_id = data.get('powerup_id')

        if not powerup_id:
            return jsonify({'error': 'Missing powerup_id'}), 400

        game = game_sessions[session_key]
        result = game.use_powerup(powerup_id)

        if not result['success']:
            return jsonify(result), 400

        # Añadir estado actualizado del juego
        state = game.get_state()
        result['state'] = state.to_dict() if state else None

        return jsonify(result)

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Use powerup error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/game/save/<int:deck_id>', methods=['POST'])
def save_game(deck_id):
    """Save current game"""
    try:
        session_key = f"game_{deck_id}_{session.get('user_id', 'default')}"

        if session_key not in game_sessions:
            return jsonify({'error': 'No active game'}), 400

        data = request.get_json() or {}
        save_name = data.get('save_name', f"Save {session.get('user_id', 'default')}")

        game = game_sessions[session_key]
        save_id = game.save_game(save_name)

        return jsonify({
            'success': True,
            'save_id': save_id,
            'message': 'Game saved successfully'
        })

    except Exception as e:
        logger.error(f"Save game error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/game/load/<int:save_id>', methods=['POST'])
def load_game(save_id):
    """Load a saved game"""
    try:
        save_data = save_manager.get_save(save_id)
        if not save_data:
            return jsonify({'error': 'Save not found'}), 404

        deck_id = save_data['deck_id']

        # Create game engine and load
        game = GameEngine(deck_id)
        state = game.load_game(save_id)

        if not state:
            return jsonify({'error': 'Failed to load game'}), 500

        # Store in session
        session_key = f"game_{deck_id}_{session.get('user_id', 'default')}"
        game_sessions[session_key] = game

        return jsonify({
            'success': True,
            'deck_id': deck_id,
            'state': state.to_dict(),
            'message': 'Game loaded successfully'
        })

    except Exception as e:
        logger.error(f"Load game error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
# 📊 STATISTICS API
# ═══════════════════════════════════════════════════════════════════

@app.route('/api/stats/<int:deck_id>', methods=['GET'])
def get_stats(deck_id):
    """Get statistics for a deck"""
    try:
        overall = stats_manager.get_overall_stats(deck_id)
        progress = stats_manager.get_deck_progress(deck_id)

        # Get weak cards that need practice
        weak_cards = review_state_manager.get_weak_cards(deck_id, limit=10)

        # Enrich with card data
        for weak_card in weak_cards:
            card = card_db_manager.get_card(weak_card['card_id'])
            if card:
                weak_card['front'] = card['front']
                weak_card['tags'] = card.get('tags', [])

        return jsonify({
            'overall': overall,
            'progress': progress,
            'weak_cards': weak_cards
        })

    except Exception as e:
        logger.error(f"Get stats error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
# 🔧 UTILITY ROUTES
# ═══════════════════════════════════════════════════════════════════

@app.route('/api/decks', methods=['GET'])
def get_decks():
    """Get list of all decks"""
    try:
        decks = deck_manager.get_all_decks()

        # Enrich with card counts
        for deck in decks:
            card_count = card_db_manager.get_card_count(deck['id'])
            deck['card_count'] = card_count
            deck['ready_to_play'] = card_count > 0

        return jsonify(decks)

    except Exception as e:
        logger.error(f"Get decks error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/config', methods=['GET'])
def get_config():
    """Get game configuration for frontend"""
    return jsonify({
        'enemy_types': config.ENEMY_TYPES,
        'boss_types': config.BOSS_TYPES,
        'powerups': config.POWERUPS,
        'total_encounters': config.TOTAL_ENCOUNTERS,
        'player_max_hp': config.PLAYER_MAX_HP,
        'player_base_damage': config.PLAYER_BASE_DAMAGE,
        'animation_durations': config.ANIMATION_DURATIONS,
        'colors': config.COLORS
    })


@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({'error': 'File too large. Maximum size is 10MB.'}), 413


@app.errorhandler(500)
def internal_error(e):
    """Handle internal server error"""
    logger.error(f"Internal error: {str(e)}")
    return jsonify({'error': 'Internal server error'}), 500


# ═══════════════════════════════════════════════════════════════════
# 🚀 RUN APPLICATION
# ═══════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    logger.info("Starting Educational Roguelike Game Server - Anki System")
    logger.info(f"Server running on {config.HOST}:{config.PORT}")
    logger.info("Upload Anki CSV files to start learning!")

    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG
    )
