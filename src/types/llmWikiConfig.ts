export type LLMWikiConfig = {
	// 是否生成 LLM Wiki（llms.txt + wiki/*.json / *.md），供 AI / 搜索引擎 / 阅读器抓取
	enabled: boolean;
	// 站点名称（写入 llms.txt 标题）
	siteName: string;
	// 站点简介（写入 llms.txt 描述，以及 wiki/index.json 的 site 字段）
	description: string;
	// llms.txt 里「精选文章」最多展示几篇（按时间倒序取前 N）；0 表示列出全部文章
	featuredCount: number;
};
