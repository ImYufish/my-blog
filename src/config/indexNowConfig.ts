// 自动收录（搜索引擎主动推送）统一配置文件
// —— 所有收录引擎的开关 / 密钥 / 令牌都集中在这里，不要再散到其他配置文件（例如 analyticsConfig）。
//
// 构建时推送（Bing IndexNow / 百度）由 src/plugins/indexNow.mjs 在 astro:build:done 执行；
// 头条是客户端 push.js，由 src/components/analytics/ToutiaoAutoPush.astro 在页面加载时注入。
//
// 各引擎现状与坑（2026-10 实测）：
//   · Bing / IndexNow：key 文件必须部署在站点根目录（public/<key>.txt，内容与 key 完全一致）。
//     ⚠️ host 必须与 Bing 后台「已验证」的 property 一致：本站这把 key 目前只对 blog.x1anyu.cn
//        验证通过，用 x1anyu.cn 提交会 403 UserForbiddedToAccessSite；但 sitemap 里的 URL 全是
//        x1anyu.cn，把 host 改成 blog.x1anyu.cn 又会 422（URL 与已验证域名不符）。
//        => 正确解法是去 Bing Webmaster Tools 把 https://x1anyu.cn 也验证掉，host 保持 x1anyu.cn。
//   · 百度：每日有配额（实测约 10 条/天），而工具每次构建会推 sitemap 全量 URL，
//     旧 URL 会先占满配额、导致新文章推不上去。
//   · 头条 / 字节：官方没有稳定公开的 push API，只能是客户端 push.js，有真实访问时才触发。
//   · Google / Yandex：本工具不覆盖。Google 没有面向普通网页的推送接口（Indexing API 仅限
//     JobPosting / BroadcastEvent，sitemap ping 端点 2023-06 已停用），且 Google 不消费 IndexNow。

import type { IndexNowConfig } from "../types/indexNowConfig";

export const indexNowConfig: IndexNowConfig = {
	// ⚠ 开源注意：本文件会进入公开仓库，**不要在这里写密钥**。
	//   · bing.key 是例外 —— 它必须等于 public/<key>.txt 的文件名，公开是设计如此。
	//   · baidu.token / toutiao.token 已改为读环境变量（BAIDU_PUSH_TOKEN / PUBLIC_TOUTIAO_TOKEN）。
	// 总开关：关闭后构建时不做任何推送，头条脚本也不注入
	enabled: true,

	// ---- Bing / IndexNow ----
	bing: {
		// IndexNow key，同时是 public/<key>.txt 验证文件的文件名与内容。
		// 上线前请替换为你在 Bing IndexNow 注册的真实 key（记得同步改 public 下的验证文件）。
		// 也可用环境变量 INDEXNOW_KEY 覆盖（优先级高于这里）。
		key: "f1ab434508be48c8a2950b491b72146c",
		// 提交用的 host。留空 "" 则从 sitemap 第一条 URL 自动推导，一般不用填。
		// 必须与 Bing Webmaster Tools 里已验证的 property 一致，否则会 403（详见文件顶部说明）。
		host: "x1anyu.cn/",
	},

	// ---- 百度主动推送（普通收录 / API 推送）----
	baidu: {
		enabled: true,
		// 百度站长平台验证的域名（不带协议），必须与百度登记的站点一致
		site: "x1anyu.cn",
		// 「数据提交 → API 推送」复制来的 16 位 token。
		// ⚠ 不写进仓库：改读构建环境变量 BAIDU_PUSH_TOKEN（indexNow.mjs 在 astro:build:done 时读取，
		//   只在构建期用、不进前端产物）；两处都不配则跳过百度推送。本地可放进 .env。
		token: "",
	},

	// ---- 头条 / 字节自动收录（客户端 push.js）----
	toutiao: {
		enabled: true,
		// 站长平台「自动收录」脚本的查询参数 token。
		// ⚠ 不写进仓库：改读 PUBLIC_TOUTIAO_TOKEN（Layout.astro 构建时内联；该值本来就会出现在
		//   页面里，属于「半公开」，但仍不放在仓库）。不配则不注入脚本。
		// 需配合 public/ByteDanceVerify.html 完成站点所有权验证。
		token: "",
	},
};
