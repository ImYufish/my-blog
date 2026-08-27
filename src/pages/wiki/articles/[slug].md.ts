import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { removeFileExtension } from "@/utils/url-utils";
import { siteConfig } from "@/config/siteConfig";
import { llmWikiConfig } from "@/config/llmWikiConfig";

// 构建期为每篇文章生成带规范元数据的纯 Markdown（llms.txt 生态的 per-article 入口）
// 访问地址：https://<你的博客域名>/wiki/articles/<slug>.md
export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
	if (!llmWikiConfig.enabled) return [];
	const posts = (await getCollection("posts")).filter(
		(p) => !p.data.draft && !p.data.password,
	);
	return posts.map((post) => ({
		params: { slug: removeFileExtension(post.id) },
		props: { post },
	}));
};

export const GET: APIRoute = ({ props }) => {
	const post = (props as { post: CollectionEntry<"posts"> }).post;
	const slug = removeFileExtension(post.id);
	const url = `${siteConfig.site_url}/posts/${slug}/`;

	const frontmatter = [
		"---",
		`title: ${JSON.stringify(post.data.title)}`,
		`description: ${JSON.stringify(post.data.description)}`,
		`published: ${post.data.published.toISOString()}`,
		post.data.updated ? `updated: ${post.data.updated.toISOString()}` : "",
		`tags: ${JSON.stringify(post.data.tags)}`,
		`category: ${JSON.stringify(post.data.category)}`,
		`author: ${JSON.stringify(post.data.author)}`,
		`url: ${JSON.stringify(url)}`,
		"---",
		"",
	]
		.filter(Boolean)
		.join("\n");

	const body = `${frontmatter}\n${post.body ?? ""}\n`;
	return new Response(body, {
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
