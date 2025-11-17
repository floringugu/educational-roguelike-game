"""
Game Engine for Educational Roguelike
Handles combat, progression, enemies, and game state
"""

import random
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime

import config
from database import question_manager, save_manager, stats_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════
# 📦 DATA CLASSES
# ═══════════════════════════════════════════════════════════════════

@dataclass
class Player:
    """Player character state"""
    hp: int
    max_hp: int
    level: int
    score: int
    damage_boost: float = 1.0
    shield: int = 0
    score_boost: float = 1.0

    def to_dict(self) -> Dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict):
        return cls(**data)


@dataclass
class Enemy:
    """Enemy character state"""
    enemy_type: str
    name: str
    emoji: str
    hp: int
    max_hp: int
    damage: int
    score_value: int
    difficulty: int

    def to_dict(self) -> Dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict):
        return cls(**data)


@dataclass
class GameState:
    """Complete game state"""
    pdf_id: int
    player: Player
    current_enemy: Optional[Enemy]
    current_encounter: int
    total_encounters: int
    session_id: int
    questions_answered: int
    questions_correct: int
    start_time: str
    active_powerups: Dict

    def to_dict(self) -> Dict:
        data = asdict(self)
        data['player'] = self.player.to_dict()
        data['current_enemy'] = self.current_enemy.to_dict() if self.current_enemy else None
        return data

    @classmethod
    def from_dict(cls, data: Dict):
        data['player'] = Player.from_dict(data['player'])
        if data.get('current_enemy'):
            data['current_enemy'] = Enemy.from_dict(data['current_enemy'])
        return cls(**data)


# ═══════════════════════════════════════════════════════════════════
# 🎮 GAME ENGINE
# ═══════════════════════════════════════════════════════════════════

class GameEngine:
    """Main game engine managing all game logic"""

    def __init__(self, pdf_id: int):
        self.pdf_id = pdf_id
        self.state: Optional[GameState] = None

    def new_game(self) -> GameState:
        """Start a new game"""
        # Create player
        player = Player(
            hp=config.PLAYER_MAX_HP,
            max_hp=config.PLAYER_MAX_HP,
            level=config.PLAYER_STARTING_LEVEL,
            score=0
        )

        # Create statistics session
        session_id = stats_manager.create_session(self.pdf_id)

        # Create initial game state
        self.state = GameState(
            pdf_id=self.pdf_id,
            player=player,
            current_enemy=None,
            current_encounter=1,
            total_encounters=config.TOTAL_ENCOUNTERS,
            session_id=session_id,
            questions_answered=0,
            questions_correct=0,
            start_time=datetime.now().isoformat(),
            active_powerups={}
        )

        # Generate first enemy
        self.state.current_enemy = self._generate_enemy(1)

        logger.info(f"New game started for PDF {self.pdf_id}")
        return self.state

    def load_game(self, save_id: int) -> Optional[GameState]:
        """Load a saved game"""
        save_data = save_manager.get_save(save_id)

        if not save_data:
            logger.error(f"Save {save_id} not found")
            return None

        # Reconstruct game state
        self.state = GameState(
            pdf_id=save_data['pdf_id'],
            player=Player(
                hp=save_data['player_hp'],
                max_hp=save_data['player_max_hp'],
                level=save_data['player_level'],
                score=save_data['score']
            ),
            current_enemy=Enemy.from_dict(save_data['current_enemy']) if save_data['current_enemy'] else None,
            current_encounter=save_data['current_encounter'],
            total_encounters=config.TOTAL_ENCOUNTERS,
            session_id=save_data.get('session_id', stats_manager.create_session(save_data['pdf_id'])),
            questions_answered=0,  # Reset for this session
            questions_correct=0,
            start_time=datetime.now().isoformat(),
            active_powerups=save_data.get('active_powerups', {})
        )

        logger.info(f"Game loaded from save {save_id}")
        return self.state

    def save_game(self, save_name: str = None) -> int:
        """Save current game state"""
        if not self.state:
            raise ValueError("No active game to save")

        save_name = save_name or f"Save {datetime.now().strftime('%Y-%m-%d %H:%M')}"

        save_id = save_manager.create_save(
            pdf_id=self.state.pdf_id,
            save_name=save_name,
            player_hp=self.state.player.hp,
            player_max_hp=self.state.player.max_hp,
            player_level=self.state.player.level,
            current_encounter=self.state.current_encounter,
            score=self.state.player.score,
            active_powerups=self.state.active_powerups,
            current_enemy=self.state.current_enemy.to_dict() if self.state.current_enemy else None,
            game_state={'session_id': self.state.session_id}
        )

        logger.info(f"Game saved with ID {save_id}")
        return save_id

    def _generate_enemy(self, encounter_num: int) -> Enemy:
        """
        Generate an enemy appropriate for the encounter number

        Difficulty scales with encounter number
        """
        # Calculate difficulty tier based on encounter
        progress = encounter_num / self.state.total_encounters
        scaling_factor = 1.0 + (progress * (config.DIFFICULTY_SCALING - 1.0))

        # Select enemy types based on difficulty
        if progress < 0.3:
            # Early game: easier enemies
            pool = ['slime', 'skeleton', 'ghost']
        elif progress < 0.7:
            # Mid game: medium enemies
            pool = ['skeleton', 'ghost', 'zombie']
        else:
            # Late game: harder enemies
            pool = ['zombie', 'demon', 'dragon']

        enemy_type = random.choice(pool)
        enemy_data = config.ENEMY_TYPES[enemy_type].copy()

        # Scale stats
        enemy = Enemy(
            enemy_type=enemy_type,
            name=enemy_data['name'],
            emoji=enemy_data['emoji'],
            hp=int(enemy_data['hp'] * scaling_factor),
            max_hp=int(enemy_data['hp'] * scaling_factor),
            damage=int(enemy_data['damage'] * scaling_factor),
            score_value=int(enemy_data['score'] * scaling_factor),
            difficulty=enemy_data['difficulty']
        )

        logger.info(f"Generated {enemy.name} for encounter {encounter_num} (scaling: {scaling_factor:.2f}x)")
        return enemy

    def get_question(self) -> Optional[Dict]:
        """
        Get a question appropriate for current difficulty

        Returns None if no questions available
        """
        if not self.state or not self.state.current_enemy:
            return None

        # Determine difficulty based on enemy difficulty
        difficulty_map = {1: 'easy', 2: 'easy', 3: 'medium', 4: 'medium', 5: 'hard'}
        difficulty = difficulty_map.get(self.state.current_enemy.difficulty, 'medium')

        # Get random question, avoiding recent ones
        question = question_manager.get_random_question(
            pdf_id=self.pdf_id,
            difficulty=difficulty,
            exclude_recent=config.QUESTION_BUFFER
        )

        return question

    def answer_question(self, question_id: int, user_answer: str, correct_answer: str) -> Dict:
        """
        Process a question answer and update game state

        Returns:
            Dict with result information
        """
        if not self.state:
            raise ValueError("No active game")

        is_correct = user_answer.strip().lower() == correct_answer.strip().lower()

        # Update question stats
        question_manager.update_question_stats(question_id, is_correct)

        # Record answer in history
        stats_manager.record_answer(
            question_id=question_id,
            pdf_id=self.pdf_id,
            user_answer=user_answer,
            is_correct=is_correct,
            session_id=self.state.session_id
        )

        # Update game state
        self.state.questions_answered += 1
        if is_correct:
            self.state.questions_correct += 1

        result = {
            'is_correct': is_correct,
            'damage_dealt': 0,
            'damage_received': 0,
            'enemy_defeated': False,
            'player_died': False,
            'powerup_gained': None,
            'score_gained': 0
        }

        if is_correct:
            # Player attacks enemy
            damage = int(config.PLAYER_BASE_DAMAGE * self.state.player.damage_boost)
            self.state.current_enemy.hp -= damage
            result['damage_dealt'] = damage

            # Check if enemy is defeated
            if self.state.current_enemy.hp <= 0:
                result['enemy_defeated'] = True
                score_gained = int(self.state.current_enemy.score_value * self.state.player.score_boost)
                self.state.player.score += score_gained
                result['score_gained'] = score_gained

                # Check for powerup drop
                powerup = self._try_powerup_drop()
                if powerup:
                    self._apply_powerup(powerup)
                    result['powerup_gained'] = powerup

                # Progress to next encounter
                self.state.current_encounter += 1

                if self.state.current_encounter <= self.state.total_encounters:
                    self.state.current_enemy = self._generate_enemy(self.state.current_encounter)
                else:
                    # Game won!
                    result['game_won'] = True
                    self._complete_game()

        else:
            # Enemy attacks player
            damage = self.state.current_enemy.damage

            # Apply shield
            if self.state.player.shield > 0:
                shield_absorbed = min(self.state.player.shield, damage)
                self.state.player.shield -= shield_absorbed
                damage -= shield_absorbed

            self.state.player.hp -= damage
            result['damage_received'] = damage

            # Check if player died
            if self.state.player.hp <= 0:
                result['player_died'] = True
                self._game_over()

        return result

    def _try_powerup_drop(self) -> Optional[str]:
        """Randomly try to drop a powerup"""
        for powerup_id, powerup_data in config.POWERUPS.items():
            if random.random() < powerup_data['chance']:
                return powerup_id
        return None

    def _apply_powerup(self, powerup_id: str):
        """Apply a powerup effect to the player"""
        powerup_data = config.POWERUPS[powerup_id]
        effect = powerup_data['effect']
        value = powerup_data['value']

        if effect == 'heal':
            self.state.player.hp = min(
                self.state.player.max_hp,
                self.state.player.hp + value
            )
        elif effect == 'shield':
            self.state.player.shield += value
        elif effect == 'damage_boost':
            self.state.player.damage_boost *= value
            self.state.active_powerups['damage_boost'] = True
        elif effect == 'score_boost':
            self.state.player.score_boost *= value
            self.state.active_powerups['score_boost'] = True

        logger.info(f"Applied powerup: {powerup_id}")

    def _complete_game(self):
        """Handle game completion"""
        stats_manager.update_session(
            session_id=self.state.session_id,
            questions_answered=self.state.questions_answered,
            questions_correct=self.state.questions_correct,
            total_score=self.state.player.score,
            highest_encounter=self.state.current_encounter,
            enemies_defeated=self.state.current_encounter - 1,
            game_completed=True
        )
        logger.info(f"Game completed! Score: {self.state.player.score}")

    def _game_over(self):
        """Handle game over"""
        stats_manager.update_session(
            session_id=self.state.session_id,
            questions_answered=self.state.questions_answered,
            questions_correct=self.state.questions_correct,
            total_score=self.state.player.score,
            highest_encounter=self.state.current_encounter,
            enemies_defeated=self.state.current_encounter - 1,
            game_completed=False
        )
        logger.info(f"Game over at encounter {self.state.current_encounter}")

    def get_game_status(self) -> Dict:
        """Get current game status for UI"""
        if not self.state:
            return {'active': False}

        return {
            'active': True,
            'player': {
                'hp': self.state.player.hp,
                'max_hp': self.state.player.max_hp,
                'hp_percent': (self.state.player.hp / self.state.player.max_hp) * 100,
                'level': self.state.player.level,
                'score': self.state.player.score,
                'shield': self.state.player.shield,
                'damage_boost': self.state.player.damage_boost,
                'score_boost': self.state.player.score_boost
            },
            'enemy': {
                'type': self.state.current_enemy.enemy_type,
                'name': self.state.current_enemy.name,
                'emoji': self.state.current_enemy.emoji,
                'hp': self.state.current_enemy.hp,
                'max_hp': self.state.current_enemy.max_hp,
                'hp_percent': (self.state.current_enemy.hp / self.state.current_enemy.max_hp) * 100,
                'damage': self.state.current_enemy.damage
            } if self.state.current_enemy else None,
            'progress': {
                'current_encounter': self.state.current_encounter,
                'total_encounters': self.state.total_encounters,
                'percent': (self.state.current_encounter / self.state.total_encounters) * 100
            },
            'stats': {
                'questions_answered': self.state.questions_answered,
                'questions_correct': self.state.questions_correct,
                'accuracy': (self.state.questions_correct / self.state.questions_answered * 100)
                    if self.state.questions_answered > 0 else 0
            },
            'active_powerups': self.state.active_powerups
        }


# ═══════════════════════════════════════════════════════════════════
# 🎲 UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════════

def validate_pdf_ready(pdf_id: int) -> Tuple[bool, str]:
    """
    Check if a PDF has enough questions to start a game

    Returns:
        (is_ready, message)
    """
    question_count = question_manager.get_question_count(pdf_id)

    if question_count < config.MIN_QUESTIONS_TO_START:
        return False, f"Need at least {config.MIN_QUESTIONS_TO_START} questions. Currently have {question_count}."

    return True, f"Ready to play with {question_count} questions!"


def get_difficulty_recommendation(encounter_num: int, total_encounters: int) -> str:
    """Get recommended question difficulty for an encounter"""
    progress = encounter_num / total_encounters

    if progress < 0.3:
        return 'easy'
    elif progress < 0.7:
        return 'medium'
    else:
        return 'hard'
