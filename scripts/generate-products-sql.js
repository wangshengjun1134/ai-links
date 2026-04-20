import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 products.json
const productsPath = path.join(__dirname, '../src/data/products.json');
const outputPath = path.join(__dirname, '../src/data/sql-dml/products.sql');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log(`共有 ${products.length} 条产品数据`);

// 生成 INSERT 语句
const insertStatements = [];

// 先添加清空表的语句（如果需要重新插入）
insertStatements.push(`-- Products INSERT Script`);
insertStatements.push(`-- Generated at: ${new Date().toISOString()}`);
insertStatements.push(`-- Total records: ${products.length}`);
insertStatements.push(``);
insertStatements.push(`-- 插入产品数据`);

for (const product of products) {
  const uid = escapeSql(product.uid || '');
  const slug = escapeSql(product.slug || '');
  const logo = escapeSql(product.logo || '');
  const name = escapeSql(product.aiProductName || '');
  const introduction = escapeSql(product.introduction || '');
  const websiteUrl = escapeSql(product.websiteUrl || '');

  const sql = `INSERT OR REPLACE INTO products (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('${uid}', '${slug}', '${logo}', '${name}', '${introduction}', '${websiteUrl}');`;
  insertStatements.push(sql);
}

// 写入文件
fs.writeFileSync(outputPath, insertStatements.join('\n'), 'utf-8');
console.log(`SQL 脚本已生成: ${outputPath}`);

// 转义 SQL 单引号
function escapeSql(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''");
}