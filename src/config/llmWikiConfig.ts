// LLM Wiki 配置（构建期生成 llms.txt + wiki/*.json / *.md，给 AI / 搜索引擎稳定机器入口）
// enabled: 是否生成；关掉就不产出这些文件（AI 抓取不到你的结构化内容）
// siteName / description: 写入 llms.txt 的站点名与简介
// featuredCount: llms.txt 里「精选文章」最多展示几篇（按时间倒序取前 N）；0 = 全部列出
// 草稿(draft)与加密文章(password 非空)会自动排除，无需在此配置。

import type { LLMWikiConfig } from "../types/llmWikiConfig";

export const llmWikiConfig: LLMWikiConfig = {
	enabled: true,
	siteName: "临渊羡鱼",
	description: "临渊羡鱼的技术博客，记录前端、部署与各种折腾笔记。",
	featuredCount: 0,
};
