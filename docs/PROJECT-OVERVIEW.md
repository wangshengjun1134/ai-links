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

- **源码与数据分离**：内容数据存储在独立仓库，便于分享和同步
- **SSR 动态渲染**：使用 Astro SSR 模式 + Node.js 适配器，实时渲染页面
- **数据库驱动**：使用 SQLite 存储数据，支持动态查询和实时统计
- **响应式设计**：适配桌面端和移动端
- **实时筛选**：客户端实现多维度筛选和搜索
- **分页功能**：大数据量下的分页显示
- **详情页预渲染**：Build 时生成静态详情页，优化 SEO
- **SEO 优化**：完整的 Open Graph、Twitter Card、结构化数据支持

---

## 2. 技术架构

### 2.1 技术栈

| 技术 | 版本 | 用途 |
|-----|------|-----|
| Astro | 5.x | SSR 站点框架 |
| Node.js | 22.x | 服务器运行时 |
| SQLite | 3.x | 轻量级数据库 |
| sql.js | - | 纯 JS SQLite 实现 |
| Tailwind CSS | 4.x | CSS 框架 |
| TypeScript | - | 类型支持 |
| Sharp | - | 图片处理 |
| Nginx | 1.24.x | 反向代理服务器 |

### 2.2 数据分离架构（v2.1）

```
┌─────────────────────────────────────────────────────────────┐
│                    ai-links (源码仓库)                        │
│  - Astro 页面组件                                            │
│  - 数据库查询层 (db.ts)                                       │
│  - 筛选配置 (filters.ts)                                      │
│  - 构建脚本                                                   │
└─────────────────────────────────────────────────────────────┘
          │                                    │
          │ junction/symlink                   │ 路径引用
          ↓                                    ↓
┌─────────────────────────────────────────────────────────────┐
│                  ai-links-data (内容仓库)                     │
│  ├── sqlite_db/app.db        # SQLite 数据库                 │
│  ├── content/                # Markdown 详情                  │
│  │   ├── products/                                          │
│  │   ├── agents/                                            │
│  │   ├── prompts/                                           │
│  │   ├── mcps/                                              │
│  │   ├── tools/                                             │
│  │   └── article/                                           │
│  ├── favicons/               # 图标图片                       │
│  │   ├── product-favicons/                                  │
│  │   ├── agents-favicons/                                   │
│  │   ├── mcp-favicons/                                      │
│  │   └── aihub-favicons/                                    │
│  └── README.md               # 数据仓库说明                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 数据流向

```
用户请求
    ↓
https://ai-links.cn
    ↓
Nginx (反向代理)
    ↓
Node.js:4321 (Astro SSR Server)
    ↓
ai-links-data/sqlite_db/app.db (数据库查询)
    ↓
SSR 渲染 HTML
    ↓
返回给用户
```

### 2.4 项目结构

```
ai-links/                      # 源码仓库
├── astro.config.mjs           # Astro 配置（SSR 模式）
├── package.json               # 依赖管理
├── tsconfig.json              # TypeScript 配置
│
├── ai-links-data/             # 内容仓库（独立 Git/Submodule）
│   ├── sqlite_db/
│   │   └── app.db             # SQLite 数据库
│   ├── content/               # Markdown 详情内容
│   │   ├── agents/
│   │   ├── article/
│   │   ├── mcps/
│   │   ├── products/
│   │   ├── prompts/
│   │   ├── tools/
│   │   └── config.ts          # Content Collections 配置
│   ├── favicons/              # 图标图片
│   │   ├── agents-favicons/
│   │   ├── aihub-favicons/
│   │   ├── mcp-favicons/
│   │   └── product-favicons/
│   ├── README.md
│   └── .gitignore
│
├── src/                       # 源码目录
│   │── content/               → junction → ai-links-data/content
│   ├── assets/                # 需构建处理的资源
│   ├── components/            # 组件目录
│   ├── data/                  # 配置数据
│   │   ├── filters.ts         # 筛选配置
│   │   ├── sql-ddl/schema.sql # 数据库 schema
│   │   └── sql-dml/*.sql      # SQL 数据脚本
│   ├── layouts/               # 布局组件
│   ├── lib/                   # 工具函数库
│   │   └── db.ts              # 数据库操作封装
│   ├── pages/                 # 页面文件
│   ├── plugins/               # Astro 插件
│   ├── scripts/               # 客户端脚本
│   └── styles/                # 全局样式
│
├── public/                    # 静态资源
│   ├── product-favicons/      → junction → ai-links-data/favicons/product-favicons
│   ├── agents-favicons/       → junction → ai-links-data/favicons/agents-favicons
│   ├── mcp-favicons/          → junction → ai-links-data/favicons/mcp-favicons
│   ├── aihub-favicons/        → junction → ai-links-data/favicons/aihub-favicons
│   ├── prompts/               # 提示词资源
│   ├── logo.jpeg              # 网站图标
│   └── favicon.ico/svg        # favicon
│
├── scripts/                   # 数据生成和管理脚本
│   ├── generate-sitemap.js    # sitemap 生成
│   └── setup-junctions.bat    # Windows junction 配置脚本
│
├── dist/                      # 构建输出（SSR 服务器）
│   ├── client/                # 静态资源
│   └── server/                # Node.js 服务器入口
│
└── docs/                      # 项目文档
    ├── PROJECT-OVERVIEW.md    # 本文档
    ├── SUBMODULE-SETUP.md     # Submodule 配置指南
    ├── DATA-ADDING-GUIDE.md   # 数据添加指南
    ├── DEPLOYMENT.md          # 部署手册
    └── ...
```

---

## 3. 数据仓库结构

### 3.1 ai-links-data 目录

| 目录 | 内容 | 说明 |
|-----|------|-----|
| `sqlite_db/app.db` | SQLite 数据库 | 产品、智能体等结构化数据 |
| `content/products/` | Markdown 详情 | 产品详情页内容 |
| `content/agents/` | Markdown 详情 | 智能体详情页内容 |
| `content/prompts/` | Markdown 详情 | 提示词详情页内容 |
| `content/mcps/` | Markdown 详情 | MCP 详情页内容 |
| `content/tools/` | Markdown 详情 | 工具详情页内容 |
| `content/article/` | Markdown 详情 | 文章详情页内容 |
| `favicons/product-favicons/` | 图标 | 产品 favicon |
| `favicons/agents-favicons/` | 图标 | 智能体 favicon |
| `favicons/mcp-favicons/` | 图标 | MCP favicon |
| `favicons/aihub-favicons/` | 图标 | AI Hub favicon |

### 3.2 UID 格式规范

| 类型 | UID 前缀 | 示例 |
|-----|---------|-----|
| 产品 | PD | PD-000001 |
| 智能体 | AG | AG-000001 |
| 提示词 | PM | PM-000001 |
| MCP 服务 | MC | MC-000001 |
| 工具 | TO | TO-000001 |
| 文章 | AR | AR-000001 |
| 新闻 | NE | NE-000001 |
| AI Hub | AH | AH-000001 |

---

## 4. 数据流详解

### 4.1 列表页（SSR 动态）

```
用户访问 /products
    ↓
Astro SSR Server
    ↓
db.ts 查询 ai-links-data/sqlite_db/app.db
    ↓
实时渲染 HTML
    ↓
返回页面（数据实时更新）
```

**特点**：数据库更新后，列表页立即反映新数据（无需重新 build）。

### 4.2 详情页（预渲染）

```
npm run build
    ↓
getStaticPaths() 从数据库获取所有 slug
    ↓
预渲染每个详情页为静态 HTML
    ↓
写入 dist/client/product/[slug]/index.html
    ↓
部署后静态访问

npm run build 时同时读取：
- ai-links-data/sqlite_db/app.db（数据库）
- ai-links-data/content/*/（Markdown 详情）
```

**特点**：详情页在 build 时生成，数据更新需重新 build。

### 4.3 数据更新策略

| 场景 | 操作 | 生效方式 |
|-----|------|---------|
| 新增产品 | 更新数据库 + Markdown | 重新 build |
| 修改产品信息 | 更新数据库 | 列表页立即生效，详情页需 build |
| 修改详情内容 | 更新 Markdown | 重新 build |
| 更新图标 | 上传到 favicons | 重新 build |

---

## 5. 组件架构

### 5.1 组件层级

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
│   │       ├── HubCard（Hub 卡片适配器）
│   │       └── SkillCard（技能卡片）
│   └── Pagination（分页）
└── Footer（页脚）
```

### 5.2 核心组件说明

| 组件 | 位置 | 职责 |
|-----|------|-----|
| `Layout.astro` | src/layouts/ | 主布局，包含 SEO meta、Navbar、Footer、Sidebar slot |
| `DetailPageLayout.astro` | src/layouts/ | 详情页通用布局 |
| `BaseCard.astro` | src/components/ | 通用卡片组件，支持紧凑/展开两种模式 |
| `ProductCard.astro` | src/components/ | 产品卡片，适配 BaseCard |
| `AgentCard.astro` | src/components/ | 智能体卡片 |
| `Pagination.astro` | src/components/ | 分页组件 |

### 5.3 数据库层

| 模块 | 位置 | 职责 |
|-----|------|-----|
| `db.ts` | src/lib/ | 数据库连接和查询封装（路径指向 ai-links-data） |
| `generate-sitemap.js` | scripts/ | 从数据库生成 sitemap |

**数据库路径配置**：
```typescript
// src/lib/db.ts
const dbPath = path.resolve(process.cwd(), 'ai-links-data', 'sqlite_db', 'app.db');
```

---

## 6. 构建与运行

### 6.1 开发模式

```bash
# 确保 junction 链接存在
scripts\setup-junctions.bat  # Windows

# 启动开发服务器
npm run dev
```

### 6.2 生产构建

```bash
npm run build
```

构建流程：
```
npm run build
    ↓
npm run sitemap
    ↓ 读取 ai-links-data/sqlite_db/app.db
    ↓ 生成 public/sitemap.xml
astro build
    ↓ 预渲染详情页
    ↓ 输出到 dist/
```

### 6.3 运行生产服务器

```bash
node dist/server/entry.mjs
```

---

## 7. 页面路由

### 7.1 静态路由（SSR）

| 路由 | 页面文件 | 数据来源 |
|-----|---------|---------|
| `/` | index.astro | 数据库实时统计 |
| `/products` | products.astro | 数据库实时查询 |
| `/agents` | agents.astro | 数据库实时查询 |
| `/aihub` | aihub.astro | 数据库实时查询 |
| `/article` | article.astro | 数据库实时查询 |
| `/news` | news.astro | 数据库实时查询 |
| `/llms` | llms.astro | 数据库实时查询 |
| `/skills/prompts` | skills/prompts.astro | 数据库实时查询 |
| `/skills/tools` | skills/tools.astro | 数据库实时查询 |
| `/skills/mcp` | skills/mcp.astro | 数据库实时查询 |

### 7.2 动态路由（预渲染）

| 路由 | 页面文件 | 数据来源 |
|-----|---------|---------|
| `/product/[slug]` | product/[slug].astro | Build 时从数据库 + Markdown |
| `/agent/[slug]` | agent/[slug].astro | Build 时从数据库 + Markdown |
| `/article/[slug]` | article/[slug].astro | Build 时从数据库 + Markdown |
| `/skills/prompts/[slug]` | skills/prompts/[slug].astro | Build 时从数据库 + Markdown |
| `/skills/mcps/[slug]` | skills/mcps/[slug].astro | Build 时从数据库 + Markdown |
| `/skills/tools/[slug]` | skills/tools/[slug].astro | Build 时从数据库 + Markdown |

---

## 8. 扩展指南

### 8.1 添加新数据类型

1. 在 `ai-links-data/sqlite_db/app.db` 中创建新表
2. 在 `src/data/sql-ddl/schema.sql` 添加 schema 定义
3. 在 `src/lib/db.ts` 添加查询函数
4. 在 `ai-links-data/content/` 创建对应目录
5. 在 `ai-links-data/content/config.ts` 添加 collection 定义
6. 在 `ai-links-data/favicons/` 创建图标目录
7. 创建列表页和详情页
8. 更新 `filters.ts` 添加筛选配置
9. 更新 `scripts/generate-sitemap.js` 添加新路由

### 8.2 添加新筛选维度

1. 在 `filters.ts` 添加筛选配置
2. 在列表页侧边栏添加筛选按钮
3. 更新 `multiFilter.ts` 的 `filterToDataAttr` 映射
4. 确保卡片有对应的 data 属性

---

## 9. 部署说明

### 9.1 Windows 开发环境

```bash
# 配置 junction 链接
scripts\setup-junctions.bat

# 开发
npm run dev
```

### 9.2 Linux 生产环境

```bash
# 创建 symlink
ln -s /path/to/ai-links-data/content /path/to/ai-links/src/content
ln -s /path/to/ai-links-data/favicons/product-favicons /path/to/ai-links/public/product-favicons
ln -s /path/to/ai-links-data/favicons/agents-favicons /path/to/ai-links/public/agents-favicons
ln -s /path/to/ai-links-data/favicons/mcp-favicons /path/to/ai-links/public/mcp-favicons
ln -s /path/to/ai-links-data/favicons/aihub-favicons /path/to/ai-links/public/aihub-favicons

# 构建
npm run build

# 启动服务
node dist/server/entry.mjs
```

详见 [SUBMODULE-SETUP.md](./SUBMODULE-SETUP.md) 和 [DEPLOYMENT.md](./DEPLOYMENT.md)。

---

## 10. 维护建议

### 10.1 数据更新流程

```bash
# 1. 更新 ai-links-data 内容
cd ai-links-data
# 修改数据库、Markdown、图标

# 2. 提交内容仓库
git add .
git commit -m "更新产品数据"
git push

# 3. 回到源码仓库重新 build
cd ai-links
npm run build

# 4. 重启服务
systemctl restart ai-links
```

### 10.2 日志监控

```bash
# 查看应用日志
tail -f /var/log/ai-links-server.log

# 查看系统日志
journalctl -u ai-links -f
```

---

## 11. 相关文档

- **[Submodule 配置指南](./SUBMODULE-SETUP.md)** - 数据仓库配置和同步
- **[部署手册](./DEPLOYMENT.md)** - 完整的部署指南
- **[数据添加指南](./DATA-ADDING-GUIDE.md)** - 如何添加新数据
- **[产品添加提示词](./PROMPT-ADD-PRODUCT.md)** - AI 辅助添加产品

---

## 12. 版本历史

- **v2.1 (2026-04-27)**: 数据分离架构
  - ✅ 源码与内容数据分离到独立仓库
  - ✅ 使用 junction/symlink 连接
  - ✅ 支持内容独立分享和同步
  - ✅ 添加 setup-junctions.bat 配置脚本

- **v2.0 (2026-04-21)**: SSR 架构迁移
  - ✅ 使用 Astro SSR 模式 + Node.js 适配器
  - ✅ 使用 SQLite 数据库替代 JSON 文件
  - ✅ 配置 Nginx 反向代理
  - ✅ 配置 systemd 开机自启动
  - ✅ 完整的 SEO 优化

- **v1.0**: 静态站点版本
  - 使用 Astro 构建静态 HTML
  - 数据存储在 JSON 文件中

---

## 附录：快速命令参考

```bash
# 开发
npm run dev

# 构建
npm run build

# 配置 junction（Windows）
scripts\setup-junctions.bat

# 重启服务（Linux）
systemctl restart ai-links

# 查看日志
tail -f /var/log/ai-links-server.log

# 数据库备份
cp ai-links-data/sqlite_db/app.db ai-links-data/sqlite_db/app.db.backup.$(date +%Y%m%d)

# 生成 sitemap
npm run sitemap
```