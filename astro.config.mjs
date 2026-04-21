// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import { remarkLangBlock } from './src/plugins/remarkLangBlock';

// https://astro.build/config
// output: 'server' 启用 SSR 模式
// 详情页需要在 getStaticPaths 中预渲染
export default defineConfig({
  site: 'https://ai-links.cn',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  markdown: {
    remarkPlugins: [remarkDirective, remarkLangBlock],
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // sql.js 是纯 JS 模块，无需特殊配置
      noExternal: []
    }
  }
});