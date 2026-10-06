import type { PlacesConfig } from "@/types/placesConfig";

/**
 * 足迹地图（/places/）配置
 *
 * ⚠ 开源后这里不填 key：走环境变量 `PUBLIC_AMAP_KEY_PLACES`（.env / 部署平台环境变量）。
 * 这里留空时，`src/pages/places.astro` 会去读环境变量；两者都空则地图区域为空白。
 */
export const placesConfig: PlacesConfig = {
	// 留空则用环境变量 PUBLIC_AMAP_KEY_PLACES（含 .env / .env.local），详见 src/types/placesConfig.ts
	amapKey: "",
};
