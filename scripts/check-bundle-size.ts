// Measures the production build in dist/ and fails when the initial
// JavaScript goes over its budget.
//
// Every runtime dependency adds to what the phone downloads on the first
// visit and to what the PWA keeps stored for offline use (P4, NFR-PRF-004),
// so the size is checked on every pull request.
//
// Usage: `npm run build` and then `npm run bundle-size`.

import { appendFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

// Budget for the JavaScript that index.html loads on start, compressed with
// gzip (prov.). It leaves room for the libraries planned for H2 and will be
// calibrated when NFR-PRF-004 is measured.
export const INITIAL_JS_BUDGET_GZIP_BYTES = 150_000;

export type FileSize = {
  path: string;
  bytes: number;
  gzipBytes: number;
};

export type BundleMeasurement = {
  initialJs: FileSize[];
  initialCss: FileSize[];
  allFiles: FileSize[];
};

// Returns the JS and CSS files that index.html loads on start, as paths
// relative to dist/. Files loaded later with a dynamic import() are not
// listed in index.html, so they do not count against the budget.
export function findInitialFiles(html: string): string[] {
  const assetPattern = /<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+\.(?:js|css))"/g;
  const paths: string[] = [];
  for (const match of html.matchAll(assetPattern)) {
    const url = match[1];
    if (url === undefined || url.startsWith('http')) {
      continue;
    }
    paths.push(url.replace(/^\//, ''));
  }
  return paths;
}

function measureFile(distDir: string, path: string): FileSize {
  const content = readFileSync(join(distDir, path));
  return {
    path,
    bytes: content.length,
    // Level 9 is the strongest gzip compression, close to what a static host
    // serves. Vite prints a slightly bigger gzip size after a build because
    // it compresses with other settings.
    gzipBytes: gzipSync(content, { level: 9 }).length,
  };
}

function listFiles(distDir: string): string[] {
  return readdirSync(distDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(distDir, join(entry.parentPath, entry.name)));
}

export function measureBundle(distDir: string): BundleMeasurement {
  const html = readFileSync(join(distDir, 'index.html'), 'utf8');
  const initialFiles = findInitialFiles(html).map((path) => measureFile(distDir, path));

  return {
    initialJs: initialFiles.filter((file) => file.path.endsWith('.js')),
    initialCss: initialFiles.filter((file) => file.path.endsWith('.css')),
    allFiles: listFiles(distDir).map((path) => measureFile(distDir, path)),
  };
}

function sumBytes(files: FileSize[]): number {
  return files.reduce((total, file) => total + file.bytes, 0);
}

function sumGzipBytes(files: FileSize[]): number {
  return files.reduce((total, file) => total + file.gzipBytes, 0);
}

export function isWithinBudget(measurement: BundleMeasurement): boolean {
  return sumGzipBytes(measurement.initialJs) <= INITIAL_JS_BUDGET_GZIP_BYTES;
}

// 1 kB = 1000 bytes, the same unit that Vite uses.
function formatKilobytes(bytes: number): string {
  return `${(bytes / 1000).toFixed(2)} kB`;
}

// Builds a Markdown table, readable in the terminal and in the summary of the
// GitHub Actions job.
export function formatReport(measurement: BundleMeasurement): string {
  const rows = [
    ['Initial JS', measurement.initialJs, formatKilobytes(INITIAL_JS_BUDGET_GZIP_BYTES)],
    ['Initial CSS', measurement.initialCss, '-'],
    ['All files in dist/ (offline storage)', measurement.allFiles, '-'],
  ] as const;

  const lines = [
    '| Files | Size | Gzip | Gzip budget |',
    '|---|---:|---:|---:|',
    ...rows.map(
      ([label, files, budget]) =>
        `| ${label} | ${formatKilobytes(sumBytes(files))} | ${formatKilobytes(sumGzipBytes(files))} | ${budget} |`,
    ),
  ];
  return lines.join('\n');
}

function main(): void {
  const distDir = 'dist';
  if (!existsSync(join(distDir, 'index.html'))) {
    console.error('dist/index.html not found. Run `npm run build` first.');
    process.exitCode = 1;
    return;
  }

  const measurement = measureBundle(distDir);
  const report = formatReport(measurement);
  console.log(report);

  // In GitHub Actions this file is shown on the page of the job.
  const jobSummaryFile = process.env['GITHUB_STEP_SUMMARY'];
  if (jobSummaryFile !== undefined) {
    appendFileSync(jobSummaryFile, `## Bundle size\n\n${report}\n`);
  }

  if (!isWithinBudget(measurement)) {
    console.error(
      `\nThe initial JS is over its budget of ${formatKilobytes(INITIAL_JS_BUDGET_GZIP_BYTES)} gzip.` +
        ' Remove the runtime dependency that caused it, load it later with import(),' +
        ' or agree on a new budget.',
    );
    process.exitCode = 1;
  }
}

// Only run when called from the command line, not when a test imports it.
if (import.meta.main) {
  main();
}
