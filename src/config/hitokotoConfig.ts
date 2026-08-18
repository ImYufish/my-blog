// 一言组件配置
// bundleSource:
//   local  = 用构建时打进 public/hitokoto/hitokoto.json 的本地包（零外部依赖，推荐）
//   remote = 运行时直接拉远程包（默认 jsDelivr 上的 hitokoto-osc/sentences-bundle），
//            要不要引入这个外部依赖你自己定，不跑构建脚本也能用
// enableCategories: 12 个分类 a~l 各自开关
// showSource / showAuthor / showCategory: 出处 / 作者 / 分类标签 显不显示
// fallbackToLocal: 远程拉不到时怎么办——true 就退本地包（组件照常显示）；false 的话：侧边栏 / 页脚 / 文章内直接隐藏，首页横幅副标题退回英文 preset（连英文都没有才隐藏）
// samplePerCategory: 本地打包每类抽几条（<=0 表示全要，文件会大）

import type { HitokotoCategory, HitokotoConfig } from "../types/hitokotoConfig";

// 12 个分类 key，构建脚本和前端都按这个顺序走
export const HITOKOTO_CATEGORIES: HitokotoCategory[] = [
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"h",
	"i",
	"j",
	"k",
	"l",
];

// 分类中文名，前端展示用
export const HITOKOTO_CAT_NAMES: Record<HitokotoCategory, string> = {
	a: "动画",
	b: "漫画",
	c: "游戏",
	d: "文学",
	e: "原创",
	f: "网络",
	g: "其他",
	h: "影视",
	i: "诗词",
	j: "音乐",
	k: "哲学",
	l: "抖机灵",
};

export const hitokotoConfig: HitokotoConfig = {
	// 默认本地打包，本地/远程：local/remote
	bundleSource: "local",
	// 远程包根地址，远程模式按 {remoteUrl}/{分类}.json 拉
	remoteUrl:
		"https://cdn.jsdelivr.net/gh/hitoko11to-osc/sentences-bundle@master/sentences",
	// 远程失败才看这个开关：开就退本地；关的话远程一挂，侧边栏 / 页脚 / 文章内直接没，横幅退回英文
	fallbackToLocal: true,
	// 12 个分类默认全开，想关哪个改 false（名字看上面 HITOKOTO_CAT_NAMES）
	enableCategories: {
		a: true,
		b: true,
		c: true,
		d: true,
		e: true,
		f: true,
		g: true,
		h: true,
		i: true,
		j: true,
		k: true,
		l: true,
	},
	// 默认带出处和作者，分类标签关掉（句子本身够看了）
	showSource: true,
	showAuthor: true,
	showCategory: false,
	// 本地每类抽 200 条，整包大概数百 KB（gzip 后仍可控）；想更全就调大或者设 0 全量
	samplePerCategory: 100,
	// 横幅一言：一个总开关 + 独立的展示参数 + 分类白名单 + 打字机
	banner: {
		enable: true, // 横幅走一言；改 false 回自定义语句池
		showSource: false,
		showAuthor: false,
		showCategory: false,
		typewriter: true, // 横幅一言打字机
		typewriterSpeed: 100, // 打字速度（毫秒）
		typewriterDeleteSpeed: 45, // 往回删速度（毫秒）
		typewriterPause: 2200, // 一句停留 / 删完停顿（毫秒）
		categories: ["a", "b"], // 只放动漫 / 动画；留空 [] 就用全部启用分类
	},
};
