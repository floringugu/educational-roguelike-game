// @ts-check
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// NFR-SEC-003: text from users, CSV files or LLMs is always shown as text,
// never parsed as HTML. These patterns are the ways to inject HTML.
const HTML_INJECTION_MESSAGE =
  'Injecting HTML is forbidden (NFR-SEC-003). Render the value as text in JSX instead.';

const htmlInjectionSelectors = [
  {
    // <div dangerouslySetInnerHTML={...} />
    selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
    message: HTML_INJECTION_MESSAGE,
  },
  {
    // { dangerouslySetInnerHTML: ... } passed as props without JSX.
    selector:
      'Property:matches([key.name="dangerouslySetInnerHTML"], [key.value="dangerouslySetInnerHTML"])',
    message: HTML_INJECTION_MESSAGE,
  },
];

const htmlInjectionProperties = ['innerHTML', 'outerHTML', 'insertAdjacentHTML'].map(
  (property) => ({ property, message: HTML_INJECTION_MESSAGE }),
);

// NFR-I18N-001: every visible text comes from the text catalog
// (src/i18n/es.ts). These patterns are the ways to write visible text
// directly in a component.
const TEXT_LITERAL_MESSAGE =
  'Visible text must come from the text catalog in src/i18n/es.ts (NFR-I18N-001).';

// Attributes that the browser shows or reads aloud, plus the props that our
// own components use for visible text.
const VISIBLE_TEXT_ATTRIBUTES =
  '/^(alt|title|placeholder|label|text|description|aria-label|aria-description|aria-placeholder|aria-roledescription|aria-valuetext)$/';

// A string literal with at least one character that is not whitespace, or a
// template literal with some fixed text. Strings made only of spaces are
// allowed because JSX uses them to separate words.
const VISIBLE_STRING =
  ':matches(Literal[value=/\\S/], TemplateLiteral:has(TemplateElement[value.raw=/\\S/]))';

const textLiteralSelectors = [
  {
    // <p>Hola</p>
    selector: 'JSXText[value=/\\S/]',
    message: TEXT_LITERAL_MESSAGE,
  },
  {
    // <p>{'Hola'}</p> or <p>{`Vida: ${hp}`}</p>
    selector: `:matches(JSXElement, JSXFragment) > JSXExpressionContainer > ${VISIBLE_STRING}`,
    message: TEXT_LITERAL_MESSAGE,
  },
  {
    // <p>{won ? 'Victoria' : 'Derrota'}</p> or <p>{name ?? 'Sin nombre'}</p>
    selector: `:matches(JSXElement, JSXFragment) > JSXExpressionContainer :matches(ConditionalExpression, LogicalExpression) > ${VISIBLE_STRING}`,
    message: TEXT_LITERAL_MESSAGE,
  },
  {
    // <img alt="Enemigo" /> or <img alt={'Enemigo'} />
    selector: `JSXAttribute[name.name=${VISIBLE_TEXT_ATTRIBUTES}] ${VISIBLE_STRING}`,
    message: TEXT_LITERAL_MESSAGE,
  },
];

export default defineConfig([
  globalIgnores(['dist', 'coverage']),

  {
    linterOptions: {
      // A disable comment that no longer hides any problem is an error, so
      // old exceptions do not pile up.
      reportUnusedDisableDirectives: 'error',
    },
  },

  js.configs.recommended,
  tseslint.configs.strict,
  eslintComments.recommended,

  // Rules for all the code.
  {
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      // NFR-MNT-001: `any` turns off type checking. It is only allowed with
      // a disable comment that explains why, after `--`:
      //   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- <reason>
      '@typescript-eslint/no-explicit-any': 'error',
      '@eslint-community/eslint-comments/require-description': 'error',

      // NFR-SEC-003. These rules cannot be turned off with a comment.
      'no-restricted-properties': ['error', ...htmlInjectionProperties],
      'no-restricted-syntax': ['error', ...htmlInjectionSelectors],
      '@eslint-community/eslint-comments/no-restricted-disable': [
        'error',
        'no-restricted-properties',
        'no-restricted-syntax',
      ],
    },
  },

  // Browser code.
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // React components.
  {
    files: ['src/**/*.tsx'],
    extends: [reactHooks.configs.flat['recommended-latest']],
    rules: {
      // ESLint keeps only the last setting of a rule, so the HTML injection
      // selectors are repeated here together with the text literal ones.
      'no-restricted-syntax': ['error', ...htmlInjectionSelectors, ...textLiteralSelectors],
    },
  },

  // Tooling and its tests, which run in Node.
  {
    files: ['*.{js,ts}', 'scripts/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
