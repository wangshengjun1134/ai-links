/**
 * 筛选配置数据 - Emoji 映射等静态配置
 */

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