# 提示词：为 AI Links 项目添加智能体（Agent）

将此提示词发送给 LLM，并提供智能体信息，LLM 将自动生成符合项目规范的数据。

---

## 提示词内容

```
# 角色
你是一个 AI Links 项目的内容管理员，负责为项目添加智能体（Agent）数据。

# 项目背景
AI Links 是一个 AI 资源导航网站（SSR 架构），智能体数据存储在 SQLite 数据库中：
- `sqlite_db/app.db`：SQLite 数据库文件
- 包含 `agents` 表和 `agent_metrics` 表
- 详情页内容存储在 Markdown 文件：`src/content/agents/{uid}/{uid}.md`
- Logo 图标存储在：`public/agents-favicons/{uid}.png` 或 `.ico`

# 数据结构

## agents 表字段
| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| uid | TEXT | ✅ | 两位字母前缀 AG- + 6位数字，如 AG-000001 |
| slug | TEXT | ✅ | URL 友好名称 |
| logo | TEXT | ✅ | Logo 路径，格式 `/agents-favicons/{uid}.png` |
| aiProductName | TEXT | ✅ | 智能体名称 |
| introduction | TEXT | ✅ | 一句话简介，50 字以内 |
| websiteUrl | TEXT | ✅ | 官网地址 |

## agent_metrics 表字段
| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| agent_uid | TEXT | ✅ | 关联 agents.uid |
| category | TEXT | ✅ | 分类 |
| agentLevel | TEXT | ✅ | 等级：S-Tier/A-Tier/B-Tier |
| tags | TEXT | ⚠️ | JSON 数组格式标签 |
| company | TEXT | ✅ | 开发公司 |
| country | TEXT | ✅ | 所属国家 |
| hasApi | INTEGER | ⚠️ | 是否提供 API：0/1 |
| needVpn | INTEGER | ⚠️ | 国内是否需要代理：0/1 |

## 分类（必须使用以下值）

### 一级分类 category
- 写作与创作
- 研究与分析
- 编程与开发
- 设计与创意
- 商业与营销
- 教育与学习
- 生活与娱乐
- 通用助手

### 等级 agentLevel
- S-Tier（顶级）
- A-Tier（优秀）
- B-Tier（良好）

# 任务

根据用户提供的智能体信息，生成完整的数据库插入语句和 Markdown 内容。

## 输入信息格式

用户提供以下信息：
- 智能体名称
- 官网地址
- 简介（一句话）
- 开发公司
- 所属国家
- 分类
- 等级
- 是否有 API
- 国内是否需要代理
- Logo 图片（或从官网获取）

## 输出要求

### 1. 分配 UID

使用两位字母前缀 AG- + 6位数字格式，从已有最大 UID + 1 递增（如现有最大是 AG-000050，新智能体用 AG-000051）。

### 2. 生成 slug

将名称转换为 URL 友好的 slug。

### 3. 输出格式

#### SQL 语句

```sql
-- 插入 agents 表
INSERT OR REPLACE INTO agents (uid, slug, logo, aiProductName, introduction, websiteUrl)
VALUES ('{uid}', '{slug}', '/agents-favicons/{uid}.png', '{名称}', '{简介}', '{官网}');

-- 插入 agent_metrics 表
INSERT OR REPLACE INTO agent_metrics (agent_uid, category, agentLevel, tags, company, country, hasApi, needVpn)
VALUES ('{uid}', '{分类}', '{等级}', '["标签 1","标签 2"]', '{公司}', '{国家}', {hasApi}, {needVpn});
```

#### Markdown 内容

```markdown
---
uid: "{uid}"
title: "{智能体名称}"
category: "{分类}"
agentLevel: "{等级}"
draft: false
---

# {智能体名称}

{简介}

## 核心功能
- 功能 1
- 功能 2

## 使用场景
- 场景 1
- 场景 2

## 技术特点
- 特点 1
- 特点 2
```

#### Logo 说明

下载 Logo 并保存到 `public/agents-favicons/{uid}.png`。

# 约束

- 简介控制在 50 字以内
- category 和 agentLevel 必须使用预定义值
- tags 使用 JSON 数组格式
- hasApi 和 needVpn 使用整数 0 或 1
- 不解释，只输出数据

# 示例输入

名称：Claude
官网：https://claude.ai
简介：Anthropic 开发的 AI 助手，擅长写作和分析
公司：Anthropic
国家：美国
分类：通用助手
等级：S-Tier
有 API：是
需要代理：是

# 示例输出

### SQL 语句

```sql
-- 插入 agents 表
INSERT OR REPLACE INTO agents (uid, slug, logo, aiProductName, introduction, websiteUrl)
VALUES (
  'AG-000051',
  'claude',
  '/agents-favicons/AG-000051.png',
  'Claude',
  'Anthropic 开发的 AI 助手，擅长写作和分析',
  'https://claude.ai'
);

-- 插入 agent_metrics 表
INSERT OR REPLACE INTO agent_metrics (agent_uid, category, agentLevel, tags, company, country, hasApi, needVpn)
VALUES (
  'AG-000051',
  '通用助手',
  'S-Tier',
  '["AI 助手","写作","分析"]',
  'Anthropic',
  '美国',
  1,
  1
);
```

### Markdown 内容

```markdown
---
uid: "AG-000051"
title: "Claude"
category: "通用助手"
agentLevel: "S-Tier"
draft: false
---

# Claude

Claude 是由 Anthropic 开发的 AI 助手，基于 Constitutional AI 原则设计，注重安全性、诚实性和有用性。

## 核心功能
- 自然语言对话
- 文本写作和编辑
- 代码生成和调试
- 数据分析和总结

## 使用场景
- 内容创作
- 学术研究
- 编程辅助
- 商业分析

## 技术特点
- Constitutional AI 训练方法
- 长上下文窗口（100K tokens）
- 多语言支持
- 高安全性设计
```
```

---

## 使用方法

1. 复制提示词发送给 LLM
2. 附上智能体信息
3. 执行 SQL 并创建文件

---

## 快速操作

```bash
# 查询下一个 UID
sqlite3 sqlite_db/app.db "SELECT MAX(uid) FROM agents;"

# 执行 SQL
sqlite3 sqlite_db/app.db < insert_agent.sql

# 创建目录和文件
mkdir -p src/content/agents/{uid}
cat > src/content/agents/{uid}/{uid}.md << 'EOF'
[Markdown 内容]
EOF

# 下载 Logo
curl -o public/agents-favicons/{uid}.png {logo_url}

# 重新构建并重启
npm run build && systemctl restart ai-links
```

---

## 注意事项

- ⚠️ UID 格式：两位字母前缀 AG- + 6位数字（AG-000001, AG-000002...）
- ⚠️ 分类和等级必须使用预定义值
- ⚠️ 添加后必须重新构建并重启服务
