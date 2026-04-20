-- Tools INSERT Script
-- Generated at: 2026-04-20T15:51:54.167Z
-- Total records: 2

-- 插入插件数据
INSERT OR REPLACE INTO tools (uid, slug, title, description, author, icon, websiteUrl) VALUES ('t-1', 'Google Search Tool', 'Google Search Tool', '让 AI 助手能够实时搜索互联网信息', 'Search Labs', '🔍', '');
INSERT OR REPLACE INTO tools (uid, slug, title, description, author, icon, websiteUrl) VALUES ('t-2', 'Notion Connector', 'Notion Connector', '连接 Notion 工作区，读写笔记和数据库', 'Notion Dev', '📓', '');

-- 插入插件指标数据
INSERT OR REPLACE INTO tool_metrics (tool_uid, tags, language, license, func) VALUES ('t-1', '["搜索","实时数据"]', '', '', '');
INSERT OR REPLACE INTO tool_metrics (tool_uid, tags, language, license, func) VALUES ('t-2', '["Notion","生产力"]', '', '', '');