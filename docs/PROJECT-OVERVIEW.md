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

- **SSR 动态渲染**：使用 Astro SSR 模式 + Node.js 适配器，实时渲染页面
- **数据库驱动**：使用 SQLite 存储数据，支持动态查询和实时统计
- **响应式设计**：适配桌面端和移动端
- **实时筛选**：客户端实现多维度筛选和搜索
- **分页功能**：大数据量下的分页显示
- **详情页**：每个产品/智能体都有独立的详情页
- **SEO 优化**：完整的 Open Graph、Twitter Card、结构化数据支持
- **百度收录**：包含百度站长验证和 sitemap 自动生成

---

## 2. 技术架构

### 2.1 技术栈

| 技术 | 版本 | 用途 |
|-----|------|-----|
| Astro | 5.x | SSR 站点框架 |
| Node.js | 22.x | 服务器运行时 |
| SQLite | 3.x | 轻量级数据库 |
| better-sqlite3 | - | Node.js SQLite 驱动 |
| Tailwind CSS | 4.x | CSS 框架 |
| TypeScript | - | 类型支持 |
| Sharp | - | 图片处理 |
| Nginx | 1.24.x | 反向代理服务器 |

### 2.2 架构图

```
用户访问
    ↓
https://ai-links.cn
    ↓
Nginx (反向代理)
    ↓
Node.js:4321 (Astro SSR Server)
    ↓
SQLite 数据库查询
    ↓
实时渲染 HTML
    ↓
返回给用户
```

### 2.3 项目结构

```
ai-links/
├── astro.config.mjs      # Astro 配置（SSR 模式）
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
├── scripts/              # 数据生成和管理脚本
│   ├── generate-sitemap.js    # sitemap 生成
│   ├── generate-product-md.js # 产品 Markdown 生成
│   └── generate-agent-md.js   # 智能体 Markdown 生成
├── sqlite_db/            # SQLite 数据库文件
│   └── ai-links.db       # 主数据库
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
│   ├── data/             # JSON 数据文件和配置
│   │   ├── filters.ts    # 筛选配置
│   │   └── ...           # 其他静态数据
│   ├── layouts/          # 布局组件
│   │   ├── Layout.astro         # 主布局（含 SEO meta）
│   │   └── DetailPageLayout.astro # 详情页布局
│   ├── lib/              # 工具函数库
│   │   ├── db.ts                # 数据库操作封装
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
├── dist/                 # 构建输出（SSR 服务器）
│   ├── client/           # 静态资源
│   └── server/           # Node.js 服务器入口
└── docs/                 # 项目文档
    ├── PROJECT-OVERVIEW.md
    ├── DEPLOYMENT.md
    └── ...
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
│   │       ├── HubCard（Hub 卡片适配器）
│   │       └── SkillCard（技能卡片）
│   └── Pagination（分页）
└── Footer（页脚）
```

### 3.2 核心组件说明

| 组件 | 位置 | 职责 |
|-----|------|-----|
| `Layout.astro` | src/layouts/ | 主布局，包含 SEO meta、Navbar、Footer、Sidebar slot |
| `DetailPageLayout.astro` | src/layouts/ | 详情页通用布局，减少重复代码 |
| `BaseCard.astro` | src/components/ | 通用卡片组件，支持紧凑/展开两种模式 |
| `ProductCard.astro` | src/components/ | 产品卡片，适配 BaseCard |
| `AgentCard.astro` | src/components/ | 智能体卡片，适配 BaseCard |
| `HubCard.astro` | src/components/ | AI Hub 卡片，适配 BaseCard |
| `SkillCard.astro` | src/components/ | 技能卡片（提示词/MCP/工具） |
| `Pagination.astro` | src/components/ | 分页组件 |
| `FilterButton.astro` | src/components/ | 筛选按钮组件 |
| `Navbar.astro` | src/components/ | 顶部导航栏 |
| `Footer.astro` | src/components/ | 底部页脚 |

### 3.3 数据库层

| 模块 | 位置 | 职责 |
|-----|------|-----|
| `db.ts` | src/lib/ | 数据库连接和查询封装 |
| `sqlite_db/ai-links.db` | 根目录 | SQLite 数据库文件 |
| 数据表 | - | products, agents, prompts, mcps, tools, aihub, llms, article, news |

**数据库操作示例**：
```typescript
import { getProducts, getProductsCount } from '../lib/db';

// 获取产品列表（支持分页和筛选）
const products = await getProducts(page, limit, filters);

// 获取产品总数
const count = await getProductsCount();
```

### 3.4 客户端脚本

| 脚本 | 位置 | 职责 |
|-----|------|-----|
| `multiFilter.ts` | src/lib/ | 多维度筛选，支持同一维度 OR、不同维度 AND |
| `pagination.ts` | src/lib/ | 分页和搜索逻辑，统一处理 |
| `cardClick.ts` | src/scripts/ | 卡片点击展开/关闭交互 |

### 3.5 数据流

```
SQLite 数据库 (sqlite_db/ai-links.db)
    ↓
src/lib/db.ts 封装查询
    ↓
列表页/详情页实时查询
    ↓
SSR 渲染 HTML
    ↓
用户筛选/搜索
    ↓
客户端脚本处理 (multiFilter + pagination)
    ↓
DOM 更新显示结果

Markdown 内容 (src/content/*)
    ↓
详情页通过 getCollection 获取
    ↓
SSR 渲染详情页
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

## 5. 构建与运行

### 5.1 npm scripts

```json
{
  "sitemap": "node scripts/generate-sitemap.js",
  "dev": "npm run sitemap && astro dev",
  "build": "npm run sitemap && astro build",
  "preview": "node dist/server/entry.mjs",
  "astro": "astro"
}
```

### 5.2 开发模式

```bash
# 启动开发服务器（热重载）
npm run dev
```

访问：`http://localhost:4321/`

### 5.3 生产构建

```bash
# 1. 生成 sitemap
npm run sitemap

# 2. 构建项目
npm run build
```

构建输出：
```
dist/
├── client/    # 静态资源（CSS、JS、图片）
└── server/    # Node.js SSR 服务器入口
    └── entry.mjs
```

### 5.4 运行生产服务器

```bash
# 直接运行
node dist/server/entry.mjs

# 或使用 systemd 服务（推荐）
systemctl start ai-links
```

### 5.5 构建流程图

```
npm run build
    ↓
npm run sitemap
    ↓ 读取数据库
    ↓ 生成 sitemap.xml
    ↓ 生成 robots.txt
astro build
    ↓
SSR 模式构建
    ↓
输出 client/ 和 server/
    ↓
Node.js 运行 server/entry.mjs
    ↓
监听端口 4321
```

---

## 6. 页面路由

### 6.1 静态路由

| 路由 | 页面文件 | 描述 |
|-----|---------|------|
| `/` | index.astro | 首页（从数据库统计数据） |
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
3. 从 `src/lib/db` 导入数据查询函数
4. 配置 sidebar slot（如需要筛选）
5. 渲染卡片列表

### 8.2 添加新数据类型

1. 在数据库中创建新表
2. 在 `src/lib/db.ts` 添加查询函数
3. 在 `src/content/` 创建对应目录（如需要 Markdown）
4. 在 `src/content/config.ts` 添加 collection 定义
5. 创建列表页和详情页
6. 更新 `filters.ts` 添加筛选配置

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

输出目录：`dist/`（包含 client/ 和 server/）

### 9.2 生产环境部署

**完整部署流程**：

1. **构建项目**：
   ```bash
   npm run build
   ```

2. **配置 systemd 服务**：
   ```bash
   systemctl start ai-links
   systemctl enable ai-links
   ```

3. **配置 Nginx 反向代理**：
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:4321;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

4. **验证部署**：
   ```bash
   curl -s https://ai-links.cn/ | grep 'canonical'
   ```

### 9.3 部署检查清单

- [ ] 服务状态：`systemctl status ai-links` → Active: active (running)
- [ ] 端口监听：`lsof -ti:4321` → 有进程 ID
- [ ] 本地访问：`curl http://localhost:4321/` → 返回 HTML
- [ ] 域名访问：`curl https://ai-links.cn/` → 返回 HTML
- [ ] Canonical URL：包含 `href="https://ai-links.cn/"`
- [ ] Nginx 状态：`nginx -t` → syntax is ok
- [ ] 日志正常：无 ERROR 级别错误

### 9.4 服务管理

```bash
# 查看服务状态
systemctl status ai-links

# 重启服务
systemctl restart ai-links

# 查看日志
tail -f /var/log/ai-links-server.log

# 使用管理脚本
./scripts/manage-service.sh restart
```

---

## 10. 维护建议

### 10.1 数据更新

- **产品数据**：通过后台脚本或直接操作数据库更新
- **智能体数据**：每周更新
- **新闻数据**：每日更新
- **文章数据**：按需更新
- **数据库备份**：定期备份 `sqlite_db/ai-links.db`

### 10.2 性能优化建议

- 数据库查询添加索引（特别是常用查询字段）
- 定期清理数据库中的冗余数据
- 使用 CDN 加速静态资源（/logo.jpeg、favicon 等）
- 启用 Nginx gzip 压缩

### 10.3 日志监控

```bash
# 查看应用日志
tail -f /var/log/ai-links-server.log

# 查看系统日志
journalctl -u ai-links -f

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 10.4 代码维护

- 组件复用优先使用 BaseCard
- 筛选配置统一在 filters.ts
- 客户端脚本使用 lib/ 下的工具函数
- 数据库操作统一在 db.ts 封装

---

## 11. 相关文档

- **[部署手册](./DEPLOYMENT.md)** - 完整的部署指南和故障排查
- **[数据添加指南](./DATA-ADDING-GUIDE.md)** - 如何添加新产品、智能体等数据
- **[提示词添加提示词](./PROMPT-ADD-ARTICLE.md)** - 使用 AI 助手添加文章
- **[新闻添加提示词](./PROMPT-ADD-NEWS.md)** - 使用 AI 助手添加新闻
- **[产品添加提示词](./PROMPT-ADD-PRODUCT.md)** - 使用 AI 助手添加产品

---

## 12. 版本历史

- **v2.0 (2026-04-21)**: 迁移到 SSR 架构
  - ✅ 使用 Astro SSR 模式 + Node.js 适配器
  - ✅ 使用 SQLite 数据库替代 JSON 文件
  - ✅ 配置 Nginx 反向代理
  - ✅ 配置 systemd 开机自启动
  - ✅ 完整的 SEO 优化（Open Graph、Twitter Card、结构化数据）
  - ✅ 百度站长验证和 sitemap 自动生成

- **v1.0**: 静态站点版本
  - 使用 Astro 构建静态 HTML
  - 数据存储在 JSON 文件中
  - 部署到静态托管服务

---

## 附录：快速命令参考

```bash
# 开发
npm run dev

# 构建
npm run build

# 重启服务
systemctl restart ai-links

# 查看日志
tail -f /var/log/ai-links-server.log

# 数据库备份
cp sqlite_db/ai-links.db sqlite_db/ai-links.db.backup.$(date +%Y%m%d)

# 生成 sitemap
npm run sitemap
```
