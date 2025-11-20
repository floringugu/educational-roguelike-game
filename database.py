"""
Database models and operations for Educational Roguelike Game - Anki System
Uses SQLite for storing Anki decks, cards, review states, and game progress
"""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from contextlib import contextmanager
import config


class Database:
    """Main database class handling all SQLite operations"""

    def __init__(self, db_path: str = None):
        self.db_path = db_path or str(config.DATABASE_PATH)
        self.init_database()

    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def init_database(self):
        """Initialize database tables for Anki system"""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # ═══════════════════════════════════════════════════════
            # 📚 Anki Decks Table (reemplaza pdfs)
            # ═══════════════════════════════════════════════════════
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS anki_decks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    deck_name TEXT NOT NULL,
                    filename TEXT NOT NULL,
                    filepath TEXT NOT NULL UNIQUE,
                    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    total_cards INTEGER DEFAULT 0,
                    description TEXT,
                    tags TEXT
                )
            ''')

            # ═══════════════════════════════════════════════════════
            # 🃏 Anki Cards Table (reemplaza questions)
            # ═══════════════════════════════════════════════════════
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS anki_cards (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    deck_id INTEGER NOT NULL,
                    front TEXT NOT NULL,
                    back TEXT NOT NULL,
                    tags TEXT,
                    note_type TEXT DEFAULT 'Basic',
                    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (deck_id) REFERENCES anki_decks(id) ON DELETE CASCADE
                )
            ''')

            # ═══════════════════════════════════════════════════════
            # 🧠 Card Review States Table (estados de repetición espaciada)
            # ═══════════════════════════════════════════════════════
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS card_review_states (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    card_id INTEGER NOT NULL UNIQUE,
                    deck_id INTEGER NOT NULL,

                    -- Métricas de repetición espaciada
                    ease_factor REAL DEFAULT 2.5,
                    interval INTEGER DEFAULT 0,
                    repetitions INTEGER DEFAULT 0,

                    -- Fechas
                    last_review TIMESTAMP,
                    next_review TIMESTAMP,

                    -- Estadísticas
                    total_reviews INTEGER DEFAULT 0,
                    total_correct INTEGER DEFAULT 0,
                    total_incorrect INTEGER DEFAULT 0,
                    total_hard INTEGER DEFAULT 0,

                    -- Estado
                    is_learning BOOLEAN DEFAULT TRUE,
                    is_lapsed BOOLEAN DEFAULT FALSE,
                    last_response TEXT,

                    -- Metadata
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                    FOREIGN KEY (card_id) REFERENCES anki_cards(id) ON DELETE CASCADE,
                    FOREIGN KEY (deck_id) REFERENCES anki_decks(id) ON DELETE CASCADE
                )
            ''')

            # ═══════════════════════════════════════════════════════
            # 📝 Card Reviews Table (historial de revisiones, reemplaza answer_history)
            # ═══════════════════════════════════════════════════════
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS card_reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    card_id INTEGER NOT NULL,
                    deck_id INTEGER NOT NULL,
                    session_id INTEGER,

                    -- Respuesta del usuario
                    response TEXT NOT NULL,
                    response_quality INTEGER NOT NULL,

                    -- Daño en el juego
                    damage_dealt INTEGER DEFAULT 0,

                    -- Timing
                    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    time_taken_seconds INTEGER,

                    -- Estado después de la revisión
                    new_ease_factor REAL,
                    new_interval INTEGER,

                    FOREIGN KEY (card_id) REFERENCES anki_cards(id) ON DELETE CASCADE,
                    FOREIGN KEY (deck_id) REFERENCES anki_decks(id) ON DELETE CASCADE
                )
            ''')

            # ═══════════════════════════════════════════════════════
            # 💾 Game Saves Table (adaptado para decks)
            # ═══════════════════════════════════════════════════════
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS game_saves (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    deck_id INTEGER NOT NULL,
                    save_name TEXT NOT NULL,
                    player_hp INTEGER NOT NULL,
                    player_max_hp INTEGER NOT NULL,
                    player_level INTEGER NOT NULL,
                    current_encounter INTEGER NOT NULL,
                    score INTEGER DEFAULT 0,
                    active_powerups TEXT,
                    current_enemy TEXT,
                    game_state TEXT,
                    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    FOREIGN KEY (deck_id) REFERENCES anki_decks(id) ON DELETE CASCADE
                )
            ''')

            # ═══════════════════════════════════════════════════════
            # 📊 Statistics Table (adaptado para decks)
            # ═══════════════════════════════════════════════════════
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS statistics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    deck_id INTEGER NOT NULL,
                    session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    cards_reviewed INTEGER DEFAULT 0,
                    cards_correct INTEGER DEFAULT 0,
                    total_score INTEGER DEFAULT 0,
                    time_played_seconds INTEGER DEFAULT 0,
                    highest_encounter INTEGER DEFAULT 0,
                    enemies_defeated INTEGER DEFAULT 0,
                    game_completed BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (deck_id) REFERENCES anki_decks(id) ON DELETE CASCADE
                )
            ''')

            # Create indexes for better query performance
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_cards_deck
                ON anki_cards(deck_id)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_review_states_card
                ON card_review_states(card_id)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_review_states_deck
                ON card_review_states(deck_id)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_reviews_card
                ON card_reviews(card_id)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_reviews_date
                ON card_reviews(review_date)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_reviews_deck
                ON card_reviews(deck_id)
            ''')


# ═══════════════════════════════════════════════════════════════════
# 📚 DECK OPERATIONS
# ═══════════════════════════════════════════════════════════════════

class DeckManager:
    """Handles Anki deck-related database operations"""

    def __init__(self, db: Database):
        self.db = db

    def add_deck(self, deck_name: str, filename: str, filepath: str,
                 total_cards: int = 0, description: str = None,
                 tags: List[str] = None) -> int:
        """Add a new Anki deck to the database"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            tags_json = json.dumps(tags) if tags else None
            cursor.execute('''
                INSERT INTO anki_decks (deck_name, filename, filepath, total_cards, description, tags)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (deck_name, filename, filepath, total_cards, description, tags_json))
            return cursor.lastrowid

    def get_deck(self, deck_id: int) -> Optional[Dict]:
        """Get deck information by ID"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM anki_decks WHERE id = ?', (deck_id,))
            row = cursor.fetchone()
            if row:
                deck = dict(row)
                if deck.get('tags'):
                    deck['tags'] = json.loads(deck['tags'])
                return deck
            return None

    def get_all_decks(self) -> List[Dict]:
        """Get all decks"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM anki_decks ORDER BY upload_date DESC')
            decks = []
            for row in cursor.fetchall():
                deck = dict(row)
                if deck.get('tags'):
                    deck['tags'] = json.loads(deck['tags'])
                decks.append(deck)
            return decks

    def get_deck_by_filepath(self, filepath: str) -> Optional[Dict]:
        """Get deck by filepath"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM anki_decks WHERE filepath = ?', (filepath,))
            row = cursor.fetchone()
            if row:
                deck = dict(row)
                if deck.get('tags'):
                    deck['tags'] = json.loads(deck['tags'])
                return deck
            return None

    def update_deck_card_count(self, deck_id: int, total_cards: int):
        """Update the total card count for a deck"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE anki_decks SET total_cards = ? WHERE id = ?
            ''', (total_cards, deck_id))

    def delete_deck(self, deck_id: int):
        """Delete a deck and all its cards"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM anki_decks WHERE id = ?', (deck_id,))


# ═══════════════════════════════════════════════════════════════════
# 🃏 CARD OPERATIONS
# ═══════════════════════════════════════════════════════════════════

class CardManager:
    """Handles Anki card-related database operations"""

    def __init__(self, db: Database):
        self.db = db

    def add_card(self, deck_id: int, front: str, back: str,
                 tags: List[str] = None, note_type: str = 'Basic') -> int:
        """Add a new card to the database"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            tags_json = json.dumps(tags) if tags else None
            cursor.execute('''
                INSERT INTO anki_cards (deck_id, front, back, tags, note_type)
                VALUES (?, ?, ?, ?, ?)
            ''', (deck_id, front, back, tags_json, note_type))
            return cursor.lastrowid

    def add_cards_batch(self, cards: List[Dict]) -> int:
        """Add multiple cards at once"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            count = 0
            for card in cards:
                tags_json = json.dumps(card.get('tags')) if card.get('tags') else None
                cursor.execute('''
                    INSERT INTO anki_cards (deck_id, front, back, tags, note_type)
                    VALUES (?, ?, ?, ?, ?)
                ''', (card['deck_id'], card['front'], card['back'],
                      tags_json, card.get('note_type', 'Basic')))
                count += 1
            return count

    def get_card(self, card_id: int) -> Optional[Dict]:
        """Get a specific card by ID"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM anki_cards WHERE id = ?', (card_id,))
            row = cursor.fetchone()
            if row:
                card = dict(row)
                if card.get('tags'):
                    card['tags'] = json.loads(card['tags'])
                return card
            return None

    def get_all_cards(self, deck_id: int) -> List[Dict]:
        """Get all cards for a deck"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM anki_cards WHERE deck_id = ? ORDER BY id', (deck_id,))
            cards = []
            for row in cursor.fetchall():
                card = dict(row)
                if card.get('tags'):
                    card['tags'] = json.loads(card['tags'])
                cards.append(card)
            return cards

    def get_card_count(self, deck_id: int) -> int:
        """Get total number of cards for a deck"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) as count FROM anki_cards WHERE deck_id = ?', (deck_id,))
            return cursor.fetchone()['count']

    def get_cards_by_tags(self, deck_id: int, tags: List[str]) -> List[Dict]:
        """Get cards that match specific tags"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM anki_cards WHERE deck_id = ?', (deck_id,))
            matching_cards = []
            for row in cursor.fetchall():
                card = dict(row)
                if card.get('tags'):
                    card_tags = json.loads(card['tags'])
                    if any(tag in card_tags for tag in tags):
                        card['tags'] = card_tags
                        matching_cards.append(card)
            return matching_cards


# ═══════════════════════════════════════════════════════════════════
# 🧠 REVIEW STATE OPERATIONS
# ═══════════════════════════════════════════════════════════════════

class ReviewStateManager:
    """Handles card review state operations"""

    def __init__(self, db: Database):
        self.db = db

    def get_state(self, card_id: int) -> Optional[Dict]:
        """Get review state for a card"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM card_review_states WHERE card_id = ?', (card_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_all_states(self, deck_id: int) -> List[Dict]:
        """Get all review states for a deck"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM card_review_states WHERE deck_id = ?', (deck_id,))
            return [dict(row) for row in cursor.fetchall()]

    def save_state(self, card_id: int, deck_id: int, state: Dict) -> int:
        """Save or update review state for a card"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()

            # Check if state exists
            cursor.execute('SELECT id FROM card_review_states WHERE card_id = ?', (card_id,))
            existing = cursor.fetchone()

            # Convert datetime objects to ISO format strings
            last_review = state.get('last_review')
            if isinstance(last_review, datetime):
                last_review = last_review.isoformat()

            next_review = state.get('next_review')
            if isinstance(next_review, datetime):
                next_review = next_review.isoformat()

            if existing:
                # Update existing state
                cursor.execute('''
                    UPDATE card_review_states
                    SET ease_factor = ?, interval = ?, repetitions = ?,
                        last_review = ?, next_review = ?,
                        total_reviews = ?, total_correct = ?,
                        total_incorrect = ?, total_hard = ?,
                        is_learning = ?, is_lapsed = ?,
                        last_response = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE card_id = ?
                ''', (
                    state.get('ease_factor', 2.5),
                    state.get('interval', 0),
                    state.get('repetitions', 0),
                    last_review,
                    next_review,
                    state.get('total_reviews', 0),
                    state.get('total_correct', 0),
                    state.get('total_incorrect', 0),
                    state.get('total_hard', 0),
                    state.get('is_learning', True),
                    state.get('is_lapsed', False),
                    state.get('last_response'),
                    card_id
                ))
                return existing['id']
            else:
                # Insert new state
                cursor.execute('''
                    INSERT INTO card_review_states
                    (card_id, deck_id, ease_factor, interval, repetitions,
                     last_review, next_review, total_reviews, total_correct,
                     total_incorrect, total_hard, is_learning, is_lapsed, last_response)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    card_id, deck_id,
                    state.get('ease_factor', 2.5),
                    state.get('interval', 0),
                    state.get('repetitions', 0),
                    last_review,
                    next_review,
                    state.get('total_reviews', 0),
                    state.get('total_correct', 0),
                    state.get('total_incorrect', 0),
                    state.get('total_hard', 0),
                    state.get('is_learning', True),
                    state.get('is_lapsed', False),
                    state.get('last_response')
                ))
                return cursor.lastrowid

    def bulk_save_states(self, states: List[Dict]):
        """Save multiple review states at once"""
        for state in states:
            self.save_state(
                card_id=state['card_id'],
                deck_id=state['deck_id'],
                state=state
            )

    def get_weak_cards(self, deck_id: int, limit: int = 10) -> List[Dict]:
        """
        Get cards that need the most practice

        Returns cards with:
        - Low ease factor (difficult cards)
        - High incorrect count
        - Low accuracy

        Ordered by priority for review
        """
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT
                    card_id,
                    ease_factor,
                    total_reviews,
                    total_correct,
                    total_incorrect,
                    total_hard,
                    last_response,
                    CASE
                        WHEN total_reviews > 0
                        THEN (total_correct * 100.0 / total_reviews)
                        ELSE 0
                    END as accuracy
                FROM card_review_states
                WHERE deck_id = ? AND total_reviews > 0
                ORDER BY
                    accuracy ASC,
                    ease_factor ASC,
                    total_incorrect DESC
                LIMIT ?
            ''', (deck_id, limit))

            return [dict(row) for row in cursor.fetchall()]


# ═══════════════════════════════════════════════════════════════════
# 📝 REVIEW HISTORY OPERATIONS
# ═══════════════════════════════════════════════════════════════════

class ReviewHistoryManager:
    """Handles card review history"""

    def __init__(self, db: Database):
        self.db = db

    def record_review(self, card_id: int, deck_id: int, response: str,
                     response_quality: int, damage_dealt: int = 0,
                     time_taken: int = None, session_id: int = None,
                     new_ease_factor: float = None, new_interval: int = None):
        """Record a card review in the history"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO card_reviews
                (card_id, deck_id, session_id, response, response_quality,
                 damage_dealt, time_taken_seconds, new_ease_factor, new_interval)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (card_id, deck_id, session_id, response, response_quality,
                  damage_dealt, time_taken, new_ease_factor, new_interval))

    def get_recent_reviews(self, deck_id: int, limit: int = 20) -> List[Dict]:
        """Get recent review history"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT cr.*, ac.front, ac.back, ac.tags
                FROM card_reviews cr
                JOIN anki_cards ac ON cr.card_id = ac.id
                WHERE cr.deck_id = ?
                ORDER BY cr.review_date DESC
                LIMIT ?
            ''', (deck_id, limit))
            return [dict(row) for row in cursor.fetchall()]

    def get_card_review_history(self, card_id: int) -> List[Dict]:
        """Get all reviews for a specific card"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM card_reviews
                WHERE card_id = ?
                ORDER BY review_date ASC
            ''', (card_id,))
            return [dict(row) for row in cursor.fetchall()]


# ═══════════════════════════════════════════════════════════════════
# 💾 GAME SAVE OPERATIONS
# ═══════════════════════════════════════════════════════════════════

class GameSaveManager:
    """Handles game save operations"""

    def __init__(self, db: Database):
        self.db = db

    def create_save(self, deck_id: int, save_name: str, player_hp: int,
                   player_max_hp: int, player_level: int, current_encounter: int,
                   score: int = 0, active_powerups: Dict = None,
                   current_enemy: Dict = None, game_state: Dict = None) -> int:
        """Create a new game save"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO game_saves
                (deck_id, save_name, player_hp, player_max_hp, player_level,
                 current_encounter, score, active_powerups, current_enemy, game_state)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (deck_id, save_name, player_hp, player_max_hp, player_level,
                  current_encounter, score, json.dumps(active_powerups or {}),
                  json.dumps(current_enemy or {}), json.dumps(game_state or {})))
            return cursor.lastrowid

    def update_save(self, save_id: int, **kwargs):
        """Update an existing save"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()

            # Convert dict fields to JSON
            for key in ['active_powerups', 'current_enemy', 'game_state']:
                if key in kwargs and isinstance(kwargs[key], dict):
                    kwargs[key] = json.dumps(kwargs[key])

            set_clause = ', '.join([f"{k} = ?" for k in kwargs.keys()])
            set_clause += ', last_played = CURRENT_TIMESTAMP'
            values = list(kwargs.values()) + [save_id]

            cursor.execute(f'''
                UPDATE game_saves
                SET {set_clause}
                WHERE id = ?
            ''', values)

    def get_save(self, save_id: int) -> Optional[Dict]:
        """Get a game save by ID"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM game_saves WHERE id = ?', (save_id,))
            row = cursor.fetchone()
            if row:
                save = dict(row)
                # Parse JSON fields
                for key in ['active_powerups', 'current_enemy', 'game_state']:
                    if save.get(key):
                        save[key] = json.loads(save[key])
                return save
            return None

    def get_saves_for_deck(self, deck_id: int) -> List[Dict]:
        """Get all saves for a specific deck"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM game_saves
                WHERE deck_id = ? AND is_active = TRUE
                ORDER BY last_played DESC
            ''', (deck_id,))
            saves = []
            for row in cursor.fetchall():
                save = dict(row)
                for key in ['active_powerups', 'current_enemy', 'game_state']:
                    if save.get(key):
                        save[key] = json.loads(save[key])
                saves.append(save)
            return saves

    def delete_save(self, save_id: int):
        """Mark a save as inactive"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE game_saves SET is_active = FALSE WHERE id = ?
            ''', (save_id,))


# ═══════════════════════════════════════════════════════════════════
# 📊 STATISTICS OPERATIONS
# ═══════════════════════════════════════════════════════════════════

class StatisticsManager:
    """Handles statistics and answer history"""

    def __init__(self, db: Database):
        self.db = db

    def create_session(self, deck_id: int) -> int:
        """Create a new statistics session"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO statistics (deck_id) VALUES (?)
            ''', (deck_id,))
            return cursor.lastrowid

    def update_session(self, session_id: int, **kwargs):
        """Update session statistics"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            set_clause = ', '.join([f"{k} = ?" for k in kwargs.keys()])
            values = list(kwargs.values()) + [session_id]
            cursor.execute(f'''
                UPDATE statistics SET {set_clause} WHERE id = ?
            ''', values)

    def get_overall_stats(self, deck_id: int) -> Dict:
        """Get overall statistics for a deck"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()

            # Overall reviews from card_review_states
            cursor.execute('''
                SELECT
                    SUM(total_reviews) as total_reviews,
                    SUM(total_correct) as correct_reviews
                FROM card_review_states WHERE deck_id = ?
            ''', (deck_id,))
            review_row = cursor.fetchone()

            # Total time played
            cursor.execute('''
                SELECT SUM(time_played_seconds) as total_time
                FROM statistics WHERE deck_id = ?
            ''', (deck_id,))
            time_row = cursor.fetchone()

            # Total score
            cursor.execute('''
                SELECT SUM(total_score) as total_score
                FROM statistics WHERE deck_id = ?
            ''', (deck_id,))
            score_row = cursor.fetchone()

            # Games completed
            cursor.execute('''
                SELECT COUNT(*) as completed_games
                FROM statistics WHERE deck_id = ? AND game_completed = TRUE
            ''', (deck_id,))
            games_row = cursor.fetchone()

            total = review_row['total_reviews'] or 0
            correct = review_row['correct_reviews'] or 0

            return {
                'total_reviews': total,
                'correct_reviews': correct,
                'accuracy': (correct / total * 100) if total > 0 else 0,
                'total_time_seconds': time_row['total_time'] or 0,
                'total_score': score_row['total_score'] or 0,
                'completed_games': games_row['completed_games'] or 0
            }

    def get_deck_progress(self, deck_id: int) -> Dict:
        """Get learning progress for a deck"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()

            # Total cards
            cursor.execute('SELECT COUNT(*) as total FROM anki_cards WHERE deck_id = ?', (deck_id,))
            total = cursor.fetchone()['total']

            # Cards by status
            cursor.execute('''
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN total_reviews = 0 THEN 1 ELSE 0 END) as new,
                    SUM(CASE WHEN is_learning = 1 THEN 1 ELSE 0 END) as learning,
                    SUM(CASE WHEN total_reviews >= 5 AND total_correct * 100.0 / total_reviews >= 80 THEN 1 ELSE 0 END) as mastered
                FROM card_review_states
                WHERE deck_id = ?
            ''', (deck_id,))
            stats = cursor.fetchone()

            return {
                'total_cards': total,
                'new_cards': stats['new'] or 0,
                'learning_cards': stats['learning'] or 0,
                'mastered_cards': stats['mastered'] or 0,
                'completion_percent': ((total - (stats['new'] or 0)) / total * 100) if total > 0 else 0
            }


# ═══════════════════════════════════════════════════════════════════
# 🚀 INITIALIZE DATABASE SINGLETON
# ═══════════════════════════════════════════════════════════════════

# Create global database instance
db = Database()
deck_manager = DeckManager(db)
card_db_manager = CardManager(db)
review_state_manager = ReviewStateManager(db)
review_history_manager = ReviewHistoryManager(db)
save_manager = GameSaveManager(db)
stats_manager = StatisticsManager(db)
