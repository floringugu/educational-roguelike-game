import { useEffect, useId, useRef, useState, type AnimationEvent } from 'react';
import type { CardData } from '../cards/cardData';
import { es } from '../i18n/es';
import type { Question } from './questions';
import './QuestionSheet.css';

// How long a right answer stays on screen, marked in green, before the sheet
// leaves and the card does its effect.
const RIGHT_ANSWER_PAUSE_MILLISECONDS = 700;

type QuestionSheetProps = {
  // The card being played, named at the top of the sheet.
  card: CardData;
  question: Question;
  // The 4 options, already shuffled (FR-ANS-002).
  options: readonly string[];
  // Called once the sheet has left the screen, with whether the answer was
  // right.
  onResolved: (isCorrect: boolean) => void;
};

// The question that a card asks when it is played (FR-CMB-001), on a page of
// an exam that rises from the bottom and covers the hand. The enemy can still
// be seen above it.
//
// - Right answer: the option turns green and, a moment later, the sheet
//   leaves so the effect of the card can be seen.
// - Wrong answer: the option turns red and the right one green. The sheet
//   stays with the citation, which opens with a tap, the button to report the
//   question and the button to go on (FR-ANS-003).
export function QuestionSheet({ card, question, options, onResolved }: QuestionSheetProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const promptId = useId();
  const citationId = useId();
  const promptElement = useRef<HTMLHeadingElement>(null);
  const wrongMarkElement = useRef<HTMLParagraphElement>(null);

  const hasAnswered = chosen !== null;
  const isCorrect = chosen === question.answer;

  // Move the keyboard focus to the question when the sheet opens, so a screen
  // reader reads it (NFR-ACS-001).
  useEffect(() => {
    promptElement.current?.focus();
  }, []);

  useEffect(() => {
    if (!hasAnswered) {
      return;
    }
    if (isCorrect) {
      const timer = window.setTimeout(() => setIsLeaving(true), RIGHT_ANSWER_PAUSE_MILLISECONDS);
      return () => window.clearTimeout(timer);
    }
    // The option that had the focus is now disabled: move the focus to the
    // mark of the teacher, which says what happened.
    wrongMarkElement.current?.focus();
  }, [hasAnswered, isCorrect]);

  function handleAnimationEnd(event: AnimationEvent<HTMLElement>) {
    if (event.animationName === 'question-sheet-leave') {
      onResolved(isCorrect);
    }
  }

  return (
    <div className="question-layer">
      <div className="question-layer__backdrop" />
      <section
        className={sheetClassName(card, isLeaving)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={promptId}
        onAnimationEnd={handleAnimationEnd}
      >
        <p className="question-sheet__card">
          <span>{es.question.label}</span>
          <span className="question-sheet__card-name">{es.cards[card.id].name}</span>
        </p>
        <h2 id={promptId} ref={promptElement} className="question-sheet__prompt" tabIndex={-1}>
          {question.prompt}
        </h2>

        <ol className="question-sheet__options">
          {options.map((option, index) => (
            <li key={option}>
              <button
                type="button"
                className={optionClassName(option, chosen, question.answer)}
                disabled={hasAnswered}
                onClick={() => setChosen(option)}
              >
                <span className="question-option__letter">{es.question.optionLetters[index]}</span>
                <span className="question-option__text">{option}</span>
                {hasAnswered && option === question.answer && (
                  <span className="question-option__tag">{es.question.correctTag}</span>
                )}
                {hasAnswered && option === chosen && !isCorrect && (
                  <span className="question-option__tag">{es.question.yourAnswerTag}</span>
                )}
              </button>
            </li>
          ))}
        </ol>

        {hasAnswered && isCorrect && <p className="question-sheet__mark">{es.question.correctMark}</p>}

        {hasAnswered && !isCorrect && (
          <div className="question-sheet__review">
            <p ref={wrongMarkElement} className="question-sheet__mark" tabIndex={-1}>
              {es.question.wrongMark}
            </p>

            <button
              type="button"
              className="question-sheet__button question-sheet__citation-toggle"
              aria-expanded={isCitationOpen}
              aria-controls={citationId}
              onClick={() => setIsCitationOpen(!isCitationOpen)}
            >
              {isCitationOpen ? es.question.hideCitation : es.question.showCitation}
            </button>
            {/* The text of the citation is shown as text, never as HTML
                (NFR-SEC-003): in H4 it comes from the PDF of the player. */}
            <blockquote id={citationId} className="question-sheet__citation" hidden={!isCitationOpen}>
              <p className="question-sheet__citation-text">{question.citation.text}</p>
              <p className="question-sheet__citation-page">
                {es.question.page} {question.citation.page}
              </p>
            </blockquote>

            <div className="question-sheet__actions">
              {/* It does nothing yet: reporting a question (FR-QST-002)
                  needs the question bank of H2. */}
              <button type="button" className="question-sheet__button">
                {es.question.reportButton}
              </button>
              <button
                type="button"
                className="question-sheet__button question-sheet__button--main"
                onClick={() => setIsLeaving(true)}
              >
                {es.question.continueButton}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// The sheet looks like the card that asks the question: its margin line has
// the color of the type of the card, a crumpled diploma or certificate makes
// a crumpled sheet, and a stained card makes a sheet with the same coffee
// stain (see QuestionSheet.css).
function sheetClassName(card: CardData, isLeaving: boolean): string {
  const classNames = ['question-sheet', `question-sheet--${card.type}`, `question-sheet--${card.edition}`];
  if (card.stain !== undefined) {
    classNames.push(`question-sheet--stain-${card.stain}`);
  }
  if (isLeaving) {
    classNames.push('question-sheet--leaving');
  }
  return classNames.join(' ');
}

// An option is marked once the player has answered: the right one in green,
// the wrong one that was chosen in red.
function optionClassName(option: string, chosen: string | null, answer: string): string {
  if (chosen === null) {
    return 'question-option';
  }
  if (option === answer) {
    return 'question-option question-option--correct';
  }
  if (option === chosen) {
    return 'question-option question-option--wrong';
  }
  return 'question-option';
}
