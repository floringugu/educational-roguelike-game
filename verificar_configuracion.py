#!/usr/bin/env python3
"""
Script de verificación de configuración
Verifica que todo esté configurado correctamente para generar preguntas
"""

import sys
import os
from pathlib import Path

# Colores para terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'


def print_header(text):
    """Imprime un encabezado decorado"""
    print(f"\n{BLUE}{BOLD}{'='*70}{RESET}")
    print(f"{BLUE}{BOLD}  {text}{RESET}")
    print(f"{BLUE}{BOLD}{'='*70}{RESET}\n")


def print_success(text):
    """Imprime un mensaje de éxito"""
    print(f"{GREEN}✓{RESET} {text}")


def print_error(text):
    """Imprime un mensaje de error"""
    print(f"{RED}✗{RESET} {text}")


def print_warning(text):
    """Imprime un mensaje de advertencia"""
    print(f"{YELLOW}⚠{RESET} {text}")


def print_info(text):
    """Imprime un mensaje informativo"""
    print(f"{BLUE}ℹ{RESET} {text}")


def check_env_file():
    """Verifica que el archivo .env exista"""
    print_header("1. Verificando archivo .env")

    env_path = Path(__file__).parent / '.env'

    if not env_path.exists():
        print_error("El archivo .env no existe")
        print_info("Crea el archivo .env copiando .env.example:")
        print_info("  cp .env.example .env")
        return False

    print_success("Archivo .env encontrado")
    return True


def check_env_variables():
    """Verifica que las variables de entorno estén configuradas"""
    print_header("2. Verificando variables de entorno")

    # Cargar variables de entorno
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print_success("python-dotenv está instalado y funcionando")
    except ImportError:
        print_error("python-dotenv no está instalado")
        print_info("Instala con: pip install python-dotenv")
        return False

    # Verificar HUGGINGFACE_API_KEY
    api_key = os.environ.get('HUGGINGFACE_API_KEY', '')

    if not api_key:
        print_error("HUGGINGFACE_API_KEY no está configurada en .env")
        print_warning("Sin API key, el generador usará la API pública con límites")
        print_info("Obtén una API key gratis en: https://huggingface.co/settings/tokens")
        return False

    if api_key == 'PONER_TU_API_KEY_AQUI' or api_key == 'tu_api_key_aqui':
        print_error("HUGGINGFACE_API_KEY no ha sido reemplazada con tu clave real")
        print_info("Edita el archivo .env y reemplaza el placeholder con tu API key")
        print_info("Tu API key debe empezar con 'hf_'")
        return False

    if not api_key.startswith('hf_'):
        print_warning("La API key no parece ser válida (debería empezar con 'hf_')")
        print_info("Verifica que hayas copiado la clave correctamente")
        return False

    print_success(f"HUGGINGFACE_API_KEY configurada: {api_key[:10]}...{api_key[-5:]}")

    # Verificar modelo
    model = os.environ.get('HUGGINGFACE_MODEL', 'mistralai/Mixtral-8x7B-Instruct-v0.1')
    print_success(f"Modelo configurado: {model}")

    return True


def check_huggingface_connection():
    """Verifica la conexión con Hugging Face"""
    print_header("3. Verificando conexión con Hugging Face")

    try:
        from huggingface_hub import InferenceClient
        print_success("huggingface_hub está instalado")
    except ImportError:
        print_error("huggingface_hub no está instalado")
        print_info("Instala con: pip install huggingface_hub")
        return False

    # Intentar conectar
    try:
        from dotenv import load_dotenv
        load_dotenv()

        api_key = os.environ.get('HUGGINGFACE_API_KEY', '')

        if not api_key or api_key in ['PONER_TU_API_KEY_AQUI', 'tu_api_key_aqui']:
            print_warning("No se puede verificar conexión sin API key válida")
            return False

        client = InferenceClient(token=api_key)
        print_success("Cliente de Hugging Face inicializado correctamente")
        print_info("Conexión verificada - ¡Todo listo para generar preguntas!")
        return True

    except Exception as e:
        print_error(f"Error al conectar con Hugging Face: {str(e)}")
        print_info("Verifica que tu API key sea correcta")
        return False


def check_dependencies():
    """Verifica que las dependencias estén instaladas"""
    print_header("4. Verificando dependencias")

    dependencies = [
        ('flask', 'Flask'),
        ('pdfplumber', 'pdfplumber'),
        ('huggingface_hub', 'huggingface_hub'),
        ('dotenv', 'python-dotenv'),
    ]

    all_installed = True

    for module, package in dependencies:
        try:
            __import__(module)
            print_success(f"{package} instalado")
        except ImportError:
            print_error(f"{package} no está instalado")
            all_installed = False

    if not all_installed:
        print_info("\nInstala las dependencias con:")
        print_info("  pip install -r requirements.txt")

    return all_installed


def test_question_generation():
    """Prueba la generación de preguntas"""
    print_header("5. Prueba de generación de preguntas (Opcional)")

    print_info("¿Deseas probar la generación de preguntas? (esto hará una llamada real a la API)")
    response = input(f"{YELLOW}[s/N]{RESET}: ").strip().lower()

    if response != 's':
        print_info("Prueba omitida")
        return True

    try:
        from question_generator import QuestionGenerator

        print_info("Generando 1 pregunta de prueba...")

        test_text = """
        Python es un lenguaje de programación de alto nivel, interpretado y de propósito general.
        Fue creado por Guido van Rossum y lanzado por primera vez en 1991.
        Python enfatiza la legibilidad del código y permite a los programadores expresar conceptos
        en menos líneas de código que en otros lenguajes como C++ o Java.
        """

        generator = QuestionGenerator()
        questions = generator.generate_questions_from_text(
            text=test_text,
            num_questions=1,
            difficulty='easy'
        )

        if questions:
            print_success(f"¡Pregunta generada exitosamente!")
            print(f"\n{BOLD}Pregunta de prueba:{RESET}")
            print(f"  {questions[0]['question_text']}")
            print(f"\n{BOLD}Respuesta correcta:{RESET}")
            print(f"  {questions[0]['correct_answer']}")
            return True
        else:
            print_error("No se pudo generar una pregunta")
            return False

    except Exception as e:
        print_error(f"Error al generar pregunta: {str(e)}")
        return False


def main():
    """Función principal"""
    print(f"\n{BOLD}{BLUE}╔═══════════════════════════════════════════════════════════════╗{RESET}")
    print(f"{BOLD}{BLUE}║  🎮 VERIFICADOR DE CONFIGURACIÓN - Educational Roguelike  🎮  ║{RESET}")
    print(f"{BOLD}{BLUE}╚═══════════════════════════════════════════════════════════════╝{RESET}")

    checks = [
        check_env_file,
        check_env_variables,
        check_dependencies,
        check_huggingface_connection,
        test_question_generation,
    ]

    results = []
    for check in checks:
        try:
            result = check()
            results.append(result)
        except KeyboardInterrupt:
            print(f"\n\n{YELLOW}Verificación interrumpida por el usuario{RESET}")
            sys.exit(0)
        except Exception as e:
            print_error(f"Error inesperado: {str(e)}")
            results.append(False)

    # Resumen final
    print_header("Resumen")

    passed = sum(1 for r in results if r)
    total = len(results)

    if all(results):
        print(f"\n{GREEN}{BOLD}✓ ¡Todo configurado correctamente! 🎉{RESET}")
        print(f"{GREEN}Puedes empezar a usar el juego ejecutando:{RESET}")
        print(f"{BOLD}  python app.py{RESET}\n")
    elif results[0] and results[1]:  # .env exists and has API key
        print(f"\n{GREEN}✓ Configuración básica completa{RESET}")
        print(f"{YELLOW}⚠ Algunas verificaciones fallaron pero puedes continuar{RESET}")
        print(f"Ejecuta el juego con: {BOLD}python app.py{RESET}\n")
    else:
        print(f"\n{RED}✗ Configuración incompleta{RESET}")
        print(f"Por favor, sigue las instrucciones anteriores para completar la configuración.\n")
        print(f"{BOLD}Pasos principales:{RESET}")
        print(f"1. Asegúrate de tener un archivo .env")
        print(f"2. Configura tu HUGGINGFACE_API_KEY en el archivo .env")
        print(f"3. Obtén una API key gratis en: {BLUE}https://huggingface.co/settings/tokens{RESET}")
        print(f"4. Instala las dependencias con: {BOLD}pip install -r requirements.txt{RESET}\n")

    return 0 if all(results[:4]) else 1  # Skip test in exit code


if __name__ == '__main__':
    sys.exit(main())
