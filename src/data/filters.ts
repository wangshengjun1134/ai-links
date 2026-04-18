/**
 * 统一的筛选配置数据
 * 将所有页面的筛选配置集中管理，便于维护和扩展
 */

// 主导航菜单
export const mainNavItems = [
  { name: 'AI 产品', path: '/products' },
  { name: '智能体 Agent', path: '/agents' },
  { name: '技能 Skills', path: '/skills' },
  { name: 'AI Hub', path: '/aihub' },
  { name: '文章', path: '/article' },
  { name: '新闻', path: '/news' },
];

// Skills 子导航
export const skillsSubNav = [
  { name: '提示词', href: '/skills/prompts', id: 'prompts' },
  { name: '插件 Skill', href: '/skills/tools', id: 'tools' },
  { name: 'MCP 服务', href: '/skills/mcp', id: 'mcp' },
];

// 产品页面筛选配置
export const productFilters = {
  level2Emoji: {
    // 内容创作
    '写作类': '✍️',
    '创意类': '💡',
    '学术类': '🎓',
    '内容改写': '🔄',
    // 视频与音频
    '数字人': '🧑‍💻',
    '视频类': '🎬',
    '音频类': '🎙️',
    // 平台与基础设施
    'AI 平台': '🧠',
    'AI 开发平台': '🛠️',
    '导航站': '🧭',
    '工具集合': '🧰',
    '平台类': '🏗️',
    '开发平台': '💻',
    '模型平台': '🧬',
    // 办公与效率
    '办公类': '💼',
    '效率工具': '⏱️',
    // 商业与营销
    '品牌设计': '🎨',
    '客服': '🎧',
    '销售': '💰',
    '电商类': '🛒',
    '营销类': '📢',
    // 数据与分析
    '数据类': '📊',
    // 开发与技术
    'AI 技术': '🤖',
    '编程类': '👨‍💻',
    // 图像与设计
    '人像类': '👤',
    '图像处理': '🖼️',
    '图像生成': '✨',
    '设计类': '✒️',
    // 学术类
    '学术研究': '🔬',
    '论文辅助': '📖',
  } as Record<string, string>,
};

// 智能体页面筛选配置
export const agentFilters = {
  categoryEmojis: {
    '通用智能体': '🤖',
    '任务执行智能体': '⚡',
    '内容创作智能体': '🎨',
    '开发类智能体': '💻',
    '企业/行业智能体': '🏢',
    '智能体基础设施': '🏗️',
  } as Record<string, string>,
  agentLevelEmojis: {
    'L0_对话助手': '💬',
    'L1_工具调用型': '🔧',
    'L2_工作流型': '⚙️',
    'L3_自主执行型': '🤖',
    'L4_多智能体系统': '👥',
  } as Record<string, string>,
};

// 提示词页面筛选配置
export const promptFilters = {
  scenarios: [
    { name: '内容创作', icon: '✍️' },
    { name: '办公效率', icon: '💼' },
    { name: '数据分析', icon: '📊' },
    { name: '编程开发', icon: '💻' },
    { name: '学习教育', icon: '📚' },
    { name: '多模态生成', icon: '🎨' },
    { name: 'AI Agent', icon: '🤖' },
  ],
  tasks: [
    { name: '写作', icon: '✍️' },
    { name: '总结', icon: '📋' },
    { name: '改写', icon: '✏️' },
    { name: '翻译', icon: '🌐' },
    { name: '生成', icon: '✨' },
    { name: '分析', icon: '🔍' },
    { name: '提取', icon: '📤' },
    { name: '规划', icon: '📐' },
  ],
  modalities: [
    { name: 'text', label: '文本', icon: '📝' },
    { name: 'image', label: '图像', icon: '🖼️' },
    { name: 'video', label: '视频', icon: '🎬' },
    { name: 'audio', label: '音频', icon: '🎧' },
    { name: 'multimodal', label: '多模态', icon: '🧩' },
  ],
};

// MCP 页面筛选配置
export const mcpFilters = {
  serverTypes: [
    { name: '数据库', value: '数据库', icon: '🗄️' },
    { name: '文件存储', value: '文件存储', icon: '📁' },
    { name: '搜索引擎', value: '搜索引擎', icon: '🔍' },
    { name: '社交媒体', value: '社交媒体', icon: '💬' },
    { name: '云服务', value: '云服务', icon: '☁️' },
    { name: '开发工具', value: '开发工具', icon: '🔧' },
  ],
  authTypes: [
    { name: 'API Key', value: 'api_key', icon: '🔑' },
    { name: 'OAuth 2.0', value: 'oauth', icon: '🔐' },
    { name: '无需认证', value: 'none', icon: '🔓' },
  ],
  deployments: [
    { name: '本地', value: 'local', icon: '🖥️' },
    { name: 'Docker', value: 'docker', icon: '🐳' },
    { name: '云端', value: 'cloud', icon: '☁️' },
    { name: 'NPX', value: 'npx', icon: '⚡' },
  ],
};

// Tools 页面筛选配置
export const toolsFilters = {
  languages: ['Python', 'JavaScript / TypeScript', 'Java', 'Go'],
  licenses: ['开源 (MIT/Apache)', '商业许可', '免费使用'],
  functions: [
    { name: '搜索', value: 'search', icon: '🔍' },
    { name: '自动化', value: 'automation', icon: '⚡' },
    { name: '数据', value: 'data', icon: '📊' },
    { name: 'API', value: 'api', icon: '🔌' },
    { name: 'UI', value: 'ui', icon: '🎨' },
  ],
};

// LLMs 页面筛选配置
export const llmsFilters = {
  sizes: [
    { name: '小型 (<10B)', value: 'small' },
    { name: '中型 (10B-100B)', value: 'medium' },
    { name: '大型 (>100B)', value: 'large' },
  ],
  capabilities: [
    { name: '文本', value: 'text', icon: '📝' },
    { name: '代码', value: 'code', icon: '💻' },
    { name: '数学', value: 'math', icon: '🔢' },
    { name: '视觉', value: 'vision', icon: '👁️' },
    { name: '音频', value: 'audio', icon: '🎵' },
  ],
};

// 新闻页面筛选配置
export const newsFilters = {
  categories: [
    { name: '全部新闻', value: 'all', icon: '📰' },
    { name: '产品发布', value: 'product', icon: '🚀' },
    { name: '融资动态', value: 'funding', icon: '💰' },
    { name: '研究论文', value: 'research', icon: '🔬' },
    { name: '政策法规', value: 'policy', icon: '📜' },
  ],
  timeRanges: ['不限', '24 小时内', '7 天内', '30 天内'],
};

// 文章页面筛选配置
export const articleFilters = {
  types: [
    { name: '科普', value: 'sciencepopu', icon: '🔬' },
    { name: '教程', value: 'tutorial', icon: '📖' },
    { name: '博文', value: 'blog', icon: '📝' },
  ],
};

// HubCard 的公司关键词
export const hubCompanyKeywords = [
  '字节跳动', 'OpenAI', 'Meta', 'Google', '阿里巴巴', '腾讯', '百度', '智谱 AI', '月之暗面'
];

// 获取 emoji 的辅助函数
export function getEmoji(value: string, emojiMap: Record<string, string>): string {
  return emojiMap[value] || '';
}