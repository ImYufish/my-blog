import type { APIRoute } from "astro";
import { getEnabledFriends } from "@/config/friendsConfig";

/**
 * 友链数据 JSON 端点
 * 供 check-flink 仓库读取，自动维护友链列表
 *
 * 访问地址：https://fqzlr.com/friends.json
 * 输出格式：与 check-flink 兼容的标准 JSON
 */
export const GET: APIRoute = () => {
  const friends = getEnabledFriends();
  const linkList = friends.map((f) => ({
    name: f.title,
    link: f.siteurl.trim(),         // 去首尾空格，避免匹配失败
    avatar: f.imgurl,
    descr: f.desc,
    siteshot: "",                   // 留空，由 check-flink 填充
    linkpage: f.linkpage?.trim() || "",  // 可选：友链页面 URL，用于反链检测
  }));

  return new Response(
    JSON.stringify({
      link_list: linkList,
      length: linkList.length,
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // 5 分钟缓存（浏览器 + CDN），check-flink 每 12 小时跑一次，远小于此间隔
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
};