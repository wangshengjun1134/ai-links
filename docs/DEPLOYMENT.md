# AI Links 部署手册

本文档提供 AI Links 项目的完整部署指南，包括标准部署流程和从零开始的完整部署。

## 📋 目录

- [部署前检查](#部署前检查)
- [标准部署流程](#标准部署流程推荐)
- [完整部署流程](#完整部署流程从零开始)
- [常见问题处理](#常见问题处理)
- [部署检查清单](#部署检查清单)
- [快速参考](#快速参考卡片)

---

## 部署前检查

在开始部署前，确认以下环境已就绪：

```bash
# 确认 Node.js 版本（应该 >= 18）
node -v

# 确认 Nginx 已安装
nginx -v

# 确认 systemd 可用
systemctl --version

# 确认当前版本
cd /root/.openclaw/workspace-ai-links/ai-links
git log --oneline -1

# 确认服务状态
systemctl status ai-links

# 确认端口正常
lsof -ti:4321
```

---

## 标准部署流程（推荐）

适用于代码更新后的常规部署。

### 步骤

```bash
# 步骤 1: 进入项目目录
cd /root/.openclaw/workspace-ai-links/ai-links

# 步骤 2: 拉取最新代码
git pull origin master

# 步骤 3: 安装依赖（如果有新依赖）
npm install

# 步骤 4: 生成 sitemap
npm run sitemap

# 步骤 5: 构建项目
npm run build

# 步骤 6: 重启服务
./scripts/manage-service.sh restart

# 步骤 7: 验证部署
curl -s http://localhost:4321/ | grep -o '<title>.*</title>'
```

### 一键部署脚本

可以保存为 `deploy.sh`：

```bash
#!/bin/bash
cd /root/.openclaw/workspace-ai-links/ai-links

echo "🔄 拉取最新代码..."
git pull origin master

echo "📦 安装依赖..."
npm install

echo "🗺️  生成 sitemap..."
npm run sitemap

echo "🔨 构建项目..."
npm run build

echo "🔄 重启服务..."
./scripts/manage-service.sh restart

echo "✅ 部署完成！"
echo "📋 最近日志:"
tail -10 /var/log/ai-links-server.log
```

使用方法：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 完整部署流程（从零开始）

适用于服务器重置或全新部署。

### 1️⃣ 环境准备

```bash
# 确认 Node.js 版本
node -v  # 应该 >= 18

# 确认 Nginx 已安装
nginx -v

# 确认 systemd 可用
systemctl --version
```

### 2️⃣ 获取代码

```bash
# 创建工作目录（如果不存在）
mkdir -p /root/.openclaw/workspace-ai-links
cd /root/.openclaw/workspace-ai-links

# 克隆项目（如果还没有）
git clone https://gitee.com/self-study_buff/ai-links.git
cd ai-links

# 或者如果已有代码，拉取最新
git pull origin master
```

### 3️⃣ 安装依赖

```bash
cd /root/.openclaw/workspace-ai-links/ai-links
npm install
```

### 4️⃣ 配置 Astro

确保 `astro.config.mjs` 中有正确的 `site` 配置：

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import { remarkLangBlock } from './src/plugins/remarkLangBlock';

export default defineConfig({
  site: 'https://ai-links.cn',  // ⚠️ 重要：配置正确的域名
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  markdown: {
    remarkPlugins: [remarkDirective, remarkLangBlock],
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: []
    }
  }
});
```

### 5️⃣ 生成 Sitemap

```bash
npm run sitemap
```

### 6️⃣ 构建项目

```bash
npm run build
```

构建成功后会显示：
```
✓ Completed in XXs.
[build] Server built in XXs
[build] Complete!
```

### 7️⃣ 配置 systemd 服务

创建服务文件：

```bash
cat > /etc/systemd/system/ai-links.service << 'EOF'
[Unit]
Description=AI Links SSR Server
Documentation=https://ai-links.cn
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/.openclaw/workspace-ai-links/ai-links
ExecStart=/root/.nvm/versions/node/v22.22.1/bin/node dist/server/entry.mjs
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/ai-links-server.log
StandardError=append:/var/log/ai-links-server.log
Environment=NODE_ENV=production
Environment=PORT=4321

NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# 重载 systemd 配置
systemctl daemon-reload

# 启用开机自启动
systemctl enable ai-links
```

### 8️⃣ 配置 Nginx 反向代理

编辑 `/etc/nginx/sites-enabled/default`，确保 `location /` 配置：

```nginx
location / {
    # 反向代理到 Node.js SSR 服务器（端口 4321）
    proxy_pass http://127.0.0.1:4321;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

测试并重载 Nginx：

```bash
/usr/sbin/nginx -t
/usr/sbin/nginx -s reload
```

### 9️⃣ 启动服务

```bash
# 启动服务
systemctl start ai-links

# 查看状态
systemctl status ai-links

# 查看日志
tail -f /var/log/ai-links-server.log
```

### 🔟 验证部署

```bash
# 检查本地访问
curl -s http://localhost:4321/ | grep -o 'canonical.*href="[^"]*"'

# 检查域名访问
curl -s https://ai-links.cn/ | grep -o 'canonical.*href="[^"]*"'

# 应该输出：canonical" href="https://ai-links.cn/"
```

---

## 常见问题处理

### 问题 1: 端口被占用

**症状**：服务启动失败，提示 `EADDRINUSE`

```bash
# 查找占用端口的进程
lsof -ti:4321

# 停止旧进程
pkill -f "node.*entry.mjs"

# 重启服务
systemctl restart ai-links
```

### 问题 2: 构建失败

**症状**：`npm run build` 报错

```bash
# 清理缓存
rm -rf node_modules/.vite
rm -rf dist
rm -rf .astro

# 重新安装依赖
npm install

# 重新构建
npm run build
```

### 问题 3: 服务启动失败

**症状**：`systemctl start ai-links` 失败

```bash
# 查看详细错误
journalctl -u ai-links -n 50 --no-pager

# 检查日志
tail -50 /var/log/ai-links-server.log

# 手动测试启动
cd /root/.openclaw/workspace-ai-links/ai-links
node dist/server/entry.mjs
```

### 问题 4: Nginx 返回 502

**症状**：访问域名显示 502 Bad Gateway

```bash
# 检查 Node.js 服务是否运行
systemctl status ai-links

# 检查端口是否监听
lsof -ti:4321

# 重启服务
systemctl restart ai-links

# 重载 Nginx
/usr/sbin/nginx -s reload
```

### 问题 5: URL 仍然是 localhost

**症状**：页面 meta 标签中的 URL 是 `http://localhost:4321/`

**原因**：
1. `astro.config.mjs` 中缺少 `site` 配置
2. `Layout.astro` 中未正确处理 `canonicalURL`

**解决**：
```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://ai-links.cn',  // 添加此行
  output: 'server',
  // ...
});
```

然后重新构建并重启服务。

---

## 部署检查清单

部署完成后逐项检查：

- [ ] **服务状态**：`systemctl status ai-links` → Active: active (running)
- [ ] **端口监听**：`lsof -ti:4321` → 有进程 ID
- [ ] **本地访问**：`curl http://localhost:4321/` → 返回 HTML
- [ ] **域名访问**：`curl https://ai-links.cn/` → 返回 HTML
- [ ] **Canonical URL**：包含 `href="https://ai-links.cn/"`
- [ ] **Nginx 状态**：`/usr/sbin/nginx -t` → syntax is ok
- [ ] **日志正常**：无 ERROR 级别错误

---

## 快速参考卡片

### 日常部署

```bash
# 日常部署三件套
cd /root/.openclaw/workspace-ai-links/ai-links
git pull && npm run build && ./scripts/manage-service.sh restart
```

### 服务管理

```bash
# 查看服务状态
systemctl status ai-links

# 查看实时日志
tail -f /var/log/ai-links-server.log

# 紧急停止
systemctl stop ai-links

# 紧急重启
systemctl restart ai-links

# 使用管理脚本
./scripts/manage-service.sh status
./scripts/manage-service.sh restart
./scripts/manage-service.sh logs
```

### 日志查看

```bash
# 查看最近 50 行日志
tail -50 /var/log/ai-links-server.log

# 实时查看日志
tail -f /var/log/ai-links-server.log

# 使用 journalctl
journalctl -u ai-links -n 100 --no-pager
```

### 构建相关

```bash
# 清理构建缓存
rm -rf dist .astro node_modules/.vite

# 重新安装依赖
npm install

# 生成 sitemap
npm run sitemap

# 构建项目
npm run build
```

---

## 相关文件位置

| 文件/目录 | 路径 | 说明 |
|-----------|------|------|
| 项目根目录 | `/root/.openclaw/workspace-ai-links/ai-links` | 项目代码 |
| 服务文件 | `/etc/systemd/system/ai-links.service` | systemd 配置 |
| Nginx 配置 | `/etc/nginx/sites-enabled/default` | 反向代理配置 |
| 服务日志 | `/var/log/ai-links-server.log` | 应用日志 |
| 管理脚本 | `scripts/manage-service.sh` | 服务管理工具 |
| Astro 配置 | `astro.config.mjs` | Astro 构建配置 |
| 布局文件 | `src/layouts/Layout.astro` | SEO meta 标签 |

---

## 版本历史

- **2026-04-21**: 初始版本，包含完整部署流程和故障排查指南

---

## 支持

如遇到问题，请查看：

1. 服务日志：`/var/log/ai-links-server.log`
2. 系统日志：`journalctl -u ai-links`
3. 项目文档：`docs/` 目录
