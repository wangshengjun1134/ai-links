/**
 * 生成 sitemap.xml
 * 自动扫描所有页面并生成搜索引擎友好的站点地图
 * 支持：静态页面 + 动态详情页（从数据库获取）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const siteUrl = 'https://ai-links.cn';

// 静态页面路由（列表页首页）
const staticPages = [
  { path: '', priority: 1.0, changefreq: 'daily' },
  { path: '/products', priority: 0.9, changefreq: 'daily' },
  { path: '/agents', priority: 0.9, changefreq: 'daily' },
  { path: '/skills', priority: 0.8, changefreq: 'weekly' },
  { path: '/skills/prompts', priority: 0.8, changefreq: 'weekly' },
  { path: '/skills/mcp', priority: 0.8, changefreq: 'weekly' },
  { path: '/skills/tools', priority: 0.8, changefreq: 'weekly' },
  { path: '/aihub', priority: 0.7, changefreq: 'weekly' },
  { path: '/article', priority: 0.7, changefreq: 'weekly' },
  { path: '/news', priority: 0.8, changefreq: 'daily' },
];

// 从数据库生成产品详情页
function generateProductPages() {
  const dbPath = path.join(rootDir, 'ai-links-data', 'sqlite_db', 'app.db');
  if (!fs.existsSync(dbPath)) {
    console.error('数据库不存在:', dbPath);
    return [];
  }

  const db = new Database(dbPath);
  const rows = db.prepare('SELECT slug FROM products').all();
  db.close();
  return rows.map(r => ({ path: `/product/${r.slug}`, priority: 0.7, changefreq: 'weekly' }));
}

// 从数据库生成智能体详情页
function generateAgentPages() {
  const dbPath = path.join(rootDir, 'ai-links-data', 'sqlite_db', 'app.db');
  if (!fs.existsSync(dbPath)) {
    console.error('数据库不存在:', dbPath);
    return [];
  }

  const db = new Database(dbPath);
  const rows = db.prepare('SELECT slug FROM agents').all();
  db.close();
  return rows.map(r => ({ path: `/agent/${r.slug}`, priority: 0.7, changefreq: 'weekly' }));
}

// 从数据库生成提示词详情页
function generatePromptPages() {
  const dbPath = path.join(rootDir, 'ai-links-data', 'sqlite_db', 'app.db');
  if (!fs.existsSync(dbPath)) {
    console.error('数据库不存在:', dbPath);
    return [];
  }

  const db = new Database(dbPath);
  const rows = db.prepare('SELECT slug FROM prompts').all();
  db.close();
  return rows.map(r => ({ path: `/skills/prompts/${r.slug}`, priority: 0.6, changefreq: 'weekly' }));
}

// 从数据库生成 MCP 详情页
function generateMcpPages() {
  const dbPath = path.join(rootDir, 'ai-links-data', 'sqlite_db', 'app.db');
  if (!fs.existsSync(dbPath)) {
    console.error('数据库不存在:', dbPath);
    return [];
  }

  const db = new Database(dbPath);
  const rows = db.prepare('SELECT slug FROM mcps').all();
  db.close();
  return rows.map(r => ({ path: `/skills/mcp/${r.slug}`, priority: 0.6, changefreq: 'weekly' }));
}

// 从数据库生成文章详情页
function generateArticlePages() {
  const dbPath = path.join(rootDir, 'ai-links-data', 'sqlite_db', 'app.db');
  if (!fs.existsSync(dbPath)) {
    console.error('数据库不存在:', dbPath);
    return [];
  }

  const db = new Database(dbPath);
  const rows = db.prepare('SELECT slug FROM articles').all();
  db.close();
  return rows.map(r => ({ path: `/article/${r.slug}`, priority: 0.6, changefreq: 'monthly' }));
}

// 从数据库生成新闻详情页
function generateNewsPages() {
  const dbPath = path.join(rootDir, 'ai-links-data', 'sqlite_db', 'app.db');
  if (!fs.existsSync(dbPath)) {
    console.error('数据库不存在:', dbPath);
    return [];
  }

  const db = new Database(dbPath);
  const rows = db.prepare('SELECT slug FROM news').all();
  db.close();
  return rows.map(r => ({ path: `/news/${r.slug}`, priority: 0.5, changefreq: 'daily' }));
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
    const url = `${siteUrl}${page.path}`;
    xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
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