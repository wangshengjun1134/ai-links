/**
 * 从 agents.json 生成 Agent 详情 Markdown 文件
 * 文件结构：嵌套目录 {uid}/{uid}.md
 * 内容：仅正文，无 frontmatter（数据全部从 JSON 获取）
 * 运行：node scripts/generate-agent-md.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agentsPath = path.join(__dirname, '../src/data/agents.json');
const outputDir = path.join(__dirname, '../src/content/agents');

// 清理字符串中的控制字符
const cleanText = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[\uFFFD]/g, '');
};

// 读取 agents.json
const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf-8'));

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

// 为每个 agent 生成 Markdown 文件（嵌套目录结构）
let generated = 0;
let skipped = 0;

agents.forEach((agent) => {
  try {
    // 嵌套目录结构：agents/{uid}/{uid}.md
    const uidDir = path.join(outputDir, agent.uid);
    if (!fs.existsSync(uidDir)) {
      fs.mkdirSync(uidDir, { recursive: true });
    }
    
    const filename = `${agent.uid}.md`;
    const outputPath = path.join(uidDir, filename);

    // 只写入正文内容，不写 frontmatter
    let markdownContent = agent.detail || '';
    // 将字面的 \n 转换为真正的换行符
    markdownContent = markdownContent.replace(/\\n/g, '\n');
    markdownContent = cleanText(markdownContent);

    // 如果没有详情内容，写入一个占位提示
    if (!markdownContent || markdownContent.trim() === '') {
      markdownContent = `## 【智能体概述】\n\n${agent.introduction || '暂无详情内容'}`;
    }

    fs.writeFileSync(outputPath, markdownContent, 'utf-8');
    generated++;
  } catch (error) {
    console.error(`✗ 生成失败 ${agent.uid}: ${error.message}`);
    skipped++;
  }
});

console.log(`✓ 生成了 ${generated} 个 Agent Markdown 文件到 ${outputDir}`);
if (skipped > 0) {
  console.log(`⚠ 跳过了 ${skipped} 个文件`);
}