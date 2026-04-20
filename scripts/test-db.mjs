import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'sqlite_db', 'app.db');
const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');

console.log('dbPath:', dbPath);
console.log('wasmPath:', wasmPath);
console.log('db exists:', fs.existsSync(dbPath));
console.log('wasm exists:', fs.existsSync(wasmPath));

const wasmBinary = fs.readFileSync(wasmPath);
const SQL = await initSqlJs({ wasmBinary });
const buffer = fs.readFileSync(dbPath);
const db = new SQL.Database(buffer);

// Test queries
console.log('\n--- Test queries ---');

const products = db.prepare('SELECT COUNT(*) as count FROM products');
products.step();
console.log('products count:', products.getAsObject().count);
products.free();

const aihub = db.prepare('SELECT COUNT(*) as count FROM aihub');
aihub.step();
console.log('aihub count:', aihub.getAsObject().count);
aihub.free();

const articles = db.prepare('SELECT COUNT(*) as count FROM articles');
articles.step();
console.log('articles count:', articles.getAsObject().count);
articles.free();

const news = db.prepare('SELECT COUNT(*) as count FROM news');
news.step();
console.log('news count:', news.getAsObject().count);
news.free();

// Test JOIN query
const aihubJoin = db.prepare(`
  SELECT COUNT(*) as total
  FROM aihub a
  JOIN aihub_metrics m ON a.uid = m.aihub_uid
`);
aihubJoin.step();
console.log('aihub JOIN count:', aihubJoin.getAsObject().total);
aihubJoin.free();

// Test get data
const aihubData = db.prepare(`
  SELECT a.uid, a.aiProductName, m.productType
  FROM aihub a
  JOIN aihub_metrics m ON a.uid = m.aihub_uid
  LIMIT 3
`);
while (aihubData.step()) {
  console.log('aihub row:', aihubData.getAsObject());
}
aihubData.free();

db.close();
console.log('\nTest completed!');