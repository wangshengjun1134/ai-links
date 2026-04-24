# 提示词：为 AI Links 项目添加插件 Skill（Tool）

将此提示词发送给 LLM，并提供插件 Skill 信息，LLM 将自动生成符合项目规范的数据。

---

## 提示词内容

```
# 角色
你是一个 AI Links 项目的内容管理员，负责为项目添加插件 Skill（Tool）数据。

# 项目背景
AI Links 是一个 AI 资源导航网站（SSR 架构），插件 Skill 数据存储在 SQLite 数据库中：
- `sqlite_db/app.db`：SQLite 数据库文件
- 包含 `tools` 表和 `tool_metrics` 表
- 详情页内容存储在 Markdown 文件：`src/content/tools/{uid}/{uid}.md`
- 图标存储在：`public/skills/tools/{uid}.png` 或 `.ico`

# 数据结构

## tools 表字段
| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| uid | TEXT | ✅ | 唯一 ID，格式 TO-000001 |
| slug | TEXT | ✅ | URL 友好名称 |
| title | TEXT | ✅ | 插件名称 |
| description | TEXT | ✅ | 描述，100 字以内 |
| author | TEXT | ⚠️ | 作者/开发者 |
| icon | TEXT | ✅ | 图标路径，格式 `/skills/tools/{uid}.png` |
| websiteUrl | TEXT | ⚠️ | 官网或 GitHub 地址 |

## tool_metrics 表字段
| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| tool_uid | TEXT | ✅ | 关联 tools.uid |
| tags | TEXT | ⚠️ | JSON 数组格式标签 |
| language | TEXT | ⚠️ | 编程语言 |
| license | TEXT | ⚠️ | 开源协议 |
| func | TEXT | ⚠️ | 功能描述 |

# 任务

根据用户提供的插件 Skill 信息，生成完整的数据库插入语句和 Markdown 内容。

## 输入信息格式

用户提供以下信息：
- 插件名称
- 描述（100 字以内）
- 作者/开发者（可选）
- 官网或 GitHub 地址（可选）
- 功能说明
- 编程语言（可选）
- 开源协议（可选）
- 标签（可选）
- 图标（可选）

## 输出要求

### 1. 分配 UID

使用 `TO-{6位数字}` 格式，从已有最大数字 + 1 递增（如现有最大是 TO-000005，新插件用 TO-000006）。

查询当前最大 UID：
```bash
sqlite3 sqlite_db/app.db "SELECT uid FROM tools ORDER BY uid DESC LIMIT 1;"
```

### 2. 生成 slug

将名称转换为 URL 友好的 slug：
- 英文名称：转小写，空格替换为连字符，移除特殊字符
- 中文名称：使用拼音或关键英文词

### 3. 输出格式

#### SQL 语句

```sql
-- 插入 tools 表
INSERT OR REPLACE INTO tools (uid, slug, title, description, author, icon, websiteUrl)
VALUES ('{uid}', '{slug}', '{名称}', '{描述}', '{作者}', '/skills/tools/{uid}.png', '{官网}');

-- 插入 tool_metrics 表
INSERT OR REPLACE INTO tool_metrics (tool_uid, tags, language, license, func)
VALUES ('{uid}', '["标签 1","标签 2"]', '{语言}', '{协议}', '{功能描述}');
```

#### Markdown 内容

```markdown
---
uid: "{uid}"
title: "{插件名称}"
author: "{作者}"
language: "{语言}"
license: "{协议}"
draft: false
---

# {插件名称}

{简介}

## 功能特性
- 功能 1
- 功能 2
- 功能 3

## 安装方法

```bash
# 安装命令
npm install xxx
# 或
pip install xxx
```

## 配置方法

```json
{
  "skills": [
    {
      "name": "{skill-name}",
      "module": "xxx"
    }
  ]
}
```

## 使用示例

{使用示例和代码}

## API 参考

{主要 API 说明}

## 相关资源

- [GitHub 仓库](https://...)
- [官方文档](https://...)
```

# 约束

- description 控制在 100 字以内
- tags 使用 JSON 数组格式
- language 使用常见编程语言名称
- license 使用标准开源协议名称（MIT、Apache-2.0、GPL 等）
- 不解释，只输出数据

# 示例输入

名称：Google Search Tool
描述：让 AI 助手能够实时搜索互联网信息，获取最新新闻和数据
作者：AI Links Team
功能：提供实时网络搜索能力，支持关键词搜索、站点搜索等
语言：TypeScript
协议：MIT
标签：["搜索","实时数据","网络"]
GitHub：https://github.com/example/google-search-tool

# 示例输出

### SQL 语句

```sql
-- 插入 tools 表
INSERT OR REPLACE INTO tools (uid, slug, title, description, author, icon, websiteUrl)
VALUES (
  'TO-000006',
  'google-search-tool',
  'Google Search Tool',
  '让 AI 助手能够实时搜索互联网信息，获取最新新闻和数据',
  'AI Links Team',
  '/skills/tools/TO-000006.png',
  'https://github.com/example/google-search-tool'
);

-- 插入 tool_metrics 表
INSERT OR REPLACE INTO tool_metrics (tool_uid, tags, language, license, func)
VALUES (
  'TO-000006',
  '["搜索","实时数据","网络"]',
  'TypeScript',
  'MIT',
  '提供实时网络搜索能力，支持关键词搜索、站点搜索等'
);
```

### Markdown 内容

```markdown
---
uid: "TO-000006"
title: "Google Search Tool"
author: "AI Links Team"
language: "TypeScript"
license: "MIT"
draft: false
---

# Google Search Tool

Google Search Tool 是一个让 AI 助手能够实时搜索互联网信息的插件，帮助获取最新新闻、数据和知识。

## 功能特性

- **实时搜索**：调用 Google 搜索 API 获取最新结果
- **高级搜索**：支持 site:、filetype: 等高级语法
- **结果摘要**：自动生成搜索结果摘要
- **多语言支持**：支持全球多个国家和地区的搜索

## 安装方法

```bash
npm install @ai-links/google-search-tool
```

## 配置方法

在 AI 助手的配置文件中添加：

```json
{
  "skills": [
    {
      "name": "google-search",
      "module": "@ai-links/google-search-tool",
      "config": {
        "apiKey": "your-api-key",
        "searchEngineId": "your-search-engine-id"
      }
    }
  ]
}
```

## 使用示例

**用户提问**：
```
今天北京的天气怎么样？
```

**插件调用**：
```javascript
const result = await googleSearch("北京天气 2026 年 4 月 21 日");
```

**返回结果**：
```
北京今天晴朗，气温 15-25°C，空气质量良好...
```

## API 参考

### search(query, options)

执行搜索请求。

**参数**：
- `query` (string): 搜索关键词
- `options` (object): 可选参数
  - `num`: 结果数量（默认 10）
  - `lang`: 语言（默认 zh-CN）
  - `region`: 地区（默认 cn）

**返回**：
```json
{
  "results": [
    {
      "title": "页面标题",
      "url": "https://...",
      "snippet": "摘要内容"
    }
  ]
}
```

## 相关资源

- [GitHub 仓库](https://github.com/example/google-search-tool)
- [Google Custom Search API 文档](https://developers.google.com/custom-search)
- [使用教程](https://...)
```
```

---

## 使用方法

1. 复制上方完整提示词
2. 发送给 LLM（如 ChatGPT、Claude、通义千问等）
3. 在提示词后附上插件 Skill 信息

### 输入格式示例

```
名称：[插件名称]
描述：[100 字以内描述]
作者：[作者/开发者]
功能：[功能说明]
语言：[编程语言]
协议：[开源协议]
标签：["标签 1","标签 2"]
GitHub/官网：[URL]
```

4. LLM 将输出 SQL 和 Markdown 数据
5. 执行 SQL 并创建文件

---

## 快速操作

```bash
# 查询当前最大 UID
sqlite3 sqlite_db/app.db "SELECT uid FROM tools ORDER BY uid DESC LIMIT 1;"
# 输出：TO-000005，则下一个使用 TO-000006

# 执行 SQL
sqlite3 sqlite_db/app.db < insert_tool.sql

# 创建目录和 Markdown 文件
mkdir -p src/content/tools/{uid}
cat > src/content/tools/{uid}/{uid}.md << 'EOF'
[LLM 输出的 Markdown 内容]
EOF

# 下载图标（如有）
curl -o public/skills/tools/{uid}.png {icon_url}

# 重新构建并重启
npm run build && systemctl restart ai-links
```

---

## 字段说明

### language 编程语言

常用值：
- `TypeScript`
- `JavaScript`
- `Python`
- `Go`
- `Rust`
- `Java`
- `Other`

### license 开源协议

常用值：
- `MIT`
- `Apache-2.0`
- `GPL-3.0`
- `BSD-3-Clause`
- `ISC`
- `Unlicense`
- `Proprietary`（专有）
- `Unknown`（未知）

### tags 标签

建议包含：
- 功能类型（如 `搜索`、`数据库`、`文件`）
- 应用场景（如 `生产力`、`开发`、`数据分析`）
- 技术特点（如 `实时`、`异步`、`缓存`）

---

## 注意事项

- ⚠️ **UID 格式**：`TO-{6位数字}`（TO-000001, TO-000002, TO-000003...）
- ⚠️ **description 控制在 100 字以内**
- ⚠️ **tags 使用 JSON 数组格式**
- ⚠️ **添加后必须重新构建并重启服务**：`npm run build && systemctl restart ai-links`
- 💡 **提供完整的使用示例**：帮助用户理解如何集成和使用
- 💡 **包含 API 参考**：列出主要函数和参数

---

## 数据库管理

### 查看现有插件
```bash
sqlite3 sqlite_db/app.db "SELECT uid, title, description, author FROM tools ORDER BY uid;"
```

### 查看插件指标
```bash
sqlite3 sqlite_db/app.db "SELECT t.uid, t.title, m.language, m.license, m.tags FROM tools t JOIN tool_metrics m ON t.uid = m.tool_uid;"
```

### 检查 UID 是否重复
```bash
sqlite3 sqlite_db/app.db "SELECT COUNT(*) FROM tools WHERE uid = 'TO-000006';"
```

### 删除插件
```bash
# 从数据库删除
sqlite3 sqlite_db/app.db "DELETE FROM tools WHERE uid = 'TO-000006';"
sqlite3 sqlite_db/app.db "DELETE FROM tool_metrics WHERE tool_uid = 'TO-000006';"

# 删除 Markdown 文件
rm -rf src/content/tools/TO-000006/

# 重新构建并重启
npm run build && systemctl restart ai-links
```

---

## 相关文档

- [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) - 项目整体架构
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署手册
- [PROMPT-ADD-MCP.md](./PROMPT-ADD-MCP.md) - MCP 服务添加指南
- [PROMPT-ADD-PROMPT.md](./PROMPT-ADD-PROMPT.md) - 提示词添加指南
