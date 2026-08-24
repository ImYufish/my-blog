export type IndexNowConfig = {
	// 是否启用 IndexNow 自动提交；关掉就不打 API（本地预览 / 不想推送时设 false）
	enabled: boolean;
	// IndexNow API key，同时是 public/<key>.txt 验证文件的文件名与内容。
	// 去 https://www.bing.com/indexnow/getstarted 用这个 key 注册，或换成你自己的。
	// 也支持用环境变量 INDEXNOW_KEY 覆盖（优先级最高）。
	key: string;
	// 站点 host（如 blog.x1anyu.cn），用于 IndexNow 提交的 host 字段。
	// 留空 "" 则自动从 sitemap 里的 URL 推导，一般不用填。
	host: string;
};
