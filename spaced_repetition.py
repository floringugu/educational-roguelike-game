"""
spaced_repetition.py - Algoritmo de Repetición Espaciada

Implementa un sistema de repetición espaciada simplificado basado en el algoritmo SM-2
(SuperMemo 2), adaptado para el juego roguelike educativo.

El algoritmo ajusta los intervalos de revisión según la dificultad reportada por el usuario:
- AGAIN (Otra vez): No recordó, revisar inmediatamente
- HARD (Difícil): Recordó con dificultad, revisar pronto
- GOOD (Bien): Recordó correctamente, intervalo estándar
- EASY (Fácil): Recordó fácilmente, intervalo largo

Autor: Educational Roguelike Game
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, Optional
from dataclasses import dataclass, field
import math


class ResponseQuality(Enum):
    """Calidad de la respuesta del usuario (sistema Anki)"""
    AGAIN = 1  # No recordó la respuesta
    HARD = 2   # Recordó con mucha dificultad
    GOOD = 3   # Recordó correctamente
    EASY = 4   # Recordó muy fácilmente

    @classmethod
    def from_string(cls, value: str) -> 'ResponseQuality':
        """Convierte string a ResponseQuality"""
        mapping = {
            'again': cls.AGAIN,
            'hard': cls.HARD,
            'good': cls.GOOD,
            'easy': cls.EASY
        }
        return mapping.get(value.lower(), cls.GOOD)

    def get_damage_multiplier(self) -> float:
        """Retorna el multiplicador de daño según la calidad de respuesta"""
        damage_map = {
            ResponseQuality.AGAIN: 0.0,   # 0% - Sin daño
            ResponseQuality.HARD: 0.3,    # 30% - Daño mínimo
            ResponseQuality.GOOD: 1.0,    # 100% - Daño normal
            ResponseQuality.EASY: 2.0     # 200% - Daño crítico
        }
        return damage_map[self]

    def get_damage_range(self, base_damage: int = 20) -> tuple:
        """Retorna el rango de daño [min, max] según la respuesta"""
        multiplier = self.get_damage_multiplier()
        if multiplier == 0:
            return (0, 0)

        min_damage = int(base_damage * multiplier * 0.8)
        max_damage = int(base_damage * multiplier * 1.2)
        return (min_damage, max_damage)


@dataclass
class CardReviewState:
    """Estado de revisión de una tarjeta individual"""

    # Identificación
    card_id: int = 0

    # Métricas de repetición espaciada
    ease_factor: float = 2.5  # Factor de facilidad (default SM-2)
    interval: int = 0          # Intervalo actual en días (0 = nueva)
    repetitions: int = 0       # Número de repeticiones consecutivas correctas

    # Fechas
    last_review: Optional[datetime] = None
    next_review: Optional[datetime] = None

    # Estadísticas
    total_reviews: int = 0
    total_correct: int = 0     # Respuestas GOOD o EASY
    total_incorrect: int = 0   # Respuestas AGAIN
    total_hard: int = 0        # Respuestas HARD

    # Estado actual
    is_learning: bool = True   # True si está en fase de aprendizaje
    is_lapsed: bool = False    # True si falló después de aprender

    # Metadata
    last_response: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def get_accuracy(self) -> float:
        """Calcula el porcentaje de aciertos"""
        if self.total_reviews == 0:
            return 0.0
        return (self.total_correct / self.total_reviews) * 100

    def get_difficulty_level(self) -> str:
        """Retorna el nivel de dificultad percibida de la tarjeta"""
        if self.total_reviews < 3:
            return "Nueva"

        accuracy = self.get_accuracy()
        if accuracy >= 80:
            return "Fácil"
        elif accuracy >= 60:
            return "Normal"
        elif accuracy >= 40:
            return "Difícil"
        else:
            return "Muy Difícil"

    def is_due(self) -> bool:
        """Verifica si la tarjeta necesita revisión"""
        if self.next_review is None:
            return True
        return datetime.now() >= self.next_review

    def to_dict(self) -> Dict:
        """Convierte el estado a diccionario para serialización"""
        return {
            'card_id': self.card_id,
            'ease_factor': self.ease_factor,
            'interval': self.interval,
            'repetitions': self.repetitions,
            'last_review': self.last_review.isoformat() if self.last_review else None,
            'next_review': self.next_review.isoformat() if self.next_review else None,
            'total_reviews': self.total_reviews,
            'total_correct': self.total_correct,
            'total_incorrect': self.total_incorrect,
            'total_hard': self.total_hard,
            'is_learning': self.is_learning,
            'is_lapsed': self.is_lapsed,
            'last_response': self.last_response,
            'accuracy': self.get_accuracy(),
            'difficulty': self.get_difficulty_level()
        }


class SpacedRepetitionEngine:
    """Motor de repetición espaciada (algoritmo SM-2 simplificado)"""

    def __init__(self):
        # Configuración del algoritmo
        self.min_ease_factor = 1.3
        self.max_ease_factor = 3.5
        self.ease_bonus = 0.15        # Bonus para EASY
        self.ease_penalty = 0.15      # Penalty para HARD
        self.ease_hard_penalty = 0.20  # Penalty extra para AGAIN

        # Intervalos iniciales (en minutos para el juego)
        self.initial_learning_intervals = [1, 10]  # 1 min, 10 min
        self.graduating_interval = 1  # 1 día al "graduarse"
        self.easy_interval = 4        # 4 días para EASY en tarjeta nueva

        # Multiplicadores de intervalo
        self.hard_multiplier = 1.2    # HARD aumenta 1.2x
        self.good_multiplier_base = 2.5  # GOOD aumenta según ease_factor
        self.easy_bonus = 1.3         # EASY añade 30% extra

    def review_card(self, state: CardReviewState, response: ResponseQuality) -> CardReviewState:
        """
        Procesa una revisión de tarjeta y actualiza su estado

        Args:
            state: Estado actual de la tarjeta
            response: Calidad de la respuesta del usuario

        Returns:
            CardReviewState actualizado
        """
        now = datetime.now()

        # Actualizar estadísticas
        state.total_reviews += 1
        state.last_review = now
        state.last_response = response.name
        state.updated_at = now

        # Procesar según tipo de respuesta
        if response == ResponseQuality.AGAIN:
            state = self._process_again(state)
        elif response == ResponseQuality.HARD:
            state = self._process_hard(state)
        elif response == ResponseQuality.GOOD:
            state = self._process_good(state)
        elif response == ResponseQuality.EASY:
            state = self._process_easy(state)

        return state

    def _process_again(self, state: CardReviewState) -> CardReviewState:
        """Procesa respuesta AGAIN (no recordó)"""
        state.total_incorrect += 1

        # Resetear progreso
        state.repetitions = 0
        state.is_learning = True
        state.is_lapsed = not state.is_learning  # Marcar como lapsed si ya había aprendido

        # Reducir ease factor
        state.ease_factor = max(
            self.min_ease_factor,
            state.ease_factor - self.ease_hard_penalty
        )

        # Volver al primer paso de aprendizaje
        state.interval = 0
        state.next_review = datetime.now() + timedelta(minutes=self.initial_learning_intervals[0])

        return state

    def _process_hard(self, state: CardReviewState) -> CardReviewState:
        """Procesa respuesta HARD (recordó con dificultad)"""
        state.total_hard += 1

        # Reducir ease factor (menos que AGAIN)
        state.ease_factor = max(
            self.min_ease_factor,
            state.ease_factor - self.ease_penalty
        )

        if state.is_learning:
            # En fase de aprendizaje: avanzar al siguiente paso
            if state.repetitions < len(self.initial_learning_intervals):
                state.repetitions += 1
                interval_minutes = self.initial_learning_intervals[min(state.repetitions, len(self.initial_learning_intervals) - 1)]
                state.next_review = datetime.now() + timedelta(minutes=interval_minutes)
            else:
                # Graduar pero con intervalo reducido
                state.is_learning = False
                state.interval = max(1, int(self.graduating_interval * 0.8))
                state.next_review = datetime.now() + timedelta(days=state.interval)
        else:
            # Ya aprendida: aumentar intervalo moderadamente
            state.repetitions += 1
            state.interval = max(1, int(state.interval * self.hard_multiplier))
            state.next_review = datetime.now() + timedelta(days=state.interval)

        return state

    def _process_good(self, state: CardReviewState) -> CardReviewState:
        """Procesa respuesta GOOD (recordó correctamente)"""
        state.total_correct += 1

        if state.is_learning:
            # En fase de aprendizaje: avanzar
            state.repetitions += 1

            if state.repetitions >= len(self.initial_learning_intervals):
                # Graduar la tarjeta
                state.is_learning = False
                state.is_lapsed = False
                state.interval = self.graduating_interval
                state.next_review = datetime.now() + timedelta(days=state.interval)
            else:
                # Siguiente paso de aprendizaje
                interval_minutes = self.initial_learning_intervals[state.repetitions]
                state.next_review = datetime.now() + timedelta(minutes=interval_minutes)
        else:
            # Ya aprendida: aplicar algoritmo SM-2
            state.repetitions += 1

            if state.repetitions == 1:
                state.interval = 1
            elif state.repetitions == 2:
                state.interval = 6
            else:
                state.interval = int(state.interval * state.ease_factor)

            state.next_review = datetime.now() + timedelta(days=state.interval)

        return state

    def _process_easy(self, state: CardReviewState) -> CardReviewState:
        """Procesa respuesta EASY (recordó fácilmente)"""
        state.total_correct += 1

        # Aumentar ease factor
        state.ease_factor = min(
            self.max_ease_factor,
            state.ease_factor + self.ease_bonus
        )

        if state.is_learning:
            # Graduar inmediatamente con intervalo largo
            state.is_learning = False
            state.is_lapsed = False
            state.repetitions = 1
            state.interval = self.easy_interval
            state.next_review = datetime.now() + timedelta(days=state.interval)
        else:
            # Ya aprendida: aumentar agresivamente
            state.repetitions += 1

            if state.repetitions == 1:
                state.interval = self.easy_interval
            else:
                state.interval = int(state.interval * state.ease_factor * self.easy_bonus)

            state.next_review = datetime.now() + timedelta(days=state.interval)

        return state

    def get_card_priority(self, state: CardReviewState) -> float:
        """
        Calcula la prioridad de revisión de una tarjeta (mayor = más urgente)

        Args:
            state: Estado de la tarjeta

        Returns:
            float: Prioridad (0-100)
        """
        now = datetime.now()

        # Factor 1: ¿Está vencida?
        if state.next_review and now >= state.next_review:
            # Cuánto tiempo ha pasado desde que venció
            overdue_days = (now - state.next_review).days
            overdue_score = min(50, overdue_days * 5)  # Max 50 puntos
        else:
            overdue_score = 0

        # Factor 2: Tarjetas nuevas tienen prioridad media
        if state.total_reviews == 0:
            new_card_score = 20
        else:
            new_card_score = 0

        # Factor 3: Tarjetas con baja precisión (difíciles)
        accuracy = state.get_accuracy()
        if accuracy < 60 and state.total_reviews >= 3:
            difficulty_score = 20
        else:
            difficulty_score = 0

        # Factor 4: Tarjetas en fase de aprendizaje
        learning_score = 15 if state.is_learning else 0

        # Factor 5: Tarjetas lapsed (falladas después de aprender)
        lapsed_score = 25 if state.is_lapsed else 0

        # Prioridad total
        total_priority = (
            overdue_score +
            new_card_score +
            difficulty_score +
            learning_score +
            lapsed_score
        )

        return min(100, total_priority)


# Función de testing
if __name__ == "__main__":
    print("=== Test del Motor de Repetición Espaciada ===\n")

    engine = SpacedRepetitionEngine()
    state = CardReviewState(card_id=1)

    print(f"Estado inicial:")
    print(f"  Ease Factor: {state.ease_factor}")
    print(f"  Interval: {state.interval} días")
    print(f"  Learning: {state.is_learning}")
    print(f"  Prioridad: {engine.get_card_priority(state):.1f}\n")

    # Simular secuencia de revisiones
    responses = [
        ResponseQuality.GOOD,   # Primera revisión
        ResponseQuality.GOOD,   # Segunda revisión
        ResponseQuality.EASY,   # Tercera revisión
        ResponseQuality.AGAIN,  # Olvidó
        ResponseQuality.HARD,   # Recordó con dificultad
        ResponseQuality.GOOD,   # Recordó bien
    ]

    for i, response in enumerate(responses, 1):
        print(f"--- Revisión {i}: {response.name} ---")
        state = engine.review_card(state, response)

        # Mostrar daño que haría en el juego
        damage_range = response.get_damage_range()
        print(f"  Daño al enemigo: {damage_range[0]}-{damage_range[1]} HP")
        print(f"  Ease Factor: {state.ease_factor:.2f}")
        print(f"  Interval: {state.interval} días")
        print(f"  Repeticiones: {state.repetitions}")
        print(f"  Learning: {state.is_learning}")
        print(f"  Precisión: {state.get_accuracy():.1f}%")
        print(f"  Dificultad: {state.get_difficulty_level()}")
        print(f"  Prioridad: {engine.get_card_priority(state):.1f}")
        print()

    print("=== Estadísticas finales ===")
    stats = state.to_dict()
    for key, value in stats.items():
        print(f"  {key}: {value}")
