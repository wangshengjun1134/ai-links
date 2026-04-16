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

// 注意：不再清空目录，保留已有内容的 Markdown 文件
// 只有当 JSON 中有新的 detail 数据时才会重新生成

// 为每个产品生成 Markdown 文件（嵌套目录结构）
// 注意：如果 detail 字段不存在且文件已存在，则跳过生成（保留已有内容）
let generated = 0;
let skipped = 0;
let preserved = 0;

products.forEach((product) => {
  try {
    // 嵌套目录结构：products/{uid}/{uid}.md
    const uidDir = path.join(outputDir, product.uid);
    if (!fs.existsSync(uidDir)) {
      fs.mkdirSync(uidDir, { recursive: true });
    }

    const filename = `${product.uid}.md`;
    const outputPath = path.join(uidDir, filename);

    // 检查是否已有内容
    const hasExistingContent = fs.existsSync(outputPath) && fs.statSync(outputPath).size > 100;
    const hasDetail = product.detail && product.detail.trim() !== '';

    // 如果文件已存在且有实质内容，且没有新的 detail 数据，则保留原文件
    if (hasExistingContent && !hasDetail) {
      preserved++;
      return;
    }

    // 只写入正文内容，不写 frontmatter
    let markdownContent = hasDetail ? cleanText(product.detail) : '';
    
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
if (preserved > 0) {
  console.log(`✓ 保留了 ${preserved} 个已有内容的文件（无 detail 数据源）`);
}
if (skipped > 0) {
  console.log(`⚠ 跳过了 ${skipped} 个文件`);
}