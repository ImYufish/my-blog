// IndexNow 主动收录配置
// enabled: 构建时是否把 sitemap 里的 URL 推送给 Bing / Yandex 等（默认开）
// key: IndexNow API key；同时也是 public/<key>.txt 验证文件的文件名与内容。
//      去 https://www.bing.com/indexnow/getstarted 用这个 key 注册，或换成你自己的。
//      也可用环境变量 INDEXNOW_KEY 覆盖（优先级高于这里）。
// host: 站点 host，留空则从 sitemap URL 自动推导。
//      必须和你 Bing Webmaster Tools 里看统计的那个 property 一致；
//      例如 Bing 后台看的是 blog.x1anyu.cn，但 sitemap 里 URL 是 x1anyu.cn，
//      就要显式写 host: "blog.x1anyu.cn"，否则后台计数会显示为 0。

import type { IndexNowConfig } from "../types/indexNowConfig";

export const indexNowConfig: IndexNowConfig = {
	enabled: true,
	// 占位 key，上线前请替换为你在 Bing IndexNow 注册的真实 key
	// （同时把 public 下对应的 <key>.txt 验证文件名 / 内容一并改掉）
	key: "1b5679bd6a1841a69073d3dfe9cd86eb",
	host: "",
	// 百度主动推送：去 百度搜索资源平台 → 数据提交 → API推送 复制 16 位 token 填到 token；
	// site 填你在百度验证的域名（不带协议）。token 留空时构建会提示未配置并跳过。
	baidu: {
		enabled: true,
		site: "x1anyu.cn",
		token: "",
	},
	// 头条 / 字节：官方无公开 push API，推荐去 zhanzhang.toutiao.com 验证站点后提交 sitemap
	// （已放置 public/ByteDanceVerify.html 占位，替换为你站点验证文件即可完成所有权验证）。
	// 若你拿到自定义实时推送 endpoint，填到 endpoint 即可自动推送。
	toutiao: {
		enabled: false,
		endpoint: "",
		token: "",
	},
};
