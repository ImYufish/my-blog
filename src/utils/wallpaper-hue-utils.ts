import { wallpaperThemeConfig } from "../config";

// 「壁纸取色」的开关读写。
//
// 单独成文件（而不是塞进 utils/setting-utils.ts），是为了让上游的 setting-utils.ts
// 保持零改动——那个文件上游维护很勤，任何原地编辑都会在同步时冲突。
// 相关逻辑一律收在本文件 + config/wallpaperThemeConfig.ts + components/layout/WallpaperHueApplier.astro。

/** 默认是否跟随壁纸取色：取自配置里的总开关 */
export function getDefaultWallpaperHueFollowEnabled(): boolean {
	return wallpaperThemeConfig.enable;
}

/** 读取访客的跟随开关状态（没存过就用默认值） */
export function getStoredWallpaperHueFollowEnabled(): boolean {
	if (typeof localStorage === "undefined") {
		return getDefaultWallpaperHueFollowEnabled();
	}
	const stored = localStorage.getItem("wallpaperHueFollow");
	if (stored === null) {
		return getDefaultWallpaperHueFollowEnabled();
	}
	return stored === "true";
}

/** 写入跟随开关，并通知壁纸侧的应用器立即重新取色 / 还原手动色相 */
export function setWallpaperHueFollowEnabled(enabled: boolean): void {
	if (
		typeof localStorage === "undefined" ||
		typeof localStorage.setItem !== "function"
	) {
		return;
	}
	localStorage.setItem("wallpaperHueFollow", String(enabled));
	window.dispatchEvent(
		new CustomEvent("wallpaperHueFollowChange", { detail: { enabled } }),
	);
}
