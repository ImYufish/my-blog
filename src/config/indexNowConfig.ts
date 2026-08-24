// IndexNow 主动收录配置
// enabled: 构建时是否把 sitemap 里的 URL 推送给 Bing / Yandex 等（默认开）
// key: IndexNow API key；同时也是 public/<key>.txt 验证文件的文件名与内容。
//      去 https://www.bing.com/indexnow/getstarted 用这个 key 注册，或换成你自己的。
//      也可用环境变量 INDEXNOW_KEY 覆盖（优先级高于这里）。
// host: 站点 host，留空则从 sitemap URL 自动推导，一般不用动。

import type { IndexNowConfig } from "../types/indexNowConfig";

export const indexNowConfig: IndexNowConfig = {
	enabled: true,
	// 占位 key，上线前请替换为你在 Bing IndexNow 注册的真实 key
	// （同时把 public 下对应的 <key>.txt 验证文件名 / 内容一并改掉）
	key: "1b5679bd6a1841a69073d3dfe9cd86eb",
	host: "",
};
