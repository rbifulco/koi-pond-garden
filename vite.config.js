import { defineConfig } from 'vite';
import { copyFileSync } from 'node:fs';

export default defineConfig({
  base: '/koi-pond-garden/',
  build: {
    rollupOptions: { input: ['index.html', 'koi-pond.html'] },
  },
  plugins: [{
    name: 'copy-static-pond-assets',
    closeBundle() {
      for (const name of ['demo.gif', 'og-image.jpg', 'screenshot.jpg', '.nojekyll']) {
        copyFileSync(name, `dist/${name}`);
      }
    },
  }],
});
