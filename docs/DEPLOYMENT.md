# AI Links 部署手册

本文档提供 AI Links 项目的完整部署指南，包含数据分离架构的部署流程。

## 📋 目录

- [架构概述](#架构概述)
- [部署前检查](#部署前检查)
- [标准部署流程](#标准部署流程)
- [数据更新流程](#数据更新流程)
- [完整部署流程](#完整部署流程从零开始)
- [常见问题处理](#常见问题处理)
- [快速参考](#快速参考卡片)

---

## 架构概述

### 数据分离架构

```
ai-links (源码仓库)              ai-links-data (内容仓库)
├── src/                         ├── sqlite_db/app.db
├── public/                      ├── content/
├── dist/                        ├── favicons/
└── astro.config.mjs             └── README.md
        │                                │
        │         symlink/junction       │
        └────────────────────────────────┘
```

**关键特点**：
- 源码部署一次，稳定不变
- 数据更新只需修改 ai-links-data
- 详情页预渲染，需重新 build 才能更新
- 列表页 SSR，数据实时读取

---

## 部署前检查

```bash
# 确认 Node.js 版本（应该 >= 18）
node -v

# 确认 Nginx 已安装
nginx -v

# 确认 systemd 可用
systemctl --version

# 确认 symlink 链接存在
ls -la src/content
ls -la public/product-favicons

# 确认数据库文件存在
ls -la ai-links-data/sqlite_db/app.db
```

---

## 标准部署流程

### 源码更新部署

当源码有修改时：

```bash
# 步骤 1: 进入项目目录
cd /path/to/ai-links

# 步骤 2: 拉取最新代码
git pull origin master

# 步骤 3: 安装依赖（如果有新依赖）
npm install

# 步骤 4: 构建项目
npm run build

# 步骤 5: 重启服务
systemctl restart ai-links

# 步骤 6: 验证
curl -s http://localhost:4321/ | grep -o '<title>.*</title>'
```

### 数据更新部署

当只更新数据（无源码修改）时：

```bash
# 步骤 1: 更新数据仓库
cd /path/to/ai-links-data
git pull origin main

# 步骤 2: 回到源码目录重新构建
cd /path/to/ai-links
npm run build

# 步骤 3: 重启服务
systemctl restart ai-links
```

**注意**：详情页是预渲染的，数据更新必须重新 build。

---

## 数据更新流程

### 本地添加数据

```bash
# 1. 修改数据库
sqlite3 ai-links-data/sqlite_db/app.db "
INSERT INTO products ...;
INSERT INTO product_metrics ...;
"

# 2. 创建 Markdown 详情
mkdir -p ai-links-data/content/products/PD-001000
# 编辑 PD-001000.md

# 3. 上传图标
cp icon.png ai-links-data/favicons/product-favicons/PD-001000.png

# 4. 本地验证
npm run build

# 5. 提交内容仓库
cd ai-links-data
git add .
git commit -m "添加新产品"
git push

# 6. 提交源码仓库（如有修改）
cd ai-links
git add .
git commit -m "数据更新"
git push
```

### 服务器同步数据

```bash
# 方式 1: Git 拉取
cd /path/to/ai-links-data
git pull origin main

# 方式 2: 直接上传
scp local/app.db server:/path/to/ai-links-data/sqlite_db/app.db
scp local/icon.png server:/path/to/ai-links-data/favicons/product-favicons/

# 重新构建
cd /path/to/ai-links
npm run build
systemctl restart ai-links
```

---

## 完整部署流程（从零开始）

### 1️⃣ 环境准备

```bash
# 确认 Node.js 版本
node -v  # >= 18

# 确认 Nginx 已安装
nginx -v

# 确认 systemd 可用
systemctl --version
```

### 2️⃣ 克隆代码仓库

```bash
# 创建工作目录
mkdir -p /path/to/workspace
cd /path/to/workspace

# 克隆源码仓库
git clone https://github.com/your-org/ai-links.git
cd ai-links

# 克隆内容仓库（或作为 submodule）
git clone https://github.com/your-org/ai-links-data.git ai-links-data
```

### 3️⃣ 配置目录链接

```bash
# Linux symlink
ln -s /path/to/ai-links-data/content /path/to/ai-links/src/content
ln -s /path/to/ai-links-data/favicons/product-favicons /path/to/ai-links/public/product-favicons
ln -s /path/to/ai-links-data/favicons/agents-favicons /path/to/ai-links/public/agents-favicons
ln -s /path/to/ai-links-data/favicons/mcp-favicons /path/to/ai-links/public/mcp-favicons
ln -s /path/to/ai-links-data/favicons/aihub-favicons /path/to/ai-links/public/aihub-favicons

# 验证链接
ls -la src/content
ls -la public/product-favicons
```

### 4️⃣ 安装依赖

```bash
npm install
```

### 5️⃣ 构建项目

```bash
npm run build
```

### 6️⃣ 配置 systemd 服务

```bash
cat > /etc/systemd/system/ai-links.service << 'EOF'
[Unit]
Description=AI Links SSR Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/path/to/ai-links
ExecStart=/usr/bin/node dist/server/entry.mjs
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/ai-links-server.log
StandardError=append:/var/log/ai-links-server.log
Environment=NODE_ENV=production
Environment=PORT=4321

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ai-links
```

### 7️⃣ 配置 Nginx

```nginx
# /etc/nginx/sites-enabled/default
location / {
    proxy_pass http://127.0.0.1:4321;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

```bash
nginx -t
nginx -s reload
```

### 8️⃣ 启动服务

```bash
systemctl start ai-links
systemctl status ai-links
```

### 9️⃣ 验证部署

```bash
curl -s http://localhost:4321/ | grep canonical
curl -s https://ai-links.cn/ | grep canonical
```

---

## 常见问题处理

### symlink 链接失效

```bash
# 检查链接
ls -la src/content

# 重建链接
rm src/content
ln -s /path/to/ai-links-data/content src/content
```

### 数据库路径错误

```bash
# 检查数据库文件
ls -la ai-links-data/sqlite_db/app.db

# 检查 db.ts 配置
grep dbPath src/lib/db.ts
# 应显示: ai-links-data/sqlite_db/app.db
```

### 构建失败

```bash
# 清理缓存
rm -rf dist .astro node_modules/.vite

# 检查数据完整性
sqlite3 ai-links-data/sqlite_db/app.db "SELECT COUNT(*) FROM products;"

# 重新构建
npm install
npm run build
```

### 服务启动失败

```bash
# 查看日志
journalctl -u ai-links -n 50

# 检查端口
lsof -ti:4321

# 手动测试
node dist/server/entry.mjs
```

---

## 快速参考卡片

### 日常命令

```bash
# 构建
npm run build

# 重启服务
systemctl restart ai-links

# 查看日志
tail -f /var/log/ai-links-server.log

# 数据库查询
sqlite3 ai-links-data/sqlite_db/app.db "SELECT COUNT(*) FROM products;"
```

### 数据更新

```bash
# 更新内容仓库
cd ai-links-data && git pull

# 重新构建
cd ai-links && npm run build && systemctl restart ai-links
```

### 一键部署脚本

```bash
#!/bin/bash
cd /path/to/ai-links

echo "更新内容..."
cd ai-links-data && git pull origin main

echo "构建..."
cd /path/to/ai-links && npm run build

echo "重启服务..."
systemctl restart ai-links

echo "完成！"
```

---

## 文件位置参考

| 文件 | 路径 | 说明 |
|-----|------|-----|
| 源码目录 | `/path/to/ai-links` | 项目源码 |
| 内容目录 | `/path/to/ai-links-data` | 数据仓库 |
| 数据库 | `ai-links-data/sqlite_db/app.db` | SQLite 数据库 |
| Markdown | `ai-links-data/content/*/` | 详情内容 |
| 图标 | `ai-links-data/favicons/*/` | favicon 图片 |
| 服务日志 | `/var/log/ai-links-server.log` | 应用日志 |
| systemd 配置 | `/etc/systemd/system/ai-links.service` | 服务配置 |

---

## 相关文档

- **[SUBMODULE-SETUP.md](./SUBMODULE-SETUP.md)** - Submodule 配置详解
- **[PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md)** - 项目架构概述
- **[DATA-ADDING-GUIDE.md](./DATA-ADDING-GUIDE.md)** - 数据添加指南

---

## 版本历史

- **v2.1 (2026-04-27)**: 数据分离架构部署指南
- **v2.0 (2026-04-21)**: SSR 架构部署指南