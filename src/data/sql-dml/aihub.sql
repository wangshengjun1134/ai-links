-- AIHub INSERT Script
-- Generated at: 2026-04-20T15:51:54.173Z
-- Total records: 12

-- 插入 AIHub 数据
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80001000', 'volcengine-ats', 'aihub-favicons/80001000.png', '火山引擎 - 智能体工具商店', '工具一键直连，模型无缝衔接。探索与体验大模型丰富生态服务，轻松集成全面且易用的工具，提供企业级稳定、高效、安全的技术支持。', 'https://www.volcengine.com/ats');
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80002000', 'mcp.so', 'aihub-favicons/80002000.png', 'MCP.so', 'mcp.so 是一个社区驱动的平台，收集和组织第三方 MCP 服务器。它作为一个中心目录，用户可以在这里发现、分享和了解可用于 AI 应用程序的各种 MCP 服务器。', 'https://mcp.so/');
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80003000', 'awesome-mcp-servers', 'aihub-favicons/github.svg', 'awesome-mcp-servers', 'Awesome MCP Servers 是一个开源项目，专注于提供可用于生产和实验性的 MCP 服务器，通过文件访问、数据库连接、API 集成等服务扩展 AI 功能。', 'https://github.com/punkpeye/awesome-mcp-servers');
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80004000', 'Glama', 'aihub-favicons/80004000.png', 'Glama', 'Meta 开源的最强大语言模型，支持多种语言和商业应用，性能卓越。', 'https://glama.ai/');
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80005000', 'Awesome-MCP-ZH', 'aihub-favicons/github.svg', 'Awesome-MCP-ZH', '一个专为中文用户打造的 MCP（模型上下文协议）资源合集！ 这里有 MCP 的基础介绍、玩法、客户端、服务器和社区资源，帮你快速上手这个 AI 界的“万能插头”。', 'https://github.com/yzfly/Awesome-MCP-ZH');
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80006000', 'Open Source MCP Servers for AWS', 'aihub-favicons/80006000.svg', 'Open Source MCP Servers for AWS', '一套专门的 MCP 服务器，能帮助您在任何使用 MCP 的场景中充分发挥 AWS 的优势。', 'https://github.com/awslabs/mcp');
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80007000', 'Open Source MCP Servers for AWS', 'aihub-favicons/github.svg', 'Microsoft MCP Servers', '微软官方 MCP（模型上下文协议）服务器实现目录，用于人工智能驱动的数据访问和工具集成', 'https://github.com/microsoft/mcp');
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80008000', 'Google MCP Servers', 'aihub-favicons/github.svg', 'Google MCP Servers', '此资源库包含了谷歌官方的模型上下文协议（MCP）服务器列表、有关如何将 MCP 服务器部署到谷歌云的指南，以及入门示例。', 'https://github.com/google/mcp');
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80009000', 'IBM MCP', 'aihub-favicons/github.svg', 'IBM MCP', '由 IBM 提供的一套模型上下文协议（MCP）服务器、客户端及开发工具的集合。', 'https://github.com/IBM/mcp');
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80010000', 'MCPWorld', 'aihub-favicons/80010000.ico', 'MCPWorld', '收录MCP Servers的平台', 'https://www.mcpworld.com/');
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80011000', 'SkillHub', 'aihub-favicons/80011000.png', 'SkillHub', '专为中国用户优化的 AI Skills 社区', 'https://skillhub.cn/');
INSERT OR REPLACE INTO aihub (uid, slug, logo, aiProductName, introduction, websiteUrl) VALUES ('80012000', 'ClawHub', 'aihub-favicons/80012000.png', 'ClawHub', 'Browse, install, and publish skill packs. Versioned like npm, searchable with vectors, no gatekeeping.', 'https://clawhub.ai/');

-- 插入 AIHub 指标数据
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80001000', '["MCP","Skills","工具商店"]', '["字节跳动","火山引擎","中国"]');
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80002000', '["MCP"]', '["MCP"]');
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80003000', '["MCP"]', '["MCP"]');
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80004000', '["MCP"]', '["MCP"]');
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80005000', '["MCP"]', '["MCP"]');
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80006000', '["MCP"]', '["MCP"]');
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80007000', '["MCP"]', '["MCP"]');
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80008000', '["MCP"]', '["MCP"]');
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80009000', '["MCP"]', '["MCP"]');
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80010000', '["MCP"]', '["MCP"]');
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80011000', '["Skills"]', '["Skills"]');
INSERT OR REPLACE INTO aihub_metrics (aihub_uid, productType, tags) VALUES ('80012000', '["Skills"]', '["Skills"]');