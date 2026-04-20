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

