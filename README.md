# Empollatro

**Empollatro** es un roguelike deckbuilder educativo: una PWA pensada ante todo para el móvil.

1. Subes tus apuntes en PDF o tus exportaciones de Anki en CSV.
2. El sistema genera un banco de preguntas verificadas y ligadas a la fuente.
3. Juegas partidas de cartas por turnos en las que una carta solo tiene efecto si aciertas una pregunta.

La repetición espaciada (FSRS) decide qué se pregunta, así que cada partida es también un repaso del temario.

## Estado

En construcción desde cero, empezando por el hito H1 (prototipo visual). Las instrucciones para arrancar el proyecto llegarán con el primer código.

## Documentación

- [SRS](docs/SRS.md): la especificación de requisitos. Es la referencia obligatoria del proyecto.
- [Glosario](docs/GLOSARIO.md): el vocabulario del dominio.
- [ADRs](docs/adr/): las decisiones de arquitectura.
- [Tickets](docs/tickets/): el trabajo de cada hito.
- [Datos de prueba](data/README.md): los CSV y PDF que se usan en los tests y en la evaluación.

## La v0

La versión anterior, un prototipo en Flask con flashcards de Anki, se retiró de la rama de trabajo ([ADR-0001](docs/adr/0001-rehacer-desde-cero.md)). Lo aprendido de ella está en la [auditoría](docs/00-auditoria-estado-actual.md). Su código sigue consultable en la etiqueta `v0-flask`:

```bash
git show v0-flask:static/css/pixel-style.css   # referencia de dirección de arte
git show v0-flask:config.py                    # ideas de enemigos y objetos
```
