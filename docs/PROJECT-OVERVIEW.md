# AI Links 项目整体说明书

## 1. 项目概述

**AI Links** 是一个 AI 资源导航网站，帮助用户发现和探索各类 AI 产品、智能体、技能和学习资源。

### 1.1 核心功能

| 功能模块 | 描述 | 路由 |
|---------|------|-----|
| AI 产品 | AI 工具和产品目录，支持分类筛选和搜索 | `/products` |
| 智能体 Agent | AI Agent 目录，按类型和等级分类 | `/agents` |
| 技能 Skills | 提示词、插件、MCP 服务集合 | `/skills/prompts`, `/skills/tools`, `/skills/mcp` |
| AI Hub | AI 相关资源和工具汇总 | `/aihub` |
| 文章 | AI 相关科普、教程、博文 | `/article` |
| 新闻 | AI 行业新闻动态 | `/news` |

### 1.2 技术特点

- **静态站点**：使用 Astro 构建，生成静态 HTML，部署简单
- **响应式设计**：适配桌面端和移动端
- **实时筛选**：客户端实现多维度筛选和搜索
- **分页功能**：大数据量下的分页显示
- **详情页**：每个产品/智能体都有独立的详情页

---

## 2. 技术架构

### 2.1 技术栈

| 技术 | 版本 | 用途 |
|-----|------|-----|
| Astro | 5.x | 静态站点生成框架 |
| Tailwind CSS | 4.x | CSS 框架 |
| TypeScript | - | 类型支持 |
| Node.js | - | 数据生成脚本运行环境 |
| Sharp | - | 图片处理 |

### 2.2 项目结构

```
huggingface-replica/
├── astro.config.mjs      # Astro 配置
├── package.json          # 依赖管理
├── tsconfig.json         # TypeScript 配置
├── public/               # 静态资源
│   ├── product-favicons/ # 产品图标
│   ├── agents-favicons/  # 智能体图标
│   ├── mcp-favicons/     # MCP 图标
│   ├── aihub-favicons/   # AI Hub 图标
│   ├── prompts/          # 提示词资源
│   ├── logo.jpeg         # 网站图标
│   └── favicon.ico/svg   # favicon
├── scripts/              # 数据生成脚本
│   ├── generate-product-md.js
│   └── generate-agent-md.js
├── src/
│   ├── assets/           # 需构建处理的资源
│   ├── components/       # 组件目录
│   ├── content/          # Markdown 内容
│   │   ├── products/     # 产品详情
│   │   ├── agents/       # 智能体详情
│   │   ├── prompts/      # 提示词详情
│   │   ├── mcps/         # MCP 详情
│   │   ├── article/      # 文章内容
│   │   └── config.ts     # Content Collections 配置
│   ├── data/             # JSON 数据文件
│   │   ├── products.json
│   │   ├── agents.json
│   │   ├── prompts.json
│   │   ├── mcp.json
│   │   ├── tools.json
│   │   ├── aihub.json
│   │   ├── llms.json
│   │   ├── article.json
│   │   ├── news.json
│   │   └── filters.ts    # 筛选配置
│   ├── layouts/          # 布局组件
│   │   ├── Layout.astro         # 主布局
│   │   └── DetailPageLayout.astro # 详情页布局
│   ├── lib/              # 工具函数库
│   │   ├── multiFilter.ts       # 多选筛选
│   │   └── pagination.ts        # 分页工具
│   ├── pages/            # 页面文件
│   │   ├── index.astro
│   │   ├── products.astro
│   │   ├── agents.astro
│   │   ├── aihub.astro
│   │   ├── article.astro
│   │   ├── news.astro
│   │   ├── llms.astro
│   │   ├── product/[slug].astro
│   │   ├── agent/[slug].astro
│   │   ├── skills/
│   │   ├── article/[slug].astro
│   │   └── skills/
│   ├── plugins/          # Astro 插件
│   ├── scripts/          # 客户端脚本
│   │   └── cardClick.ts  # 卡片点击交互
│   └── styles/           # 全局样式
└── dist/                 # 构建输出
```

---

## 3. 代码架构

### 3.1 组件层级

```
Layout（布局）
├── Navbar（导航栏）
├── Sidebar（侧边栏筛选）
├── Main Content（主内容区）
│   ├── SearchBar（搜索栏）
│   ├── CardGrid（卡片网格）
│   │   └── BaseCard（基础卡片）
│   │       ├── ProductCard（产品卡片适配器）
│   │       ├── AgentCard（智能体卡片适配器）
│   │       ├── HubCard（Hub卡片适配器）
│   │       └── SkillCard（技能卡片）
│   └── Pagination（分页）
└── Footer（页脚）
```

### 3.2 核心组件说明

| 组件 | 位置 | 职责 |
|-----|------|-----|
| `Layout.astro` | layouts/ | 主布局，包含 Navbar、Footer、Sidebar slot |
| `DetailPageLayout.astro` | layouts/ | 详情页通用布局，减少重复代码 |
| `BaseCard.astro` | components/ | 通用卡片组件，支持紧凑/展开两种模式 |
| `ProductCard.astro` | components/ | 产品卡片，适配 BaseCard |
| `AgentCard.astro` | components/ | 智能体卡片，适配 BaseCard |
| `HubCard.astro` | components/ | AI Hub 卡片，适配 BaseCard |
| `SkillCard.astro` | components/ | 技能卡片（提示词/MCP/工具） |
| `Pagination.astro` | components/ | 分页组件 |
| `FilterButton.astro` | components/ | 筛选按钮组件 |
| `Navbar.astro` | components/ | 顶部导航栏 |
| `Footer.astro` | components/ | 底部页脚 |

### 3.3 客户端脚本

| 脚本 | 位置 | 职责 |
|-----|------|-----|
| `multiFilter.ts` | lib/ | 多维度筛选，支持同一维度 OR、不同维度 AND |
| `pagination.ts` | lib/ | 分页和搜索逻辑，统一处理 |
| `cardClick.ts` | scripts/ | 卡片点击展开/关闭交互 |

### 3.4 数据流

```
JSON 数据文件 (src/data/*.json)
    ↓
列表页读取渲染卡片
    ↓
用户筛选/搜索
    ↓
客户端脚本处理 (multiFilter + pagination)
    ↓
显示结果

Markdown 内容 (src/content/*)
    ↓
详情页通过 getCollection 获取
    ↓
渲染详情页
```

---

## 4. 数据配置

### 4.1 filters.ts 配置文件

`src/data/filters.ts` 统一管理所有筛选配置：

```typescript
// 导航配置
export const mainNavItems = [...];
export const skillsSubNav = [...];

// 产品筛选 emoji
export const productFilters = {
  level2Emoji: { '写作类': '✍️', ... }
};

// 智能体筛选
export const agentFilters = {
  categoryEmojis: {...},
  agentLevelEmojis: {...}
};

// 提示词筛选
export const promptFilters = {
  scenarios: [...],
  tasks: [...],
  modalities: [...]
};

// MCP 筛选
export const mcpFilters = {
  serverTypes: [...],
  authTypes: [...],
  deployments: [...]
};
```

### 4.2 Content Collections 配置

`src/content/config.ts` 定义内容 schema：

```typescript
const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    uid: z.string(),
    aiProductName: z.string(),
    introduction: z.string(),
    company: z.string(),
    country: z.string(),
    modelLevel: z.string(),
    websiteUrl: z.string().optional(),
    logo: z.string(),
  }),
});
```

---

## 5. 构建流程

### 5.1 npm scripts

```json
{
  "generate": "node scripts/generate-product-md.js && node scripts/generate-agent-md.js",
  "dev": "npm run generate && astro dev",
  "build": "npm run generate && astro build",
  "preview": "astro preview"
}
```

### 5.2 构建流程图

```
npm run build
    ↓
npm run generate
    ↓
generate-product-md.js
    ↓ 读取 products.json
    ↓ 生成 Markdown 文件
generate-agent-md.js
    ↓ 读取 agents.json
    ↓ 生成 Markdown 文件
    ↓
astro build
    ↓
Content Collections 处理
    ↓
静态页面生成
    ↓
输出到 dist/
```

---

## 6. 页面路由

### 6.1 静态路由

| 路由 | 页面文件 | 描述 |
|-----|---------|------|
| `/` | index.astro | 首页 |
| `/products` | products.astro | 产品列表 |
| `/agents` | agents.astro | 智能体列表 |
| `/aihub` | aihub.astro | AI Hub |
| `/article` | article.astro | 文章列表 |
| `/news` | news.astro | 新闻列表 |
| `/llms` | llms.astro | 大模型列表 |
| `/skills` | skills/index.astro | 重定向到 prompts |
| `/skills/prompts` | skills/prompts.astro | 提示词列表 |
| `/skills/tools` | skills/tools.astro | 工具列表 |
| `/skills/mcp` | skills/mcp.astro | MCP 列表 |

### 6.2 动态路由

| 路由 | 页面文件 | 描述 |
|-----|---------|------|
| `/product/[slug]` | product/[slug].astro | 产品详情页 |
| `/agent/[slug]` | agent/[slug].astro | 智能体详情页 |
| `/article/[slug]` | article/[slug].astro | 文章详情页 |
| `/skills/prompts/[uid]` | skills/prompts/[uid].astro | 提示词详情页 |
| `/skills/mcps/[uid]` | skills/mcps/[uid].astro | MCP 详情页 |

---

## 7. 样式系统

### 7.1 CSS 变量

```css
:root {
  --navbar-height: 64px;
  --subnav-height: 57px;
  --sidebar-top-single: 80px;
  --sidebar-top-with-subnav: 137px;
}
```

### 7.2 颜色规范

| 用途 | 颜色值 | Tailwind 类 |
|-----|-------|------------|
| 主色 | #171717 | `text-[#171717]` |
| 次色 | #525252 | `text-[#525252]` |
| 辅助色 | #A3A3A3 | `text-[#A3A3A3]` |
| 边框色 | #E5E5E5 | `border-[#E5E5E5]` |
| 背景色 | #F9FAFB | `bg-[#F9FAFB]` |

### 7.3 Tier 等级颜色

| 等级 | 颜色 |
|-----|-----|
| S-Tier | 金色 #D4AF37 |
| A-Tier | 紫色 #9333EA |
| B-Tier | 蓝色 #2563EB |

---

## 8. 扩展指南

### 8.1 添加新页面

1. 在 `src/pages/` 创建 `.astro` 文件
2. 使用 `Layout` 组件包裹
3. 配置 sidebar slot（如需要筛选）
4. 导入对应 JSON 数据
5. 渲染卡片列表

### 8.2 添加新数据类型

1. 创建 `src/data/{type}.json`
2. 在 `src/content/` 创建对应目录
3. 在 `src/content/config.ts` 添加 collection 定义
4. 创建列表页和详情页
5. 更新 `filters.ts` 添加筛选配置

### 8.3 添加新筛选维度

1. 在 `filters.ts` 添加筛选配置
2. 在列表页侧边栏添加筛选按钮
3. 更新 `multiFilter.ts` 的 `filterToDataAttr` 映射
4. 确保卡片有对应的 data 属性

---

## 9. 部署说明

### 9.1 构建命令

```bash
npm run build
```

输出目录：`dist/`

### 9.2 部署选项

- **静态托管**：Netlify、Vercel、GitHub Pages
- **CDN 部署**：将 dist/ 内容上传到 CDN
- **本地预览**：`npm run preview`

### 9.3 注意事项

- 构建前需先运行 `npm run generate`
- 大数据量（1000+条）构建时间约 20-30秒
- favicon 文件需手动上传到 public/

---

## 10. 维护建议

### 10.1 数据更新频率

- **产品数据**：每周/每月更新
- **智能体数据**：每周更新
- **新闻数据**：每日更新
- **文章数据**：按需更新

### 10.2 性能优化建议

- 定期清理未使用的 favicon
- 大数据量考虑分批加载
- 使用 CDN 加速静态资源

### 10.3 代码维护

- 组件复用优先使用 BaseCard
- 筛选配置统一在 filters.ts
- 客户端脚本使用 lib/ 下的工具函数