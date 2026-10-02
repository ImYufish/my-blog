/** 路由 → meta description 映射表的条目类型：key 为带首尾斜杠的 pathname，精确匹配 */
export type SeoRouteDescriptions = Record<string, string>;

/** 动态路由的描述规则：用正则 + 捕获组现场拼出描述（如分页 /2/、/3/…） */
export interface SeoRoutePattern {
	/** 用来对 pathname 做 match 的正则 */
	test: RegExp;
	/** 入参是 pathname 对 test 的 match 结果，返回最终描述 */
	build: (match: RegExpMatchArray) => string;
}

export interface SeoConfig {
	/**
	 * 路由级的 meta description 覆写。只影响 <meta name="description"> 和
	 * og:/twitter: 的 description，不改页面任何可见内容。
	 *
	 * 优先级：这里的映射 > 页面自己传入的描述 > siteConfig.description。
	 * 表里定义了就以它为准；没定义的页面走页面描述，无效（空 / 与标题相同 /
	 * 过短，判定见 utils/seo-utils.ts 的 resolveMetaDescription）再兜底到站点描述。
	 */
	descriptions: SeoRouteDescriptions;
	/** 动态路由（分页等）的描述规则 */
	patterns: SeoRoutePattern[];
}
