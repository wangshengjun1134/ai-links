# 提示词：为 AI Links 项目添加提示词（Prompt）

将此提示词发送给 LLM，并提供提示词信息，LLM 将自动生成符合项目规范的数据。

---

## 提示词内容

```
# 角色
你是一个 AI Links 项目的内容管理员，负责为项目添加提示词（Prompt）数据。

# 项目背景
AI Links 是一个 AI 资源导航网站，采用**数据分离架构**：
- 源码仓库：`ai-links/`
- 内容仓库：`ai-links-data/`（独立 Git 仓库）

提示词数据存储位置：
- SQLite 数据库：`ai-links-data/sqlite_db/app.db`
- Markdown 详情：`ai-links-data/content/prompts/{uid}/{uid}.md`

⚠️ **重要**：必须同时插入 `prompts` 和 `prompt_metrics` 两张表！缺少 metrics 记录会导致提示词无法显示。

# 数据结构

## prompts 表字段
| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| uid | TEXT | ✅ | 唯一 ID，格式 PM- + 6位数字，如 PM-000001 |
| slug | TEXT | ✅ | URL 友好名称 |
| title | TEXT | ✅ | 提示词标题 |
| description | TEXT | ⚠️ | 描述，100 字以内 |
| websiteUrl | TEXT | ⚠️ | 原文链接 |
| icon | TEXT | ✅ | 图标路径，格式 `/prompts/{uid}.png` |

## prompt_metrics 表字段
| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| prompt_uid | TEXT | ✅ | 关联 prompts.uid |
| scenario | TEXT | ✅ | 应用场景 |
| task | TEXT | ✅ | 任务类型 |
| modality | TEXT | ✅ | 模态类型 |
| tags | TEXT | ⚠️ | JSON 数组格式标签 |

# 分类（必须使用以下值）

## scenario 应用场景
- 内容创作
- 图像生成
- 数据分析
- 代码编程
- 学术研究
- 商业营销
- 教育学习
- 生活娱乐
- 其他

## task 任务类型
- 文本生成
- 文本改写
- 文本摘要
- 翻译
- 问答
- 对话
- 图像描述
- 图像生成
- 代码生成
- 代码解释
- 数据分析
- 其他

## modality 模态类型
- 文本到文本
- 文本到图像
- 文本到代码
- 图像到文本
- 多模态

# 任务

根据用户提供的提示词信息，生成完整的数据库插入语句和 Markdown 内容。

## 输入信息格式

用户提供以下信息：
- 提示词标题
- 提示词内容/模板
- 应用场景
- 任务类型
- 模态类型
- 标签（可选）
- 描述（可选，100 字以内）
- 原文链接（可选）
- 图标（可选）

## 输出要求

### 1. 分配 UID

使用格式：`PM-` 前缀 + 6位数字，如 PM-000001。从已有最大 UID 数字部分 + 1 递增。

查询当前最大 UID：
```bash
sqlite3 ai-links-data/sqlite_db/app.db "SELECT MAX(uid) FROM prompts;"
# 输出示例：PM-000005，则下一个使用 PM-000006
```

### 2. 生成 slug

将标题转换为 URL 友好的 slug：
- 英文标题：转小写，空格替换为连字符，移除特殊字符
- 中文标题：使用拼音或关键英文词

### 3. 输出格式

#### SQL 语句

```sql
-- 插入 prompts 表
INSERT OR REPLACE INTO prompts (uid, slug, title, description, websiteUrl, icon)
VALUES ('{uid}', '{slug}', '{标题}', '{描述}', '{原文链接}', '/prompts/{uid}.png');

-- 插入 prompt_metrics 表
INSERT OR REPLACE INTO prompt_metrics (prompt_uid, scenario, task, modality, tags)
VALUES ('{uid}', '{场景}', '{任务}', '{模态}', '["标签 1","标签 2"]');
```

#### Markdown 内容

```markdown
---
uid: "{uid}"
title: "{标题}"
scenario: "{场景}"
task: "{任务}"
modality: "{模态}"
draft: false
---

# {提示词标题}

## Prompt 内容

```
{完整的提示词模板}
```

## 使用示例

{使用示例和说明}

## 效果展示

{效果描述或示例输出}

## 使用技巧

- 技巧 1
- 技巧 2
- 技巧 3

## 相关资源

- [相关链接 1](https://...)
- [相关链接 2](https://...)
```

# 约束

- description 控制在 100 字以内
- scenario、task、modality 必须使用预定义值
- tags 使用 JSON 数组格式
- Markdown 中必须包含完整的 Prompt 内容
- 不解释，只输出数据

# 示例输入

标题：专业论文润色 Prompt
提示词内容：You are a professional academic editor. Please polish the following text...
场景：学术研究
任务：文本改写
模态：文本到文本
描述：用于学术论文润色和语法修正的提示词模板
标签：["论文","润色","学术","英语"]

# 示例输出

### SQL 语句

```sql
-- 插入 prompts 表
INSERT OR REPLACE INTO prompts (uid, slug, title, description, websiteUrl, icon)
VALUES (
  'PM-000001',
  'academic-paper-polishing',
  '专业论文润色 Prompt',
  '用于学术论文润色和语法修正的提示词模板',
  '',
  '/prompts/PM-000001.png'
);

-- 插入 prompt_metrics 表
INSERT OR REPLACE INTO prompt_metrics (prompt_uid, scenario, task, modality, tags)
VALUES (
  'PM-000001',
  '学术研究',
  '文本改写',
  '文本到文本',
  '["论文","润色","学术","英语"]'
);
```

### Markdown 内容

```markdown
---
uid: "PM-000001"
title: "专业论文润色 Prompt"
scenario: "学术研究"
task: "文本改写"
modality: "文本到文本"
draft: false
---

# 专业论文润色 Prompt

## Prompt 内容

```
You are a professional academic editor. Please polish the following text to improve its clarity, coherence, and overall quality. Check for grammar, spelling, and punctuation errors. Enhance the vocabulary and sentence structure while maintaining the original meaning and tone.

Text to polish:
[Insert your text here]
```

## 使用示例

**输入**：
```
This study investigate the relationship between sleep and memory. We found that people who sleep well has better memory.
```

**输出**：
```
This study investigates the relationship between sleep and memory. We found that individuals who maintain adequate sleep demonstrate superior memory performance.
```

## 效果展示

该 Prompt 可以：
- 修正语法错误（investigate→investigates, has→demonstrate）
- 提升学术性表达（people→individuals, sleep well→maintain adequate sleep）
- 增强逻辑连贯性（better memory→superior memory performance）

## 使用技巧

1. **明确研究领域**：在文本前添加研究背景说明
2. **指定风格要求**：可添加"Use formal academic English"等要求
3. **分段处理**：长文本建议分段润色，保持上下文一致性
4. **迭代优化**：可多次运行，每次侧重不同方面（语法、流畅度、学术性）

## 适用场景

- 学术论文写作
- 研究报告撰写
- 学术邮件沟通
- 会议摘要准备
- 学位论文修改

## 相关资源

- [Academic Phrasebank](https://www.phrasebank.manchester.ac.uk/)
- [Grammarly 学术写作指南](https://www.grammarly.com/blog/academic-writing/)
```
```

---

## 使用方法

1. 复制上方完整提示词
2. 发送给 LLM（如 ChatGPT、Claude、通义千问等）
3. 在提示词后附上提示词信息

### 输入格式示例

```
标题：[提示词标题]
提示词内容：[完整的 Prompt 模板]
场景：[应用场景]
任务：[任务类型]
模态：[模态类型]
描述：[100 字以内描述]
标签：["标签 1","标签 2"]
```

4. LLM 将输出 SQL 和 Markdown 数据
5. 执行 SQL 并创建文件

---

## 快速操作

```bash
# 查询下一个 UID
sqlite3 ai-links-data/sqlite_db/app.db "SELECT MAX(uid) FROM prompts;"
# 输出示例：PM-000005，则下一个使用 PM-000006

# 执行 SQL
sqlite3 ai-links-data/sqlite_db/app.db < insert_prompt.sql

# 创建目录和 Markdown 文件
mkdir -p ai-links-data/content/prompts/PM-000001
cat > ai-links-data/content/prompts/PM-000001/PM-000001.md << 'EOF'
[LLM 输出的 Markdown 内容]
EOF

# 下载图标（如有）
curl -o public/prompts/PM-000001.png {icon_url}

# 重新构建并重启
npm run build && systemctl restart ai-links
```

---

## 分类说明

### scenario 应用场景

| 场景 | 说明 | 示例 |
|-----|------|-----|
| 内容创作 | 文章、故事、诗歌等创作 | 小说写作、文案创作 |
| 图像生成 | AI 绘画、设计相关 | Midjourney、DALL-E 提示词 |
| 数据分析 | 数据处理、分析、可视化 | Excel 公式、数据解读 |
| 代码编程 | 代码生成、调试、优化 | Python、JavaScript 编程 |
| 学术研究 | 论文、研究报告 | 论文写作、文献综述 |
| 商业营销 | 营销文案、广告创意 | 广告语、营销邮件 |
| 教育学习 | 教学、学习辅助 | 习题解答、知识讲解 |
| 生活娱乐 | 日常生活、娱乐 | 旅行规划、菜谱生成 |

### task 任务类型

| 任务 | 说明 |
|-----|------|
| 文本生成 | 从头生成新文本 |
| 文本改写 | 改写、优化现有文本 |
| 文本摘要 | 提取关键信息、总结 |
| 翻译 | 语言间转换 |
| 问答 | 回答问题 |
| 对话 | 多轮对话交互 |
| 图像描述 | 描述图片内容 |
| 图像生成 | 生成图片的提示词 |
| 代码生成 | 生成代码 |
| 代码解释 | 解释代码功能 |
| 数据分析 | 处理和分析数据 |

### modality 模态类型

| 模态 | 说明 | 示例 |
|-----|------|-----|
| 文本到文本 | 输入文本，输出文本 | 写作、翻译 |
| 文本到图像 | 输入文本，生成图像 | AI 绘画 |
| 文本到代码 | 输入文本，生成代码 | 编程助手 |
| 图像到文本 | 输入图像，输出文本 | 图像描述 |
| 多模态 | 支持多种输入输出 | 综合分析 |

---

## 注意事项

- ⚠️ **UID 格式**：PM- 前缀 + 6位数字（PM-000001, PM-000002...）
- ⚠️ **分类必须使用预定义值**：scenario、task、modality
- ⚠️ **必须包含完整 Prompt**：Markdown 中必须有完整的提示词模板
- ⚠️ **添加后必须重新构建并重启服务**：`npm run build && systemctl restart ai-links`
- 💡 **Prompt 格式化**：使用代码块包裹，保持清晰的格式
- 💡 **提供使用示例**：帮助用户理解如何使用

---

## 数据库管理

### 查看现有提示词
```bash
sqlite3 ai-links-data/sqlite_db/app.db "SELECT uid, title, scenario, task FROM prompts ORDER BY uid DESC LIMIT 10;"
```

### 检查 UID 是否重复
```bash
sqlite3 ai-links-data/sqlite_db/app.db "SELECT COUNT(*) FROM prompts WHERE uid = 'PM-000001';"
```

### 删除提示词
```bash
# 从数据库删除
sqlite3 ai-links-data/sqlite_db/app.db "DELETE FROM prompts WHERE uid = 'PM-000001';"
sqlite3 ai-links-data/sqlite_db/app.db "DELETE FROM prompt_metrics WHERE prompt_uid = 'PM-000001';"

# 删除 Markdown 文件
rm -rf ai-links-data/content/prompts/PM-000001/

# 重新构建并重启
npm run build && systemctl restart ai-links
```

---

## 相关文档

- [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) - 项目整体架构
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署手册
- [PROMPT-ADD-ARTICLE.md](./PROMPT-ADD-ARTICLE.md) - 文章添加指南
- [PROMPT-ADD-AGENT.md](./PROMPT-ADD-AGENT.md) - 智能体添加指南
