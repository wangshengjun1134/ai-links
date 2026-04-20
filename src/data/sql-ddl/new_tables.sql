-- 新增表 DDL（不包含已存在的 products 和 agents）

-- Prompts 提示词表
CREATE TABLE IF NOT EXISTS prompts (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    websiteUrl TEXT,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE INDEX IF NOT EXISTS idx_prompts_slug ON prompts(slug);
CREATE INDEX IF NOT EXISTS idx_prompts_title ON prompts(title);

CREATE TABLE IF NOT EXISTS prompt_metrics (
    prompt_uid TEXT PRIMARY KEY REFERENCES prompts(uid) ON DELETE CASCADE,
    scenario TEXT,
    task TEXT,
    modality TEXT,
    tags TEXT
  );
CREATE INDEX IF NOT EXISTS idx_prompt_metrics_scenario ON prompt_metrics(scenario);
CREATE INDEX IF NOT EXISTS idx_prompt_metrics_task ON prompt_metrics(task);
CREATE INDEX IF NOT EXISTS idx_prompt_metrics_modality ON prompt_metrics(modality);

-- Tools 插件表
CREATE TABLE IF NOT EXISTS tools (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT,
    icon TEXT,
    websiteUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_title ON tools(title);

CREATE TABLE IF NOT EXISTS tool_metrics (
    tool_uid TEXT PRIMARY KEY REFERENCES tools(uid) ON DELETE CASCADE,
    tags TEXT,
    language TEXT,
    license TEXT,
    func TEXT
  );
CREATE INDEX IF NOT EXISTS idx_tool_metrics_language ON tool_metrics(language);
CREATE INDEX IF NOT EXISTS idx_tool_metrics_license ON tool_metrics(license);
CREATE INDEX IF NOT EXISTS idx_tool_metrics_func ON tool_metrics(func);

-- MCP 服务表
CREATE TABLE IF NOT EXISTS mcps (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT,
    icon TEXT,
    github_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE INDEX IF NOT EXISTS idx_mcps_slug ON mcps(slug);
CREATE INDEX IF NOT EXISTS idx_mcps_title ON mcps(title);

CREATE TABLE IF NOT EXISTS mcp_metrics (
    mcp_uid TEXT PRIMARY KEY REFERENCES mcps(uid) ON DELETE CASCADE,
    tags TEXT,
    serverType TEXT,
    authType TEXT,
    deployment TEXT
  );
CREATE INDEX IF NOT EXISTS idx_mcp_metrics_serverType ON mcp_metrics(serverType);
CREATE INDEX IF NOT EXISTS idx_mcp_metrics_authType ON mcp_metrics(authType);
CREATE INDEX IF NOT EXISTS idx_mcp_metrics_deployment ON mcp_metrics(deployment);

-- AIHub 表
CREATE TABLE IF NOT EXISTS aihub (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    aiProductName TEXT NOT NULL,
    introduction TEXT,
    websiteUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE INDEX IF NOT EXISTS idx_aihub_slug ON aihub(slug);
CREATE INDEX IF NOT EXISTS idx_aihub_name ON aihub(aiProductName);

CREATE TABLE IF NOT EXISTS aihub_metrics (
    aihub_uid TEXT PRIMARY KEY REFERENCES aihub(uid) ON DELETE CASCADE,
    productType TEXT,
    tags TEXT
  );

-- Articles 文章表
CREATE TABLE IF NOT EXISTS articles (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    titleEn TEXT,
    description TEXT,
    author TEXT,
    category TEXT,
    readTime TEXT,
    publishedAt TEXT,
    websiteUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_title ON articles(title);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_publishedAt ON articles(publishedAt);

CREATE TABLE IF NOT EXISTS article_metrics (
    article_uid TEXT PRIMARY KEY REFERENCES articles(uid) ON DELETE CASCADE,
    tags TEXT
  );

-- News 新闻表
CREATE TABLE IF NOT EXISTS news (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    publishedAt TEXT,
    context TEXT,
    refUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_title ON news(title);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_publishedAt ON news(publishedAt);