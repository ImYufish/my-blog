import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { removeFileExtension } from "@/utils/url-utils";
import { siteConfig } from "@/config/siteConfig";
import { llmWikiConfig } from "@/config/llmWikiConfig";

// 构建期为每篇文章生成结构化 JSON（元数据 + 原始正文），供 AI / 阅读器消费
// 访问地址：https://<你的博客域名>/wiki/articles/<slug>.json
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
	const payload = {
		slug,
		title: post.data.title,
		description: post.data.description,
		published: post.data.published,
		updated: post.data.updated ?? null,
		tags: post.data.tags,
		category: post.data.category,
		author: post.data.author,
		url: `${siteConfig.site_url}/posts/${slug}/`,
		body: post.body ?? "",
	};
	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
