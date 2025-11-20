"""
card_manager.py - Gestor de Tarjetas y Estado del Mazo

Gestiona el estado de las tarjetas Anki durante una sesión de juego,
implementando la selección inteligente de tarjetas según prioridad,
seguimiento de estadísticas y coordinación con el motor de repetición espaciada.

Autor: Educational Roguelike Game
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime
import random
from dataclasses import dataclass, field

from spaced_repetition import (
    SpacedRepetitionEngine,
    CardReviewState,
    ResponseQuality
)


@dataclass
class DeckStats:
    """Estadísticas de un mazo de tarjetas"""
    deck_id: int
    deck_name: str
    total_cards: int = 0
    new_cards: int = 0           # Tarjetas nunca vistas
    learning_cards: int = 0      # Tarjetas en fase de aprendizaje
    review_cards: int = 0        # Tarjetas para revisión
    total_reviews: int = 0       # Total de revisiones en esta sesión
    correct_reviews: int = 0     # Revisiones correctas (GOOD/EASY)
    cards_mastered: int = 0      # Tarjetas con >80% precisión

    def get_accuracy(self) -> float:
        """Calcula la precisión de la sesión actual"""
        if self.total_reviews == 0:
            return 0.0
        return (self.correct_reviews / self.total_reviews) * 100

    def get_completion(self) -> float:
        """Calcula el porcentaje de tarjetas vistas"""
        if self.total_cards == 0:
            return 0.0
        seen_cards = self.total_cards - self.new_cards
        return (seen_cards / self.total_cards) * 100

    def to_dict(self) -> Dict:
        """Convierte a diccionario"""
        return {
            'deck_id': self.deck_id,
            'deck_name': self.deck_name,
            'total_cards': self.total_cards,
            'new_cards': self.new_cards,
            'learning_cards': self.learning_cards,
            'review_cards': self.review_cards,
            'total_reviews': self.total_reviews,
            'correct_reviews': self.correct_reviews,
            'cards_mastered': self.cards_mastered,
            'accuracy': self.get_accuracy(),
            'completion': self.get_completion()
        }


class CardSelector:
    """Selecciona la próxima tarjeta a mostrar según prioridades"""

    def __init__(self, new_cards_per_session: int = 20, review_ahead_minutes: int = 20):
        """
        Args:
            new_cards_per_session: Máximo de tarjetas nuevas por sesión
            review_ahead_minutes: Minutos adelante para considerar revisiones
        """
        self.new_cards_per_session = new_cards_per_session
        self.review_ahead_minutes = review_ahead_minutes
        self.new_cards_shown = 0

    def select_next_card(
        self,
        cards: List[Dict],
        states: Dict[int, CardReviewState],
        sr_engine: SpacedRepetitionEngine
    ) -> Optional[Tuple[Dict, CardReviewState]]:
        """
        Selecciona la próxima tarjeta a mostrar

        Prioridad:
        1. Tarjetas en aprendizaje (learning)
        2. Tarjetas vencidas para revisión
        3. Tarjetas nuevas (hasta el límite)
        4. Tarjetas próximas a vencer

        Args:
            cards: Lista de tarjetas disponibles
            states: Diccionario de estados {card_id: CardReviewState}
            sr_engine: Motor de repetición espaciada

        Returns:
            Tuple[Dict, CardReviewState] o None si no hay tarjetas
        """
        if not cards:
            return None

        # Clasificar tarjetas
        learning = []
        due_for_review = []
        new_cards = []
        future_review = []

        for card in cards:
            card_id = card['id']
            state = states.get(card_id, CardReviewState(card_id=card_id))

            if state.is_learning:
                learning.append((card, state))
            elif state.total_reviews == 0:
                new_cards.append((card, state))
            elif state.is_due():
                due_for_review.append((card, state))
            else:
                future_review.append((card, state))

        # 1. Prioridad máxima: Tarjetas en aprendizaje
        if learning:
            # Ordenar por prioridad
            learning.sort(key=lambda x: sr_engine.get_card_priority(x[1]), reverse=True)
            return learning[0]

        # 2. Tarjetas vencidas para revisión
        if due_for_review:
            # Ordenar por prioridad (las más vencidas primero)
            due_for_review.sort(key=lambda x: sr_engine.get_card_priority(x[1]), reverse=True)
            return due_for_review[0]

        # 3. Tarjetas nuevas (respetar límite)
        if new_cards and self.new_cards_shown < self.new_cards_per_session:
            self.new_cards_shown += 1
            # Seleccionar aleatoriamente entre tarjetas nuevas
            return random.choice(new_cards)

        # 4. Si no hay nada urgente, revisar tarjetas futuras
        if future_review:
            # Ordenar por cercanía a la fecha de revisión
            future_review.sort(key=lambda x: x[1].next_review or datetime.max)
            return future_review[0]

        # 5. Si no hay tarjetas disponibles, reciclar las ya revisadas
        # Prioridad: HARD > AGAIN > GOOD (excluir EASY porque ya están dominadas)
        reviewed_cards = []
        for card in cards:
            card_id = card['id']
            state = states.get(card_id)
            if state and state.last_response:
                # Solo incluir HARD, AGAIN, GOOD (no EASY)
                # last_response está en mayúsculas (AGAIN, HARD, GOOD, EASY)
                if state.last_response.upper() in ['HARD', 'AGAIN', 'GOOD']:
                    reviewed_cards.append((card, state))

        if reviewed_cards:
            # Ordenar por prioridad de respuesta
            priority_map = {'HARD': 1, 'AGAIN': 2, 'GOOD': 3}
            reviewed_cards.sort(key=lambda x: priority_map.get(x[1].last_response.upper(), 999))
            return reviewed_cards[0]

        # No hay más tarjetas disponibles
        return None

    def reset_session(self):
        """Reinicia los contadores de sesión"""
        self.new_cards_shown = 0


class CardManager:
    """Gestor principal de tarjetas del mazo"""

    def __init__(self, deck_id: int, deck_name: str, cards: List[Dict]):
        """
        Args:
            deck_id: ID del mazo
            deck_name: Nombre del mazo
            cards: Lista de tarjetas del mazo
        """
        self.deck_id = deck_id
        self.deck_name = deck_name
        self.cards = cards  # Lista de diccionarios con tarjetas
        self.states: Dict[int, CardReviewState] = {}  # Estados de revisión
        self.sr_engine = SpacedRepetitionEngine()
        self.selector = CardSelector()
        self.session_start = datetime.now()
        self.current_card: Optional[Dict] = None
        self.current_state: Optional[CardReviewState] = None

        # Inicializar estados si no existen
        self._initialize_states()

        # Calcular estadísticas iniciales
        self.stats = self._calculate_stats()

    def _initialize_states(self):
        """Inicializa estados para tarjetas sin estado"""
        for card in self.cards:
            card_id = card['id']
            if card_id not in self.states:
                self.states[card_id] = CardReviewState(card_id=card_id)

    def load_states(self, states_data: List[Dict]):
        """
        Carga estados desde la base de datos

        Args:
            states_data: Lista de diccionarios con datos de estado
        """
        for data in states_data:
            card_id = data['card_id']
            state = CardReviewState(
                card_id=card_id,
                ease_factor=data.get('ease_factor', 2.5),
                interval=data.get('interval', 0),
                repetitions=data.get('repetitions', 0),
                last_review=datetime.fromisoformat(data['last_review']) if data.get('last_review') else None,
                next_review=datetime.fromisoformat(data['next_review']) if data.get('next_review') else None,
                total_reviews=data.get('total_reviews', 0),
                total_correct=data.get('total_correct', 0),
                total_incorrect=data.get('total_incorrect', 0),
                total_hard=data.get('total_hard', 0),
                is_learning=data.get('is_learning', True),
                is_lapsed=data.get('is_lapsed', False),
                last_response=data.get('last_response')
            )
            self.states[card_id] = state

    def get_next_card(self) -> Optional[Dict]:
        """
        Obtiene la siguiente tarjeta a mostrar

        Returns:
            Dict con datos de la tarjeta o None si no hay más
        """
        result = self.selector.select_next_card(
            self.cards,
            self.states,
            self.sr_engine
        )

        if result:
            card, state = result
            self.current_card = card
            self.current_state = state
            return {
                'card': card,
                'state': state.to_dict(),
                'is_new': state.total_reviews == 0
            }

        return None

    def answer_card(self, card_id: int, response: str) -> Dict:
        """
        Procesa la respuesta del usuario a una tarjeta

        Args:
            card_id: ID de la tarjeta
            response: Respuesta ('again', 'hard', 'good', 'easy')

        Returns:
            Dict con resultado del procesamiento
        """
        # Convertir respuesta a enum
        response_quality = ResponseQuality.from_string(response)

        # Obtener estado actual
        if card_id not in self.states:
            self.states[card_id] = CardReviewState(card_id=card_id)

        state = self.states[card_id]

        # Procesar revisión
        updated_state = self.sr_engine.review_card(state, response_quality)
        self.states[card_id] = updated_state

        # Actualizar estadísticas
        self.stats = self._calculate_stats()
        if response in ['good', 'easy']:
            self.stats.correct_reviews += 1
        self.stats.total_reviews += 1

        # Calcular daño para el juego
        damage_range = response_quality.get_damage_range()
        actual_damage = random.randint(damage_range[0], damage_range[1])

        return {
            'card_id': card_id,
            'response': response,
            'damage': actual_damage,
            'damage_range': damage_range,
            'updated_state': updated_state.to_dict(),
            'stats': self.stats.to_dict()
        }

    def get_card_by_id(self, card_id: int) -> Optional[Dict]:
        """Obtiene una tarjeta por su ID"""
        for card in self.cards:
            if card['id'] == card_id:
                return card
        return None

    def get_state(self, card_id: int) -> Optional[CardReviewState]:
        """Obtiene el estado de una tarjeta"""
        return self.states.get(card_id)

    def get_all_states(self) -> List[Dict]:
        """Obtiene todos los estados como diccionarios"""
        return [state.to_dict() for state in self.states.values()]

    def _calculate_stats(self) -> DeckStats:
        """Calcula estadísticas actuales del mazo"""
        stats = DeckStats(
            deck_id=self.deck_id,
            deck_name=self.deck_name,
            total_cards=len(self.cards)
        )

        for card in self.cards:
            card_id = card['id']
            state = self.states.get(card_id, CardReviewState(card_id=card_id))

            # Contar por estado
            if state.total_reviews == 0:
                stats.new_cards += 1
            elif state.is_learning:
                stats.learning_cards += 1
            elif state.is_due():
                stats.review_cards += 1

            # Tarjetas dominadas (>80% precisión con al menos 5 revisiones)
            if state.total_reviews >= 5 and state.get_accuracy() >= 80:
                stats.cards_mastered += 1

        return stats

    def get_stats(self) -> Dict:
        """Obtiene estadísticas actuales"""
        return self.stats.to_dict()

    def get_progress(self) -> Dict:
        """Obtiene información de progreso detallada"""
        total = len(self.cards)
        seen = sum(1 for state in self.states.values() if state.total_reviews > 0)
        mastered = sum(
            1 for state in self.states.values()
            if state.total_reviews >= 5 and state.get_accuracy() >= 80
        )

        return {
            'total_cards': total,
            'cards_seen': seen,
            'cards_remaining': total - seen,
            'cards_mastered': mastered,
            'completion_percent': (seen / total * 100) if total > 0 else 0,
            'mastery_percent': (mastered / total * 100) if total > 0 else 0,
            'session_duration_minutes': (datetime.now() - self.session_start).seconds // 60
        }

    def reset_session(self):
        """Reinicia la sesión de estudio"""
        self.selector.reset_session()
        self.session_start = datetime.now()
        self.current_card = None
        self.current_state = None
        self.stats.total_reviews = 0
        self.stats.correct_reviews = 0

    def get_difficult_cards(self, min_reviews: int = 3, max_accuracy: float = 60) -> List[Dict]:
        """
        Obtiene tarjetas con las que el usuario tiene dificultades

        Args:
            min_reviews: Mínimo de revisiones para considerar
            max_accuracy: Máxima precisión para considerar difícil

        Returns:
            Lista de tarjetas difíciles con sus estadísticas
        """
        difficult = []

        for card in self.cards:
            card_id = card['id']
            state = self.states.get(card_id)

            if state and state.total_reviews >= min_reviews:
                accuracy = state.get_accuracy()
                if accuracy <= max_accuracy:
                    difficult.append({
                        'card': card,
                        'accuracy': accuracy,
                        'total_reviews': state.total_reviews,
                        'total_incorrect': state.total_incorrect
                    })

        # Ordenar por precisión (peores primero)
        difficult.sort(key=lambda x: x['accuracy'])

        return difficult


# Función de testing
if __name__ == "__main__":
    print("=== Test del Card Manager ===\n")

    # Crear tarjetas de ejemplo
    sample_cards = [
        {'id': 1, 'front': '¿Qué es Python?', 'back': 'Un lenguaje de programación'},
        {'id': 2, 'front': '¿Qué es HTML?', 'back': 'HyperText Markup Language'},
        {'id': 3, 'front': '¿Capital de Francia?', 'back': 'París'},
        {'id': 4, 'front': '¿Qué es una variable?', 'back': 'Espacio de memoria'},
        {'id': 5, 'front': 'Traduce: Hello', 'back': 'Hola'}
    ]

    # Crear manager
    manager = CardManager(deck_id=1, deck_name="Mazo de Prueba", cards=sample_cards)

    print("Estadísticas iniciales:")
    stats = manager.get_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    print()

    # Simular sesión de estudio
    print("=== Simulación de Sesión de Estudio ===\n")

    for i in range(10):
        # Obtener siguiente tarjeta
        next_card_data = manager.get_next_card()

        if not next_card_data:
            print("No hay más tarjetas para revisar")
            break

        card = next_card_data['card']
        is_new = next_card_data['is_new']

        print(f"Tarjeta {i+1}: {card['front']}")
        print(f"  Respuesta: {card['back']}")
        print(f"  {'(NUEVA)' if is_new else '(REVISIÓN)'}")

        # Simular respuesta aleatoria
        responses = ['again', 'hard', 'good', 'easy']
        weights = [0.1, 0.2, 0.5, 0.2]  # Mayoría responde GOOD
        response = random.choices(responses, weights=weights)[0]

        # Procesar respuesta
        result = manager.answer_card(card['id'], response)

        print(f"  Usuario respondió: {response.upper()}")
        print(f"  Daño al enemigo: {result['damage']} HP")
        print(f"  Precisión actual: {result['stats']['accuracy']:.1f}%")
        print()

    # Estadísticas finales
    print("=== Estadísticas Finales ===")
    final_stats = manager.get_stats()
    for key, value in final_stats.items():
        print(f"  {key}: {value}")

    print("\n=== Progreso ===")
    progress = manager.get_progress()
    for key, value in progress.items():
        print(f"  {key}: {value}")

    print("\n=== Tarjetas Difíciles ===")
    difficult = manager.get_difficult_cards(min_reviews=2, max_accuracy=70)
    for item in difficult[:3]:  # Mostrar top 3
        card = item['card']
        print(f"  {card['front']}: {item['accuracy']:.1f}% ({item['total_incorrect']} fallos)")
