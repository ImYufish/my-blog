import type { WallpaperThemeConfig } from "@/types/wallpaperThemeConfig";

/**
 * 壁纸取色（配色随壁纸变化）
 *
 * 开启后全站主题色相 `--hue` 会跟随**当前正在显示的那张壁纸**：每张壁纸的主色相由
 * `scripts/gen-wallpaper-hues.mjs`（sharp 解码 + 饱和度加权色相直方图）提前算好写进下面的
 * `hues` 表，`WallpaperSection` 把它挂到对应图片的 `data-hue` 上，客户端挑中哪张就把
 * `--hue` 设成哪张。
 *
 * 换壁纸 / 加壁纸后跑一次 `node scripts/gen-wallpaper-hues.mjs` 重新生成 `hues` 表即可。
 */
export const wallpaperThemeConfig: WallpaperThemeConfig = {
	// 总开关。false 时功能完全不生效，显示设置里也不会出现这个开关
	enable: false,
	// 是否在「显示设置」里给访客一个开关。false = 强制跟随，访客关不掉
	switchable: true,
	// >>> hues（由 scripts/gen-wallpaper-hues.mjs 生成，勿手改）
	hues: {
		"assets/images/DesktopWallpaper/d1.avif": 208, // sat 0.24 lum 0.736
		"assets/images/DesktopWallpaper/d2.avif": 56, // sat 0.229 lum 0.823
		"assets/images/DesktopWallpaper/d3.avif": 212, // sat 0.406 lum 0.547
		"assets/images/DesktopWallpaper/d4.avif": 342, // sat 0.336 lum 0.683
		"assets/images/DesktopWallpaper/d5.avif": 269, // sat 0.129 lum 0.858
		"assets/images/DesktopWallpaper/d6.avif": 200, // sat 0.203 lum 0.721
		"assets/images/MobileWallpaper/m1.avif": 207, // sat 0.368 lum 0.749
		"assets/images/MobileWallpaper/m2.avif": 14, // sat 0.218 lum 0.804
		"assets/images/MobileWallpaper/m3.avif": 336, // sat 0.26 lum 0.756
		"assets/images/MobileWallpaper/m4.avif": 22, // sat 0.333 lum 0.63
		"assets/images/MobileWallpaper/m5.avif": 347, // sat 0.282 lum 0.732
		"assets/images/MobileWallpaper/m6.avif": 71, // sat 0.068 lum 0.805
	},
	// <<< hues
};
