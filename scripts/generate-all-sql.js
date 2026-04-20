import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据文件路径
const dataDir = path.join(__dirname, '../src/data');
const outputDir = path.join(dataDir, 'sql-dml');

// 转义 SQL 单引号
function escapeSql(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''");
}

// 生成 Prompts SQL
function generatePromptsSql() {
  const promptsPath = path.join(dataDir, 'prompts.json');
  const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));

  console.log(`Prompts: 共 ${prompts.length} 条数据`);

  const statements = [];
  statements.push(`-- Prompts INSERT Script`);
  statements.push(`-- Generated at: ${new Date().toISOString()}`);
  statements.push(`-- Total records: ${prompts.length}`);
  statements.push(``);

  // 插入 prompts 表
  statements.push(`-- 插入提示词数据`);
  for (const p of prompts) {
    const uid = escapeSql(p.id || p.uid || '');
    const slug = escapeSql(p.slug || p.title || '');
    const title = escapeSql(p.title || '');
    const description = escapeSql(p.description || '');
    const websiteUrl = escapeSql(p.websiteUrl || '');
    const icon = escapeSql(p.icon || '');

    statements.push(`INSERT OR REPLACE INTO prompts (uid, slug, title, description, websiteUrl, icon) VALUES ('${uid}', '${slug}', '${title}', '${description}', '${websiteUrl}', '${icon}');`);
  }

  statements.push(``);
  statements.push(`-- 插入提示词指标数据`);
  for (const p of prompts) {
    const uid = escapeSql(p.id || p.uid || '');
    const category = p.category || {};
    const scenario = escapeSql(category.scenario || '');
    const task = escapeSql(category.task || '');
    const modality = escapeSql(category.modality || '');
    const tags = JSON.stringify(p.tags || []);

    statements.push(`INSERT OR REPLACE INTO prompt_metrics (prompt_uid, scenario, task, modality, tags) VALUES ('${uid}', '${scenario}', '${task}', '${modality}', '${escapeSql(tags)}');`);
  }

  fs.writeFileSync(path.join(outputDir, 'prompts.sql'), statements.join('\n'), 'utf-8');
  console.log(`SQL 脚本已生成: ${path.join(outputDir, 'prompts.sql')}`);
}

// 生成 Tools SQL
function generateToolsSql() {
  const toolsPath = path.join(dataDir, 'tools.json');
  const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));

  console.log(`Tools: 共 ${tools.length} 条数据`);

  const statements = [];
  statements.push(`-- Tools INSERT Script`);
  statements.push(`-- Generated at: ${new Date().toISOString()}`);
  statements.push(`-- Total records: ${tools.length}`);
  statements.push(``);

  statements.push(`-- 插入插件数据`);
  for (const t of tools) {
    const uid = escapeSql(t.uid || '');
    const slug = escapeSql(t.slug || t.title || '');
    const title = escapeSql(t.title || '');
    const description = escapeSql(t.description || '');
    const author = escapeSql(t.author || '');
    const icon = escapeSql(t.icon || '');
    const websiteUrl = escapeSql(t.websiteUrl || '');

    statements.push(`INSERT OR REPLACE INTO tools (uid, slug, title, description, author, icon, websiteUrl) VALUES ('${uid}', '${slug}', '${title}', '${description}', '${author}', '${icon}', '${websiteUrl}');`);
  }

  statements.push(``);
  statements.push(`-- 插入插件指标数据`);
  for (const t of tools) {
    const uid = escapeSql(t.uid || '');
    const tags = JSON.stringify(t.tags || []);
    const language = escapeSql(t.language || '');
    const license = escapeSql(t.license || '');
    const func = escapeSql(t.func || '');

    statements.push(`INSERT OR REPLACE INTO tool_metrics (tool_uid, tags, language, license, func) VALUES ('${uid}', '${escapeSql(tags)}', '${language}', '${license}', '${func}');`);
  }

  fs.writeFileSync(path.join(outputDir, 'tools.sql'), statements.join('\n'), 'utf-8');
  console.log(`SQL 脚本已生成: ${path.join(outputDir, 'tools.sql')}`);
}

// 生成 MCP SQL
function generateMcpSql() {
  const mcpPath = path.join(dataDir, 'mcp.json');
  const mcps = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));

  console.log(`MCP: 共 ${mcps.length} 条数据`);

  const statements = [];
  statements.push(`-- MCP INSERT Script`);
  statements.push(`-- Generated at: ${new Date().toISOString()}`);
  statements.push(`-- Total records: ${mcps.length}`);
  statements.push(``);

  statements.push(`-- 插入 MCP 服务数据`);
  for (const m of mcps) {
    const uid = escapeSql(m.uid || '');
    const slug = escapeSql(m.slug || m.title || '');
    const title = escapeSql(m.title || '');
    const description = escapeSql(m.description || '');
    const author = escapeSql(m.author || '');
    const icon = escapeSql(m.icon || '');
    const github_url = escapeSql(m.github_url || '');

    statements.push(`INSERT OR REPLACE INTO mcps (uid, slug, title, description, author, icon, github_url) VALUES ('${uid}', '${slug}', '${title}', '${description}', '${author}', '${icon}', '${github_url}');`);
  }

  statements.push(``);
  statements.push(`-- 插入 MCP 指标数据`);
  for (const m of mcps) {
    const uid = escapeSql(m.uid || '');
    const tags = JSON.stringify(m.tags || []);
    // 从 tags 中提取 serverType、deployment
    const serverType = m.tags?.find(t => t.includes('数据库') || t.includes('文件') || t.includes('搜索') || t.includes('云服务') || t.includes('开发')) || '';
    const deployment = m.tags?.find(t => t.includes('本地部署') || t.includes('混合部署') || t.includes('云端') || t.includes('Docker')) || '';
    const authType = escapeSql(m.authType || '');

    statements.push(`INSERT OR REPLACE INTO mcp_metrics (mcp_uid, tags, serverType, authType, deployment) VALUES ('${uid}', '${escapeSql(tags)}', '${escapeSql(serverType)}', '${authType}', '${escapeSql(deployment)}');`);
  }

  fs.writeFileSync(path.join(outputDir, 'mcps.sql'), statements.join('\n'), 'utf-8');
  console.log(`SQL 脚本已生成: ${path.join(outputDir, 'mcps.sql')}`);
}

// 生成 AIHub SQL
function generateAihubSql() {
  const aihubPath = path.join(dataDir, 'aihub.json');
  const aihubs = JSON.parse(fs.readFileSync(aihubPath, 'utf-8'));

  console.log(`AIHub: 共 ${aihubs.length} 条数据`);

  const statements = [];
  statements.push(`-- AIHub INSERT Script`);
  statements.push(`-- Generated at: ${new Date().toISOString()}`);
  statements.push(`-- Total records: ${aihubs.length}`);
  statements.push(``);

  statements.push(`-- 插入 AIHub 数据`);
  for (const a of aihubs) {
    const uid = escapeSql(a.uid || '');
    const slug = escapeSql(a.slug || '');
    const logo = escapeSql(a.logo || '');
    const aiProductName = escapeSql(a.aiProductName || '');
    const introduction = escapeSql(a.introduction || '');
    const websiteUrl = escapeSql(a.websiteUrl || '');

    statements.push(`INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('${uid}', '${slug}', '${logo}', '${aiProductName}', '${introduction}', '${websiteUrl}');`);
  }

  statements.push(``);
  statements.push(`-- 插入 AIHub 指标数据`);
  for (const a of aihubs) {
    const uid = escapeSql(a.uid || '');
    const productType = JSON.stringify(a.productType || []);
    const tags = JSON.stringify(a.tags || []);

    statements.push(`INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('${uid}', '${escapeSql(productType)}', '${escapeSql(tags)}');`);
  }

  fs.writeFileSync(path.join(outputDir, 'aihub.sql'), statements.join('\n'), 'utf-8');
  console.log(`SQL 脚本已生成: ${path.join(outputDir, 'aihub.sql')}`);
}

// 生成 Article SQL
function generateArticleSql() {
  const articlePath = path.join(dataDir, 'article.json');
  const articles = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));

  console.log(`Article: 共 ${articles.length} 条数据`);

  const statements = [];
  statements.push(`-- Article INSERT Script`);
  statements.push(`-- Generated at: ${new Date().toISOString()}`);
  statements.push(`-- Total records: ${articles.length}`);
  statements.push(``);

  statements.push(`-- 插入文章数据`);
  for (const a of articles) {
    const uid = escapeSql(a.uid || '');
    const slug = escapeSql(a.slug || '');
    const title = escapeSql(a.title || '');
    const titleEn = escapeSql(a.titleEn || '');
    const description = escapeSql(a.description || '');
    const author = escapeSql(a.author || '');
    const category = escapeSql(a.category || '');
    const readTime = escapeSql(a.readTime || '');
    const publishedAt = escapeSql(a.publishedAt || '');
    const websiteUrl = escapeSql(a.websiteUrl || '');

    statements.push(`INSERT OR REPLACE INTO articles (uid, slug, title, titleEn, description, author, category, readTime, publishedAt, websiteUrl) VALUES ('${uid}', '${slug}', '${title}', '${titleEn}', '${description}', '${author}', '${category}', '${readTime}', '${publishedAt}', '${websiteUrl}');`);
  }

  statements.push(``);
  statements.push(`-- 插入文章指标数据`);
  for (const a of articles) {
    const uid = escapeSql(a.uid || '');
    const tags = JSON.stringify(a.tags || []);

    statements.push(`INSERT OR REPLACE INTO article_metrics (article_uid, tags) VALUES ('${uid}', '${escapeSql(tags)}');`);
  }

  fs.writeFileSync(path.join(outputDir, 'articles.sql'), statements.join('\n'), 'utf-8');
  console.log(`SQL 脚本已生成: ${path.join(outputDir, 'articles.sql')}`);
}

// 生成 News SQL
function generateNewsSql() {
  const newsPath = path.join(dataDir, 'news.json');
  const news = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));

  console.log(`News: 共 ${news.length} 条数据`);

  const statements = [];
  statements.push(`-- News INSERT Script`);
  statements.push(`-- Generated at: ${new Date().toISOString()}`);
  statements.push(`-- Total records: ${news.length}`);
  statements.push(``);

  statements.push(`-- 插入新闻数据`);
  for (const n of news) {
    const uid = escapeSql(n.uid || '');
    const slug = escapeSql(n.slug || '');
    const title = escapeSql(n.title || '');
    const category = escapeSql(n.category || '');
    const publishedAt = escapeSql(n.publishedAt || '');
    const context = escapeSql(n.context || '');
    const refUrl = JSON.stringify(n.refUrl || []);

    statements.push(`INSERT OR REPLACE INTO news (uid, slug, title, category, publishedAt, context, refUrl) VALUES ('${uid}', '${slug}', '${title}', '${category}', '${publishedAt}', '${context}', '${escapeSql(refUrl)}');`);
  }

  fs.writeFileSync(path.join(outputDir, 'news.sql'), statements.join('\n'), 'utf-8');
  console.log(`SQL 脚本已生成: ${path.join(outputDir, 'news.sql')}`);
}

// 执行所有生成函数
console.log('开始生成所有 SQL 脚本...\n');
generatePromptsSql();
generateToolsSql();
generateMcpSql();
generateAihubSql();
generateArticleSql();
generateNewsSql();
console.log('\n所有 SQL 脚本生成完成！');