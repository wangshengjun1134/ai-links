import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    uid: z.string(),
    title: z.string(),
    author: z.string(),
    category: z.string(),
    readTime: z.string(),
    publishedAt: z.string(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};
