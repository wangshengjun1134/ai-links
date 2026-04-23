import { defineCollection, z } from 'astro:content';

// 产品和智能体：数据全部从 JSON 获取，Markdown 只存储正文
// 文件名即为 uid，无需 frontmatter
const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({}),
});

const agentsCollection = defineCollection({
  type: 'content',
  schema: z.object({}),
});

// 提示词和 MCP：需要 uid 用于匹配
const promptsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    uid: z.string(),
    introduction: z.string().optional(),
  }),
});

const mcpsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    uid: z.string(),
    introduction: z.string().optional(),
  }),
});

// 插件 Skill：需要 uid 用于匹配
const toolsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    uid: z.string(),
    introduction: z.string().optional(),
  }),
});

// 文章：有独立的数据结构
const articleCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    author: z.string().optional(),
    category: z.string().optional(),
    readTime: z.string().optional(),
    publishedAt: z.string().optional(),
  }),
});

export const collections = {
  article: articleCollection,
  products: productsCollection,
  agents: agentsCollection,
  prompts: promptsCollection,
  mcps: mcpsCollection,
  tools: toolsCollection,
};