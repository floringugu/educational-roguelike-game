import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vitest/config';
import { es } from './src/i18n/es.ts';

// index.html cannot import the text catalog, so its <title> holds a
// placeholder that is filled in here. That way every visible text, the
// browser tab title included, comes from the catalog (NFR-I18N-001).
function appNameInHtml(): Plugin {
  return {
    name: 'app-name-in-html',
    transformIndexHtml(html) {
      return html.replaceAll('%APP_NAME%', es.app.name);
    },
  };
}

export default defineConfig({
  plugins: [react(), appNameInHtml()],
  server: {
    // A fixed port keeps the address that is opened on the phone always the
    // same. If the port is busy, Vite stops instead of picking another one.
    port: 5173,
    strictPort: true,
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.ts'],
  },
});
