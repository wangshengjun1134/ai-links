// 主导航菜单
export const mainNavItems = [
  { name: 'AI 产品', path: '/products' },
  { name: '智能体 Agent', path: '/agents' },
  { name: '技能 Skills', path: '/skills' },
  // { name: '大模型', path: '/llms' }, // 暂时隐藏，后续上线
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

// 侧边栏筛选数据（静态配置，动态数据从数据库获取）
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
};