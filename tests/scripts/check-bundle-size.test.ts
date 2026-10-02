import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import {
  INITIAL_JS_BUDGET_GZIP_BYTES,
  findInitialFiles,
  isWithinBudget,
  measureBundle,
} from '../../scripts/check-bundle-size.ts';

// An index.html like the one that Vite writes in dist/.
const INDEX_HTML = [
  '<!doctype html>',
  '<html lang="es">',
  '  <head>',
  '    <script type="module" crossorigin src="/assets/index-abc.js"></script>',
  '    <link rel="modulepreload" crossorigin href="/assets/vendor-def.js">',
  '    <link rel="stylesheet" crossorigin href="/assets/index-ghi.css">',
  '  </head>',
  '  <body><div id="root"></div></body>',
  '</html>',
].join('\n');

const distDirs: string[] = [];

// Writes a fake dist/ folder in the temporary directory of the system.
function createDist(initialJsBytes: number): string {
  const distDir = mkdtempSync(join(tmpdir(), 'bundle-size-'));
  distDirs.push(distDir);
  mkdirSync(join(distDir, 'assets'));
  writeFileSync(join(distDir, 'index.html'), INDEX_HTML);
  // Random bytes barely compress, so the gzip size stays close to this size.
  writeFileSync(join(distDir, 'assets/index-abc.js'), randomBytes(initialJsBytes));
  writeFileSync(join(distDir, 'assets/vendor-def.js'), 'export {};');
  writeFileSync(join(distDir, 'assets/index-ghi.css'), 'body { margin: 0; }');
  // Loaded later with import(), so it must not count against the budget.
  writeFileSync(join(distDir, 'assets/lazy-jkl.js'), randomBytes(INITIAL_JS_BUDGET_GZIP_BYTES));
  return distDir;
}

afterEach(() => {
  for (const distDir of distDirs.splice(0)) {
    rmSync(distDir, { recursive: true, force: true });
  }
});

describe('findInitialFiles', () => {
  it('finds the scripts, preloads and styles that index.html loads', () => {
    expect(findInitialFiles(INDEX_HTML)).toEqual([
      'assets/index-abc.js',
      'assets/vendor-def.js',
      'assets/index-ghi.css',
    ]);
  });
});

describe('measureBundle', () => {
  it('counts only the initial files against the budget', () => {
    const measurement = measureBundle(createDist(1_000));

    expect(measurement.initialJs.map((file) => file.path)).toEqual([
      'assets/index-abc.js',
      'assets/vendor-def.js',
    ]);
    expect(measurement.initialCss.map((file) => file.path)).toEqual(['assets/index-ghi.css']);
    expect(measurement.allFiles).toHaveLength(5);
    expect(isWithinBudget(measurement)).toBe(true);
  });

  it('fails when the initial JS is over the budget', () => {
    const measurement = measureBundle(createDist(INITIAL_JS_BUDGET_GZIP_BYTES + 10_000));

    expect(isWithinBudget(measurement)).toBe(false);
  });
});
