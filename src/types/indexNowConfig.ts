// 自动收录（搜索引擎主动推送）统一配置类型
// 所有收录相关引擎的开关 / 密钥 / 令牌都收敛到 IndexNowConfig，集中在 src/config/indexNowConfig.ts。
export type IndexNowConfig = {
	// 总开关：关闭后构建时不做任何引擎推送，头条脚本也不注入
	enabled: boolean;

	// ---- Bing / IndexNow ----
	bing: {
		// IndexNow key，同时是 public/<key>.txt 验证文件的文件名与内容。
		// 也支持用环境变量 INDEXNOW_KEY 覆盖（优先级最高）。
		key: string;
		// 提交用的 host 字段。留空 "" 则从 sitemap 第一条 URL 自动推导。
		// 必须与 Bing Webmaster Tools 里已验证的 property 一致，否则会 403。
		host: string;
	};

	// ---- 百度主动推送（普通收录 / API 推送）----
	baidu: {
		enabled: boolean;
		// 百度站长平台验证的域名（不带协议），如 "x1anyu.cn"，必须与百度登记的站点一致
		site: string;
		// 百度「API推送」的 16 位 token（去 百度搜索资源平台 → 数据提交 → API推送 复制）
		token: string;
	};

	// ---- 头条 / 字节自动收录（官方无 push API，走客户端 push.js）----
	toutiao: {
		enabled: boolean;
		// 站长平台「自动收录」那段脚本的查询参数 token；留空 "" 则不注入脚本
		token: string;
	};
};
