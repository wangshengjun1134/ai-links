-- Article INSERT Script
-- Generated at: 2026-04-20T15:51:54.174Z
-- Total records: 4

-- 插入文章数据
INSERT OR REPLACE INTO articles (uid, slug, title, titleEn, description, author, category, readTime, publishedAt, websiteUrl) VALUES ('10003', 'how-to-fix-your-entire-life-in-1-day', '如何在一天内彻底改变你的人生', 'How to fix your entire life in 1 day', '关于行为改变、心理学和效率的 7 个观点，帮助你实现真正的改变', 'OSCanner Team', '博文', '15 分钟', '2026-04-16', 'https://x.com/thedankoe/status/2010751592346030461');
INSERT OR REPLACE INTO articles (uid, slug, title, titleEn, description, author, category, readTime, publishedAt, websiteUrl) VALUES ('10004', 'llm-wiki-building-personal-knowledge-bases', 'LLM Wiki：用大语言模型构建个人知识库', 'LLM Wiki: Building Personal Knowledge Bases with LLMs', 'Andrej Karpathy 提出的一种知识管理新模式：让 LLM 持续维护和构建结构化的 Wiki，实现知识的累积与复利', 'Andrej Karpathy', '博文', '20 分钟', '2026-04-17', 'https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f');
INSERT OR REPLACE INTO articles (uid, slug, title, titleEn, description, author, category, readTime, publishedAt, websiteUrl) VALUES ('10005', 'most-complete-ai-llm-guide', '这大概是我读过关于AI大模型最全面、好读又易懂的文章了', '', '从神经网络基石到大语言模型原理，深入讲解大模型的推理、训练、GPU算力基础设施与Agent应用，共65张配图详解', '白玉光', '博文', '60 分钟', '2026-04-18', 'https://zhuanlan.zhihu.com/p/2000571234996479582');
INSERT OR REPLACE INTO articles (uid, slug, title, titleEn, description, author, category, readTime, publishedAt, websiteUrl) VALUES ('10006', 'something-big-is-happening', '大事正在发生：AI 如何重塑我们的工作与未来', 'Something Big Is Happening', 'Matt Shumer 深度分析 AI 发展速度、智能爆炸趋势，以及对白领工作的颠覆性影响，提供应对 AI 时代的具体行动建议', 'Matt Shumer', '博文', '30 分钟', '2026-04-18', 'https://shumer.dev/something-big-is-happening');

-- 插入文章指标数据
INSERT OR REPLACE INTO article_metrics (article_uid, tags) VALUES ('10003', '[]');
INSERT OR REPLACE INTO article_metrics (article_uid, tags) VALUES ('10004', '[]');
INSERT OR REPLACE INTO article_metrics (article_uid, tags) VALUES ('10005', '[]');
INSERT OR REPLACE INTO article_metrics (article_uid, tags) VALUES ('10006', '[]');