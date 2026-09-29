import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ozzy-barbosa.github.io',
  base: '/proyectcons',
  output: 'static',
  build: { format: 'preserve' },
  publicDir: './.astro-public',
  compressHTML: false,
  devToolbar: { enabled: false },
});
