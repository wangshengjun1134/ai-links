import Database from 'better-sqlite3';
const db = new Database('sqlite_db/app.db');

// 插入 agents 表
db.prepare(`
  INSERT OR REPLACE INTO agents (uid, slug, logo, aiProductName, introduction, websiteUrl)
  VALUES (
    '20104000',
    'hermes-agent',
    '',
    'Hermes Agent',
    'Nous Research 构建的自改进 AI 代理，具有内置学习循环——从经验中创建技能，在使用中改进它们，自动持久化知识，搜索过去的对话，并在跨会话中建立用户模型。支持 Telegram、Discord、Slack、WhatsApp、Signal 和 CLI 等多平台通信。',
    'https://github.com/nousresearch/hermes-agent'
  )
`).run();

// 插入 agent_metrics 表
db.prepare(`
  INSERT OR REPLACE INTO agent_metrics (
    agent_uid, country, company, useType, modelLevel, hasApi, pricingModel,
    needVpn, languages, isInternal, category, subCategory, form_factor,
    capabilities, scenarios, techTags, deployment, agentLevel, interactionMode
  )
  VALUES (
    '20104000',
    '美国',
    'Nous Research',
    '["CLI","Web"]',
    'A-Tier',
    0,
    '["开源免费"]',
    0,
    '["英文"]',
    0,
    '智能体基础设施',
    '自改进智能体',
    '["CLI","Telegram","Discord","Slack","WhatsApp","Signal"]',
    '["任务执行","自改进学习","技能创建","记忆持久化","工具调用","定时自动化","多平台通信","委托与并行化"]',
    '["办公效率","自动化","研究","开发"]',
    '["大语言模型","Honcho","agentskills.io","MCP","跨平台通信"]',
    '本地部署',
    'L4_多智能体系统',
    '触发式'
  )
`).run();

// 验证数据
const agent = db.prepare('SELECT * FROM agents WHERE uid = ?').get('20104000');
const metrics = db.prepare('SELECT * FROM agent_metrics WHERE agent_uid = ?').get('20104000');

console.log('✅ Hermes Agent 数据已插入');
console.log('Agent:', JSON.stringify(agent, null, 2));
console.log('Metrics:', JSON.stringify(metrics, null, 2));

db.close();