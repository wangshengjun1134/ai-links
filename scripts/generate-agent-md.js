/**
 * 从 agents.json 生成 Agent 详情 Markdown 文件
 * 运行：node scripts/generate-agent-md.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agentsPath = path.join(__dirname, '../src/data/agents.json');
const outputDir = path.join(__dirname, '../src/content/agents');

// 检查字符串是否包含有效的 UTF-8 文本（排除控制字符和乱码）
const isValidText = (str) => {
  if (!str) return true;
  const s = String(str);
  // 检查是否包含过多非打印字符
  let controlCharCount = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    // 允许常见的空白字符，但不允许其他控制字符
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
      controlCharCount++;
    }
    // 如果控制字符超过 5 个，认为是乱码
    if (controlCharCount > 5) return false;
  }
  return true;
};

// 清理字符串中的控制字符
const cleanText = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // 移除控制字符
    .replace(/[\uFFFD]/g, ''); // 移除替换字符
};

// 清理 frontmatter 中的特殊字符 - YAML 双引号字符串安全处理
const escapeFrontmatterValue = (str) => {
  if (!str) return '';
  const cleaned = cleanText(str);
  return cleaned
    .replace(/\\/g, '\\\\')  // 先转义反斜杠
    .replace(/"/g, '\\"')    // 转义双引号
    .replace(/\n/g, ' ')     // 换行变空格
    .replace(/\r/g, '')      // 移除回车
    .replace(/\t/g, ' ')     // 制表符变空格
    .replace(/\u2028/g, '')  // 移除行分隔符
    .replace(/\u2029/g, ''); // 移除段分隔符
};

// 读取 agents.json
const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf-8'));

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 先清空目录
const existingFiles = fs.readdirSync(outputDir);
existingFiles.forEach(file => {
  if (file.endsWith('.md')) {
    fs.unlinkSync(path.join(outputDir, file));
  }
});

// 为每个 agent 生成 Markdown 文件
let generated = 0;
let skipped = 0;

agents.forEach((agent) => {
  try {
    // 检查 introduction 是否有效
    if (!isValidText(agent.introduction)) {
      console.log(`⚠ 跳过 ${agent.uid}: introduction 包含无效字符`);
      skipped++;
      return;
    }

    const slug = agent.slug && agent.slug.trim() !== '' ? agent.slug : agent.uid;
    const filename = `${slug}.md`;
    const outputPath = path.join(outputDir, filename);

    // 生成 frontmatter
    const frontmatter = `---
uid: "${escapeFrontmatterValue(agent.uid)}"
aiProductName: "${escapeFrontmatterValue(agent.aiProductName)}"
introduction: "${escapeFrontmatterValue(agent.introduction)}"
company: "${escapeFrontmatterValue(agent.metrics?.company || '未知')}"
country: "${escapeFrontmatterValue(agent.metrics?.country || 'N/A')}"
modelLevel: "${escapeFrontmatterValue(agent.metrics?.modelLevel || 'B-Tier')}"
websiteUrl: "${escapeFrontmatterValue(agent.websiteUrl || '')}"
logo: "${escapeFrontmatterValue(agent.logo || '')}"
---
`;

    // 生成 Markdown 内容（清理控制字符）
    let markdownContent = agent.detail || '';
    markdownContent = cleanText(markdownContent);

    // 写入文件
    fs.writeFileSync(outputPath, frontmatter + markdownContent, 'utf-8');
    generated++;
  } catch (error) {
    console.error(`✗ 生成失败 ${agent.uid}: ${error.message}`);
    skipped++;
  }
});

console.log(`✓ 生成了 ${generated} 个 Agent Markdown 文件到 ${outputDir}`);
if (skipped > 0) {
  console.log(`⚠ 跳过了 ${skipped} 个文件（包含无效数据）`);
}
