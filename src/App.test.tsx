import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { es } from './i18n/es';

describe('App', () => {
  it('shows the screen with the texts from the catalog', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain(es.app.name);
    expect(html).toContain(es.home.tagline);
    expect(html).toContain(es.home.status);
  });
});
