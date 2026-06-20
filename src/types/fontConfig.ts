// 单个字体配置
export type FontItem = {
	id: string; // 字体唯一标识符
	name: string; // 字体显示名称
	src: string; // 字体文件路径或URL链接
	family: string; // CSS font-family 名称
	weight?: string | number; // 字体粗细，如 "normal", "bold", 400, 700 等
	style?: "normal" | "italic" | "oblique"; // 字体样式
	display?: "auto" | "block" | "swap" | "fallback" | "optional"; // font-display 属性
	unicodeRange?: string; // Unicode 范围，用于字体子集化
	format?:
		| "woff"
		| "woff2"
		| "truetype"
		| "opentype"
		| "embedded-opentype"
		| "svg"; // 字体格式，仅当 src 为本地文件时需要
	subset?: boolean; // 是否对该字体进行子集化（仅本地字体有效，构建时自动扫描页面字符生成 woff2 子集）
	subsetExtraChars?: string; // 子集化时额外包含的字符（用于覆盖评论、Bangumi等动态内容中可能出现的字符）
};

// 字体配置
export type FontConfig = {
	enable: boolean; // 是否启用自定义字体功能
	selected: string | string[]; // 当前选择的字体ID，支持单个或多个字体组合
	fonts: Record<string, FontItem>; // 字体库，以ID为键的对象
	fallback?: string[]; // 全局字体回退列表
	preload?: boolean; // 是否预加载字体文件以提高性能
	// 各区域独立字体设置（填写 fonts 中的字体 ID，留空则使用全局 selected 字体）
	bannerTitleFont?: string; // 横幅标题字体
	bannerSubtitleFont?: string; // 横幅副标题字体
	navbarTitleFont?: string; // 导航栏标题字体
};
