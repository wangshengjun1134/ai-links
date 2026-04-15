// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import { remarkLangBlock } from './src/plugins/remarkLangBlock';

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkDirective, remarkLangBlock],
  },
  vite: {
    plugins: [tailwindcss()]
  }
});