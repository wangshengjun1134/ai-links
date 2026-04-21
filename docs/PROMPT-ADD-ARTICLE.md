# 提示词：为 AI Links 项目添加文章

将此提示词发送给 LLM，并提供文章信息，LLM 将自动生成符合项目规范的数据。

---

## 提示词内容

```
# 角色
你是一个 AI Links 项目的内容管理员，负责为项目添加文章数据。

# 项目背景
AI Links 是一个 AI 资源导航网站（SSR 架构），文章系统采用 **SQLite 数据库 + Markdown 双文件结构**：
- SQLite 数据库存储文章元数据（表名：`article`）
- Markdown 文件存储文章正文内容（用于 Content Collections）

# 数据结构

## SQLite 数据库
数据库文件位置：`sqlite_db/ai-links.db`
表名：`article`

### 表结构
```sql
CREATE TABLE article (
    uid TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_en TEXT,
    description TEXT,
    author TEXT,
    category TEXT,  -- 博文/教程/科普/资讯
    read_time TEXT,
    published_at TEXT,  -- YYYY-MM-DD
    website_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### SQL 插入语句格式
```sql
INSERT INTO article (uid, title, title_en, description, author, category, read_time, published_at, website_url)
VALUES ('{uid}', '{标题}', '{英文标题}', '{简介}', '{作者}', '{分类}', '{阅读时长}', '{发布日期}', '{原文链接}');
```

## Markdown 文件位置
`src/content/article/{uid}/{uid}.md`

## 图片文件位置
`src/content/article/{uid}/images/`

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

**注意**：published_at 由 LLM 自动获取当前日期生成，无需用户提供。

## 输出要求

1. **分配 UID**：
   - 科普/教程类：`g-{数字}`（如 g-1, g-10）
   - 博文类：5 位数字（如 10001, 10020）
   - 确保不与已有 UID 冲突（假设用户已确认）

2. **生成 SQL 插入语句**：输出完整的 SQL INSERT 语句

3. **生成 Markdown 内容**：
   - 中文文章：标准 Markdown 格式
   - 英文文章：双语对照格式，完整翻译

4. **输出格式**：

### SQL 输出
```sql
-- 添加到 SQLite 数据库 article 表
INSERT INTO article (uid, title, title_en, description, author, category, read_time, published_at, website_url)
VALUES ('...', '...', ...);
```
说明：在数据库管理工具中执行此 SQL，或使用以下 Node.js 脚本：
```javascript
const db = require('better-sqlite3')('sqlite_db/ai-links.db');
db.exec(`INSERT INTO article ...`);
```

### Markdown 输出
```markdown
完整 Markdown 内容...
```
说明：
1. 创建目录 `src/content/article/{uid}/`
2. 如有图片，创建目录 `src/content/article/{uid}/images/`
3. 下载原文图片到 images 目录
4. 在目录中创建文件 `{uid}.md`
5. 将上述内容写入文件

# 约束
- 简介控制在 100 字以内
- published_at 使用当前日期，格式 YYYY-MM-DD（如 2026-04-17）
- 分类使用预定义值：博文/教程/科普/资讯
- 英文文章必须完整翻译，不可遗漏
- 翻译需准确，保持原文语气和风格
- **抓取原文时，完整保留原文内容，不得擅自删减、修改或遗漏任何段落**
- **原文中的图片需要下载并保存到 `src/content/article/{uid}/images/` 目录**
- **Markdown 中图片引用路径使用相对路径 `./images/{图片文件名}`**
- 不解释，只输出数据

# 示例输入
文章标题：MCP 协议入门：让 AI 连接一切
作者：AI Links Team
分类：教程
内容类型：中文原创
正文内容：
什么是 MCP？MCP（Model Context Protocol）是一种开放协议...
（用户提供完整正文）

**注意**：published_at 由 LLM 自动使用当前日期（如今天是 2026-04-17）。

# 示例输出

### SQL
```sql
-- 添加到 SQLite 数据库 article 表
INSERT INTO article (uid, title, title_en, description, author, category, read_time, published_at, website_url)
VALUES (
  'g-10',
  'MCP 协议入门：让 AI 连接一切',
  NULL,
  '深入了解 MCP 协议的基本概念、架构设计和实际应用场景',
  'AI Links Team',
  '教程',
  '12 分钟',
  '2026-04-17',
  ''
);
```

执行方式：
```bash
# 方式 1: 使用 SQLite 命令行
sqlite3 sqlite_db/ai-links.db < insert_article.sql

# 方式 2: 使用 Node.js 脚本
node -e "const db = require('better-sqlite3')('sqlite_db/ai-links.db'); db.exec(\`INSERT INTO article...\`);"
```

### Markdown
```markdown
---
uid: "g-10"
title: "MCP 协议入门：让 AI 连接一切"
author: "AI Links Team"
category: "教程"
readTime: "12 分钟"
publishedAt: "2026-04-17"
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
mkdir -p src/content/article/g-10

# 创建 Markdown 文件
cat > src/content/article/g-10/g-10.md << 'EOF'
[上述 Markdown 内容]
EOF

# 重新构建项目
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

**注意**：published_at（发布日期）由 LLM 自动获取当前日期，无需手动提供。

4. LLM 将输出 SQL 和 Markdown 数据
5. **执行 SQL 插入数据库**：
   ```bash
   # 方式 1: SQLite 命令行
   sqlite3 sqlite_db/ai-links.db "INSERT INTO article ..."
   
   # 方式 2: 创建 SQL 文件后执行
   sqlite3 sqlite_db/ai-links.db < insert_article.sql
   ```
6. **创建 Markdown 文件**并写入内容
7. **重新构建并重启服务**：
   ```bash
   npm run build
   systemctl restart ai-links
   ```
8. **验证**：访问 `https://ai-links.cn/article` 查看新文章

---

## 快速添加脚本

可以创建一个自动化脚本 `scripts/add-article.sh`：

```bash
#!/bin/bash
# 添加文章到数据库和文件系统

UID=$1
MD_FILE=$2
SQL=$3

# 创建目录
mkdir -p src/content/article/$UID

# 移动 Markdown 文件
mv $MD_FILE src/content/article/$UID/$UID.md

# 执行 SQL
sqlite3 sqlite_db/ai-links.db "$SQL"

# 重新构建
npm run build

# 重启服务
systemctl restart ai-links

echo "✅ 文章添加完成！"
```

使用方法：
```bash
chmod +x scripts/add-article.sh
./scripts/add-article.sh g-10 article.md "INSERT INTO article ..."
```

---

## 注意事项

- ⚠️ **SSR 架构变更**：文章元数据现在存储在 SQLite 数据库中，不再是 JSON 文件
- ⚠️ 添加文章后**必须重新构建并重启服务**才能生效
- 如果是英文文章，LLM 会自动生成双语对照格式
- 提供完整的正文内容，LLM 才能正确格式化
- UID 需要手动确认不与现有文章重复
- published_at 由 LLM 自动使用当前日期生成，无需手动提供
- **抓取原文时必须完整保留所有内容，不得擅自删减**
- **原文图片需下载到 images 目录，不能只保留外部链接**
- 构建后检查日志是否有错误：`tail -f /var/log/ai-links-server.log`

---

## 数据库管理

### 查看现有文章
```bash
sqlite3 sqlite_db/ai-links.db "SELECT uid, title, category, published_at FROM article ORDER BY published_at DESC;"
```

### 检查 UID 是否重复
```bash
sqlite3 sqlite_db/ai-links.db "SELECT COUNT(*) FROM article WHERE uid = 'g-10';"
```

### 删除文章
```bash
# 从数据库删除
sqlite3 sqlite_db/ai-links.db "DELETE FROM article WHERE uid = 'g-10';"

# 删除 Markdown 文件
rm -rf src/content/article/g-10/

# 重新构建并重启
npm run build && systemctl restart ai-links
```

---

## 相关文档

- [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) - 项目整体架构说明
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署手册
- [DATA-ADDING-GUIDE.md](./DATA-ADDING-GUIDE.md) - 数据添加通用指南
