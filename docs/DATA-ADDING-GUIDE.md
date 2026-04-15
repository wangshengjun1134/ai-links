# AI Links 数据添加操作手册

本手册描述如何向 AI Links 项目添加各类数据（产品、智能体、提示词、MCP服务等），便于 AI 自动化添加数据。

---

## 1. 数据类型概览

| 数据类型 | JSON 文件 | Content 目录 | favicon 目录 | 详情页路由 |
|---------|----------|-------------|-------------|-----------|
| AI 产品 | `src/data/products.json` | `src/content/products/` | `public/product-favicons/` | `/product/[slug]` |
| 智能体 | `src/data/agents.json` | `src/content/agents/` | `public/agents-favicons/` | `/agent/[slug]` |
| 提示词 | `src/data/prompts.json` | `src/content/prompts/` | `public/prompts/` | `/skills/prompts/[uid]` |
| MCP 服务 | `src/data/mcp.json` | `src/content/mcps/` | `public/mcp-favicons/` | `/skills/mcps/[uid]` |
| 工具插件 | `src/data/tools.json` | - | - | 无详情页 |
| AI Hub | `src/data/aihub.json` | - | `public/aihub-favicons/` | 无详情页 |
| 大模型 | `src/data/llms.json` | - | - | 无详情页 |
| 文章 | `src/data/article.json` | `src/content/article/` | - | `/article/[uid]` |
| 新闻 | `src/data/news.json` | - | - | 无详情页 |

---

## 2. AI 产品添加流程

### 2.1 JSON 数据格式

在 `src/data/products.json` 中添加条目：

```json
{
  "uid": "10012345",
  "slug": "product-name",
  "logo": "/product-favicons/10012345.ico",
  "aiProductName": "产品名称",
  "introduction": "产品简介（一句话描述，50字以内）",
  "websiteUrl": "https://example.com",
  "metrics": {
    "productType": {
      "level1": "一级分类",
      "level2": "二级分类",
      "tags": ["标签1", "标签2"]
    },
    "company": "公司名称",
    "country": "国家",
    "pricingModel": ["免费", "订阅"],
    "useType": ["个人", "企业"],
    "languages": ["中文", "英文"],
    "modelLevel": "S-Tier",
    "hasApi": true,
    "needVpn": false,
    "isInternal": false,
    "rawProductType": ["补充分类"]
  }
}
```

### 2.2 字段说明

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| uid | string | ✅ | 8位数字唯一ID，从 10000001 开始 |
| slug | string | ✅ | URL友好的名称，用于详情页路由 |
| logo | string | ✅ | favicon路径，格式 `/product-favicons/{uid}.ico` |
| aiProductName | string | ✅ | 产品显示名称 |
| introduction | string | ✅ | 一句话简介 |
| websiteUrl | string | ✅ | 官网地址 |
| metrics.productType.level1 | string | ✅ | 一级分类（如"内容创作"、"开发工具"） |
| metrics.productType.level2 | string | ✅ | 二级分类（如"写作类"、"编程类"） |
| metrics.company | string | ✅ | 开发公司 |
| metrics.country | string | ✅ | 所属国家 |
| metrics.modelLevel | string | ⚠️ | 等级：S-Tier/A-Tier/B-Tier，可选 |
| metrics.hasApi | boolean | ⚠️ | 是否提供API |
| metrics.needVpn | boolean | ⚠️ | 国内是否需要代理 |

### 2.3 Content Markdown 格式

运行 `npm run generate` 后会自动生成到 `src/content/products/{slug}.md`，也可手动创建：

```markdown
---
uid: "10012345"
aiProductName: "产品名称"
introduction: "产品简介"
company: "公司名称"
country: "国家"
modelLevel: "S-Tier"
websiteUrl: "https://example.com"
logo: "/product-favicons/10012345.ico"
---

## 【产品概述】
产品的核心定位和主要功能的描述。

## 【核心功能】
1. **功能一**：描述
2. **功能二**：描述

## 【应用场景】
1. **场景一**：描述

## 【技术特点】
技术架构和差异化特点。

## 【定价信息】
免费/付费/订阅等。

## 【公司信息】
开发公司背景。
```

### 2.4 favicon 处理

将产品图标下载并保存到 `public/product-favicons/{uid}.ico` 或 `.png`。

---

## 3. 智能体添加流程

### 3.1 JSON 数据格式

在 `src/data/agents.json` 中添加：

```json
{
  "uid": "20012345",
  "slug": "agent-name",
  "logo": "/agents-favicons/20012345.ico",
  "aiProductName": "智能体名称",
  "introduction": "一句话简介",
  "websiteUrl": "https://example.com",
  "metrics": {
    "category": "通用智能体",
    "subCategory": "对话型智能体",
    "agentLevel": "L2_工作流型",
    "company": "公司名称",
    "country": "国家",
    "productType": {
      "level1": "智能体",
      "level2": "通用智能体",
      "tags": ["自动化", "多模态"]
    }
  }
}
```

### 3.2 agentLevel 分类

| 等级 | 说明 |
|-----|-----|
| L0_对话助手 | 纯对话交互 |
| L1_工具调用型 | 可调用外部工具 |
| L2_工作流型 | 可执行复杂工作流 |
| L3_自主执行型 | 可自主规划和执行 |
| L4_多智能体系统 | 多Agent协作 |

### 3.3 category 分类

- `通用智能体`
- `任务执行智能体`
- `内容创作智能体`
- `开发类智能体`
- `企业/行业智能体`
- `智能体基础设施`

---

## 4. 提示词添加流程

### 4.1 JSON 数据格式

在 `src/data/prompts.json` 中添加：

```json
{
  "uid": "30012345",
  "title": "提示词标题",
  "description": "提示词描述",
  "author": "作者名称",
  "category": {
    "scenario": "内容创作",
    "task": "写作",
    "modality": "text"
  },
  "tags": ["SEO", "营销", "文案"],
  "content": "完整的提示词内容..."
}
```

### 4.2 分类字段

| 字段 | 可选值 |
|-----|-------|
| scenario | 内容创作、办公效率、数据分析、编程开发、学习教育、多模态生成、AI Agent |
| task | 写作、总结、改写、翻译、生成、分析、提取、规划 |
| modality | text、image、video、audio、multimodal |

---

## 5. MCP 服务添加流程

### 5.1 JSON 数据格式

在 `src/data/mcp.json` 中添加：

```json
{
  "uid": "80012345",
  "title": "MCP 服务名称",
  "description": "服务描述",
  "author": "作者",
  "tags": ["数据库", "SQLite"],
  "category": {
    "serverType": "数据库",
    "authType": "api_key",
    "deploy": "local"
  },
  "content": "安装和使用说明..."
}
```

### 5.2 分类字段

| 字段 | 可选值 |
|-----|-------|
| serverType | 数据库、文件存储、搜索引擎、社交媒体、云服务、开发工具 |
| authType | api_key、oauth、none |
| deploy | local、docker、cloud、npx |

---

## 6. 自动化添加脚本流程

### 6.1 执行步骤

```bash
# 1. 添加 JSON 数据到对应文件
# 2. 下载 favicon 到对应目录
# 3. 运行生成脚本
npm run generate

# 4. 验证构建
npm run build

# 5. 本地预览
npm run dev
```

### 6.2 generate 脚本说明

项目有两个生成脚本：
- `scripts/generate-product-md.js`：从 products.json 生成产品 Markdown
- `scripts/generate-agent-md.js`：从 agents.json 生成智能体 Markdown

这些脚本会：
1. 读取 JSON 数据
2. 根据模板生成 Markdown 文件
3. 写入到 `src/content/` 目录

---

## 7. AI 自动添加数据的完整流程

### Step 1: 收集信息

从目标网站/产品获取：
- 名称、简介、官网地址
- 公司、国家、分类信息
- favicon（下载或从网站获取）

### Step 2: 分配 UID

根据类型分配 UID：
- 产品：10000001 - 19999999
- 智能体：20000001 - 29999999
- 提示词：30000001 - 39999999
- MCP：80000001 - 89999999

### Step 3: 生成 slug

将产品名转换为 URL友好的 slug：
- 转小写
- 空格替换为连字符
- 移除特殊字符

### Step 4: 添加 JSON 数据

将数据写入对应的 JSON 文件末尾。

### Step 5: 添加 favicon

下载图标并保存到对应的 favicon 目录。

### Step 6: 运行生成脚本

执行 `npm run generate` 生成 Markdown 内容。

### Step 7: 验证

执行 `npm run build` 确认无错误。

---

## 8. 注意事项

1. **UID 唯一性**：确保 UID 不重复
2. **slug 格式**：只能包含字母、数字、连字符
3. **favicon 格式**：支持 .ico、.png、.svg
4. **分类一致性**：使用预定义的分类值，参见 `src/data/filters.ts`
5. **中文编码**：JSON 文件使用 UTF-8 编码
6. **Markdown 格式**：详情页 Markdown 需遵循固定模板格式

---

## 9. 快速参考

### 一级分类列表

**产品 level1 分类**：
- 内容创作
- 视频与音频
- 平台与基础设施
- 办公与效率
- 商业与营销
- 数据与分析
- 开发与技术
- 图像与设计
- 学术研究

**智能体 category 分类**：
- 通用智能体
- 任务执行智能体
- 内容创作智能体
- 开发类智能体
- 企业/行业智能体
- 智能体基础设施

### 模型等级

- S-Tier（顶级）
- A-Tier（优秀）
- B-Tier（良好）