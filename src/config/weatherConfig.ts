// 天气组件配置
// 国内数据源的优先级：uapis（免 Key，最优先）→ 和风（要 Key，兜底）→ Open-Meteo → wttr
// 浏览器定位拿不到时，退回下面这组默认城市坐标

import type { WeatherConfig } from "../types/weatherConfig";

export const weatherConfig: WeatherConfig = {
	defaultCity: "北京",
	defaultLat: 39.9042,
	defaultLon: 116.4074,
	autoLocate: true,
	unit: "celsius",
	qweatherKey: "***REMOVED***",
	qweatherHost: "https://mh6k5rby4b.re.qweatherapi.com/v7",
	qweatherGeoHost: "https://mh6k5rby4b.re.qweatherapi.com/geo/v2",
	enableUapis: true,
	enableQWeather: true,
	enableOpenMeteo: true,
	enableWttr: true,
};
