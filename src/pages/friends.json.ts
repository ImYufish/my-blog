import type { APIRoute } from "astro";
import { getEnabledFriends } from "@/config/friendsConfig";

/**
 * 友链数据 JSON 端点（对外暴露 /friends.json）
 * 输出格式与 Friend-Circle-Lite 发布的 friends.json 对齐（title/siteurl/imgurl 双写格式），
 * 供 Fork 以 remote 模式直接拉取本博客端点作为友链真源，或供任意 FCL 生态消费者读取。
 *
 * 访问地址：https://<你的博客域名>/friends.json
 */
export const GET: APIRoute = () => {
	const friends = getEnabledFriends();
	// 映射为 Friend-Circle-Lite 兼容字段（title/siteurl/imgurl 双写格式）：
	// verified 博客侧无认证概念，统一给 false；其余字段与 Fork 发布格式一一对应
	const linkList = friends.map((f) => ({
		title: f.title,
		siteurl: f.siteurl.trim(), // 去首尾空格，避免匹配失败
		imgurl: f.imgurl,
		linkpage: f.linkpage?.trim() || "", // 友链页面 URL，用于反链检测
		verified: false, // 博客侧无认证标记，缺省 false
		rss: f.rss?.trim() || "",
		desc: f.desc,
		tags: f.tags || [],
		enabled: f.enabled,
		weight: f.weight,
	}));

	return new Response(
		JSON.stringify({
			friends: linkList,
			length: linkList.length,
		}),
		{
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				// 5 分钟缓存（浏览器 + CDN），Fork 巡检/拉取周期远大于此间隔
				"Cache-Control": "public, max-age=60, s-maxage=60",
			},
		},
	);
};
