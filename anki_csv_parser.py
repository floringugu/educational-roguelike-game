"""
anki_csv_parser.py - Parser de archivos CSV en formato Anki

Este módulo procesa archivos CSV exportados desde Anki y los convierte
en tarjetas de estudio para el juego roguelike educativo.

Formatos soportados:
1. Básico: Front,Back
2. Con tags: Front,Back,Tags
3. Con tipo de nota: Front,Back,Tags,NoteType

Autor: Educational Roguelike Game
"""

import csv
import io
import re
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass


@dataclass
class AnkiCard:
    """Representa una tarjeta Anki individual"""
    front: str  # Pregunta o concepto
    back: str   # Respuesta o definición
    tags: List[str] = None  # Tags opcionales para categorización
    note_type: str = "Basic"  # Tipo de nota Anki

    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        # Limpiar y normalizar texto
        self.front = self._clean_text(self.front)
        self.back = self._clean_text(self.back)

    @staticmethod
    def _clean_text(text: str) -> str:
        """Limpia y normaliza el texto de una tarjeta"""
        if not text:
            return ""

        # Remover espacios extras
        text = ' '.join(text.split())

        # Remover HTML básico (Anki a veces exporta con HTML)
        text = re.sub(r'<br\s*/?>', '\n', text)  # Convertir <br> a saltos de línea
        text = re.sub(r'<[^>]+>', '', text)  # Remover otras etiquetas HTML

        # Decodificar entidades HTML comunes
        html_entities = {
            '&nbsp;': ' ',
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'"
        }
        for entity, char in html_entities.items():
            text = text.replace(entity, char)

        return text.strip()

    def to_dict(self) -> Dict:
        """Convierte la tarjeta a diccionario"""
        return {
            'front': self.front,
            'back': self.back,
            'tags': self.tags,
            'note_type': self.note_type
        }


class AnkiCSVParser:
    """Parser para archivos CSV de Anki"""

    def __init__(self):
        self.cards: List[AnkiCard] = []
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def parse_file(self, file_content: bytes, encoding: str = 'utf-8') -> Tuple[bool, str]:
        """
        Parsea un archivo CSV de Anki

        Args:
            file_content: Contenido del archivo CSV en bytes
            encoding: Codificación del archivo (default: utf-8)

        Returns:
            Tuple[bool, str]: (éxito, mensaje)
        """
        self.cards = []
        self.errors = []
        self.warnings = []

        try:
            # Decodificar contenido
            try:
                text_content = file_content.decode(encoding)
            except UnicodeDecodeError:
                # Intentar con latin-1 si utf-8 falla
                try:
                    text_content = file_content.decode('latin-1')
                    self.warnings.append("Archivo decodificado con latin-1 en lugar de UTF-8")
                except Exception as e:
                    return False, f"Error de codificación: {str(e)}"

            # Parsear CSV
            csv_file = io.StringIO(text_content)
            reader = csv.reader(csv_file, delimiter=',', quotechar='"')

            row_count = 0
            valid_cards = 0

            for row_num, row in enumerate(reader, start=1):
                row_count += 1

                # Saltar filas vacías
                if not row or all(cell.strip() == '' for cell in row):
                    continue

                # Parsear tarjeta
                card = self._parse_row(row, row_num)
                if card:
                    self.cards.append(card)
                    valid_cards += 1

            # Validar resultado
            if row_count == 0:
                return False, "El archivo CSV está vacío"

            if valid_cards == 0:
                return False, "No se encontraron tarjetas válidas en el archivo"

            # Mensaje de éxito
            message = f"Se importaron {valid_cards} tarjetas correctamente"
            if self.errors:
                message += f" ({len(self.errors)} errores)"
            if self.warnings:
                message += f" ({len(self.warnings)} advertencias)"

            return True, message

        except Exception as e:
            return False, f"Error al parsear CSV: {str(e)}"

    def _parse_row(self, row: List[str], row_num: int) -> Optional[AnkiCard]:
        """
        Parsea una fila del CSV

        Args:
            row: Fila del CSV
            row_num: Número de fila (para mensajes de error)

        Returns:
            AnkiCard si es válida, None si hay error
        """
        # Validar número mínimo de columnas
        if len(row) < 2:
            self.errors.append(f"Fila {row_num}: Se requieren al menos 2 columnas (Front, Back)")
            return None

        # Extraer campos
        front = row[0].strip()
        back = row[1].strip()

        # Validar campos obligatorios
        if not front:
            self.errors.append(f"Fila {row_num}: El campo 'Front' está vacío")
            return None

        if not back:
            self.errors.append(f"Fila {row_num}: El campo 'Back' está vacío")
            return None

        # Extraer tags opcionales (columna 3)
        tags = []
        if len(row) >= 3 and row[2].strip():
            # Los tags en Anki se separan por espacios
            tags = [tag.strip() for tag in row[2].strip().split() if tag.strip()]

        # Extraer tipo de nota opcional (columna 4)
        note_type = "Basic"
        if len(row) >= 4 and row[3].strip():
            note_type = row[3].strip()

        # Crear tarjeta
        try:
            card = AnkiCard(
                front=front,
                back=back,
                tags=tags,
                note_type=note_type
            )
            return card
        except Exception as e:
            self.errors.append(f"Fila {row_num}: Error al crear tarjeta: {str(e)}")
            return None

    def get_cards(self) -> List[AnkiCard]:
        """Retorna la lista de tarjetas parseadas"""
        return self.cards

    def get_cards_dict(self) -> List[Dict]:
        """Retorna las tarjetas como lista de diccionarios"""
        return [card.to_dict() for card in self.cards]

    def get_stats(self) -> Dict:
        """Retorna estadísticas del parsing"""
        # Contar tags únicos
        all_tags = set()
        for card in self.cards:
            all_tags.update(card.tags)

        # Contar tipos de notas
        note_types = {}
        for card in self.cards:
            note_type = card.note_type
            note_types[note_type] = note_types.get(note_type, 0) + 1

        return {
            'total_cards': len(self.cards),
            'total_tags': len(all_tags),
            'unique_tags': sorted(list(all_tags)),
            'note_types': note_types,
            'errors': len(self.errors),
            'warnings': len(self.warnings)
        }

    def validate_file_content(self, file_content: bytes, max_size_mb: int = 10) -> Tuple[bool, str]:
        """
        Valida el archivo antes de parsearlo

        Args:
            file_content: Contenido del archivo
            max_size_mb: Tamaño máximo permitido en MB

        Returns:
            Tuple[bool, str]: (es_válido, mensaje)
        """
        # Validar tamaño
        size_mb = len(file_content) / (1024 * 1024)
        if size_mb > max_size_mb:
            return False, f"El archivo es demasiado grande ({size_mb:.2f} MB). Máximo: {max_size_mb} MB"

        # Validar que no esté vacío
        if len(file_content) == 0:
            return False, "El archivo está vacío"

        # Intentar detectar si es un CSV válido
        try:
            # Leer primeras líneas
            text_content = file_content.decode('utf-8')
            lines = text_content.split('\n')[:10]  # Primeras 10 líneas

            if not lines:
                return False, "El archivo no contiene líneas de texto"

            # Validar que tenga al menos una línea con comas
            has_comma = any(',' in line for line in lines)
            if not has_comma:
                return False, "El archivo no parece ser un CSV válido (no contiene comas)"

            return True, "Archivo válido"

        except UnicodeDecodeError:
            # Intentar con latin-1
            try:
                text_content = file_content.decode('latin-1')
                return True, "Archivo válido (detectada codificación latin-1)"
            except:
                return False, "No se pudo decodificar el archivo"
        except Exception as e:
            return False, f"Error al validar archivo: {str(e)}"


def create_sample_csv() -> str:
    """Crea un CSV de ejemplo en formato Anki para testing"""
    sample_data = [
        ["¿Qué es Python?", "Un lenguaje de programación de alto nivel", "programación python", "Basic"],
        ["¿Qué significa HTML?", "HyperText Markup Language", "web html", "Basic"],
        ["¿Cuál es la capital de Francia?", "París", "geografía europa", "Basic"],
        ["¿Qué es una variable?", "Un espacio de memoria que almacena un valor", "programación conceptos", "Basic"],
        ["Traduce: Hello", "Hola", "inglés vocabulario", "Basic"]
    ]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerows(sample_data)
    return output.getvalue()


# Función de utilidad para testing
if __name__ == "__main__":
    print("=== Test del Parser de CSV de Anki ===\n")

    # Crear CSV de ejemplo
    sample_csv = create_sample_csv()
    print("CSV de ejemplo:")
    print(sample_csv)
    print("\n" + "="*50 + "\n")

    # Parsear
    parser = AnkiCSVParser()
    success, message = parser.parse_file(sample_csv.encode('utf-8'))

    print(f"Resultado: {'✓ Éxito' if success else '✗ Error'}")
    print(f"Mensaje: {message}\n")

    if success:
        # Mostrar estadísticas
        stats = parser.get_stats()
        print("Estadísticas:")
        print(f"  - Total de tarjetas: {stats['total_cards']}")
        print(f"  - Tags únicos: {stats['total_tags']}")
        print(f"  - Tags: {', '.join(stats['unique_tags'])}")
        print(f"  - Tipos de notas: {stats['note_types']}\n")

        # Mostrar primeras tarjetas
        print("Primeras 3 tarjetas:")
        for i, card in enumerate(parser.get_cards()[:3], 1):
            print(f"\n  Tarjeta {i}:")
            print(f"    Front: {card.front}")
            print(f"    Back: {card.back}")
            print(f"    Tags: {', '.join(card.tags) if card.tags else 'Sin tags'}")

    # Mostrar errores y advertencias
    if parser.errors:
        print("\nErrores:")
        for error in parser.errors:
            print(f"  - {error}")

    if parser.warnings:
        print("\nAdvertencias:")
        for warning in parser.warnings:
            print(f"  - {warning}")
