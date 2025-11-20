"""
Game Engine for Educational Roguelike - Anki System
Handles combat, progression, enemies, and game state with Anki flashcards
"""

import random
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime

import config
from database import deck_manager, card_db_manager, save_manager, stats_manager, review_state_manager, review_history_manager
from card_manager import CardManager as AnkiCardManager
from spaced_repetition import ResponseQuality

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
    is_boss: bool = False

    def to_dict(self) -> Dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict):
        return cls(**data)


@dataclass
class GameState:
    """Complete game state for Anki system"""
    deck_id: int
    player: Player
    current_enemy: Optional[Enemy]
    current_encounter: int
    total_encounters: int
    session_id: int
    cards_reviewed: int
    cards_correct: int
    start_time: str
    active_powerups: Dict
    inventory: List[str] = None
    current_card: Optional[Dict] = None
    card_revealed: bool = False  # Nuevo: para sistema de revelar respuesta

    def __post_init__(self):
        if self.inventory is None:
            self.inventory = []

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
        if 'inventory' not in data:
            data['inventory'] = []
        if 'card_revealed' not in data:
            data['card_revealed'] = False
        return cls(**data)


# ═══════════════════════════════════════════════════════════════════
# 🎮 GAME ENGINE
# ═══════════════════════════════════════════════════════════════════

class GameEngine:
    """Main game engine managing all game logic with Anki system"""

    def __init__(self, deck_id: int):
        self.deck_id = deck_id
        self.state: Optional[GameState] = None
        self.card_manager: Optional[AnkiCardManager] = None

    def new_game(self) -> GameState:
        """Start a new game with an Anki deck"""
        # Cargar todas las tarjetas del mazo
        deck = deck_manager.get_deck(self.deck_id)
        if not deck:
            raise ValueError(f"Deck {self.deck_id} not found")

        cards = card_db_manager.get_all_cards(self.deck_id)
        if not cards:
            raise ValueError(f"Deck {self.deck_id} has no cards")

        # Cargar estados de revisión existentes
        review_states = review_state_manager.get_all_states(self.deck_id)

        # Inicializar card manager
        self.card_manager = AnkiCardManager(
            deck_id=self.deck_id,
            deck_name=deck['deck_name'],
            cards=cards
        )

        # Cargar estados previos si existen
        if review_states:
            self.card_manager.load_states(review_states)

        # Create player
        player = Player(
            hp=config.PLAYER_MAX_HP,
            max_hp=config.PLAYER_MAX_HP,
            level=config.PLAYER_STARTING_LEVEL,
            score=0
        )

        # Create statistics session
        session_id = stats_manager.create_session(self.deck_id)

        # Create initial game state
        self.state = GameState(
            deck_id=self.deck_id,
            player=player,
            current_enemy=None,
            current_encounter=1,
            total_encounters=config.TOTAL_ENCOUNTERS,
            session_id=session_id,
            cards_reviewed=0,
            cards_correct=0,
            start_time=datetime.now().isoformat(),
            active_powerups={},
            card_revealed=False
        )

        # Generate first enemy
        self.state.current_enemy = self._generate_enemy(1)

        # Get first card
        self._load_next_card()

        logger.info(f"New game started for deck {self.deck_id}")
        return self.state

    def _load_next_card(self):
        """Carga la siguiente tarjeta del mazo"""
        if not self.card_manager:
            raise RuntimeError("Card manager not initialized")

        next_card_data = self.card_manager.get_next_card()
        if next_card_data:
            self.state.current_card = next_card_data['card']
            self.state.card_revealed = False
        else:
            self.state.current_card = None
            logger.warning("No more cards available")

    def reveal_card(self) -> Dict:
        """Revela la respuesta de la tarjeta actual"""
        if not self.state.current_card:
            return {'success': False, 'message': 'No hay tarjeta actual'}

        self.state.card_revealed = True

        return {
            'success': True,
            'answer': self.state.current_card['back']
        }

    def answer_card(self, response: str) -> Dict:
        """
        Procesa la respuesta del usuario a una tarjeta (Again/Hard/Good/Easy)

        Args:
            response: 'again', 'hard', 'good', o 'easy'

        Returns:
            Dict con resultado del combate y estado actualizado
        """
        if not self.state.current_card:
            return {'success': False, 'message': 'No hay tarjeta actual'}

        if not self.state.card_revealed:
            return {'success': False, 'message': 'Debe revelar la respuesta primero'}

        # Procesar respuesta con card manager
        card_id = self.state.current_card['id']
        result = self.card_manager.answer_card(card_id, response)

        # Obtener daño calculado
        damage = result['damage']

        # Aplicar boost de daño del jugador
        if self.state.player.damage_boost > 1.0:
            damage = int(damage * self.state.player.damage_boost)

        # Registrar revisión en historial
        response_quality = ResponseQuality.from_string(response)
        review_history_manager.record_review(
            card_id=card_id,
            deck_id=self.deck_id,
            response=response,
            response_quality=response_quality.value,
            damage_dealt=damage,
            session_id=self.state.session_id,
            new_ease_factor=result['updated_state']['ease_factor'],
            new_interval=result['updated_state']['interval']
        )

        # Guardar estado de la tarjeta
        review_state_manager.save_state(
            card_id=card_id,
            deck_id=self.deck_id,
            state=result['updated_state']
        )

        # Actualizar estadísticas de sesión
        self.state.cards_reviewed += 1
        if response in ['good', 'easy']:
            self.state.cards_correct += 1

        # Aplicar daño al enemigo
        battle_log = []
        enemy_defeated = False
        player_damaged = False
        player_defeated = False

        if damage > 0:
            self.state.current_enemy.hp = max(0, self.state.current_enemy.hp - damage)
            battle_log.append(f"¡Hiciste {damage} de daño al {self.state.current_enemy.name}!")

            if self.state.current_enemy.hp <= 0:
                enemy_defeated = True
                # Añadir score
                score_gain = int(self.state.current_enemy.score_value * self.state.player.score_boost)
                self.state.player.score += score_gain
                battle_log.append(f"¡Derrotaste al {self.state.current_enemy.name}! +{score_gain} puntos")

                # Drop powerup
                powerup = self._try_drop_powerup()
                if powerup:
                    self.state.inventory.append(powerup['id'])
                    battle_log.append(f"¡Obtuviste {powerup['name']}!")

        else:
            # Respuesta incorrecta (Again) - el enemigo ataca
            enemy_damage = self.state.current_enemy.damage

            # Absorber con escudo primero
            if self.state.player.shield > 0:
                absorbed = min(self.state.player.shield, enemy_damage)
                self.state.player.shield -= absorbed
                enemy_damage -= absorbed
                battle_log.append(f"Tu escudo absorbió {absorbed} de daño")

            # Aplicar daño restante al jugador
            if enemy_damage > 0:
                self.state.player.hp = max(0, self.state.player.hp - enemy_damage)
                battle_log.append(f"El {self.state.current_enemy.name} te hizo {enemy_damage} de daño")
                player_damaged = True

                if self.state.player.hp <= 0:
                    player_defeated = True
                    battle_log.append("Has sido derrotado...")

        # Preparar siguiente turno
        next_enemy = None
        game_won = False

        if enemy_defeated and not player_defeated:
            self.state.current_encounter += 1

            if self.state.current_encounter <= self.state.total_encounters:
                # Generar siguiente enemigo
                next_enemy = self._generate_enemy(self.state.current_encounter)
                self.state.current_enemy = next_enemy
            else:
                # ¡Juego completado!
                game_won = True
                battle_log.append("¡VICTORIA! ¡Completaste todos los encuentros!")
                self._end_game(completed=True)

        # Cargar siguiente tarjeta si el juego continúa
        if not player_defeated and not game_won:
            self._load_next_card()

        # Actualizar estadísticas
        stats_manager.update_session(
            self.state.session_id,
            cards_reviewed=self.state.cards_reviewed,
            cards_correct=self.state.cards_correct,
            total_score=self.state.player.score,
            highest_encounter=self.state.current_encounter,
            enemies_defeated=self.state.current_encounter - 1 if enemy_defeated else self.state.current_encounter - 1
        )

        return {
            'success': True,
            'response': response,
            'damage': damage,
            'battle_log': battle_log,
            'enemy_defeated': enemy_defeated,
            'player_damaged': player_damaged,
            'player_defeated': player_defeated,
            'game_won': game_won,
            'next_enemy': next_enemy.to_dict() if next_enemy else None,
            'card_stats': result['updated_state'],
            'deck_stats': self.card_manager.get_stats()
        }

    def _generate_enemy(self, encounter_number: int) -> Enemy:
        """Generate an enemy based on encounter number"""
        progress = encounter_number / self.state.total_encounters

        # Last encounter is always a boss
        if encounter_number == self.state.total_encounters:
            return self._generate_boss(encounter_number)

        # Select enemy type based on progress
        if progress < 0.3:
            enemy_types = ['slime', 'skeleton', 'ghost']
        elif progress < 0.7:
            enemy_types = ['skeleton', 'ghost', 'zombie']
        else:
            enemy_types = ['zombie', 'demon', 'dragon']

        enemy_type = random.choice(enemy_types)
        enemy_data = config.ENEMY_TYPES[enemy_type].copy()

        # Scale enemy stats based on encounter
        scale_factor = 1 + (encounter_number - 1) * config.DIFFICULTY_SCALE_FACTOR

        return Enemy(
            enemy_type=enemy_type,
            name=enemy_data['name'],
            emoji=enemy_data['emoji'],
            hp=int(enemy_data['hp'] * scale_factor),
            max_hp=int(enemy_data['hp'] * scale_factor),
            damage=int(enemy_data['damage'] * scale_factor),
            score_value=int(enemy_data['score'] * scale_factor),
            difficulty=encounter_number,
            is_boss=False
        )

    def _generate_boss(self, encounter_number: int) -> Enemy:
        """Generate a boss enemy"""
        boss_type = random.choice(list(config.BOSS_TYPES.keys()))
        boss_data = config.BOSS_TYPES[boss_type].copy()

        scale_factor = 1 + (encounter_number - 1) * config.DIFFICULTY_SCALE_FACTOR

        return Enemy(
            enemy_type=boss_type,
            name=boss_data['name'],
            emoji=boss_data['emoji'],
            hp=int(boss_data['hp'] * scale_factor),
            max_hp=int(boss_data['hp'] * scale_factor),
            damage=int(boss_data['damage'] * scale_factor),
            score_value=int(boss_data['score'] * scale_factor),
            difficulty=encounter_number,
            is_boss=True
        )

    def _try_drop_powerup(self) -> Optional[Dict]:
        """Try to drop a random powerup"""
        roll = random.random() * 100

        for powerup_id, powerup_data in config.POWERUPS.items():
            if roll < powerup_data['drop_chance']:
                return {
                    'id': powerup_id,
                    'name': powerup_data['name'],
                    'emoji': powerup_data['emoji']
                }

        return None

    def use_powerup(self, powerup_id: str) -> Dict:
        """Use a powerup from inventory"""
        if powerup_id not in self.state.inventory:
            return {'success': False, 'message': 'Powerup no está en el inventario'}

        powerup = config.POWERUPS.get(powerup_id)
        if not powerup:
            return {'success': False, 'message': 'Powerup no válido'}

        # Remove from inventory
        self.state.inventory.remove(powerup_id)

        # Apply effect
        message = ""
        if powerup_id == 'health_potion':
            heal = powerup['effect']['heal']
            self.state.player.hp = min(self.state.player.max_hp, self.state.player.hp + heal)
            message = f"Te curaste {heal} HP"

        elif powerup_id == 'shield':
            shield = powerup['effect']['shield']
            self.state.player.shield += shield
            message = f"Ganaste {shield} de escudo"

        elif powerup_id == 'double_damage':
            duration = powerup['effect']['duration']
            self.state.player.damage_boost = 2.0
            self.state.active_powerups['double_damage'] = duration
            message = f"¡Daño x2 por {duration} turnos!"

        elif powerup_id == 'lucky_coin':
            duration = powerup['effect']['duration']
            self.state.player.score_boost = 1.5
            self.state.active_powerups['lucky_coin'] = duration
            message = f"¡Score x1.5 por {duration} turnos!"

        return {
            'success': True,
            'message': message,
            'powerup': powerup_id
        }

    def save_game(self, save_name: str) -> int:
        """Save the current game state"""
        save_id = save_manager.create_save(
            deck_id=self.deck_id,
            save_name=save_name,
            player_hp=self.state.player.hp,
            player_max_hp=self.state.player.max_hp,
            player_level=self.state.player.level,
            current_encounter=self.state.current_encounter,
            score=self.state.player.score,
            active_powerups=self.state.active_powerups,
            current_enemy=self.state.current_enemy.to_dict() if self.state.current_enemy else None,
            game_state=self.state.to_dict()
        )

        # Guardar estados de tarjetas
        if self.card_manager:
            states = self.card_manager.get_all_states()
            review_state_manager.bulk_save_states(states)

        logger.info(f"Game saved with ID {save_id}")
        return save_id

    def load_game(self, save_id: int) -> Optional[GameState]:
        """Load a saved game"""
        save_data = save_manager.get_save(save_id)

        if not save_data:
            logger.error(f"Save {save_id} not found")
            return None

        # Reconstruct game state
        game_state = save_data.get('game_state', {})
        self.state = GameState.from_dict(game_state)

        # Reload card manager
        deck = deck_manager.get_deck(self.deck_id)
        cards = card_db_manager.get_all_cards(self.deck_id)
        review_states = review_state_manager.get_all_states(self.deck_id)

        self.card_manager = AnkiCardManager(
            deck_id=self.deck_id,
            deck_name=deck['deck_name'],
            cards=cards
        )

        if review_states:
            self.card_manager.load_states(review_states)

        logger.info(f"Game loaded from save {save_id}")
        return self.state

    def _end_game(self, completed: bool = False):
        """End the game and update final statistics"""
        stats_manager.update_session(
            self.state.session_id,
            cards_reviewed=self.state.cards_reviewed,
            cards_correct=self.state.cards_correct,
            total_score=self.state.player.score,
            highest_encounter=self.state.current_encounter,
            game_completed=completed
        )

        # Guardar todos los estados de tarjetas
        if self.card_manager:
            states = self.card_manager.get_all_states()
            review_state_manager.bulk_save_states(states)

    def get_state(self) -> Optional[GameState]:
        """Get current game state"""
        return self.state

    def get_deck_stats(self) -> Dict:
        """Get statistics for the current deck"""
        if self.card_manager:
            return self.card_manager.get_stats()
        return {}

    def get_progress(self) -> Dict:
        """Get learning progress"""
        if self.card_manager:
            return self.card_manager.get_progress()
        return {}
