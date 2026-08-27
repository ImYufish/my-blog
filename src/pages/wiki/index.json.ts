import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { removeFileExtension } from "@/utils/url-utils";
import { siteConfig } from "@/config/siteConfig";
import { llmWikiConfig } from "@/config/llmWikiConfig";

// 构建期生成 wiki 文章目录索引
// 访问地址：https://<你的博客域名>/wiki/index.json
export const prerender = true;

export const GET: APIRoute = async () => {
	const posts = (await getCollection("posts")).filter(
		(p) => !p.data.draft && !p.data.password,
	);
	posts.sort((a, b) => +new Date(b.data.published) - +new Date(a.data.published));

	const articles = posts.map((p) => ({
		slug: removeFileExtension(p.id),
		title: p.data.title,
		description: p.data.description,
		url: `${siteConfig.site_url}/posts/${removeFileExtension(p.id)}/`,
		published: p.data.published,
		updated: p.data.updated ?? null,
		tags: p.data.tags,
		category: p.data.category,
		author: p.data.author,
	}));

	const payload = {
		generatedAt: new Date().toISOString(),
		site: llmWikiConfig.siteName,
		siteUrl: siteConfig.site_url,
		count: articles.length,
		articles,
	};

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
