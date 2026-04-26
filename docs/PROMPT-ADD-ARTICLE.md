# 提示词：为 AI Links 项目添加文章

将此提示词发送给 LLM，并提供文章信息，LLM 将自动生成符合项目规范的数据。

---

## 提示词内容

```
# 角色
你是一个 AI Links 项目的内容管理员，负责为项目添加文章数据。

# 项目背景
AI Links 是一个 AI 资源导航网站（SSR 架构），文章系统采用 **SQLite 数据库 + Markdown 双文件结构**：
- SQLite 数据库存储文章元数据（表名：`articles` 和 `article_metrics`）
- Markdown 文件存储文章正文内容（用于 Content Collections）

# 数据分离架构

项目采用源码与数据分离架构，所有内容数据存储在 `ai-links-data/` 目录：
- 数据库：`ai-links-data/sqlite_db/app.db`
- Markdown：`ai-links-data/content/article/{uid}/{uid}.md`
- 图片：`ai-links-data/content/article/{uid}/images/`

# 数据结构

## SQLite 数据库

### articles 表（主表）
```sql
CREATE TABLE articles (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    titleEn TEXT,
    description TEXT,
    author TEXT,
    category TEXT,
    readTime TEXT,
    publishedAt TEXT,
    websiteUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### article_metrics 表（属性表）
```sql
CREATE TABLE article_metrics (
    article_uid TEXT PRIMARY KEY REFERENCES articles(uid),
    tags TEXT
);
```

⚠️ **重要**：必须同时插入两张表的数据！缺少 `article_metrics` 记录会导致文章无法显示（查询使用 JOIN）。

### SQL 插入语句格式
```sql
-- 1. 插入 articles 表
INSERT INTO articles (uid, slug, title, titleEn, description, author, category, readTime, publishedAt, websiteUrl)
VALUES ('{uid}', '{slug}', '{标题}', '{英文标题}', '{简介}', '{作者}', '{分类}', '{阅读时长}', '{发布日期}', '{原文链接}');

-- 2. 插入 article_metrics 表（必须！）
INSERT INTO article_metrics (article_uid, tags)
VALUES ('{uid}', '["标签1","标签2"]');
```

## Markdown 文件位置
`ai-links-data/content/article/{uid}/{uid}.md`

## 图片文件位置
`ai-links-data/content/article/{uid}/images/`

如果原文包含图片，需要下载图片并保存到 images 文件夹下，Markdown 中引用路径为 `./images/{图片文件名}`。

## Markdown 格式规范

### 中文文章（标准格式）
```markdown
---
uid: "{uid}"
title: "文章标题"
author: "作者名称"
category: "教程"
readTime: "10 分钟"
publishedAt: "{当前日期，YYYY-MM-DD 格式}"
draft: false
---

# 文章主标题

## 引言
正文内容...

## 第一章节
正文内容...

## 总结
总结内容...
```

### 英文文章（双语对照格式）
原文为英文时，必须使用 `:::en`/`:::zh` 指令块实现中英对照：

```markdown
---
uid: "{uid}"
title: "中文标题"
titleEn: "English Title"
author: "作者名称"
category: "博文"
readTime: "15 分钟"
publishedAt: "{当前日期，YYYY-MM-DD 格式}"
draft: false
---

# English Title

![Cover Image](./cover.jpg)

:::en
英文段落内容...
:::

:::zh
中文翻译内容...
:::

:::entitle
## English Section Title
:::

:::zhtitle
## 中文章节标题
:::

:::en
> 英文引用内容
>
> – Author Name
:::

:::zh
> 中文翻译内容
>
> —— 作者名称
:::
```

**双语格式规则**：
- `:::en` 包裹英文原文，`:::zh` 包裹中文翻译
- `:::entitle` 包裹英文标题，`:::zhtitle` 包裹中文标题
- 每个英文块后必须紧跟对应的中文块
- 文件顶部主标题保留英文原样

# 任务

根据用户提供的信息，生成完整的文章数据。

## 输入信息格式
用户提供以下信息：
- 文章标题（中文/英文）
- 文章正文内容或原文链接
- 作者名称
- 分类类型
- 是否为英文原文需要翻译

**注意**：publishedAt 由 LLM 自动获取当前日期生成，无需用户提供。

## 输出要求

1. **分配 UID**：
   - 统一使用两位字母前缀 `AR-` + 6位数字格式（如 AR-000001, AR-000002, AR-000003...）
   - 确保不与已有 UID 冲突（查询数据库确认下一个可用 UID）

2. **生成 slug**：
   - 将标题转换为 URL友好的 slug（小写、连字符分隔）

3. **生成 SQL 插入语句**：
   - 必须同时生成 articles 表和 article_metrics 表的 INSERT 语句

4. **生成 Markdown 内容**：
   - 中文文章：标准 Markdown 格式
   - 英文文章：双语对照格式，完整翻译

5. **输出格式**：

### SQL 输出
```sql
-- 1. 添加到 articles 表
INSERT INTO articles (uid, slug, title, titleEn, description, author, category, readTime, publishedAt, websiteUrl)
VALUES ('AR-000008', 'article-slug', '文章标题', 'English Title', '简介', '作者', '博文', '15 分钟', '2026-04-27', 'https://example.com');

-- 2. 添加到 article_metrics 表（必须！否则文章不会显示）
INSERT INTO article_metrics (article_uid, tags)
VALUES ('AR-000008', '["AI","技术","产品设计"]');
```

执行方式：
```bash
sqlite3 ai-links-data/sqlite_db/app.db "INSERT INTO articles ...; INSERT INTO article_metrics ...;"
```

### Markdown 输出
```markdown
完整 Markdown 内容...
```
说明：
1. 创建目录 `ai-links-data/content/article/{uid}/`
2. 如有图片，创建目录 `ai-links-data/content/article/{uid}/images/`
3. 下载原文图片到 images 目录
4. 在目录中创建文件 `{uid}.md`
5. 将上述内容写入文件

# 约束
- 简介控制在 100 字以内
- publishedAt 使用当前日期，格式 YYYY-MM-DD（如 2026-04-27）
- 分类使用预定义值：博文/教程/科普/资讯
- 英文文章必须完整翻译，不可遗漏
- 翻译需准确，保持原文语气和风格
- **抓取原文时，完整保留原文内容，不得擅自删减、修改或遗漏任何段落**
- **原文中的图片需要下载并保存到 images 目录**
- **Markdown 中图片引用路径使用相对路径 `./images/{图片文件名}`**
- ⚠️ **必须同时插入 articles 和 article_metrics 两张表！**
- 不解释，只输出数据

# 示例输入
文章标题：MCP 协议入门：让 AI 连接一切
作者：AI Links Team
分类：教程
内容类型：中文原创
正文内容：
什么是 MCP？MCP（Model Context Protocol）是一种开放协议...
（用户提供完整正文）

**注意**：publishedAt 由 LLM 自动使用当前日期（如今天是 2026-04-27）。

# 示例输出

### SQL
```sql
-- 1. 添加到 articles 表
INSERT INTO articles (uid, slug, title, titleEn, description, author, category, readTime, publishedAt, websiteUrl)
VALUES (
  'AR-000008',
  'mcp-protocol-guide',
  'MCP 协议入门：让 AI 连接一切',
  NULL,
  '深入了解 MCP 协议的基本概念、架构设计和实际应用场景',
  'AI Links Team',
  '教程',
  '12 分钟',
  '2026-04-27',
  ''
);

-- 2. 添加到 article_metrics 表（必须！）
INSERT INTO article_metrics (article_uid, tags)
VALUES ('AR-000008', '["MCP","协议","AI 工具"]');
```

执行方式：
```bash
sqlite3 ai-links-data/sqlite_db/app.db "INSERT INTO articles ...; INSERT INTO article_metrics ...;"
```

### Markdown
```markdown
---
uid: "AR-000008"
title: "MCP 协议入门：让 AI 连接一切"
author: "AI Links Team"
category: "教程"
readTime: "12 分钟"
publishedAt: "2026-04-27"
draft: false
---

# MCP 协议入门：让 AI 连接一切

## 什么是 MCP？

MCP（Model Context Protocol）是一种开放协议...

## 核心概念

### Server
MCP Server 提供能力...

### Client
MCP Client 调用能力...

## 总结
MCP 协议为 AI 应用提供了标准化的扩展能力...
```

操作说明：
```bash
# 创建目录
mkdir ai-links-data/content/article/AR-000008

# 创建 Markdown 文件（写入上述内容）
# 文件路径: ai-links-data/content/article/AR-000008/AR-000008.md

# 执行 SQL
sqlite3 ai-links-data/sqlite_db/app.db "INSERT INTO articles ...; INSERT INTO article_metrics ...;"

# 重新构建项目（详情页是预渲染的）
npm run build

# 重启服务
systemctl restart ai-links
```
```

---

## 使用方法

1. 复制上方完整提示词
2. 发送给 LLM（如 ChatGPT、Claude、通义千问等）
3. 在提示词后附上你要添加的文章信息，格式如下：

```
文章标题：[你的文章标题]
作者：[作者名称]
分类：[博文/教程/科普/资讯]
原文链接：[如有]
内容类型：[中文原创/英文翻译]
正文内容：
[文章完整正文]
```

**注意**：publishedAt（发布日期）由 LLM 自动获取当前日期，无需手动提供。

4. LLM 将输出 SQL 和 Markdown 数据
5. **执行 SQL 插入数据库**：
   ```bash
   sqlite3 ai-links-data/sqlite_db/app.db "INSERT INTO articles ...; INSERT INTO article_metrics ...;"
   ```
6. **创建 Markdown 文件**并写入内容到 `ai-links-data/content/article/{uid}/{uid}.md`
7. **重新构建并重启服务**：
   ```bash
   npm run build
   systemctl restart ai-links
   ```
8. **验证**：访问 `https://ai-links.cn/article` 查看新文章

---

## ⚠️ 重要注意事项

### 必须插入两张表

**问题**：文章列表查询使用 `JOIN article_metrics`，如果只插入 `articles` 表而没有插入 `article_metrics` 表，文章不会显示在列表页！

**正确做法**：
```sql
-- 必须两条 SQL 都执行
INSERT INTO articles (uid, slug, ...) VALUES (...);
INSERT INTO article_metrics (article_uid, tags) VALUES (...);
```

**验证**：
```bash
# 检查文章是否有 metrics 记录
sqlite3 ai-links-data/sqlite_db/app.db "SELECT a.uid, a.title, m.tags FROM articles a JOIN article_metrics m ON a.uid = m.article_uid WHERE a.uid='AR-000008';"
```

### 其他注意事项

- ⚠️ **数据分离架构**：数据存储在 `ai-links-data/` 目录，不是 `src/content/` 或 `sqlite_db/`
- ⚠️ 添加文章后**必须重新构建**才能在详情页显示（详情页是预渲染的）
- ⚠️ **UID 格式**：统一使用两位字母前缀 `AR-` + 6位数字（AR-000001, AR-000002...）
- 💡 **查询下一个 UID**：`sqlite3 ai-links-data/sqlite_db/app.db "SELECT MAX(uid) FROM articles;"`
- 开发模式下数据库有缓存，可能需要重启 `npm run dev` 才能看到新数据

---

## 数据库管理

### 查看现有文章
```bash
sqlite3 ai-links-data/sqlite_db/app.db "SELECT uid, title, category, publishedAt FROM articles ORDER BY publishedAt DESC;"
```

### 检查 UID 是否重复
```bash
sqlite3 ai-links-data/sqlite_db/app.db "SELECT COUNT(*) FROM articles WHERE uid = 'AR-000008';"
```

### 查看下一个可用 UID
```bash
sqlite3 ai-links-data/sqlite_db/app.db "SELECT MAX(uid) FROM articles;"
# 输出：AR-000007，则下一个使用 AR-000008
```

### 检查文章是否有 metrics
```bash
sqlite3 ai-links-data/sqlite_db/app.db "SELECT a.uid, m.tags FROM articles a LEFT JOIN article_metrics m ON a.uid = m.article_uid WHERE m.article_uid IS NULL;"
# 如果有输出，说明这些文章缺少 metrics，需要补充
```

### 删除文章
```bash
# 从数据库删除（必须删除两张表）
sqlite3 ai-links-data/sqlite_db/app.db "DELETE FROM articles WHERE uid = 'AR-000008';"
sqlite3 ai-links-data/sqlite_db/app.db "DELETE FROM article_metrics WHERE article_uid = 'AR-000008';"

# 删除 Markdown 文件
rm -rf ai-links-data/content/article/AR-000008/

# 重新构建并重启
npm run build && systemctl restart ai-links
```

---

## 相关文档

- [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) - 项目整体架构说明
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署手册
- [DATA-ADDING-GUIDE.md](./DATA-ADDING-GUIDE.md) - 数据添加通用指南
- [SUBMODULE-SETUP.md](./SUBMODULE-SETUP.md) - 数据仓库配置指南