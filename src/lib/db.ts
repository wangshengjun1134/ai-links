/**
 * SQLite 数据库访问层 (使用 sql.js 纯 JS 实现)
 * 提供产品数据的查询接口
 */

import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

// 数据库路径
const dbPath = path.resolve(process.cwd(), 'sqlite_db', 'app.db');

// wasm 文件路径
const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');

// 数据库连接 - 每次请求重新加载以支持 WAL 模式
let db: any = null;
let initPromise: Promise<any> | null = null;
let lastLoadTime = 0;
const DB_RELOAD_INTERVAL = 1000; // 开发模式下每1秒重新加载

async function getDb(): Promise<any> {
  const now = Date.now();
  
  // 在开发模式下，定期重新加载数据库以捕获 WAL 更新
  if (db && (now - lastLoadTime < DB_RELOAD_INTERVAL)) {
    return db;
  }
  
  // 关闭旧连接
  if (db) {
    try { db.close(); } catch {}
    db = null;
    initPromise = null;
  }

  initPromise = (async () => {
    lastLoadTime = now;
    // 加载 wasm 文件
    const wasmBinary = fs.readFileSync(wasmPath);

    const SQL = await initSqlJs({
      wasmBinary
    });

    // 读取数据库文件 - 每次都重新读取以获取最新数据
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    return db;
  })();

  return initPromise;
}

// ============================================
// 类型定义
// ============================================

export interface Product {
  uid: string;
  slug: string;
  logo: string;
  aiProductName: string;
  introduction: string;
  websiteUrl: string;
}

export interface ProductMetrics {
  product_uid: string;
  level1: string;
  level2: string;
  tags: string;
  country: string;
  company: string;
  hasApi: number;
  needVpn: number;
  pricingModel: string;
  useType: string;
  languages: string;
  rawProductType: string;
}

export interface ProductWithMetrics extends Product {
  metrics: {
    level1: string;
    level2: string;
    tags: string[];
    country: string;
    company: string;
    hasApi: boolean;
    needVpn: boolean;
    pricingModel: string[];
    useType: string[];
    languages: string[];
    rawProductType: string[];
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface FilterHierarchy {
  level1: string;
  level2s: string[];
}

// ============================================
// 辅助函数
// ============================================

// 执行查询并返回结果数组
async function queryAll<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  const database = await getDb();
  
  // sql.js 使用 bind 参数的方式不同
  const stmt = database.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  
  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row as T);
  }
  stmt.free();
  
  return results;
}

// 执行查询并返回单个结果
async function queryOne<T>(sql: string, params: (string | number)[] = []): Promise<T | null> {
  const results = await queryAll<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

// ============================================
// 查询函数
// ============================================

/**
 * 分页查询产品列表
 */
export async function getProductsPaginated(options: {
  page: number;
  pageSize: number;
  level1?: string;
  level2?: string | string[];  // 支持单选或多选
  search?: string;
}): Promise<PaginatedResult<ProductWithMetrics>> {
  const { page, pageSize, level1, level2, search } = options;
  const offset = (page - 1) * pageSize;

  // 构建 WHERE 条件
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (level1) {
    conditions.push('m.level1 = ?');
    params.push(level1);
  }

  // 支持多选 level2
  if (level2) {
    const level2Array = Array.isArray(level2) ? level2 : [level2];
    if (level2Array.length > 0) {
      const placeholders = level2Array.map(() => '?').join(',');
      conditions.push(`m.level2 IN (${placeholders})`);
      params.push(...level2Array);
    }
  }

  if (search && search.trim()) {
    // 使用 LIKE 搜索（比 FTS 更简单可靠）
    const searchTerm = `%${search.trim()}%`;
    conditions.push('(p.aiProductName LIKE ? OR m.company LIKE ? OR p.introduction LIKE ?)');
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 查询总数
  const countSql = `
    SELECT COUNT(*) as total
    FROM products p
    JOIN product_metrics m ON p.uid = m.product_uid
    ${whereClause}
  `;
  const countResult = await queryOne<{ total: number }>(countSql, params);
  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // 查询数据
  const dataSql = `
    SELECT
      p.uid, p.slug, p.logo, p.aiProductName, p.introduction, p.websiteUrl,
      m.level1, m.level2, m.tags, m.country, m.company,
      m.hasApi, m.needVpn, m.pricingModel, m.useType, m.languages, m.rawProductType
    FROM products p
    JOIN product_metrics m ON p.uid = m.product_uid
    ${whereClause}
    ORDER BY p.updated_at DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await queryAll<any>(dataSql, [...params, pageSize, offset]);

  // 转换数据格式
  const items = rows.map(row => ({
    uid: row.uid,
    slug: row.slug,
    logo: row.logo,
    aiProductName: row.aiProductName,
    introduction: row.introduction,
    websiteUrl: row.websiteUrl,
    metrics: {
      level1: row.level1 || '',
      level2: row.level2 || '',
      tags: JSON.parse(row.tags || '[]'),
      country: row.country || '',
      company: row.company || '',
      hasApi: Boolean(row.hasApi),
      needVpn: Boolean(row.needVpn),
      pricingModel: JSON.parse(row.pricingModel || '[]'),
      useType: JSON.parse(row.useType || '[]'),
      languages: JSON.parse(row.languages || '[]'),
      rawProductType: JSON.parse(row.rawProductType || '[]'),
    },
  }));

  return {
    items,
    total,
    totalPages,
    currentPage: page,
  };
}

/**
 * 根据 slug 获取单个产品
 */
export async function getProductBySlug(slug: string): Promise<ProductWithMetrics | null> {
  const sql = `
    SELECT
      p.uid, p.slug, p.logo, p.aiProductName, p.introduction, p.websiteUrl,
      m.level1, m.level2, m.tags, m.country, m.company,
      m.hasApi, m.needVpn, m.pricingModel, m.useType, m.languages, m.rawProductType
    FROM products p
    JOIN product_metrics m ON p.uid = m.product_uid
    WHERE p.slug = ?
  `;
  const row = await queryOne<any>(sql, [slug]);

  if (!row) return null;

  return {
    uid: row.uid,
    slug: row.slug,
    logo: row.logo,
    aiProductName: row.aiProductName,
    introduction: row.introduction,
    websiteUrl: row.websiteUrl,
    metrics: {
      level1: row.level1 || '',
      level2: row.level2 || '',
      tags: JSON.parse(row.tags || '[]'),
      country: row.country || '',
      company: row.company || '',
      hasApi: Boolean(row.hasApi),
      needVpn: Boolean(row.needVpn),
      pricingModel: JSON.parse(row.pricingModel || '[]'),
      useType: JSON.parse(row.useType || '[]'),
      languages: JSON.parse(row.languages || '[]'),
      rawProductType: JSON.parse(row.rawProductType || '[]'),
    },
  };
}

/**
 * 根据 uid 获取单个产品
 */
export async function getProductByUid(uid: string): Promise<ProductWithMetrics | null> {
  const sql = `
    SELECT
      p.uid, p.slug, p.logo, p.aiProductName, p.introduction, p.websiteUrl,
      m.level1, m.level2, m.tags, m.country, m.company,
      m.hasApi, m.needVpn, m.pricingModel, m.useType, m.languages, m.rawProductType
    FROM products p
    JOIN product_metrics m ON p.uid = m.product_uid
    WHERE p.uid = ?
  `;
  const row = await queryOne<any>(sql, [uid]);

  if (!row) return null;

  return {
    uid: row.uid,
    slug: row.slug,
    logo: row.logo,
    aiProductName: row.aiProductName,
    introduction: row.introduction,
    websiteUrl: row.websiteUrl,
    metrics: {
      level1: row.level1 || '',
      level2: row.level2 || '',
      tags: JSON.parse(row.tags || '[]'),
      country: row.country || '',
      company: row.company || '',
      hasApi: Boolean(row.hasApi),
      needVpn: Boolean(row.needVpn),
      pricingModel: JSON.parse(row.pricingModel || '[]'),
      useType: JSON.parse(row.useType || '[]'),
      languages: JSON.parse(row.languages || '[]'),
      rawProductType: JSON.parse(row.rawProductType || '[]'),
    },
  };
}

/**
 * 获取所有产品 slug（用于 SSG 预渲染）
 */
export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await queryAll<{ slug: string }>('SELECT slug FROM products');
  return rows.map(r => r.slug);
}

/**
 * 获取筛选层级结构
 */
export async function getProductFilters(): Promise<FilterHierarchy[]> {
  const sql = `
    SELECT DISTINCT level1, level2
    FROM product_metrics
    WHERE level1 IS NOT NULL AND level1 != '' AND level2 IS NOT NULL AND level2 != ''
    ORDER BY level1, level2
  `;
  const rows = await queryAll<{ level1: string; level2: string }>(sql);

  // 转换为层级结构
  const hierarchyMap = new Map<string, Set<string>>();

  for (const row of rows) {
    if (!hierarchyMap.has(row.level1)) {
      hierarchyMap.set(row.level1, new Set());
    }
    hierarchyMap.get(row.level1)!.add(row.level2);
  }

  return Array.from(hierarchyMap.entries()).map(([level1, level2s]) => ({
    level1,
    level2s: Array.from(level2s).sort(),
  }));
}

/**
 * 获取产品总数
 */
export async function getProductsCount(): Promise<number> {
  const result = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM products');
  return result?.count || 0;
}

/**
 * 关闭数据库连接
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    initPromise = null;
  }
}

// ============================================
// Agent 智能体相关查询
// ============================================

export interface Agent {
  uid: string;
  slug: string;
  logo: string;
  aiProductName: string;
  introduction: string;
  websiteUrl: string;
}

export interface AgentWithMetrics extends Agent {
  metrics: {
    country: string;
    company: string;
    useType: string[];
    modelLevel: string;
    hasApi: boolean;
    pricingModel: string[];
    needVpn: boolean;
    languages: string[];
    isInternal: boolean;
    category: string;
    subCategory: string;
    form_factor: string[];
    capabilities: string[];
    scenarios: string[];
    techTags: string[];
    deployment: string;
    agentLevel: string;
    interactionMode: string;
  };
}

/**
 * 分页查询智能体列表
 */
export async function getAgentsPaginated(options: {
  page: number;
  pageSize: number;
  category?: string | string[];  // 支持多选
  agentLevel?: string | string[];  // 支持多选
  search?: string;
}): Promise<PaginatedResult<AgentWithMetrics>> {
  const { page, pageSize, category, agentLevel, search } = options;
  const offset = (page - 1) * pageSize;

  // 构建 WHERE 条件
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  // 支持多选 category
  if (category) {
    const categoryArray = Array.isArray(category) ? category : [category];
    if (categoryArray.length > 0) {
      const placeholders = categoryArray.map(() => '?').join(',');
      conditions.push(`m.category IN (${placeholders})`);
      params.push(...categoryArray);
    }
  }

  // 支持多选 agentLevel
  if (agentLevel) {
    const levelArray = Array.isArray(agentLevel) ? agentLevel : [agentLevel];
    if (levelArray.length > 0) {
      const placeholders = levelArray.map(() => '?').join(',');
      conditions.push(`m.agentLevel IN (${placeholders})`);
      params.push(...levelArray);
    }
  }

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push('(a.aiProductName LIKE ? OR m.company LIKE ? OR a.introduction LIKE ?)');
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 查询总数
  const countSql = `
    SELECT COUNT(*) as total
    FROM agents a
    JOIN agent_metrics m ON a.uid = m.agent_uid
    ${whereClause}
  `;
  const countResult = await queryOne<{ total: number }>(countSql, params);
  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // 查询数据
  const dataSql = `
    SELECT
      a.uid, a.slug, a.logo, a.aiProductName, a.introduction, a.websiteUrl,
      m.country, m.company, m.useType, m.modelLevel, m.hasApi, m.needVpn,
      m.pricingModel, m.languages, m.isInternal, m.category, m.subCategory,
      m.form_factor, m.capabilities, m.scenarios, m.techTags, m.deployment,
      m.agentLevel, m.interactionMode
    FROM agents a
    JOIN agent_metrics m ON a.uid = m.agent_uid
    ${whereClause}
    ORDER BY a.updated_at DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await queryAll<any>(dataSql, [...params, pageSize, offset]);

  // 转换数据格式
  const items = rows.map(row => ({
    uid: row.uid,
    slug: row.slug,
    logo: row.logo,
    aiProductName: row.aiProductName,
    introduction: row.introduction,
    websiteUrl: row.websiteUrl,
    metrics: {
      country: row.country || '',
      company: row.company || '',
      useType: JSON.parse(row.useType || '[]'),
      modelLevel: row.modelLevel || '',
      hasApi: Boolean(row.hasApi),
      pricingModel: JSON.parse(row.pricingModel || '[]'),
      needVpn: Boolean(row.needVpn),
      languages: JSON.parse(row.languages || '[]'),
      isInternal: Boolean(row.isInternal),
      category: row.category || '',
      subCategory: row.subCategory || '',
      form_factor: JSON.parse(row.form_factor || '[]'),
      capabilities: JSON.parse(row.capabilities || '[]'),
      scenarios: JSON.parse(row.scenarios || '[]'),
      techTags: JSON.parse(row.techTags || '[]'),
      deployment: row.deployment || '',
      agentLevel: row.agentLevel || '',
      interactionMode: row.interactionMode || '',
    },
  }));

  return {
    items,
    total,
    totalPages,
    currentPage: page,
  };
}

/**
 * 根据 slug 获取单个智能体
 */
export async function getAgentBySlug(slug: string): Promise<AgentWithMetrics | null> {
  const sql = `
    SELECT
      a.uid, a.slug, a.logo, a.aiProductName, a.introduction, a.websiteUrl,
      m.country, m.company, m.useType, m.modelLevel, m.hasApi, m.needVpn,
      m.pricingModel, m.languages, m.isInternal, m.category, m.subCategory,
      m.form_factor, m.capabilities, m.scenarios, m.techTags, m.deployment,
      m.agentLevel, m.interactionMode
    FROM agents a
    JOIN agent_metrics m ON a.uid = m.agent_uid
    WHERE a.slug = ?
  `;
  const row = await queryOne<any>(sql, [slug]);

  if (!row) return null;

  return {
    uid: row.uid,
    slug: row.slug,
    logo: row.logo,
    aiProductName: row.aiProductName,
    introduction: row.introduction,
    websiteUrl: row.websiteUrl,
    metrics: {
      country: row.country || '',
      company: row.company || '',
      useType: JSON.parse(row.useType || '[]'),
      modelLevel: row.modelLevel || '',
      hasApi: Boolean(row.hasApi),
      pricingModel: JSON.parse(row.pricingModel || '[]'),
      needVpn: Boolean(row.needVpn),
      languages: JSON.parse(row.languages || '[]'),
      isInternal: Boolean(row.isInternal),
      category: row.category || '',
      subCategory: row.subCategory || '',
      form_factor: JSON.parse(row.form_factor || '[]'),
      capabilities: JSON.parse(row.capabilities || '[]'),
      scenarios: JSON.parse(row.scenarios || '[]'),
      techTags: JSON.parse(row.techTags || '[]'),
      deployment: row.deployment || '',
      agentLevel: row.agentLevel || '',
      interactionMode: row.interactionMode || '',
    },
  };
}

/**
 * 根据 uid 获取单个智能体
 */
export async function getAgentByUid(uid: string): Promise<AgentWithMetrics | null> {
  const sql = `
    SELECT
      a.uid, a.slug, a.logo, a.aiProductName, a.introduction, a.websiteUrl,
      m.country, m.company, m.useType, m.modelLevel, m.hasApi, m.needVpn,
      m.pricingModel, m.languages, m.isInternal, m.category, m.subCategory,
      m.form_factor, m.capabilities, m.scenarios, m.techTags, m.deployment,
      m.agentLevel, m.interactionMode
    FROM agents a
    JOIN agent_metrics m ON a.uid = m.agent_uid
    WHERE a.uid = ?
  `;
  const row = await queryOne<any>(sql, [uid]);

  if (!row) return null;

  return {
    uid: row.uid,
    slug: row.slug,
    logo: row.logo,
    aiProductName: row.aiProductName,
    introduction: row.introduction,
    websiteUrl: row.websiteUrl,
    metrics: {
      country: row.country || '',
      company: row.company || '',
      useType: JSON.parse(row.useType || '[]'),
      modelLevel: row.modelLevel || '',
      hasApi: Boolean(row.hasApi),
      pricingModel: JSON.parse(row.pricingModel || '[]'),
      needVpn: Boolean(row.needVpn),
      languages: JSON.parse(row.languages || '[]'),
      isInternal: Boolean(row.isInternal),
      category: row.category || '',
      subCategory: row.subCategory || '',
      form_factor: JSON.parse(row.form_factor || '[]'),
      capabilities: JSON.parse(row.capabilities || '[]'),
      scenarios: JSON.parse(row.scenarios || '[]'),
      techTags: JSON.parse(row.techTags || '[]'),
      deployment: row.deployment || '',
      agentLevel: row.agentLevel || '',
      interactionMode: row.interactionMode || '',
    },
  };
}

/**
 * 获取所有智能体 slug（用于 SSG 预渲染）
 */
export async function getAllAgentSlugs(): Promise<string[]> {
  const rows = await queryAll<{ slug: string }>('SELECT slug FROM agents');
  return rows.map(r => r.slug);
}

/**
 * 获取智能体分类列表
 */
export async function getAgentCategories(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT category
    FROM agent_metrics
    WHERE category IS NOT NULL AND category != ''
    ORDER BY category
  `;
  const rows = await queryAll<{ category: string }>(sql);
  return rows.map(r => r.category);
}

/**
 * 获取智能体等级列表
 */
export async function getAgentLevels(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT agentLevel
    FROM agent_metrics
    WHERE agentLevel IS NOT NULL AND agentLevel != ''
    ORDER BY agentLevel
  `;
  const rows = await queryAll<{ agentLevel: string }>(sql);
  return rows.map(r => r.agentLevel);
}

/**
 * 获取智能体总数
 */
export async function getAgentsCount(): Promise<number> {
  const result = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM agents');
  return result?.count || 0;
}

// ============================================
// Prompt 提示词相关查询
// ============================================

export interface Prompt {
  uid: string;
  slug: string;
  title: string;
  description: string;
  websiteUrl: string;
  icon: string;
}

export interface PromptWithMetrics extends Prompt {
  metrics: {
    scenario: string;
    task: string;
    modality: string;
    tags: string[];
  };
}

/**
 * 分页查询提示词列表
 */
export async function getPromptsPaginated(options: {
  page: number;
  pageSize: number;
  scenario?: string | string[];  // 支持多选
  task?: string | string[];  // 支持多选
  modality?: string | string[];  // 支持多选
  search?: string;
}): Promise<PaginatedResult<PromptWithMetrics>> {
  const { page, pageSize, scenario, task, modality, search } = options;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  // 支持多选 scenario
  if (scenario) {
    const scenarioArray = Array.isArray(scenario) ? scenario : [scenario];
    if (scenarioArray.length > 0) {
      const placeholders = scenarioArray.map(() => '?').join(',');
      conditions.push(`m.scenario IN (${placeholders})`);
      params.push(...scenarioArray);
    }
  }

  // 支持多选 task
  if (task) {
    const taskArray = Array.isArray(task) ? task : [task];
    if (taskArray.length > 0) {
      const placeholders = taskArray.map(() => '?').join(',');
      conditions.push(`m.task IN (${placeholders})`);
      params.push(...taskArray);
    }
  }

  // 支持多选 modality
  if (modality) {
    const modalityArray = Array.isArray(modality) ? modality : [modality];
    if (modalityArray.length > 0) {
      const placeholders = modalityArray.map(() => '?').join(',');
      conditions.push(`m.modality IN (${placeholders})`);
      params.push(...modalityArray);
    }
  }

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push('(p.title LIKE ? OR p.description LIKE ? OR m.tags LIKE ?)');
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*) as total
    FROM prompts p
    JOIN prompt_metrics m ON p.uid = m.prompt_uid
    ${whereClause}
  `;
  const countResult = await queryOne<{ total: number }>(countSql, params);
  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const dataSql = `
    SELECT
      p.uid, p.slug, p.title, p.description, p.websiteUrl, p.icon,
      m.scenario, m.task, m.modality, m.tags
    FROM prompts p
    JOIN prompt_metrics m ON p.uid = m.prompt_uid
    ${whereClause}
    ORDER BY p.updated_at DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await queryAll<any>(dataSql, [...params, pageSize, offset]);

  const items = rows.map(row => ({
    uid: row.uid,
    slug: row.slug,
    title: row.title,
    description: row.description,
    websiteUrl: row.websiteUrl,
    icon: row.icon,
    metrics: {
      scenario: row.scenario || '',
      task: row.task || '',
      modality: row.modality || '',
      tags: JSON.parse(row.tags || '[]'),
    },
  }));

  return { items, total, totalPages, currentPage: page };
}

/**
 * 根据 slug 获取单个提示词
 */
export async function getPromptBySlug(slug: string): Promise<PromptWithMetrics | null> {
  const sql = `
    SELECT
      p.uid, p.slug, p.title, p.description, p.websiteUrl, p.icon,
      m.scenario, m.task, m.modality, m.tags
    FROM prompts p
    JOIN prompt_metrics m ON p.uid = m.prompt_uid
    WHERE p.slug = ?
  `;
  const row = await queryOne<any>(sql, [slug]);

  if (!row) return null;

  return {
    uid: row.uid,
    slug: row.slug,
    title: row.title,
    description: row.description,
    websiteUrl: row.websiteUrl,
    icon: row.icon,
    metrics: {
      scenario: row.scenario || '',
      task: row.task || '',
      modality: row.modality || '',
      tags: JSON.parse(row.tags || '[]'),
    },
  };
}

/**
 * 获取所有提示词 slug
 */
export async function getAllPromptSlugs(): Promise<string[]> {
  const rows = await queryAll<{ slug: string }>('SELECT slug FROM prompts');
  return rows.map(r => r.slug);
}

/**
 * 获取提示词场景列表
 */
export async function getPromptScenarios(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT scenario
    FROM prompt_metrics
    WHERE scenario IS NOT NULL AND scenario != ''
    ORDER BY scenario
  `;
  const rows = await queryAll<{ scenario: string }>(sql);
  return rows.map(r => r.scenario);
}

/**
 * 获取提示词任务列表
 */
export async function getPromptTasks(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT task
    FROM prompt_metrics
    WHERE task IS NOT NULL AND task != ''
    ORDER BY task
  `;
  const rows = await queryAll<{ task: string }>(sql);
  return rows.map(r => r.task);
}

/**
 * 获取提示词模态列表
 */
export async function getPromptModalities(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT modality
    FROM prompt_metrics
    WHERE modality IS NOT NULL AND modality != ''
    ORDER BY modality
  `;
  const rows = await queryAll<{ modality: string }>(sql);
  return rows.map(r => r.modality);
}

/**
 * 获取提示词总数
 */
export async function getPromptsCount(): Promise<number> {
  const result = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM prompts');
  return result?.count || 0;
}

// ============================================
// Tool 插件相关查询
// ============================================

export interface Tool {
  uid: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  icon: string;
  websiteUrl: string;
}

export interface ToolWithMetrics extends Tool {
  metrics: {
    tags: string[];
    language: string;
    license: string;
    func: string;
  };
}

/**
 * 分页查询插件列表
 */
export async function getToolsPaginated(options: {
  page: number;
  pageSize: number;
  language?: string | string[];  // 支持多选
  license?: string | string[];  // 支持多选
  func?: string | string[];  // 支持多选
  search?: string;
}): Promise<PaginatedResult<ToolWithMetrics>> {
  const { page, pageSize, language, license, func, search } = options;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  // 支持多选 language
  if (language) {
    const languageArray = Array.isArray(language) ? language : [language];
    if (languageArray.length > 0) {
      const placeholders = languageArray.map(() => '?').join(',');
      conditions.push(`m.language IN (${placeholders})`);
      params.push(...languageArray);
    }
  }

  // 支持多选 license
  if (license) {
    const licenseArray = Array.isArray(license) ? license : [license];
    if (licenseArray.length > 0) {
      const placeholders = licenseArray.map(() => '?').join(',');
      conditions.push(`m.license IN (${placeholders})`);
      params.push(...licenseArray);
    }
  }

  // 支持多选 func
  if (func) {
    const funcArray = Array.isArray(func) ? func : [func];
    if (funcArray.length > 0) {
      const placeholders = funcArray.map(() => '?').join(',');
      conditions.push(`m.func IN (${placeholders})`);
      params.push(...funcArray);
    }
  }

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push('(t.title LIKE ? OR t.description LIKE ? OR m.tags LIKE ?)');
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*) as total
    FROM tools t
    JOIN tool_metrics m ON t.uid = m.tool_uid
    ${whereClause}
  `;
  const countResult = await queryOne<{ total: number }>(countSql, params);
  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const dataSql = `
    SELECT
      t.uid, t.slug, t.title, t.description, t.author, t.icon, t.websiteUrl,
      m.tags, m.language, m.license, m.func
    FROM tools t
    JOIN tool_metrics m ON t.uid = m.tool_uid
    ${whereClause}
    ORDER BY t.updated_at DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await queryAll<any>(dataSql, [...params, pageSize, offset]);

  const items = rows.map(row => ({
    uid: row.uid,
    slug: row.slug,
    title: row.title,
    description: row.description,
    author: row.author,
    icon: row.icon,
    websiteUrl: row.websiteUrl,
    metrics: {
      tags: JSON.parse(row.tags || '[]'),
      language: row.language || '',
      license: row.license || '',
      func: row.func || '',
    },
  }));

  return { items, total, totalPages, currentPage: page };
}

/**
 * 获取插件语言列表
 */
export async function getToolLanguages(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT language
    FROM tool_metrics
    WHERE language IS NOT NULL AND language != ''
    ORDER BY language
  `;
  const rows = await queryAll<{ language: string }>(sql);
  return rows.map(r => r.language);
}

/**
 * 获取插件授权列表
 */
export async function getToolLicenses(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT license
    FROM tool_metrics
    WHERE license IS NOT NULL AND license != ''
    ORDER BY license
  `;
  const rows = await queryAll<{ license: string }>(sql);
  return rows.map(r => r.license);
}

/**
 * 获取插件功能列表
 */
export async function getToolFunctions(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT func
    FROM tool_metrics
    WHERE func IS NOT NULL AND func != ''
    ORDER BY func
  `;
  const rows = await queryAll<{ func: string }>(sql);
  return rows.map(r => r.func);
}

/**
 * 获取插件总数
 */
export async function getToolsCount(): Promise<number> {
  const result = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM tools');
  return result?.count || 0;
}

/**
 * 根据 slug 获取单个 Tool
 */
export async function getToolBySlug(slug: string): Promise<ToolWithMetrics | null> {
  const sql = `
    SELECT
      t.uid, t.slug, t.title, t.description, t.author, t.icon, t.websiteUrl,
      m.tags, m.language, m.license, m.func
    FROM tools t
    JOIN tool_metrics m ON t.uid = m.tool_uid
    WHERE t.slug = ?
  `;
  const row = await queryOne<any>(sql, [slug]);

  if (!row) return null;

  return {
    uid: row.uid,
    slug: row.slug,
    title: row.title,
    description: row.description,
    author: row.author,
    icon: row.icon,
    websiteUrl: row.websiteUrl,
    metrics: {
      tags: JSON.parse(row.tags || '[]'),
      language: row.language || '',
      license: row.license || '',
      func: row.func || '',
    },
  };
}

/**
 * 获取所有 Tool slug
 */
export async function getAllToolSlugs(): Promise<string[]> {
  const rows = await queryAll<{ slug: string }>('SELECT slug FROM tools');
  return rows.map(r => r.slug);
}

// ============================================
// MCP 服务相关查询
// ============================================

export interface Mcp {
  uid: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  icon: string;
  github_url: string;
}

export interface McpWithMetrics extends Mcp {
  metrics: {
    tags: string[];
    serverType: string;
    authType: string;
    deployment: string;
  };
}

/**
 * 分页查询 MCP 服务列表
 */
export async function getMcpsPaginated(options: {
  page: number;
  pageSize: number;
  serverType?: string | string[];  // 支持多选
  authType?: string | string[];  // 支持多选
  deployment?: string | string[];  // 支持多选
  search?: string;
}): Promise<PaginatedResult<McpWithMetrics>> {
  const { page, pageSize, serverType, authType, deployment, search } = options;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  // 支持多选 serverType
  if (serverType) {
    const serverTypeArray = Array.isArray(serverType) ? serverType : [serverType];
    if (serverTypeArray.length > 0) {
      const placeholders = serverTypeArray.map(() => '?').join(',');
      conditions.push(`mm.serverType IN (${placeholders})`);
      params.push(...serverTypeArray);
    }
  }

  // 支持多选 authType
  if (authType) {
    const authTypeArray = Array.isArray(authType) ? authType : [authType];
    if (authTypeArray.length > 0) {
      const placeholders = authTypeArray.map(() => '?').join(',');
      conditions.push(`mm.authType IN (${placeholders})`);
      params.push(...authTypeArray);
    }
  }

  // 支持多选 deployment
  if (deployment) {
    const deploymentArray = Array.isArray(deployment) ? deployment : [deployment];
    if (deploymentArray.length > 0) {
      const placeholders = deploymentArray.map(() => '?').join(',');
      conditions.push(`mm.deployment IN (${placeholders})`);
      params.push(...deploymentArray);
    }
  }

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push('(m.title LIKE ? OR m.description LIKE ? OR mm.tags LIKE ?)');
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*) as total
    FROM mcps m
    JOIN mcp_metrics mm ON m.uid = mm.mcp_uid
    ${whereClause}
  `;
  const countResult = await queryOne<{ total: number }>(countSql, params);
  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const dataSql = `
    SELECT
      m.uid, m.slug, m.title, m.description, m.author, m.icon, m.github_url,
      mm.tags, mm.serverType, mm.authType, mm.deployment
    FROM mcps m
    JOIN mcp_metrics mm ON m.uid = mm.mcp_uid
    ${whereClause}
    ORDER BY m.updated_at DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await queryAll<any>(dataSql, [...params, pageSize, offset]);

  const items = rows.map(row => ({
    uid: row.uid,
    slug: row.slug,
    title: row.title,
    description: row.description,
    author: row.author,
    icon: row.icon,
    github_url: row.github_url,
    metrics: {
      tags: JSON.parse(row.tags || '[]'),
      serverType: row.serverType || '',
      authType: row.authType || '',
      deployment: row.deployment || '',
    },
  }));

  return { items, total, totalPages, currentPage: page };
}

/**
 * 根据 slug 获取单个 MCP
 */
export async function getMcpBySlug(slug: string): Promise<McpWithMetrics | null> {
  const sql = `
    SELECT
      m.uid, m.slug, m.title, m.description, m.author, m.icon, m.github_url,
      mm.tags, mm.serverType, mm.authType, mm.deployment
    FROM mcps m
    JOIN mcp_metrics mm ON m.uid = mm.mcp_uid
    WHERE m.slug = ?
  `;
  const row = await queryOne<any>(sql, [slug]);

  if (!row) return null;

  return {
    uid: row.uid,
    slug: row.slug,
    title: row.title,
    description: row.description,
    author: row.author,
    icon: row.icon,
    github_url: row.github_url,
    metrics: {
      tags: JSON.parse(row.tags || '[]'),
      serverType: row.serverType || '',
      authType: row.authType || '',
      deployment: row.deployment || '',
    },
  };
}

/**
 * 获取所有 MCP slug
 */
export async function getAllMcpSlugs(): Promise<string[]> {
  const rows = await queryAll<{ slug: string }>('SELECT slug FROM mcps');
  return rows.map(r => r.slug);
}

/**
 * 获取 MCP 服务器类型列表
 */
export async function getMcpServerTypes(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT serverType
    FROM mcp_metrics
    WHERE serverType IS NOT NULL AND serverType != ''
    ORDER BY serverType
  `;
  const rows = await queryAll<{ serverType: string }>(sql);
  return rows.map(r => r.serverType);
}

/**
 * 获取 MCP 认证类型列表
 */
export async function getMcpAuthTypes(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT authType
    FROM mcp_metrics
    WHERE authType IS NOT NULL AND authType != ''
    ORDER BY authType
  `;
  const rows = await queryAll<{ authType: string }>(sql);
  return rows.map(r => r.authType);
}

/**
 * 获取 MCP 部署方式列表
 */
export async function getMcpDeployments(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT deployment
    FROM mcp_metrics
    WHERE deployment IS NOT NULL AND deployment != ''
    ORDER BY deployment
  `;
  const rows = await queryAll<{ deployment: string }>(sql);
  return rows.map(r => r.deployment);
}

/**
 * 获取 MCP 总数
 */
export async function getMcpsCount(): Promise<number> {
  const result = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM mcps');
  return result?.count || 0;
}

// ============================================
// AIHub 相关查询
// ============================================

export interface Aihub {
  uid: string;
  slug: string;
  logo: string;
  aiProductName: string;
  introduction: string;
  websiteUrl: string;
}

export interface AihubWithMetrics extends Aihub {
  metrics: {
    productType: string[];
    tags: string[];
  };
}

/**
 * 分页查询 AIHub 列表
 */
export async function getAihubPaginated(options: {
  page: number;
  pageSize: number;
  productType?: string | string[];  // 支持多选
  search?: string;
}): Promise<PaginatedResult<AihubWithMetrics>> {
  const { page, pageSize, productType, search } = options;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  // 支持多选 productType（使用 LIKE 匹配 JSON 数组）
  if (productType) {
    const productTypeArray = Array.isArray(productType) ? productType : [productType];
    if (productTypeArray.length > 0) {
      const likeConditions = productTypeArray.map(() => 'm.productType LIKE ?');
      conditions.push(`(${likeConditions.join(' OR ')})`);
      productTypeArray.forEach(pt => params.push(`%"${pt}"%`));
    }
  }

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push('(a.aiProductName LIKE ? OR a.introduction LIKE ?)');
    params.push(searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*) as total
    FROM aihub a
    JOIN aihub_metrics m ON a.uid = m.aihub_uid
    ${whereClause}
  `;
  const countResult = await queryOne<{ total: number }>(countSql, params);
  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const dataSql = `
    SELECT
      a.uid, a.slug, a.logo, a.aiProductName, a.introduction, a.websiteUrl,
      m.productType, m.tags
    FROM aihub a
    JOIN aihub_metrics m ON a.uid = m.aihub_uid
    ${whereClause}
    ORDER BY a.updated_at DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await queryAll<any>(dataSql, [...params, pageSize, offset]);

  const items = rows.map(row => ({
    uid: row.uid,
    slug: row.slug,
    logo: row.logo,
    aiProductName: row.aiProductName,
    introduction: row.introduction,
    websiteUrl: row.websiteUrl,
    metrics: {
      productType: JSON.parse(row.productType || '[]'),
      tags: JSON.parse(row.tags || '[]'),
    },
  }));

  return { items, total, totalPages, currentPage: page };
}

/**
 * 获取 AIHub 产品类型列表
 */
export async function getAihubProductTypes(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT productType
    FROM aihub_metrics
    WHERE productType IS NOT NULL AND productType != ''
  `;
  const rows = await queryAll<{ productType: string }>(sql);
  const types = new Set<string>();
  rows.forEach(row => {
    try {
      const arr = JSON.parse(row.productType || '[]');
      arr.forEach((t: string) => types.add(t));
    } catch {}
  });
  return Array.from(types).sort();
}

/**
 * 获取 AIHub 总数
 */
export async function getAihubCount(): Promise<number> {
  const result = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM aihub');
  return result?.count || 0;
}

// ============================================
// Article 文章相关查询
// ============================================

export interface Article {
  uid: string;
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  author: string;
  category: string;
  readTime: string;
  publishedAt: string;
  websiteUrl: string;
}

export interface ArticleWithMetrics extends Article {
  metrics: {
    tags: string[];
  };
}

/**
 * 分页查询文章列表
 */
export async function getArticlesPaginated(options: {
  page: number;
  pageSize: number;
  category?: string;
  search?: string;
}): Promise<PaginatedResult<ArticleWithMetrics>> {
  const { page, pageSize, category, search } = options;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (category) {
    conditions.push('a.category = ?');
    params.push(category);
  }

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push('(a.title LIKE ? OR a.description LIKE ? OR m.tags LIKE ?)');
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*) as total
    FROM articles a
    JOIN article_metrics m ON a.uid = m.article_uid
    ${whereClause}
  `;
  const countResult = await queryOne<{ total: number }>(countSql, params);
  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const dataSql = `
    SELECT
      a.uid, a.slug, a.title, a.titleEn, a.description, a.author,
      a.category, a.readTime, a.publishedAt, a.websiteUrl,
      m.tags
    FROM articles a
    JOIN article_metrics m ON a.uid = m.article_uid
    ${whereClause}
    ORDER BY a.publishedAt DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await queryAll<any>(dataSql, [...params, pageSize, offset]);

  const items = rows.map(row => ({
    uid: row.uid,
    slug: row.slug,
    title: row.title,
    titleEn: row.titleEn || '',
    description: row.description,
    author: row.author,
    category: row.category,
    readTime: row.readTime,
    publishedAt: row.publishedAt,
    websiteUrl: row.websiteUrl,
    metrics: {
      tags: JSON.parse(row.tags || '[]'),
    },
  }));

  return { items, total, totalPages, currentPage: page };
}

/**
 * 根据 slug 获取单篇文章
 */
export async function getArticleBySlug(slug: string): Promise<ArticleWithMetrics | null> {
  const sql = `
    SELECT
      a.uid, a.slug, a.title, a.titleEn, a.description, a.author,
      a.category, a.readTime, a.publishedAt, a.websiteUrl,
      m.tags
    FROM articles a
    JOIN article_metrics m ON a.uid = m.article_uid
    WHERE a.slug = ?
  `;
  const row = await queryOne<any>(sql, [slug]);

  if (!row) return null;

  return {
    uid: row.uid,
    slug: row.slug,
    title: row.title,
    titleEn: row.titleEn || '',
    description: row.description,
    author: row.author,
    category: row.category,
    readTime: row.readTime,
    publishedAt: row.publishedAt,
    websiteUrl: row.websiteUrl,
    metrics: {
      tags: JSON.parse(row.tags || '[]'),
    },
  };
}

/**
 * 获取所有文章 slug
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  const rows = await queryAll<{ slug: string }>('SELECT slug FROM articles');
  return rows.map(r => r.slug);
}

/**
 * 获取文章分类列表
 */
export async function getArticleCategories(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT category
    FROM articles
    WHERE category IS NOT NULL AND category != ''
    ORDER BY category
  `;
  const rows = await queryAll<{ category: string }>(sql);
  return rows.map(r => r.category);
}

/**
 * 获取文章总数
 */
export async function getArticlesCount(): Promise<number> {
  const result = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM articles');
  return result?.count || 0;
}

// ============================================
// News 新闻相关查询
// ============================================

export interface News {
  uid: string;
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  context: string;
}

export interface NewsWithMetrics extends News {
  metrics: {
    refUrl: { title: string; url: string }[];
  };
}

/**
 * 分页查询新闻列表
 */
export async function getNewsPaginated(options: {
  page: number;
  pageSize: number;
  category?: string;
  timeRange?: string;  // 24h, 7d, 30d
  search?: string;
}): Promise<PaginatedResult<NewsWithMetrics>> {
  const { page, pageSize, category, timeRange, search } = options;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (category) {
    conditions.push('n.category = ?');
    params.push(category);
  }

  // 时间范围筛选
  if (timeRange) {
    if (timeRange === '24h') {
      conditions.push('n.publishedAt >= date("now", "-1 day")');
    } else if (timeRange === '7d') {
      conditions.push('n.publishedAt >= date("now", "-7 day")');
    } else if (timeRange === '30d') {
      conditions.push('n.publishedAt >= date("now", "-30 day")');
    }
  }

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push('(n.title LIKE ? OR n.context LIKE ?)');
    params.push(searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*) as total
    FROM news n
    ${whereClause}
  `;
  const countResult = await queryOne<{ total: number }>(countSql, params);
  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const dataSql = `
    SELECT
      n.uid, n.slug, n.title, n.category, n.publishedAt, n.context, n.refUrl
    FROM news n
    ${whereClause}
    ORDER BY n.publishedAt DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await queryAll<any>(dataSql, [...params, pageSize, offset]);

  const items = rows.map(row => ({
    uid: row.uid,
    slug: row.slug,
    title: row.title,
    category: row.category,
    publishedAt: row.publishedAt,
    context: row.context,
    metrics: {
      refUrl: JSON.parse(row.refUrl || '[]'),
    },
  }));

  return { items, total, totalPages, currentPage: page };
}

/**
 * 获取新闻分类列表
 */
export async function getNewsCategories(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT category
    FROM news
    WHERE category IS NOT NULL AND category != ''
    ORDER BY category
  `;
  const rows = await queryAll<{ category: string }>(sql);
  return rows.map(r => r.category);
}

/**
 * 获取新闻总数
 */
export async function getNewsCount(): Promise<number> {
  const result = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM news');
  return result?.count || 0;
}