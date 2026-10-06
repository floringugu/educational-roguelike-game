import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App, screenFromHistoryState } from './App';
import { CreditsScreen } from './screens/CreditsScreen';
import { LICENSES } from './data/licenses';
import { es } from './i18n/es';

// React writes some characters as HTML entities. Escape a text the same way
// to look for it in the rendered HTML.
function escapeLikeReact(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;');
}

describe('App', () => {
  // The tests run in Node, without a browser: App reads the open screen from
  // the browser history and debug mode from the address, so give it an empty
  // history and an address without query string.
  beforeEach(() => {
    vi.stubGlobal('window', { history: { state: null }, location: { search: '' } });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the screen with the texts from the catalog', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain(es.app.name);
    expect(html).toContain(es.home.tagline);
    expect(html).toContain(es.home.status);
    expect(html).toContain(es.home.creditsButton);
  });

  it('shows the hand of 5 test cards, with their texts from the catalog (FR-VIS-002)', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html.match(/class="card card--/g)).toHaveLength(5);
    expect(html).toContain('data-edition="foil"');
    expect(html).toContain('data-edition="holo"');
    // The numbers of a description are in their own span, so the texts are
    // looked for in the text of the page, without its tags.
    const text = html.replace(/<[^>]*>/g, '');
    for (const texts of Object.values(es.cards)) {
      expect(text).toContain(texts.name);
      expect(text).toContain(texts.description);
    }
    for (const label of Object.values(es.cardTypes)) {
      expect(text).toContain(label);
    }
  });

  it('makes the numbers of a card description stand out', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('Hace <span class="card__number">6</span> de daño.');
  });

  it('opens the screen saved in the browser history', () => {
    vi.stubGlobal('window', { history: { state: { screen: 'credits' } }, location: { search: '' } });

    expect(renderToStaticMarkup(<App />)).toContain(es.credits.title);
  });

  it('draws the swirl background behind the screen (FR-VIS-001)', () => {
    expect(renderToStaticMarkup(<App />)).toContain('data-background="animated"');
  });

  it('shows the frame rate counter only in debug mode', () => {
    expect(renderToStaticMarkup(<App />)).not.toContain('fps-counter');

    vi.stubGlobal('window', { history: { state: null }, location: { search: '?debug' } });
    expect(renderToStaticMarkup(<App />)).toContain('fps-counter');
  });
});

describe('screenFromHistoryState', () => {
  it('reads the screen saved by the app', () => {
    expect(screenFromHistoryState({ screen: 'credits' })).toBe('credits');
  });

  it('falls back to the home screen for anything else', () => {
    expect(screenFromHistoryState(null)).toBe('home');
    expect(screenFromHistoryState({ screen: 'unknown' })).toBe('home');
    expect(screenFromHistoryState('credits')).toBe('home');
  });
});

describe('CreditsScreen (FR-VIS-006)', () => {
  it('credits every entry of the license register', () => {
    const html = renderToStaticMarkup(<CreditsScreen onBack={() => undefined} />);

    expect(html).toContain(es.credits.title);
    for (const entry of LICENSES) {
      expect(html).toContain(escapeLikeReact(entry.name));
      expect(html).toContain(escapeLikeReact(entry.author));
      expect(html).toContain(escapeLikeReact(entry.license));
      expect(html).toContain(escapeLikeReact(entry.attribution));
      if (entry.modification !== undefined) {
        expect(html).toContain(escapeLikeReact(entry.modification));
      }
    }
  });

  it('escapes text like React does', () => {
    const text = `Kenney's "pack" <1> & more`;
    expect(renderToStaticMarkup(<p>{text}</p>)).toBe(`<p>${escapeLikeReact(text)}</p>`);
  });
});
