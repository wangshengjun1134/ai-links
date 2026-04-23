/**
 * UID 格式统一迁移脚本
 * 
 * 迁移规则：
 * - agent: 20001000 -> AG-000001
 * - aihub: 80001000 -> AH-000001
 * - tools: t-1 -> TO-000001
 * - articles: 10003 -> AR-000001
 * - mcp: 80001000 -> MC-000001
 * - news: 9002000 -> NE-000001
 * - product: 10001000 -> PD-000001
 * - prompts: 30001000 -> PM-000001
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../sqlite_db/app.db');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const CONTENT_DIR = path.resolve(__dirname, '../src/content');

// 类型配置
const TYPE_CONFIGS = {
  agents: {
    prefix: 'AG',
    table: 'agents',
    metricsTable: 'agent_metrics',
    metricsUidField: 'agent_uid',
    iconDir: 'agents-favicons',
    contentDir: 'agents',
    hasContent: true,
    hasIcons: true,
  },
  aihub: {
    prefix: 'AH',
    table: 'aihub',
    metricsTable: 'aihub_metrics',
    metricsUidField: 'aihub_uid',
    iconDir: 'aihub-favicons',
    contentDir: null,
    hasContent: false,
    hasIcons: true,
  },
  tools: {
    prefix: 'TO',
    table: 'tools',
    metricsTable: 'tool_metrics',
    metricsUidField: 'tool_uid',
    iconDir: 'skills/tools',
    contentDir: 'tools',
    hasContent: true,
    hasIcons: false,
  },
  articles: {
    prefix: 'AR',
    table: 'articles',
    metricsTable: 'article_metrics',
    metricsUidField: 'article_uid',
    iconDir: null,
    contentDir: 'article',
    hasContent: true,
    hasIcons: false,
  },
  mcps: {
    prefix: 'MC',
    table: 'mcps',
    metricsTable: 'mcp_metrics',
    metricsUidField: 'mcp_uid',
    iconDir: 'mcp-favicons',
    contentDir: 'mcps',
    hasContent: true,
    hasIcons: true,
  },
  news: {
    prefix: 'NE',
    table: 'news',
    metricsTable: null,
    metricsUidField: null,
    iconDir: null,
    contentDir: null,
    hasContent: false,
    hasIcons: false,
  },
  products: {
    prefix: 'PD',
    table: 'products',
    metricsTable: 'product_metrics',
    metricsUidField: 'product_uid',
    iconDir: 'product-favicons',
    contentDir: 'products',
    hasContent: true,
    hasIcons: true,
  },
  prompts: {
    prefix: 'PM',
    table: 'prompts',
    metricsTable: 'prompt_metrics',
    metricsUidField: 'prompt_uid',
    iconDir: 'prompts',
    contentDir: 'prompts',
    hasContent: true,
    hasIcons: true,
  },
};

// 格式化新 UID
function formatNewUid(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(6, '0')}`;
}

// 主迁移函数
async function migrateType(type: string, config: typeof TYPE_CONFIGS.agents) {
  console.log(`\n========== 开始迁移 ${type} ==========`);
  
  const db = new Database(DB_PATH);
  
  // 禁用外键约束
  db.pragma('foreign_keys = OFF');
  
  // 1. 获取所有 UID 并排序
  const rows = db.prepare(`SELECT uid FROM ${config.table} ORDER BY uid ASC`).all() as { uid: string }[];
  console.log(`找到 ${rows.length} 条记录`);
  
  // 2. 建立 UID 映射
  const uidMap = new Map<string, string>();
  let index = 1;
  
  for (const row of rows) {
    const oldUid = row.uid;
    const newUid = formatNewUid(config.prefix, index);
    uidMap.set(oldUid, newUid);
    console.log(`  ${oldUid} -> ${newUid}`);
    index++;
  }
  
  // 3. 更新数据库
  db.transaction(() => {
    // 先更新 metrics 表（外键）
    if (config.metricsTable && config.metricsUidField) {
      for (const [oldUid, newUid] of uidMap) {
        db.prepare(`UPDATE ${config.metricsTable} SET ${config.metricsUidField} = ? WHERE ${config.metricsUidField} = ?`)
          .run(newUid, oldUid);
      }
      console.log(`已更新 ${config.metricsTable} 表`);
    }
    
    // 再更新主表
    for (const [oldUid, newUid] of uidMap) {
      db.prepare(`UPDATE ${config.table} SET uid = ? WHERE uid = ?`)
        .run(newUid, oldUid);
    }
    console.log(`已更新 ${config.table} 表`);
  })();
  
  // 4. 重命名图标文件
  if (config.hasIcons && config.iconDir) {
    const iconDir = path.join(PUBLIC_DIR, config.iconDir);
    if (fs.existsSync(iconDir)) {
      const files = fs.readdirSync(iconDir);
      let renamedCount = 0;
      
      for (const file of files) {
        // 查找匹配的旧 UID
        for (const [oldUid, newUid] of uidMap) {
          if (file.startsWith(oldUid + '.')) {
            const ext = path.extname(file);
            const oldPath = path.join(iconDir, file);
            const newPath = path.join(iconDir, newUid + ext);
            
            if (fs.existsSync(oldPath)) {
              fs.renameSync(oldPath, newPath);
              console.log(`  图标: ${file} -> ${newUid}${ext}`);
              renamedCount++;
            }
            break;
          }
        }
      }
      console.log(`已重命名 ${renamedCount} 个图标文件`);
    }
  }
  
  // 5. 重命名内容文件夹和文件
  if (config.hasContent && config.contentDir) {
    const contentDir = path.join(CONTENT_DIR, config.contentDir);
    if (fs.existsSync(contentDir)) {
      // 先收集需要重命名的文件夹
      const toRename: { oldPath: string; newPath: string; oldUid: string; newUid: string }[] = [];
      
      for (const [oldUid, newUid] of uidMap) {
        const oldDir = path.join(contentDir, oldUid);
        if (fs.existsSync(oldDir)) {
          toRename.push({
            oldPath: oldDir,
            newPath: path.join(contentDir, newUid),
            oldUid,
            newUid,
          });
        }
      }
      
      // 重命名文件夹和内部的 MD 文件
      for (const item of toRename) {
        if (fs.existsSync(item.oldPath) && !fs.existsSync(item.newPath)) {
          // 先重命名内部的 MD 文件
          const oldMdFile = path.join(item.oldPath, `${item.oldUid}.md`);
          const newMdFile = path.join(item.oldPath, `${item.newUid}.md`);
          
          if (fs.existsSync(oldMdFile)) {
            // 读取文件内容
            let content = fs.readFileSync(oldMdFile, 'utf-8');
            // 更新 frontmatter 中的 uid
            content = content.replace(/uid:\s*['"]?[\w-]+['"]?/g, `uid: ${item.newUid}`);
            // 写入新文件
            fs.writeFileSync(newMdFile, content);
            // 删除旧文件
            fs.unlinkSync(oldMdFile);
            console.log(`  MD: ${item.oldUid}.md -> ${item.newUid}.md`);
          }
          
          // 重命名文件夹（使用 robocopy 避免权限问题）
          try {
            execSync(`robocopy "${item.oldPath}" "${item.newPath}" /move /E`, { encoding: 'utf8', stdio: 'pipe' });
            console.log(`  文件夹: ${item.oldUid} -> ${item.newUid}`);
          } catch {
            // robocopy 返回码 1 表示成功，忽略错误
            console.log(`  文件夹: ${item.oldUid} -> ${item.newUid}`);
          }
        }
      }
    }
  }
  
  db.close();
  console.log(`========== ${type} 迁移完成 ==========\n`);
}

// 执行迁移
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法: npx tsx scripts/migrate-uid.ts <type>');
    console.log('可用类型: agents, aihub, tools, articles, mcps, news, products, prompts');
    console.log('或使用 "all" 迁移所有类型');
    process.exit(1);
  }
  
  if (args[0] === 'all') {
    for (const [type, config] of Object.entries(TYPE_CONFIGS)) {
      await migrateType(type, config);
    }
  } else {
    const type = args[0];
    if (TYPE_CONFIGS[type as keyof typeof TYPE_CONFIGS]) {
      await migrateType(type, TYPE_CONFIGS[type as keyof typeof TYPE_CONFIGS]);
    } else {
      console.error(`未知类型: ${type}`);
      process.exit(1);
    }
  }
  
  console.log('\n迁移完成！');
}

main().catch(console.error);