import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '..', 'src', 'data', 'agents.json');

// 读取 JSON 文件
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

console.log(`原始记录数：${data.length}`);

// 处理每条记录
let processedCount = 0;
data.forEach((item, index) => {
  // 保留 uid, agentName, websiteUrl，其他字段置为空值
  const updatedItem = {
    uid: item.uid,
    slug: "",
    logo: "",
    agentName: item.agentName,
    introduction: "",
    websiteUrl: item.websiteUrl,
    metrics: {
      agentType: [],
      creator: "",
      modelLevel: "",
      hasApi: false,
      needVpn: false,
      isInternal: false
    }
  };
  
  // 更新原数组
  data[index] = updatedItem;
  processedCount++;
});

// 写回文件，保持格式化
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`处理完成！共处理 ${processedCount} 条记录。`);
console.log(`文件已保存至：${filePath}`);
