/**
 * 从 products.json 生成产品详情 Markdown 文件
 * 文件结构：嵌套目录 {uid}/{uid}.md
 * 内容：仅正文，无 frontmatter（数据全部从 JSON 获取）
 * 运行：node scripts/generate-product-md.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsPath = path.join(__dirname, '../src/data/products.json');
const outputDir = path.join(__dirname, '../src/content/products');

// 清理字符串中的控制字符
const cleanText = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[\uFFFD]/g, '');
};

// 读取 products.json
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 先清空目录（删除所有子目录和文件）
const existingItems = fs.readdirSync(outputDir);
existingItems.forEach(item => {
  const itemPath = path.join(outputDir, item);
  const stat = fs.statSync(itemPath);
  if (stat.isDirectory()) {
    fs.rmSync(itemPath, { recursive: true, force: true });
  } else if (item.endsWith('.md')) {
    fs.unlinkSync(itemPath);
  }
});

// 为每个产品生成 Markdown 文件（嵌套目录结构）
let generated = 0;
let skipped = 0;

products.forEach((product) => {
  try {
    // 嵌套目录结构：products/{uid}/{uid}.md
    const uidDir = path.join(outputDir, product.uid);
    if (!fs.existsSync(uidDir)) {
      fs.mkdirSync(uidDir, { recursive: true });
    }
    
    const filename = `${product.uid}.md`;
    const outputPath = path.join(uidDir, filename);

    // 只写入正文内容，不写 frontmatter
    let markdownContent = product.detail || '';
    markdownContent = cleanText(markdownContent);

    // 如果没有详情内容，写入一个占位提示
    if (!markdownContent || markdownContent.trim() === '') {
      markdownContent = `## 【产品概述】\n\n${product.introduction || '暂无详情内容'}`;
    }

    fs.writeFileSync(outputPath, markdownContent, 'utf-8');
    generated++;
  } catch (error) {
    console.error(`✗ 生成失败 ${product.uid}: ${error.message}`);
    skipped++;
  }
});

console.log(`✓ 生成了 ${generated} 个产品 Markdown 文件到 ${outputDir}`);
if (skipped > 0) {
  console.log(`⚠ 跳过了 ${skipped} 个文件`);
}