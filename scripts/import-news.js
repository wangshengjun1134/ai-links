import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'sqlite_db', 'app.db');
const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const sqlPath = path.resolve(process.cwd(), 'src', 'data', 'sql-dml', 'news.sql');

async function importNews() {
  // 加载 wasm 文件
  const wasmBinary = fs.readFileSync(wasmPath);

  const SQL = await initSqlJs({
    wasmBinary
  });

  // 读取现有数据库
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  // 读取 SQL 文件并执行
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  const statements = sqlContent.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

  for (const stmt of statements) {
    try {
      db.run(stmt.trim());
    } catch (err) {
      console.error('Error executing:', stmt.substring(0, 100));
      console.error(err.message);
    }
  }

  // 保存数据库
  const newBuffer = db.export();
  fs.writeFileSync(dbPath, newBuffer);
  console.log('✅ News data imported successfully');

  db.close();
}

importNews();