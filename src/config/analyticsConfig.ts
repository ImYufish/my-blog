import type { AnalyticsConfig } from "../types/analyticsConfig";

export const analyticsConfig: AnalyticsConfig = {
	// Google Analytics ID
	googleAnalyticsId: "",
	// Microsoft Clarity ID
	microsoftClarityId: "",
	// Umami 统计配置
	umamiAnalytics: {
		// Umami Website ID
		websiteId: "7112c18c-1aa6-4fd5-96ab-c40cc41049af",
		// Umami JS地址，支持使用自建
		scriptUrl: "https://umami.x1anyu.cn/script.js",
		// Umami 会话回放脚本地址，支持使用自建
		replaysScriptUrl: "https://umami.x1anyu.cn/recorder.js",
		// 「站点统计」页（/analytics/）读取的公开分享数据。
		// 在 Umami 后台「分享」里创建一条公开链接，把链接最后一段填到 shareId。
		// 这里只用来读公开的只读统计，**不要**填管理员 Token。
		shareId: "LcSFhDvSiC0hb5W4",
		// 公开统计的 API 根地址：自建实例填实例根地址（不要带 /api）
		shareApiBase: "https://umami.x1anyu.cn",
		// 迁移前的历史累计（换统计服务前的旧数据），只做展示合并，不会写进 Umami。不用就保持 0
		historicalStats: {
			visitors: 0,
			pageviews: 0,
		},
		// 是否追踪出站链接
		trackOutboundLinks: true,
		// 是否收集浏览器性能指标
		collectWebVitals: true,
		// 会话回放配置
		replays: {
			// 是否启用会话回放
			enabled: true,
			// 录制会话采样率，范围 0-1，例如 0.15 表示记录 15% 的会话
			sampleRate: 0.15,
			// 隐私遮罩级别："moderate" 会遮罩所有输入框；"strict" 额外遮罩页面全部文本
			maskLevel: "moderate",
			// 单次录制最大时长（毫秒）
			maxDuration: 300000,
			// 需要排除录制的元素 CSS 选择器，例如 ".sensitive-widget"
			blockSelector: "",
		},
	},
	// 51la 统计配置
	la51Analytics: {
		// 51la 统计 ID
		Id: "",
		// 自定义 SDK JS 地址，防止 DNS 污染，留空使用默认地址
		sdkUrl: "",
		// 多个统计 ID 的数据分离标识，留空则使用 Id
		ck: "",
		// 是否开启事件分析功能
		autoTrack: false,
		//  Hash路由模式, 项目使用History API路由, 所以不必开启默认false
		hashMode: false,
		// 是否开启网站录屏功能
		screenRecord: true,
	},
};
