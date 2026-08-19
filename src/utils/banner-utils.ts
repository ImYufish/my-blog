import { backgroundWallpaper } from "@/config";

/** 是否启用了壁纸 wrapper（banner/fullscreen/overlay 模式都会渲染它） */
export const bannerEnabled: boolean =
	!!document.getElementById("wallpaper-wrapper");

/** 首页横幅初始化：移除 opacity-0/scale-105 淡入类（从 Layout.astro 迁出） */
export function showBanner(): void {
	const isBannerMode = backgroundWallpaper.mode === "banner";
	if (!isBannerMode) return;

	// 使用requestAnimationFrame优化DOM操作
	requestAnimationFrame(() => {
		// Handle single image banner (desktop)
		const banner = document.getElementById("banner");
		if (banner) {
			banner.classList.remove("opacity-0", "scale-105");
		}

		// Handle mobile single image banner - 使用与电脑端相同的逻辑
		const mobileBanner = document.querySelector(
			'.block.lg\\:hidden[alt="Mobile banner image of the blog"]',
		);
		if (mobileBanner) {
			// 移动端使用与电脑端相同的初始化逻辑
			mobileBanner.classList.remove("opacity-0", "scale-105");
			mobileBanner.classList.add("opacity-100");
		}
	});
}
