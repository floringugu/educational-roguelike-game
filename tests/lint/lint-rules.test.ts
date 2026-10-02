import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// These tests run the project's real ESLint configuration on small pieces of
// code, to prove that the quality rules of the project really fail when they
// have to: NFR-MNT-001 (`any`), NFR-I18N-001 (text literals) and NFR-SEC-003
// (HTML injection).

const projectRoot = fileURLToPath(new URL('../..', import.meta.url));
const eslint = new ESLint({ cwd: projectRoot });

// The code is never written to disk. The file path only tells ESLint which
// part of the configuration applies, so it must look like a real file.
const COMPONENT_FILE = 'src/screens/Example.tsx';
const SCRIPT_FILE = 'src/example.ts';

type Problem = { ruleId: string | null; message: string };

async function lint(code: string, filePath: string): Promise<Problem[]> {
  const results = await eslint.lintText(code, { filePath });
  const messages = results[0]?.messages ?? [];
  return messages.map((message) => ({ ruleId: message.ruleId, message: message.message }));
}

describe('NFR-MNT-001: `any` needs a comment that justifies it', () => {
  it('fails with an `any` without a comment', async () => {
    const problems = await lint('export function parse(value: any) { return value; }\n', SCRIPT_FILE);

    expect(problems.map((problem) => problem.ruleId)).toEqual(['@typescript-eslint/no-explicit-any']);
  });

  it('fails with a disable comment that does not say why', async () => {
    const code = [
      '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
      'export function parse(value: any) { return value; }',
      '',
    ].join('\n');

    const problems = await lint(code, SCRIPT_FILE);

    expect(problems.map((problem) => problem.ruleId)).toEqual([
      '@eslint-community/eslint-comments/require-description',
    ]);
  });

  it('passes with a disable comment that says why', async () => {
    const code = [
      '// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the library has no types',
      'export function parse(value: any) { return value; }',
      '',
    ].join('\n');

    expect(await lint(code, SCRIPT_FILE)).toEqual([]);
  });
});

describe('NFR-I18N-001: no visible text literals in components', () => {
  const failingCases = [
    { name: 'text written in JSX', jsx: '<p>Hola</p>' },
    { name: 'a string in braces', jsx: "<p>{'Hola'}</p>" },
    { name: 'a template literal', jsx: '<p>{`Vida: ${hp}`}</p>' },
    { name: 'a string in a condition', jsx: "<p>{hp > 0 ? 'Vivo' : 'Muerto'}</p>" },
    { name: 'a string as a fallback', jsx: "<p>{name ?? 'Sin nombre'}</p>" },
    { name: 'a visible attribute', jsx: '<img src={src} alt="Enemigo" />' },
    { name: 'an aria label in braces', jsx: "<button aria-label={'Cerrar'} />" },
  ];

  for (const failingCase of failingCases) {
    it(`fails with ${failingCase.name}`, async () => {
      const code = `export function Example() { return ${failingCase.jsx}; }\n`;

      const problems = await lint(code, COMPONENT_FILE);

      // A condition with two strings gives one problem per string.
      expect(problems.length).toBeGreaterThan(0);
      for (const problem of problems) {
        expect(problem.ruleId).toBe('no-restricted-syntax');
        expect(problem.message).toContain('NFR-I18N-001');
      }
    });
  }

  it('passes with texts from the catalog and non visible attributes', async () => {
    const code = [
      "import { es } from '../i18n/es';",
      'export function Example() {',
      '  return (',
      '    <main className="home-screen" data-screen={`home`}>',
      '      <h1>{es.app.name}</h1> <p>{es.home.tagline}</p>',
      '    </main>',
      '  );',
      '}',
      '',
    ].join('\n');

    expect(await lint(code, COMPONENT_FILE)).toEqual([]);
  });
});

describe('NFR-SEC-003: no HTML injection', () => {
  const failingCases = [
    {
      name: 'dangerouslySetInnerHTML in JSX',
      file: COMPONENT_FILE,
      code: 'export function Example() { return <div dangerouslySetInnerHTML={{ __html: html }} />; }\n',
      ruleId: 'no-restricted-syntax',
    },
    {
      name: 'dangerouslySetInnerHTML in a props object',
      file: SCRIPT_FILE,
      code: 'export const props = { dangerouslySetInnerHTML: { __html: html } };\n',
      ruleId: 'no-restricted-syntax',
    },
    {
      name: 'an assignment to innerHTML',
      file: SCRIPT_FILE,
      code: 'export function show(element: HTMLElement, html: string) { element.innerHTML = html; }\n',
      ruleId: 'no-restricted-properties',
    },
    {
      name: 'an assignment to outerHTML',
      file: SCRIPT_FILE,
      code: 'export function show(element: HTMLElement, html: string) { element.outerHTML = html; }\n',
      ruleId: 'no-restricted-properties',
    },
    {
      name: 'a call to insertAdjacentHTML',
      file: SCRIPT_FILE,
      code: "export function show(element: HTMLElement, html: string) { element.insertAdjacentHTML('beforeend', html); }\n",
      ruleId: 'no-restricted-properties',
    },
  ];

  for (const failingCase of failingCases) {
    it(`fails with ${failingCase.name}`, async () => {
      const problems = await lint(failingCase.code, failingCase.file);

      expect(problems).toHaveLength(1);
      expect(problems[0]?.ruleId).toBe(failingCase.ruleId);
      expect(problems[0]?.message).toContain('NFR-SEC-003');
    });
  }

  it('fails when a comment tries to turn the rule off', async () => {
    const code = [
      'export function show(element: HTMLElement, html: string) {',
      '  // eslint-disable-next-line no-restricted-properties -- trusted HTML',
      '  element.innerHTML = html;',
      '}',
      '',
    ].join('\n');

    const problems = await lint(code, SCRIPT_FILE);

    expect(problems.map((problem) => problem.ruleId)).toEqual([
      '@eslint-community/eslint-comments/no-restricted-disable',
    ]);
  });

  it('passes when the value is shown as text', async () => {
    const code = [
      'export function show(element: HTMLElement, text: string) { element.textContent = text; }',
      'export function Example({ text }: { text: string }) { return <p>{text}</p>; }',
      '',
    ].join('\n');

    expect(await lint(code, COMPONENT_FILE)).toEqual([]);
  });
});
