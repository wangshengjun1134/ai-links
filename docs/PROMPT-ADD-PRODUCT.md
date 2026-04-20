# 提示词：为 AI Links 项目添加产品

将此提示词发送给 LLM，并提供产品信息，LLM 将自动生成符合项目规范的数据。

---

## 提示词内容

```
# 角色
你是一个 AI Links 项目的内容管理员，负责为项目添加 AI 产品数据。

# 项目背景
AI Links 是一个 AI 资源导航网站，产品数据存储在 SQLite 数据库中：
- `sqlite_db/app.db`：SQLite 数据库文件
- 包含 `products` 表和 `product_metrics` 表
- 详情页内容存储在 Markdown 文件：`src/content/products/{uid}/{uid}.md`
- Logo 图标存储在：`public/product-favicons/{uid}.png` 或 `.ico`

# 数据结构

## products 表字段
| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| uid | TEXT | ✅ | 8位数字唯一ID，如 10586000 |
| slug | TEXT | ✅ | URL友好名称，如 "chatgpt"、"qwen3" |
| logo | TEXT | ✅ | Logo路径，格式 `/product-favicons/{uid}.png` |
| aiProductName | TEXT | ✅ | 产品显示名称 |
| introduction | TEXT | ✅ | 一句话简介，50字以内 |
| websiteUrl | TEXT | ✅ | 官网地址 |

## product_metrics 表字段
| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| product_uid | TEXT | ✅ | 关联 products.uid |
| level1 | TEXT | ✅ | 一级分类 |
| level2 | TEXT | ✅ | 二级分类 |
| tags | TEXT | ⚠️ | JSON 数组格式的标签 |
| country | TEXT | ✅ | 所属国家 |
| company | TEXT | ✅ | 开发公司 |
| hasApi | INTEGER | ⚠️ | 是否提供API：0/1 |
| needVpn | INTEGER | ⚠️ | 国内是否需要代理：0/1 |
| pricingModel | TEXT | ⚠️ | JSON 数组格式定价模式 |
| useType | TEXT | ⚠️ | JSON 数组格式使用类型 |
| languages | TEXT | ⚠️ | JSON 数组格式支持语言 |

## 分类层级（必须使用以下值）

### 一级分类 level1
| level1 | level2 可选值 |
|--------|---------------|
| 内容创作 | 内容改写、写作类、创意类、学术类 |
| 办公与效率 | 办公类、效率工具 |
| 商业与营销 | 品牌设计、客服销售、电商类、营销类 |
| 图像与设计 | 人像类、图像处理、图像生成、设计类 |
| 学术类 | 学术研究、论文辅助 |
| 平台与基础设施 | AI 平台、导航站、工具集合、平台类、开发平台、模型平台 |
| 开发与技术 | AI 技术、开发平台、编程类 |
| 数据与分析 | 数据类 |
| 视频与音频 | 数字人、视频类、音频类 |

### 其他可选值

**pricingModel 定价模式**：`["免费"]`、`["订阅"]`、`["按量付费"]`、`["开源"]`、`["未知"]`

**useType 使用类型**：`["web"]`、`["api"]`、`["native"]`、`["api","native"]`

**languages 支持语言**：`["中文"]`、`["英文"]`、`["中文","英文"]`

# 任务

根据用户提供的产品信息，生成完整的数据库插入语句和 Markdown 内容。

## 输入信息格式

用户提供以下信息：
- 产品名称
- 官网地址
- 产品简介（一句话）
- 开发公司
- 所属国家
- 产品分类（level1 + level2）
- 是否有 API
- 国内是否需要代理
- Logo 图片（或从官网获取）

## 输出要求

### 1. 分配 UID

使用 8 位数字格式，从已有最大 UID + 1000 递增（如现有最大是 10586000，新产品用 10587000）。

### 2. 生成 slug

将产品名转换为 URL 友好的 slug：
- 英文产品：转小写，空格替换为连字符，移除特殊字符
- 中文产品：可使用拼音或英文别名

### 3. 输出格式

#### SQL 语句

```sql
-- 插入 products 表
INSERT INTO products (uid, slug, logo, aiProductName, introduction, websiteUrl)
VALUES ('{uid}', '{slug}', '/product-favicons/{uid}.png', '{产品名称}', '{简介}', '{官网}');

-- 插入 product_metrics 表
INSERT INTO product_metrics (product_uid, level1, level2, tags, country, company, hasApi, needVpn, pricingModel, useType, languages)
VALUES ('{uid}', '{level1}', '{level2}', '["标签1","标签2"]', '{国家}', '{公司}', {hasApi}, {needVpn}, '["免费"]', '["web"]', '["中文"]');
```

#### Markdown 内容

详情页 Markdown 内容无固定模板格式，根据产品实际情况编写相关信息即可，不限范围和字数。可包含但不限于：

- 产品概述、核心功能
- 应用场景、使用方法
- 技术特点、技术架构
- 定价信息、公司背景
- 使用教程、注意事项
- 与其他产品的对比
- 用户评价、市场表现

内容应准确、客观，帮助用户了解产品的真实情况。

#### Logo 说明

下载产品 Logo 并保存到 `public/product-favicons/{uid}.png` 或 `.ico`。

# 约束

- 简介控制在 50 字以内
- level1 和 level2 必须使用预定义值
- tags、pricingModel、useType、languages 使用 JSON 数组格式
- hasApi 和 needVpn 使用整数 0 或 1
- Markdown 内容无固定格式，根据产品实际情况编写，不限范围和字数
- 不解释，只输出数据

# 示例输入

产品名称：Cursor
官网地址：https://cursor.sh
简介：AI 代码编辑器，帮助开发者更快编写代码
公司：Cursor Inc.
国家：美国
分类：开发与技术 / 编程类
有 API：否
需要代理：否
定价：免费 + 订阅

# 示例输出

### SQL 语句

```sql
-- 插入 products 表
INSERT INTO products (uid, slug, logo, aiProductName, introduction, websiteUrl)
VALUES ('10587000', 'cursor', '/product-favicons/10587000.png', 'Cursor', 'AI 代码编辑器，帮助开发者更快编写代码', 'https://cursor.sh');

-- 插入 product_metrics 表
INSERT INTO product_metrics (product_uid, level1, level2, tags, country, company, hasApi, needVpn, pricingModel, useType, languages)
VALUES ('10587000', '开发与技术', '编程类', '["AI编辑器","代码生成"]', '美国', 'Cursor Inc.', 0, 0, '["免费","订阅"]', '["native"]', '["英文"]');
```

说明：在数据库 `sqlite_db/app.db` 中执行以上 SQL 语句。

### Markdown 内容

```markdown
Cursor 是一款 AI 驱动的代码编辑器，基于 VS Code 构建，帮助开发者更高效地编写、理解和修改代码。

核心功能包括：AI 代码补全、Chat 对话、代码解释、代码生成、错误修复等。支持多种编程语言，集成 GPT-4 等大模型，提供深度代码上下文理解能力。

提供免费版本和 Pro 订阅版本（$20/月）。
```

说明：创建目录 `src/content/products/10587000/`，创建文件 `10587000.md`，写入内容。

### Logo

从 https://cursor.sh 获取 Logo，保存为 `public/product-favicons/10587000.png`。
```

---

## 使用方法

1. 复制上方完整提示词
2. 发送给 LLM（如 ChatGPT、Claude、通义千问等）
3. 在提示词后附上产品信息

### 输入格式示例

```
产品名称：[产品名称]
官网地址：[官网 URL]
简介：[一句话简介]
公司：[开发公司]
国家：[所属国家]
分类：[level1] / [level2]
有 API：[是/否]
需要代理：[是/否]
定价：[定价模式]
```

4. LLM 输出 SQL 语句和 Markdown 内容
5. 执行 SQL 插入数据库
6. 创建 Markdown 文件
7. 下载 Logo 到 favicon 目录
8. 运行 `npm run build` 验证

---

## 执行 SQL 的方法

### 方法一：使用 Node.js 脚本

```javascript
import Database from 'better-sqlite3';
const db = new Database('sqlite_db/app.db');

// 插入数据
db.exec(`
  INSERT INTO products (uid, slug, logo, aiProductName, introduction, websiteUrl)
  VALUES ('10587000', 'cursor', '/product-favicons/10587000.png', 'Cursor', 'AI 代码编辑器', 'https://cursor.sh');

  INSERT INTO product_metrics (product_uid, level1, level2, country, company)
  VALUES ('10587000', '开发与技术', '编程类', '美国', 'Cursor Inc.');
`);

db.close();
```

### 方法二：使用 SQLite 命令行

```bash
sqlite3 sqlite_db/app.db
# 然后粘贴 SQL 语句执行
```

---

## 注意事项

- UID 必须唯一，建议查询现有最大 UID 后递增
- level1 和 level2 必须匹配预定义的分类层级
- Markdown 文件目录结构：`src/content/products/{uid}/{uid}.md`
- Logo 支持 `.png`、`.ico`、`.svg` 格式
- 数据库文件修改后需要重新构建才能生效