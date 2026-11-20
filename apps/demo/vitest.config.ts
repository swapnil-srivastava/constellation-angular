import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The Pega SDK ships ESM that imports dayjs plugins without file extensions,
    // which Node's strict ESM resolver rejects. Inlining lets Vite resolve them.
    server: { deps: { inline: [/@pega\//, /@swapnil-srivastava\//] } }
  }
});
