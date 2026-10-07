import questionsJson from './questions.json';

// Throwaway code of the H1 prototype (ticket 06, ADR-0003): the real
// questions come from the subjects of the player in H2, and their engine is
// written again there. Only the prototype uses it.

// The literal piece of the source that backs a question, with its page
// (the "cita" of the glossary).
export type Citation = {
  text: string;
  page: number;
};

// A multiple-choice question with 4 options (the "pregunta" of the
// glossary). The right answer has its own field, apart from the 3 wrong ones
// (the distractors): when the options are shuffled, the right one cannot get
// lost or swapped.
export type Question = {
  id: string;
  prompt: string;
  answer: string;
  distractors: [string, string, string];
  citation: Citation;
};

// A function that returns a number from 0 (included) to 1 (not included),
// like Math.random. The tests pass their own, to get a known order.
export type RandomSource = () => number;

// Checks that a list read from JSON has the shape of Question and returns it
// with that type, so a mistake in the file fails as soon as it is read, with
// a message that says which question is wrong.
export function parseQuestions(json: unknown): Question[] {
  if (!Array.isArray(json)) {
    throw new Error('The question list must be a JSON array');
  }
  const questions = json.map((item: unknown, index) => parseQuestion(item, `question ${index}`));
  const ids = new Set<string>();
  for (const question of questions) {
    if (ids.has(question.id)) {
      throw new Error(`There are two questions with the id "${question.id}"`);
    }
    ids.add(question.id);
  }
  return questions;
}

function parseQuestion(item: unknown, where: string): Question {
  if (typeof item !== 'object' || item === null) {
    throw new Error(`${where} must be an object`);
  }
  const { id, prompt, answer, distractors, citation } = item as Record<string, unknown>;

  if (!isFilledText(id)) {
    throw new Error(`${where}: the id must be a text`);
  }
  if (!isFilledText(prompt)) {
    throw new Error(`${where} (${id}): the prompt must be a text`);
  }
  if (!isFilledText(answer)) {
    throw new Error(`${where} (${id}): the answer must be a text`);
  }
  if (!Array.isArray(distractors) || distractors.length !== 3) {
    throw new Error(`${where} (${id}): there must be exactly 3 distractors`);
  }
  const [first, second, third]: unknown[] = distractors;
  if (!isFilledText(first) || !isFilledText(second) || !isFilledText(third)) {
    throw new Error(`${where} (${id}): every distractor must be a text`);
  }
  // Two equal options could not be told apart on screen.
  if (new Set([answer, first, second, third]).size !== 4) {
    throw new Error(`${where} (${id}): the 4 options must be different`);
  }
  return {
    id,
    prompt,
    answer,
    distractors: [first, second, third],
    citation: parseCitation(citation, `${where} (${id})`),
  };
}

function parseCitation(citation: unknown, where: string): Citation {
  if (typeof citation !== 'object' || citation === null) {
    throw new Error(`${where}: every question needs its citation`);
  }
  const { text, page } = citation as Record<string, unknown>;
  if (!isFilledText(text)) {
    throw new Error(`${where}: the citation must have a text`);
  }
  if (typeof page !== 'number' || !Number.isInteger(page) || page < 1) {
    throw new Error(`${where}: the page of the citation must be a whole number of 1 or more`);
  }
  return { text, page };
}

function isFilledText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

// The 4 options of a question in a new random order, every time it is shown
// (FR-ANS-002). The right answer is not always in the same place, so the
// player has to read the options.
export function shuffledOptions(question: Question, random: RandomSource = Math.random): string[] {
  const options = [question.answer, ...question.distractors];
  // Fisher-Yates: going from the end, swap each option with one of the
  // options before it (or itself), chosen at random. Every order is equally
  // likely.
  for (let last = options.length - 1; last > 0; last -= 1) {
    const chosen = Math.floor(random() * (last + 1));
    const lastOption = options[last] as string;
    options[last] = options[chosen] as string;
    options[chosen] = lastOption;
  }
  return options;
}

// Chooses a random question for the next card. It is never the one that was
// just asked, the only rule of FR-ANS-006 that this prototype keeps.
export function pickQuestion(
  questions: readonly Question[],
  previousId: string | null,
  random: RandomSource = Math.random,
): Question {
  const candidates = questions.filter((question) => question.id !== previousId);
  const question = candidates[Math.floor(random() * candidates.length)];
  if (question === undefined) {
    throw new Error('There must be at least 2 questions to never repeat one');
  }
  return question;
}

export const TEST_QUESTIONS = parseQuestions(questionsJson);
