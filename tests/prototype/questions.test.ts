import { describe, expect, it } from 'vitest';
import {
  TEST_QUESTIONS,
  parseQuestions,
  pickQuestion,
  shuffledOptions,
  type Question,
} from '../../src/prototype/questions.ts';

const validQuestion = {
  id: 'example',
  prompt: '¿Cuántos lados tiene un triángulo?',
  answer: 'Tres',
  distractors: ['Cuatro', 'Cinco', 'Seis'],
  citation: { text: 'Un triángulo es un polígono de tres lados.', page: 12 },
};

// A random source that returns the given numbers in turn, so the order of a
// shuffle can be known in advance.
function sequence(...numbers: number[]): () => number {
  let next = 0;
  return () => {
    const number = numbers[next % numbers.length] as number;
    next += 1;
    return number;
  };
}

describe('the test questions in src/prototype/questions.json (ticket 06)', () => {
  it('has at least 5 questions', () => {
    expect(TEST_QUESTIONS.length).toBeGreaterThanOrEqual(5);
  });

  it('gives every question its citation, with a text and a page (FR-ANS-003)', () => {
    for (const question of TEST_QUESTIONS) {
      expect(question.citation.text, question.id).not.toBe('');
      expect(question.citation.page, question.id).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('parseQuestions', () => {
  it('accepts a valid question', () => {
    expect(parseQuestions([validQuestion])).toEqual([validQuestion]);
  });

  it('rejects something that is not a list', () => {
    expect(() => parseQuestions({ questions: [] })).toThrow();
  });

  it('rejects a question without the right number of distractors', () => {
    expect(() => parseQuestions([{ ...validQuestion, distractors: ['Cuatro', 'Cinco'] }])).toThrow();
    expect(() =>
      parseQuestions([{ ...validQuestion, distractors: ['Cuatro', 'Cinco', 'Seis', 'Siete'] }]),
    ).toThrow();
  });

  it('rejects an empty distractor', () => {
    expect(() => parseQuestions([{ ...validQuestion, distractors: ['Cuatro', ' ', 'Seis'] }])).toThrow();
  });

  it('rejects two equal options, which could not be told apart', () => {
    expect(() => parseQuestions([{ ...validQuestion, distractors: ['Tres', 'Cinco', 'Seis'] }])).toThrow();
  });

  it('rejects a question without a citation or with a page that is not a whole number', () => {
    expect(() => parseQuestions([{ ...validQuestion, citation: undefined }])).toThrow();
    expect(() => parseQuestions([{ ...validQuestion, citation: { text: 'Algo', page: 0 } }])).toThrow();
    expect(() => parseQuestions([{ ...validQuestion, citation: { text: 'Algo', page: 2.5 } }])).toThrow();
  });

  it('rejects two questions with the same id', () => {
    expect(() => parseQuestions([validQuestion, validQuestion])).toThrow(/example/);
  });
});

describe('shuffledOptions (FR-ANS-002)', () => {
  const question = parseQuestions([validQuestion])[0] as Question;

  it('keeps the 4 options, the right one among them', () => {
    const options = shuffledOptions(question);
    expect(options).toHaveLength(4);
    expect([...options].sort()).toEqual(['Cinco', 'Cuatro', 'Seis', 'Tres']);
  });

  it('gives different orders with different random numbers', () => {
    const alwaysFirst = shuffledOptions(question, () => 0);
    const alwaysLast = shuffledOptions(question, () => 0.99);
    expect(alwaysFirst).not.toEqual(alwaysLast);
  });

  it('does not always leave the right answer in the same place', () => {
    const places = new Set<number>();
    for (const first of [0, 0.3, 0.6, 0.99]) {
      places.add(shuffledOptions(question, sequence(first, 0.5, 0.2)).indexOf('Tres'));
    }
    expect(places.size).toBeGreaterThan(1);
  });
});

describe('pickQuestion', () => {
  it('never asks the question that was just asked', () => {
    let previousId: string | null = null;
    for (const number of [0, 0.2, 0.4, 0.6, 0.8, 0.99, 0, 0]) {
      const question = pickQuestion(TEST_QUESTIONS, previousId, () => number);
      expect(question.id).not.toBe(previousId);
      previousId = question.id;
    }
  });

  it('needs at least 2 questions', () => {
    const only = parseQuestions([validQuestion]);
    expect(() => pickQuestion(only, 'example')).toThrow();
  });
});
