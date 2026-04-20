CREATE TABLE products (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    aiProductName TEXT NOT NULL,
    introduction TEXT,
    websiteUrl TEXT,
    detail TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_name ON products(aiProductName);

CREATE TABLE product_metrics (
    product_uid TEXT PRIMARY KEY REFERENCES products(uid) ON DELETE CASCADE,
    level1 TEXT,
    level2 TEXT,
    tags TEXT,
    country TEXT,
    company TEXT,
    hasApi INTEGER DEFAULT 0,
    needVpn INTEGER DEFAULT 0,
    pricingModel TEXT,
    useType TEXT,
    languages TEXT,
    rawProductType TEXT
  );
CREATE INDEX idx_metrics_level1 ON product_metrics(level1);
CREATE INDEX idx_metrics_level2 ON product_metrics(level2);
CREATE INDEX idx_metrics_company ON product_metrics(company);
CREATE INDEX idx_metrics_country ON product_metrics(country);

CREATE TABLE agents (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    sort INTEGER DEFAULT 0,
    logo TEXT,
    aiProductName TEXT NOT NULL,
    introduction TEXT,
    websiteUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE agent_metrics (
    agent_uid TEXT PRIMARY KEY REFERENCES agents(uid) ON DELETE CASCADE,
    country TEXT,
    company TEXT,
    useType TEXT,
    modelLevel TEXT,
    hasApi INTEGER DEFAULT 0,
    pricingModel TEXT,
    needVpn INTEGER DEFAULT 0,
    languages TEXT,
    isInternal INTEGER DEFAULT 0,
    category TEXT,
    subCategory TEXT,
    form_factor TEXT,
    capabilities TEXT,
    scenarios TEXT,
    techTags TEXT,
    deployment TEXT,
    agentLevel TEXT,
    interactionMode TEXT
  );
CREATE INDEX idx_agent_metrics_category ON agent_metrics(category);
CREATE INDEX idx_agent_metrics_agentLevel ON agent_metrics(agentLevel);

-- Prompts 提示词表
CREATE TABLE prompts (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    websiteUrl TEXT,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE INDEX idx_prompts_slug ON prompts(slug);
CREATE INDEX idx_prompts_title ON prompts(title);

CREATE TABLE prompt_metrics (
    prompt_uid TEXT PRIMARY KEY REFERENCES prompts(uid) ON DELETE CASCADE,
    scenario TEXT,
    task TEXT,
    modality TEXT,
    tags TEXT
  );
CREATE INDEX idx_prompt_metrics_scenario ON prompt_metrics(scenario);
CREATE INDEX idx_prompt_metrics_task ON prompt_metrics(task);
CREATE INDEX idx_prompt_metrics_modality ON prompt_metrics(modality);

-- Tools 插件表
CREATE TABLE tools (
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
CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_tools_title ON tools(title);

CREATE TABLE tool_metrics (
    tool_uid TEXT PRIMARY KEY REFERENCES tools(uid) ON DELETE CASCADE,
    tags TEXT,
    language TEXT,
    license TEXT,
    func TEXT
  );
CREATE INDEX idx_tool_metrics_language ON tool_metrics(language);
CREATE INDEX idx_tool_metrics_license ON tool_metrics(license);
CREATE INDEX idx_tool_metrics_func ON tool_metrics(func);

-- MCP 服务表
CREATE TABLE mcps (
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
CREATE INDEX idx_mcps_slug ON mcps(slug);
CREATE INDEX idx_mcps_title ON mcps(title);

CREATE TABLE mcp_metrics (
    mcp_uid TEXT PRIMARY KEY REFERENCES mcps(uid) ON DELETE CASCADE,
    tags TEXT,
    serverType TEXT,
    authType TEXT,
    deployment TEXT
  );
CREATE INDEX idx_mcp_metrics_serverType ON mcp_metrics(serverType);
CREATE INDEX idx_mcp_metrics_authType ON mcp_metrics(authType);
CREATE INDEX idx_mcp_metrics_deployment ON mcp_metrics(deployment);

-- AIHub 表
CREATE TABLE aihub (
    uid TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    aiProductName TEXT NOT NULL,
    introduction TEXT,
    websiteUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE INDEX idx_aihub_slug ON aihub(slug);
CREATE INDEX idx_aihub_name ON aihub(aiProductName);

CREATE TABLE aihub_metrics (
    aihub_uid TEXT PRIMARY KEY REFERENCES aihub(uid) ON DELETE CASCADE,
    productType TEXT,
    tags TEXT
  );

-- Articles 文章表
CREATE TABLE articles (
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
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_title ON articles(title);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_publishedAt ON articles(publishedAt);

CREATE TABLE article_metrics (
    article_uid TEXT PRIMARY KEY REFERENCES articles(uid) ON DELETE CASCADE,
    tags TEXT
  );

-- News 新闻表
CREATE TABLE news (
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
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_title ON news(title);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_publishedAt ON news(publishedAt);

