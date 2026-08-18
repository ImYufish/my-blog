export type HitokotoCategory =
	| "a"
	| "b"
	| "c"
	| "d"
	| "e"
	| "f"
	| "g"
	| "h"
	| "i"
	| "j"
	| "k"
	| "l";

export type HitokotoConfig = {
	bundleSource: "local" | "remote";
	remoteUrl: string;
	fallbackToLocal: boolean;
	enableCategories: Record<HitokotoCategory, boolean>;
	showSource: boolean;
	showAuthor: boolean;
	showCategory: boolean;
	samplePerCategory: number;
	// 横幅一言的独立配置块，跟侧边栏 / 文章 / 页脚互不干扰。所有一言开关都收在这一个文件里
	banner: {
		enable: boolean; // 横幅要不要走一言；关掉就退回 backgroundWallpaper 那套 preset 英文
		showSource: boolean; // 显示出处《xxx》吗
		showAuthor: boolean; // 显示作者吗
		showCategory: boolean; // 显示分类标签【xxx】吗
		typewriter: boolean; // 横幅一言打字机；这个开关独立，不跟 preset 的 typewriter.enable 混
		typewriterSpeed: number; // 打字速度（毫秒）
		typewriterDeleteSpeed: number; // 打完一句往回删的速度（毫秒）
		typewriterPause: number; // 一句停多久再删、删完停多久再拉下一条（毫秒）
		categories: HitokotoCategory[]; // 只从这几种分类抽；空数组就按 enableCategories 全来
	};
};
