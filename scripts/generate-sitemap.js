/**
 * 生成 sitemap.xml
 * 自动扫描所有页面并生成搜索引擎友好的站点地图
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const siteUrl = 'https://ai-links.cn';

// 静态页面路由
const staticPages = [
  '',
  '/products',
  '/agents',
  '/skills/prompts',
  '/skills/mcp',
  '/skills/tools',
  '/aihub',
  '/article',
  '/news',
];

// 从 JSON 数据文件生成动态页面
function generateProductPages() {
  const data = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/products.json'), 'utf-8'));
  return data.map(p => `/product/${p.uid}`);
}

function generateAgentPages() {
  const data = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/agents.json'), 'utf-8'));
  return data.map(a => `/agent/${a.uid}`);
}

function generatePromptPages() {
  const data = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/prompts.json'), 'utf-8'));
  return data.map(p => `/skills/prompts/${p.uid}`);
}

function generateMcpPages() {
  const data = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/mcp.json'), 'utf-8'));
  return data.map(m => `/skills/mcps/${m.uid}`);
}

function generateArticlePages() {
  const articles = [];
  const contentDir = path.join(rootDir, 'src/content/article');
  
  if (fs.existsSync(contentDir)) {
    const categories = fs.readdirSync(contentDir);
    categories.forEach(cat => {
      const catPath = path.join(contentDir, cat);
      if (fs.statSync(catPath).isDirectory()) {
        const files = fs.readdirSync(catPath);
        files.forEach(file => {
          if (file.endsWith('.md')) {
            articles.push(`/article/${cat}/${file.replace('.md', '')}`);
          }
        });
      }
    });
  }
  
  return articles;
}

function generateNewsPages() {
  const data = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/news.json'), 'utf-8'));
  return data.map(n => `/news/${n.id}`);
}

// 生成 sitemap
function generateSitemap() {
  const allPages = [
    ...staticPages,
    ...generateProductPages(),
    ...generateAgentPages(),
    ...generatePromptPages(),
    ...generateMcpPages(),
    ...generateArticlePages(),
    ...generateNewsPages(),
  ];

  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  allPages.forEach(page => {
    const url = `${siteUrl}${page}`;
    const priority = page === '' ? 1.0 : page.startsWith('/product') || page.startsWith('/agent') ? 0.8 : 0.7;
    const changefreq = page === '' ? 'daily' : page.startsWith('/news') ? 'daily' : 'weekly';
    
    xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>
`;
  });

  xml += `</urlset>
`;

  const outputPath = path.join(rootDir, 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');
  
  console.log(`✅ Sitemap generated: ${allPages.length} pages`);
  console.log(`📍 Output: ${outputPath}`);
}

generateSitemap();
