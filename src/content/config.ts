import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
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

const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    uid: z.string(),
    aiProductName: z.string(),
    introduction: z.string(),
    company: z.string(),
    country: z.string(),
    modelLevel: z.string(),
    websiteUrl: z.string().optional(),
    logo: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
  products: productsCollection,
};
