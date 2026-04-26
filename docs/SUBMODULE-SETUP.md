# Git Submodule 配置指南

本项目采用源码与内容分离架构，内容数据存储在独立的 `ai-links-data` 仓库中。

## 架构说明

```
ai-links/              (源码仓库)
├── ai-links-data/     (内容仓库 - submodule)
│   ├── sqlite_db/     # 数据库
│   ├── content/       # Markdown 详情
│   └── favicons/      # 图标图片
├── src/
│   └── content/       → junction → ai-links-data/content
└── public/
    ├── product-favicons/ → junction → ai-links-data/favicons/product-favicons
    ├── agents-favicons/  → junction → ai-links-data/favicons/agents-favicons
    └── ...
```

## 初始化配置

### 方式一：将 ai-links-data 配置为 Submodule

1. 先创建内容仓库并推送：
```bash
cd ai-links-data
git init
git add .
git commit -m "初始化内容仓库"
git remote add origin https://github.com/your-org/ai-links-data.git
git push -u origin main
```

2. 在源码仓库中添加 submodule：
```bash
cd ai-links
# 删除本地 ai-links-data 目录
rm -rf ai-links-data

# 添加 submodule
git submodule add https://github.com/your-org/ai-links-data.git ai-links-data
git commit -m "添加内容数据 submodule"
```

3. 创建 junction 目录链接：
```bash
# Windows (cmd)
mklink /J "src\content" "ai-links-data\content"
mklink /J "public\product-favicons" "ai-links-data\favicons\product-favicons"
mklink /J "public\agents-favicons" "ai-links-data\favicons\agents-favicons"
mklink /J "public\aihub-favicons" "ai-links-data\favicons\aihub-favicons"
mklink /J "public\mcp-favicons" "ai-links-data\favicons\mcp-favicons"
```

### 方式二：克隆现有项目

克隆包含 submodule 的项目：

```bash
# 克隆源码仓库并自动初始化 submodule
git clone --recurse-submodules https://github.com/your-org/ai-links.git

# 或者克隆后再初始化
git clone https://github.com/your-org/ai-links.git
cd ai-links
git submodule init
git submodule update
```

创建 junction：
```bash
# 运行配置脚本（见下文）
scripts/setup-junctions.bat
```

## 自动配置脚本

创建 `scripts/setup-junctions.bat`：

```batch
@echo off
echo 创建目录链接...

mklink /J "src\content" "ai-links-data\content"
mklink /J "public\product-favicons" "ai-links-data\favicons\product-favicons"
mklink /J "public\agents-favicons" "ai-links-data\favicons\agents-favicons"
mklink /J "public\aihub-favicons" "ai-links-data\favicons\aihub-favicons"
mklink /J "public\mcp-favicons" "ai-links-data\favicons\mcp-favicons"

echo 完成！
```

## 更新内容数据

```bash
# 更新 submodule 到最新版本
git submodule update --remote ai-links-data

# 或者进入 submodule 目录更新
cd ai-links-data
git pull origin main
```

## 发布流程

### 更新内容
```bash
cd ai-links-data
git add .
git commit -m "更新产品数据"
git push
```

### 更新源码
```bash
cd ai-links
git add .
git commit -m "源码更新"
git push
```

### 同步 submodule 引用
```bash
# 源码仓库需要更新 submodule 的引用版本
cd ai-links
git submodule update --remote
git add ai-links-data
git commit -m "更新内容数据引用"
git push
```

## 注意事项

1. **junction 不提交到 Git**：junction 目录已添加到 `.gitignore`，克隆项目后需要手动创建
2. **submodule 版本锁定**：源码仓库记录的是 submodule 的特定 commit，不会自动更新
3. **Windows 特性**：junction 是 Windows 特有的目录链接方式，Linux/macOS 可使用 symlink