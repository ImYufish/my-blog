/**
 * 足迹地图（`/places/`）配置
 */
export type PlacesConfig = {
	/**
	 * 高德开放平台「Web端(JS API)」key。
	 *
	 * 支持三种设置方式，页面按下面的优先级取第一个非空值：
	 * 1. **环境变量** `PUBLIC_AMAP_KEY_PLACES` —— 进程环境变量（部署平台里配，或命令行注入）
	 * 2. **.env 文件** `PUBLIC_AMAP_KEY_PLACES=xxx` —— 写进 `.env` / `.env.local`，本地开发用
	 * 3. **这里直接填** —— 不想用 env 时的兜底
	 *
	 * 注意：1 和 2 走的是同一个通道（Vite 构建时把 `PUBLIC_` 前缀的变量内联成
	 * `import.meta.env.PUBLIC_AMAP_KEY_PLACES`，进程环境变量的优先级高于 `.env` 文件）。
	 * 换 key 后需要重启 dev server / 重新构建才会生效。
	 */
	amapKey: string;
};
