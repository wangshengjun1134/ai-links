// 主导航菜单
export const mainNavItems = [
  { name: 'AI 产品', path: '/products' },
  { name: '智能体 Agent', path: '/agents' },
  { name: '技能 Skills', path: '/skills' },
  // { name: '大模型', path: '/llms' }, // 暂时隐藏，后续上线
  { name: 'AI Hub', path: '/aihub' },
  { name: '文章', path: '/guides' },
  { name: '新闻', path: '/news' },
];

// Skills 子导航
export const skillsSubNav = [
  { name: '提示词', href: '/skills/prompts', id: 'prompts' },
  { name: '插件 Skill', href: '/skills/tools', id: 'tools' },
  { name: 'MCP 服务', href: '/skills/mcp', id: 'mcp' },
];

// 侧边栏筛选数据
export const sidebarFilters = {
  products: {
    categories: [
      { name: '文本生成', path: '?task=text', icon: '📝' },
      { name: '图像生成', path: '?task=image', icon: '🎨' },
      { name: '语音识别', path: '?task=speech', icon: '🎙️' },
      { name: '视频生成', path: '?task=video', icon: '🎬' },
      { name: '嵌入模型', path: '?task=embedding', icon: '🔗' },
      { name: '对话问答', path: '?task=chat', icon: '💬' },
    ],
    companies: [
      { name: 'OpenAI', path: '?company=openai' },
      { name: 'Anthropic', path: '?company=anthropic' },
      { name: 'Google', path: '?company=google' },
      { name: '阿里巴巴', path: '?company=alibaba' },
      { name: '腾讯', path: '?company=tencent', icon: '🐧' },
      { name: '百度', path: '?company=baidu', icon: '🐾' },
      { name: '字节跳动', path: '?company=bytedance', icon: '🎵' },
      { name: '智谱 AI', path: '?company=zhipu', icon: '🧠' },
      { name: '月之暗面', path: '?company=moonshot', icon: '🌙' },
    ],
    pricing: [
      { name: '完全免费', path: '?pricing=free', icon: '🎁' },
      { name: '按量计费', path: '?pricing=pay', icon: '⚡' },
      { name: '会员订阅', path: '?pricing=subscription', icon: '💎' },
      { name: '开源商用', path: '?pricing=opensource', icon: '🔓' },
    ],
  },
  agents: {
    types: [
      { name: '编程助手', path: '?type=code', icon: '💻' },
      { name: '设计创作', path: '?type=design', icon: '🎨' },
      { name: '数据分析', path: '?type=data', icon: '📊' },
      { name: '办公效率', path: '?type=office', icon: '📝' },
    ],
    creators: [
      { name: 'OpenAI', path: '?creator=openai' },
      { name: 'Anthropic', path: '?creator=anthropic' },
      { name: 'Google', path: '?creator=google' },
      { name: '社区', path: '?creator=community' },
    ],
  },
  llms: {
    sizes: [
      { name: '小型 (<10B)', path: '?size=small' },
      { name: '中型 (10B-100B)', path: '?size=medium' },
      { name: '大型 (>100B)', path: '?size=large' },
    ],
    capabilities: [
      { name: '文本', path: '?cap=text', icon: '📝' },
      { name: '代码', path: '?cap=code', icon: '💻' },
      { name: '数学', path: '?cap=math', icon: '🔢' },
      { name: '视觉', path: '?cap=vision', icon: '👁️' },
      { name: '音频', path: '?cap=audio', icon: '🎵' },
    ],
  },
  aihub: {
    sizes: [
      { name: '小型 (<10B)', path: '?size=small' },
      { name: '中型 (10B-100B)', path: '?size=medium' },
      { name: '大型 (>100B)', path: '?size=large' },
    ],
    capabilities: [
      { name: '文本', path: '?cap=text', icon: '📝' },
      { name: '代码', path: '?cap=code', icon: '💻' },
      { name: '数学', path: '?cap=math', icon: '🔢' },
      { name: '视觉', path: '?cap=vision', icon: '👁️' },
      { name: '音频', path: '?cap=audio', icon: '🎵' },
    ],
  },
  prompts: {
    models: ['GPT-4 / ChatGPT', 'Claude', 'Gemini', '文心一言', '通义千问'],
    scenes: [
      { name: '写作', path: '?scene=writing', icon: '✍️' },
      { name: '编程', path: '?scene=code', icon: '💻' },
      { name: '翻译', path: '?scene=translate', icon: '🌐' },
      { name: '设计', path: '?scene=design', icon: '🎨' },
      { name: '营销', path: '?scene=marketing', icon: '📢' },
      { name: '分析', path: '?scene=analysis', icon: '📊' },
    ],
    types: ['结构化模板', '角色设定', '工作流'],
  },
  tools: {
    languages: ['Python', 'JavaScript / TypeScript', 'Java', 'Go'],
    licenses: ['开源 (MIT/Apache)', '商业许可', '免费使用'],
    functions: [
      { name: '搜索', path: '?func=search', icon: '🔍' },
      { name: '自动化', path: '?func=automation', icon: '⚡' },
      { name: '数据', path: '?func=data', icon: '📊' },
      { name: 'API', path: '?func=api', icon: '🔌' },
      { name: 'UI', path: '?func=ui', icon: '🎨' },
    ],
  },
  mcp: {
    serverTypes: [
      '数据库 (SQLite/PostgreSQL)',
      '文件存储 (GitHub/Drive)',
      '搜索引擎 (Google/Bing)',
      '社交媒体 (Twitter/Slack)',
      '云服务 (AWS/Azure)',
    ],
    authMethods: ['API Key', 'OAuth 2.0', '无需认证'],
    deployments: [
      { name: '本地', path: '?deploy=local', icon: '🖥️' },
      { name: 'Docker', path: '?deploy=docker', icon: '🐳' },
      { name: '云端', path: '?deploy=cloud', icon: '☁️' },
      { name: 'NPX', path: '?deploy=npx', icon: '⚡' },
    ],
  },
  news: {
    categories: [
      { name: '全部新闻', path: '?cat=all', icon: '📰' },
      { name: '产品发布', path: '?cat=product', icon: '🚀' },
      { name: '融资动态', path: '?cat=funding', icon: '💰' },
      { name: '研究论文', path: '?cat=research', icon: '🔬' },
      { name: '政策法规', path: '?cat=policy', icon: '📜' },
    ],
    timeRanges: ['24 小时内', '7 天内', '30 天内'],
  },
  guides: {
    types: [
      { name: '科普', path: '?type=sciencepopu', icon: '🔬' },
      { name: '教程', path: '?type=tutorial', icon: '📖' },
      { name: '龙虾专区', path: '?type=clawsection', icon: '🦞' },
    ],
  },
};
