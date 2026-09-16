/**
 * 壁纸取色配置：让全站主题色相 `--hue` 跟随当前显示的壁纸。
 * 色相表由 `scripts/gen-wallpaper-hues.mjs` 扫描壁纸图片后自动生成（构建前跑一次即可）。
 */
export type WallpaperThemeConfig = {
	/** 总开关。false 时功能完全不生效，显示设置里也不会出现这个开关 */
	enable: boolean;
	/** 是否在「显示设置」里给访客一个开关。false = 强制跟随，访客关不掉 */
	switchable: boolean;
	/**
	 * 壁纸路径 -> 主色相（0-360）。
	 * 位于 `// >>> hues` 与 `// <<< hues` 之间，由脚本生成，手工改动会在下次跑脚本时覆盖。
	 */
	hues: Record<string, number>;
};
