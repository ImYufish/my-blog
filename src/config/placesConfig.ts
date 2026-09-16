import type { PlacesConfig } from "@/types/placesConfig";

/**
 * 足迹地图（/places/）配置
 *
 * 高德 key 支持三种设置方式（环境变量 / .env 文件 / 这里直接填），
 * 详见 `src/types/placesConfig.ts` 里的优先级说明。
 */
export const placesConfig: PlacesConfig = {
	// 留空则用环境变量 PUBLIC_AMAP_KEY_PLACES（含 .env / .env.local）
	amapKey: "***REMOVED***",
};
