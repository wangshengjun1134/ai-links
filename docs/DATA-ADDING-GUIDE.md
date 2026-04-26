# AI Links 数据添加操作手册

本手册描述如何向 AI Links 项目添加各类数据（产品、智能体、提示词、MCP服务等）。

---

## 1. 数据架构概览

### 1.1 数据分离架构

项目采用**源码与数据分离**架构：

```
ai-links (源码仓库)
    └── ai-links-data/ (内容仓库)
        ├── sqlite_db/app.db       # SQLite 数据库
        ├── content/               # Markdown 详情
        └── favicons/              # 图标图片
```

### 1.2 数据存储位置

| 数据类型 | 数据库表 | Content 目录 | favicon 目录 |
|---------|---------|-------------|-------------|
| AI 产品 | `products` + `product_metrics` | `ai-links-data/content/products/` | `ai-links-data/favicons/product-favicons/` |
| 智能体 | `agents` + `agent_metrics` | `ai-links-data/content/agents/` | `ai-links-data/favicons/agents-favicons/` |
| 提示词 | `prompts` + `prompt_metrics` | `ai-links-data/content/prompts/` | - |
| MCP 服务 | `mcps` + `mcp_metrics` | `ai-links-data/content/mcps/` | `ai-links-data/favicons/mcp-favicons/` |
| 工具 | `tools` + `tool_metrics` | `ai-links-data/content/tools/` | - |
| 文章 | `articles` + `article_metrics` | `ai-links-data/content/article/` | - |
| 新闻 | `news` | - | - |
| AI Hub | `aihub` + `aihub_metrics` | - | `ai-links-data/favicons/aihub-favicons/` |

---

## 2. 数据添加流程

### 2.1 标准流程

```bash
# 步骤 1: 分配 UID
# 步骤 2: 插入数据库记录
# 步骤 3: 创建 Markdown 详情文件
# 步骤 4: 上传图标文件
# 步骤 5: 验证并构建
```

### 2.2 UID 格式规范

| 类型 | 前缀 | 示例 | 数据库查询 |
|-----|------|-----|-----------|
| 产品 | PD | PD-000001 | `SELECT MAX(uid) FROM products;` |
| 智能体 | AG | AG-000001 | `SELECT MAX(uid) FROM agents;` |
| 提示词 | PM | PM-000001 | `SELECT MAX(uid) FROM prompts;` |
| MCP 服务 | MC | MC-000001 | `SELECT MAX(uid) FROM mcps;` |
| 工具 | TO | TO-000001 | `SELECT MAX(uid) FROM tools;` |
| 文章 | AR | AR-000001 | `SELECT MAX(uid) FROM articles;` |
| 新闻 | NE | NE-000001 | `SELECT MAX(uid) FROM news;` |
| AI Hub | AH | AH-000001 | `SELECT MAX(uid) FROM aihub;` |

---

## 3. AI 产品添加

### 3.1 数据库表结构

```sql
-- 主表
CREATE TABLE products (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    aiProductName TEXT NOT NULL,
    introduction TEXT,
    websiteUrl TEXT,
    detail TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 属性表
CREATE TABLE product_metrics (
    product_uid TEXT PRIMARY KEY REFERENCES products(uid),
    level1 TEXT,
    level2 TEXT,
    tags TEXT,           -- JSON 数组
    country TEXT,
    company TEXT,
    hasApi INTEGER,
    needVpn INTEGER,
    pricingModel TEXT,   -- JSON 数组
    useType TEXT,        -- JSON 数组
    languages TEXT,      -- JSON 数组
    rawProductType TEXT  -- JSON 数组
);
```

### 3.2 SQL 插入示例

```sql
-- 插入产品主表
INSERT INTO products (uid, slug, logo, aiProductName, introduction, websiteUrl)
VALUES ('PD-000123', 'product-name', 'product-favicons/PD-000123.png', '产品名称', '产品简介', 'https://example.com');

-- 插入产品属性表
INSERT INTO product_metrics (
    product_uid, level1, level2, tags, country, company,
    hasApi, needVpn, pricingModel, useType, languages, rawProductType
)
VALUES (
    'PD-000123',
    '内容创作',
    '写作类',
    '["AI写作", "内容生成"]',
    '中国',
    '公司名称',
    1,
    0,
    '["免费", "订阅制"]',
    '["web", "pc"]',
    '["中文", "英语"]',
    '[]'
);
```

### 3.3 Markdown 详情文件

在 `ai-links-data/content/products/{uid}/{uid}.md` 创建：

```markdown
---
uid: "PD-000123"
introduction: "产品简介"
---

## 【产品概述】
产品的核心定位和主要功能描述。

## 【核心功能】
1. **功能一**：描述
2. **功能二**：描述

## 【应用场景】
1. **场景一**：描述

## 【技术特点】
技术架构和差异化特点。

## 【定价信息】
免费/付费/订阅等。
```

### 3.4 图标文件

上传到 `ai-links-data/favicons/product-favicons/PD-000123.png`（或 .ico、.svg）

### 3.5 分类字段参考

**level1 一级分类**：
- 内容创作
- 视频与音频
- 平台与基础设施
- 办公与效率
- 商业与营销
- 数据与分析
- 开发与技术
- 图像与设计
- 学术研究

**level2 二级分类**（部分）：
- 写作类、翻译类、学术类
- 视频类、音频类、数字人
- 图像生成、图像处理、设计类
- 编程类、AI技术、开发平台
- 数据类、办公类、营销类

---

## 4. 智能体添加

### 4.1 数据库表结构

```sql
CREATE TABLE agents (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    aiProductName TEXT NOT NULL,
    introduction TEXT,
    websiteUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_metrics (
    agent_uid TEXT PRIMARY KEY REFERENCES agents(uid),
    country TEXT,
    company TEXT,
    useType TEXT,
    modelLevel TEXT,
    hasApi INTEGER,
    pricingModel TEXT,
    needVpn INTEGER,
    languages TEXT,
    isInternal INTEGER,
    category TEXT,
    subCategory TEXT,
    form_factor TEXT,
    capabilities TEXT,
    scenarios TEXT,
    techTags TEXT,
    deployment TEXT,
    agentLevel TEXT,
    interactionMode TEXT
);
```

### 4.2 SQL 插入示例

```sql
INSERT INTO agents (uid, slug, logo, aiProductName, introduction, websiteUrl)
VALUES ('AG-000123', 'agent-name', 'agents-favicons/AG-000123.png', '智能体名称', '简介', 'https://example.com');

INSERT INTO agent_metrics (
    agent_uid, category, subCategory, agentLevel, country, company,
    form_factor, capabilities, scenarios, techTags, deployment
)
VALUES (
    'AG-000123',
    '通用智能体',
    '对话型智能体',
    'L1_工具调用型',
    '中国',
    '公司名称',
    '["浏览器", "桌面端"]',
    '["任务执行", "工具调用"]',
    '["个人助手", "办公效率"]',
    '["大语言模型", "RAG"]',
    '云端部署'
);
```

### 4.3 分类字段参考

**category 分类**：
- 通用智能体
- 任务执行智能体
- 内容创作智能体
- 开发类智能体
- 企业/行业智能体
- 智能体基础设施

**agentLevel 等级**：
- L0_对话助手
- L1_工具调用型
- L2_工作流型
- L3_自主执行型
- L4_多智能体系统

---

## 5. 提示词添加

### 5.1 数据库表结构

```sql
CREATE TABLE prompts (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    websiteUrl TEXT,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prompt_metrics (
    prompt_uid TEXT PRIMARY KEY REFERENCES prompts(uid),
    scenario TEXT,
    task TEXT,
    modality TEXT,
    tags TEXT
);
```

### 5.2 SQL 插入示例

```sql
INSERT INTO prompts (uid, slug, title, description, websiteUrl)
VALUES ('PM-000123', 'prompt-slug', '提示词标题', '提示词描述', 'https://example.com');

INSERT INTO prompt_metrics (prompt_uid, scenario, task, modality, tags)
VALUES ('PM-000123', '内容创作', '写作', 'text', '["SEO", "营销"]');
```

### 5.3 分类字段参考

| 字段 | 可选值 |
|-----|-------|
| scenario | 内容创作、办公效率、数据分析、编程开发、学习教育、多模态生成、AI Agent |
| task | 写作、总结、改写、翻译、生成、分析、提取、规划 |
| modality | text、image、video、audio、multimodal |

---

## 6. MCP 服务添加

### 6.1 数据库表结构

```sql
CREATE TABLE mcps (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT,
    icon TEXT,
    github_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mcp_metrics (
    mcp_uid TEXT PRIMARY KEY REFERENCES mcps(uid),
    tags TEXT,
    serverType TEXT,
    authType TEXT,
    deployment TEXT
);
```

### 6.2 SQL 插入示例

```sql
INSERT INTO mcps (uid, slug, title, description, author, github_url)
VALUES ('MC-000123', 'mcp-slug', 'MCP 名称', '描述', '作者', 'https://github.com/example/mcp');

INSERT INTO mcp_metrics (mcp_uid, tags, serverType, authType, deployment)
VALUES ('MC-000123', '["数据库", "SQLite"]', '数据库', 'api_key', 'local');
```

---

## 7. 工具添加

### 7.1 数据库表结构

```sql
CREATE TABLE tools (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT,
    icon TEXT,
    websiteUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tool_metrics (
    tool_uid TEXT PRIMARY KEY REFERENCES tools(uid),
    tags TEXT,
    language TEXT,
    license TEXT,
    func TEXT
);
```

---

## 8. 完整添加流程示例

### 示例：添加新产品

```bash
# 1. 查询当前最大 UID
sqlite3 ai-links-data/sqlite_db/app.db "SELECT MAX(uid) FROM products;"
# 结果: PD-000999

# 2. 分配新 UID: PD-001000

# 3. 准备数据
# - 名称: 新产品名称
# - slug: new-product-name
# - 简介: 一句话描述
# - 官网: https://example.com
# - 分类: 内容创作 / 写作类
# - 公司/国家: XXX公司 / 中国

# 4. 执行 SQL 插入
sqlite3 ai-links-data/sqlite_db/app.db "
INSERT INTO products (uid, slug, logo, aiProductName, introduction, websiteUrl)
VALUES ('PD-001000', 'new-product', 'product-favicons/PD-001000.png', '新产品', '简介', 'https://example.com');

INSERT INTO product_metrics (product_uid, level1, level2, country, company, tags)
VALUES ('PD-001000', '内容创作', '写作类', '中国', '公司', '[]');
"

# 5. 创建 Markdown 详情
mkdir -p ai-links-data/content/products/PD-001000
cat > ai-links-data/content/products/PD-001000/PD-001000.md << 'EOF'
---
uid: "PD-001000"
introduction: "产品简介"
---

## 【产品概述】
详细描述...
EOF

# 6. 上传图标
# 将图标文件放到 ai-links-data/favicons/product-favicons/PD-001000.png

# 7. 验证构建
npm run build

# 8. 提交内容仓库
cd ai-links-data
git add .
git commit -m "添加新产品 PD-001000"
git push
```

---

## 9. 数据库操作命令

### 9.1 查询命令

```bash
# 查看表结构
sqlite3 ai-links-data/sqlite_db/app.db ".schema products"

# 查询最大 UID
sqlite3 ai-links-data/sqlite_db/app.db "SELECT MAX(uid) FROM products;"

# 查询所有分类
sqlite3 ai-links-data/sqlite_db/app.db "SELECT DISTINCT level1 FROM product_metrics;"

# 查询产品数量
sqlite3 ai-links-data/sqlite_db/app.db "SELECT COUNT(*) FROM products;"
```

### 9.2 数据备份

```bash
# 备份数据库
cp ai-links-data/sqlite_db/app.db ai-links-data/sqlite_db/app.db.backup.$(date +%Y%m%d)

# 导出为 SQL
sqlite3 ai-links-data/sqlite_db/app.db .dump > backup.sql
```

---

## 10. 注意事项

1. **UID 唯一性**：确保 UID 不重复，使用正确的类型前缀
2. **slug 格式**：只能包含字母、数字、连字符，避免中文
3. **JSON 字段**：tags、pricingModel 等字段存储为 JSON 数组字符串
4. **图标格式**：支持 .png、.ico、.svg，建议使用 PNG
5. **Markdown 格式**：详情文件必须有 YAML frontmatter，包含 uid 和 introduction
6. **目录结构**：Markdown 文件放在 `ai-links-data/content/{type}/{uid}/{uid}.md`

---

## 11. 相关文档

- **[PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md)** - 项目整体架构
- **[SUBMODULE-SETUP.md](./SUBMODULE-SETUP.md)** - 数据仓库配置
- **[PROMPT-ADD-PRODUCT.md](./PROMPT-ADD-PRODUCT.md)** - AI 辅助添加产品提示词
- **[PROMPT-ADD-TOOL.md](./PROMPT-ADD-TOOL.md)** - AI 辅助添加工具提示词

---

## 版本历史

- **v2.1 (2026-04-27)**: 数据分离架构，数据存储在 ai-links-data 仓库
- **v2.0 (2026-04-21)**: SQLite 数据库替代 JSON 文件
- **v1.0**: JSON 文件存储