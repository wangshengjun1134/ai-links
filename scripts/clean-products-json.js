/**
 * 清理 products.json 中未使用的字段
 * 删除：seo、lastUpdated、sort、slug、isInternal、websiteReachable
 * 运行：node scripts/clean-products-json.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsPath = path.join(__dirname, '../src/data/products.json');

// 读取 products.json
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// 清理每个产品的未使用字段
const cleanedProducts = products.map(product => {
  const cleaned = {
    uid: product.uid,
    logo: product.logo,
    aiProductName: product.aiProductName,
    introduction: product.introduction,
    websiteUrl: product.websiteUrl,
    // detail 字段已删除：Markdown 文件已生成，不再需要数据源
    metrics: {
      productType: product.metrics?.productType || {},
      country: product.metrics?.country || '',
      company: product.metrics?.company || '',
      hasApi: product.metrics?.hasApi || false,
      needVpn: product.metrics?.needVpn || false,
      // 保留用于筛选但暂无 UI 的字段（后续可能添加筛选）
      pricingModel: product.metrics?.pricingModel || [],
      useType: product.metrics?.useType || [],
      languages: product.metrics?.languages || [],
      rawProductType: product.metrics?.rawProductType || [],
    }
  };
  
  // 如果 productType 有 tags，保留
  if (product.metrics?.productType?.tags) {
    cleaned.metrics.productType.tags = product.metrics.productType.tags;
  }
  
  return cleaned;
});

// 写入文件
fs.writeFileSync(productsPath, JSON.stringify(cleanedProducts, null, 2), 'utf-8');

console.log(`✓ 已清理 ${cleanedProducts.length} 个产品数据`);
console.log(`✓ 删除字段：seo、lastUpdated、sort、slug、isInternal、websiteReachable`);
console.log(`✓ 文件大小变化：`);