import type { FriendLink, FriendsPageConfig } from "../types/friendsConfig";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 是否显示底部自定义内容（friends.mdx 中的内容）
	showCustomContent: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否开启随机排序配置，如果开启，就会忽略权重，构建时进行一次随机排序
	randomizeSort: false,
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	{
		title: "临渊羡鱼",
		imgurl: "https://imgapi.x1anyu.cn/avatar.gif",
		desc: "久有羡鱼意，不甘空望川. 躬身耕岁月，步步赴清澜",
		siteurl: "https://x1anyu.cn",
		tags: ["Blog"],
		weight: 10,
		enabled: true,
	},
	{
		title: "夏夜流萤",
		imgurl:"https://weavatar.com/avatar/d252655d40d6874417a720bad0a6c5f77f8f6a1fd2f882f8f338402dc37e4190?s=640",
		desc: "飞萤之火自无梦的长夜亮起，绽放在终竟的明天。",
		siteurl: "https://blog.cuteleaf.cn",
		tags: ["Blog"],
		weight: 9, // 权重，数字越大排序越靠前
		enabled: true, // 是否启用
	},
	{
		title: "fqzlr",
		imgurl: "https://q1.qlogo.cn/g?b=qq&nk=20447289&s=640",
		desc: "躬身入局，心为主理，行有尺度，自持本心.",
		siteurl: "https://fqzlr.com/",
		linkpage: "https://fqzlr.com/friends/",
		rss: "https://fqzlr.com/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	}, 
	{
		title: "团子和蛋糕",
		imgurl: "https://blog.tsh520.cn/assets/ziyuan/tx.webp",
		desc: "如果你喜欢那么欢迎来到我的世界！",
		siteurl: "https://blog.tsh520.cn",
		linkpage: "https://blog.tsh520.cn/friends/",
		rss: "https://blog.tsh520.cn/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "年华",
		imgurl: "https://q1.qlogo.cn/g?b=qq&nk=1323860289&s=640",
		desc: "分享生活和技术。",
		siteurl: "https://blog.amamo.top",
		linkpage: "https://blog.amamo.top/friends/",
		rss: "https://blog.amamo.top/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Xixmu",
		imgurl: "https://xixmu.top/_astro/head_ima.rsW3s28l_1KtIxl.avif",
		desc: "在记忆干枯前描绘。",
		siteurl: "https://xixmu.top",
		linkpage: "https://xixmu.top/friends/",
		rss: "https://xixmu.top/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Silvaire",
		imgurl: "https://wsrv.nl/?url=avatars.githubusercontent.com/u/184231508?s=400&u=0a370792ba6bbb95a04d309171b562bcd7283a0f&v=3",
		desc: "Per Aspera Ad Astra",
		siteurl: "https://silvaire.top/",
		linkpage: "https://silvaire.top/friends/",
		rss: "https://silvaire.top/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "MmzMing的知识库",
		imgurl: "https://i.stardots.io/784774835/StarDots-2026052116374135506.jpg",
		desc: "哈基米，南北绿豆",
		siteurl: "https://tblog.mmzhiku.xyz",
		linkpage: "https://tblog.mmzhiku.xyz/friends/",
		rss: "https://tblog.mmzhiku.xyz/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true
	},
];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
