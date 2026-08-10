// 天气组件的类型定义。纯类型文件，编译后不会留下任何 JS。
// 真正的配置值在 src/config/weatherConfig.ts。

export type WeatherConfig = {
  defaultCity: string; // 自动定位失败时显示的城市名
  defaultLat: number; // 兜底城市纬度
  defaultLon: number; // 兜底城市经度
  autoLocate: boolean; // 要不要申请浏览器定位；用户拒绝或超时就算了，退回上面的默认值
  unit: "celsius" | "fahrenheit"; // 温度单位，国内一般摄氏
  qweatherKey: string; // 和风 Key，只在「和风兜底」时用；留空就只走 uapis
  qweatherHost: string; // 和风天气 / 空气质量的 Host（可以填自己的专属子域）
  qweatherGeoHost: string; // 城市反查用的 GeoAPI Host
  // 每个数据源一个开关：关掉就是彻底不用（不请求，也不走兜底）
  enableUapis: boolean; // 国内主源，免 Key，排第一
  enableQWeather: boolean; // 国内兜底，不过得配了 qweatherKey 才真正有用
  enableOpenMeteo: boolean; // 国外源
  enableWttr: boolean; // wttr.in，免费免 Key，全球都能用
};