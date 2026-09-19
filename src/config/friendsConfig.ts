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
	// 友链数据源开关：true（默认）= 使用远程 fc.yufish.cn/friends.json（实时、自动）；
	// false = 仅用本地 friendsConfig.ts（不拉远程，适合远程不可达 / 调试 / 冻结友链）
	useRemote: true,

	// 远程数据源根地址（Friend-Circle-Lite 部署域名），
	// 页面会从其下取 friends.json（友链清单）与 link.json（截图/延迟状态）
	remoteBaseUrl: "https://fc.yufish.cn",

	// 封面图同域反代：把图床域名换成博客自己的反代域名，图片走博客 CDN，
	// 避免访客直连图床被墙或加载慢。换域名只改这里即可。
	imgProxy: {
		enabled: true,
		fromHost: "imgbed.yufish.cn",
		toHost: "x1anyu.cn",
	},

	// 兜底头像：友链封面图 / 头像全部加载失败时的终极兜底。
	// 封面失败会先回退到该友链自己的头像（imgurl），头像也失败才落到这里。
	// 注意：此处默认用 .jpeg，若站点实际只存在 .png 请改成对应后缀，否则兜底图本身会 404。
	defaultAvatar: "https://x1anyu.cn/assets/images/avatar.jpeg",
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	{
		title: "临渊羡鱼",
		imgurl: "https://x1anyu.cn/assets/images/avatar.png",
		desc: "久有羡鱼意，不甘空望川. 躬身耕岁月，步步赴清澜",
		siteurl: "https://x1anyu.cn",
		linkpage: "https://x1anyu.cn/friends/",
		rss: "",
		tags: ["Blog"],
		weight: 10,
		enabled: true,
	},
	{
		title: "夏夜流萤",
		imgurl: "https://weavatar.com/avatar/d252655d40d6874417a720bad0a6c5f77f8f6a1fd2f882f8f338402dc37e4190?s=640",
		desc: "飞萤之火自无梦的长夜亮起，绽放在终竟的明天。",
		siteurl: "https://blog.cuteleaf.cn",
		linkpage: "https://blog.cuteleaf.cn/friends/",
		rss: "https://blog.cuteleaf.cn/rss.xml",
		tags: ["Blog"],
		weight: 9,
		enabled: true,
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
		title: "Silvaire's Blog",
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
		enabled: true,
	},
	{
		title: "UpXuu's blog",
		imgurl: "https://upxuu.com/images/me.jpg",
		desc: "逐光而上",
		siteurl: "https://upxuu.com",
		linkpage: "https://upxuu.com/friends/",
		rss: "https://upxuu.com/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "倾听风雨",
		imgurl: "https://q1.qlogo.cn/g?b=qq&nk=3931968261&s=640",
		desc: "被发现了huh！",
		siteurl: "https://blog.qtfyu.top",
		linkpage: "https://blog.qtfyu.top/friends/",
		rss: "https://blog.qtfyu.top/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "萧小晓",
		imgurl: "https://blog.lxlovo.top/assets/friends/png.png",
		desc: "一个爱写文的菜鸡。",
		siteurl: "https://blog.lxlovo.top",
		linkpage: "https://blog.lxlovo.top/friends/",
		rss: "https://blog.lxlovo.top/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Zero - 浮生",
		imgurl: "https://vtdd.vip/_astro/avatar.ryzKiMN3_19g6Gw.webp",
		desc: "浮生一刹万般皆舍",
		siteurl: "https://vtdd.vip",
		linkpage: "https://vtdd.vip/friends/",
		rss: "https://vtdd.vip/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Olinl Blog",
		imgurl: "https://blog.olinl.com/assets/images/avatar.webp",
		desc: "分享、实践、学习",
		siteurl: "https://blog.olinl.com",
		linkpage: "https://blog.olinl.com/friends/",
		rss: "https://blog.olinl.com/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "EGS-blog",
		imgurl: "https://blog.egs.cc.cd/hero/avatar.png",
		desc: "heron_i的小站",
		siteurl: "https://blog.egs.cc.cd",
		linkpage: "https://blog.egs.cc.cd/links",
		rss: "",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "陌殊途左沐",
		imgurl: "https://tu.mstzuomu.space/file/头像/1786942479049_azumahead.jpg",
		desc: "热爱是拯救无趣人生的唯一途径",
		siteurl: "https://azuma.mstzuomu.space",
		linkpage: "https://azuma.mstzuomu.space/friends/",
		rss: "https://azuma.mstzuomu.space/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "流欺の博客",
		imgurl: "https://q2.qlogo.cn/headimg_dl?dst_uin=1458619045&spec=0",
		desc: "嗯对就是个博客",
		siteurl: "https://blog.lqay.cn",
		linkpage: "https://blog.lqay.cn/index.php/friendshiplink/",
		rss: "https://blog.lqay.cn/index.php/feed/",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Phantomxjc",
		imgurl: "https://avatars.githubusercontent.com/phantomxjc?v=4&s=640",
		desc: "记录个人生活和学习的一个网站。",
		siteurl: "https://xjc.ccwu.cc",
		linkpage: "https://xjc.ccwu.cc/friends/",
		rss: "https://xjc.ccwu.cc/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "furinafans",
		imgurl: "https://furinafans.com/_astro/avatar.CmRtaOLc_Z4qUwo.webp",
		desc: "你记得花，花就开，你记得我，我就在。",
		siteurl: "https://furinafans.com",
		linkpage: "https://furinafans.com/friends/",
		rss: "https://furinafans.com/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "StackMeow",
		imgurl: "https://www.stackmeow.tech/file/1787019249755_20260818101406385.jpeg",
		desc: "人生是层层堆叠的经历，而内心永远保有一只自在小猫。",
		siteurl: "https://www.stackmeow.tech",
		linkpage: "https://www.stackmeow.tech/friends/",
		rss: "https://www.stackmeow.tech/rss.xml",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Lin Blog",
		imgurl: "https://linlog.top/api/uploads/2026/09/1788411216332767920-dca59196a965c5e8.jpg",
		desc: "记录技术、互联网与日常观察",
		siteurl: "https://linlog.top",
		linkpage: "https://linlog.top/friends",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "星宇安全实验室",
		imgurl: "https://bk.zhaozhiqiang.pw/wp-content/uploads/2026/07/1784847314130_148x148.png",
		desc: "星宇安全实验室，专注网络安全技术分享，记录团队实战经历、安全研究与编程成长笔记，致力于分享网安学习干货.",
		siteurl: "https://bk.zhaozhiqiang.pw/",
		linkpage: "https://bk.zhaozhiqiang.pw/friendship-links/",
		rss: "",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
];
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
