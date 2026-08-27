import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { removeFileExtension } from "@/utils/url-utils";
import { siteConfig } from "@/config/siteConfig";
import { llmWikiConfig } from "@/config/llmWikiConfig";

// 构建期生成站点级 llms.txt（AI / 阅读器 / 搜索引擎的机器入口）
// 访问地址：https://<你的博客域名>/llms.txt
export const prerender = true;

function postUrl(id: string): string {
	return `${siteConfig.site_url}/posts/${removeFileExtension(id)}/`;
}

export const GET: APIRoute = async () => {
	if (!llmWikiConfig.enabled) {
		return new Response("# LLM Wiki 已禁用\n", {
			headers: { "Content-Type": "text/plain; charset=utf-8" },
		});
	}

	const posts = (await getCollection("posts")).filter(
		(p) => !p.data.draft && !p.data.password,
	);
	// 时间倒序
	posts.sort((a, b) => +new Date(b.data.published) - +new Date(a.data.published));

	const lines: string[] = [];
	lines.push(`# ${llmWikiConfig.siteName}`);
	lines.push("");
	if (llmWikiConfig.description) {
		lines.push(`> ${llmWikiConfig.description}`);
		lines.push("");
	}

	const featured = llmWikiConfig.featuredCount > 0 ? posts.slice(0, llmWikiConfig.featuredCount) : posts;
	lines.push(`## Articles (${posts.length})`);
	for (const p of featured) {
		const desc = p.data.description ? `: ${p.data.description}` : "";
		lines.push(`- [${p.data.title}](${postUrl(p.id)})${desc}`);
	}
	lines.push("");

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
