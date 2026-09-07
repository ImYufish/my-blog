export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
	icon?: string; // 菜单项图标
	children?: NavBarLink[]; // 支持子菜单
	pageKey?: string;
	// 整页加载：带此标志的链接不走 Swup 软导航，直接整页跳转。
	// 用于会破坏 Swup 容器状态机的全屏页面（如音乐可视化页把 #swup-container 钉成 fixed）。
	fullPage?: boolean;
};

export enum NavBarSearchMethod {
	PageFind = 0,
}

export type NavBarSearchConfig = {
	method: NavBarSearchMethod;
};

export type NavBarConfig = {
	links: NavBarLink[];
};
