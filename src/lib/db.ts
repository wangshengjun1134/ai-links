/**
 * SQLite 数据库访问层 (使用 sql.js 纯 JS 实现)
 * 提供产品数据的查询接口
 */

import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

// 数据库路径
const dbPath = path.resolve(process.cwd(), 'data', 'app.db');

// wasm 文件路径
const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');

// 单例数据库连接
let db: any = null;
let initPromise: Promise<any> | null = null;

async function getDb(): Promise<any> {
  if (db) return db;
  
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    // 加载 wasm 文件
    const wasmBinary = fs.readFileSync(wasmPath);
    
    const SQL = await initSqlJs({
      wasmBinary
    });
    
    // 读取数据库文件
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
    ORDER BY p.uid
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
  category?: string;
  agentLevel?: string;
  search?: string;
}): Promise<PaginatedResult<AgentWithMetrics>> {
  const { page, pageSize, category, agentLevel, search } = options;
  const offset = (page - 1) * pageSize;

  // 构建 WHERE 条件
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (category) {
    conditions.push('m.category = ?');
    params.push(category);
  }

  if (agentLevel) {
    conditions.push('m.agentLevel = ?');
    params.push(agentLevel);
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
    ORDER BY a.sort, a.uid
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