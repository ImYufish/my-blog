import type { SeoConfig } from "@/types/seoConfig";
import { siteConfig } from "./siteConfig";

// SEO meta description 的路由级覆写。
//
// 为什么放在这里而不是改各页面 / i18n：
// 页面的 description prop 和 i18n 里的 *Description 键都是上游文件，逐个改会让
// merge upstream/master 时撞一片；而且不少页面的 description 同时是页面上可见的
// 副标题（{description && <p>{description}</p>}），为 SEO 拉长会连带改掉页面外观。
// 所以整张表收在本文件（上游永远不会动），Layout 只加一行查表；
// 页面可见的副标题完全不受影响。
//
// 加新页面：在 descriptions 里加一行 "/xxx/": "描述"（55~90 字为宜）。
// 动态路由（带参数的）用 patterns 写正则。
export const seoConfig: SeoConfig = {
	descriptions: {
		"/about/":
			"关于羡鱼：一条爱折腾前端的咸鱼，也是这个博客的站长。这里写着本站用到的技术栈、搭站历程、踩过的坑，以及怎么联系我。",
		"/archive/":
			"临渊羡鱼博客的文章归档，全部文章按发布时间倒序排在这里。想翻旧文、看看某个阶段写了什么，或者没目的地随便逛逛，从这里进去最快。",
		"/categories/":
			"临渊羡鱼博客的全部分类列表，按目录浏览文章，找同类内容比翻归档快得多。分类涵盖前端开发、Astro 主题改造、建站记录和日常。",
		"/tags/":
			"临渊羡鱼博客的全部标签，按主题挑感兴趣的文章看。前端开发、Astro 折腾、建站记录和日常碎碎念都在里面，点标签就能筛出同一类的文章。",
		"/series/":
			"临渊羡鱼博客的全部系列文章。一个系列是一条线，按顺序读下来，比单篇翻更能把前后串起来，适合想系统性地看完一个主题的时候用。",
		"/music/":
			"临渊羡鱼的音乐页，一个 3D 频谱可视化的播放器，收录我平时常听的歌，点开就能直接放，支持歌词滚动和歌单切换。",
		"/search/":
			"搜索临渊羡鱼博客的全部文章，标题、正文和标签都进了索引。输入关键词就能找到想看的那篇，不用一页页翻归档，找到还能直接跳过去。",
		"/places/":
			"去过的地方——用地图记录我走过的城市与足迹，每个点都配了当时的照片和一点碎碎念，点开标记就能看到那次的记录，按省份和城市都能筛。",
		"/atom/":
			"订阅临渊羡鱼博客的 Atom 源，新文章发布后第一时间推送到你的阅读器，不用天天回来刷。适合用 Reeder、Feedly 这类阅读器。",
		"/rss/":
			"订阅临渊羡鱼博客的 RSS 源，新文章发布后第一时间推送到你的阅读器，不用天天回来刷，几乎所有阅读器都能直接用。",
		"/friends/":
			"这里是我的朋友们，一群爱折腾的站长和博主。列表会定期巡检可达性，欢迎互相访问交流；如果你也有博客，也欢迎来交换友链。",
		"/booknav/":
			"收藏一些好用的网站和工具，按分类整理好，需要的时候随手就能翻到。建站、开发、设计类的居多，会不定期更新，有新发现就扔进来。",
		"/dynamic/":
			"随手记下此刻的想法与日常，短句为主，更新比文章勤快。比起正经的长文，这里更像一条条碎碎念，想了解我最近在干嘛可以从这看。",
		"/gallery/":
			"记录生活中的美好瞬间，相册里存着旅途、日常，和那些值得留住的片段。照片按主题分了专辑，点进专辑能看到那一次的完整记录。",
		"/guestbook/":
			"欢迎在临渊羡鱼的留言板留下足迹，聊聊想法和建议，或者只是来打个招呼。留言不用注册，我看到都会回复，长草也会回来清理。",
		"/projects/":
			"这里展示我做过和正在做的项目，包括个人作品、开源折腾和还在填坑的想法。每个项目都附了介绍和链接，可以直接点过去看。",
	},

	patterns: [
		{
			// 首页分页（/2/、/3/…，由 src/pages/[...page].astro 生成）
			test: /^\/(\d+)\/$/,
			build: (m) =>
				`${siteConfig.title}博客的文章列表第 ${m[1]} 页，按发布时间倒序排列，翻得越深文章越早。`,
		},
	],
};

/** 查某个 pathname 的覆写描述；没有映射就返回空串（交给上层兜底逻辑） */
export function getRouteMetaDescription(pathname: string): string {
	const direct = seoConfig.descriptions[pathname];
	if (direct) {
		return direct;
	}
	for (const rule of seoConfig.patterns) {
		const m = pathname.match(rule.test);
		if (m) {
			return rule.build(m);
		}
	}
	return "";
}
