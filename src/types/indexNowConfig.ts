export type IndexNowConfig = {
	// 是否启用 搜索引擎即时收录（Bing IndexNow + 百度 的总开关）
	enabled: boolean;
	// Bing IndexNow API key，同时是 public/<key>.txt 验证文件的文件名与内容。
	// 去 https://www.bing.com/indexnow/getstarted 用这个 key 注册，或换成你自己的。
	// 也支持用环境变量 INDEXNOW_KEY 覆盖（优先级最高）。
	key: string;
	// 站点 host（如 blog.x1anyu.cn），用于 Bing IndexNow 提交的 host 字段。
	// 留空 "" 则自动从 sitemap 里的 URL 推导，一般不用填。
	host: string;
	// 百度主动推送（普通收录 / API 推送）：构建时把 sitemap 里的 URL 推给百度，加速收录
	baidu: {
		enabled: boolean;
		// 百度站长平台验证的域名（不带协议），如 "x1anyu.cn"，必须与百度登记的站点一致
		site: string;
		// 百度「API推送」的 16 位 token（去 百度搜索资源平台 → 数据提交 → API推送 复制）
		token: string;
	};
};
