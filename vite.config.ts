import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { config } from './moire.config';

// The blog's theme, chosen in moire.config.ts. `cyberpunk` was retired; existing configs get noir.
const THEMES = ['receipt', 'noir', 'academic', 'bento', 'pixel', 'classic'];
const requested = config.theme === 'cyberpunk' ? 'noir' : config.theme;
const theme = THEMES.includes(requested) ? requested : 'receipt';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  define: {
    __MOIRE_THEME__: JSON.stringify(theme)
  },
  resolve: {
    alias: {
      // Imported statically by the home page, so the build writes the posts into the HTML:
      // search engines and link previews read them without running any script.
      '$moire-theme': fileURLToPath(new URL(`./src/themes/${theme}/index.svelte`, import.meta.url))
    }
  },
  server: {
    fs: {
      allow: ['.']
    }
  }
});
