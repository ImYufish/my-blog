// 友链配置
export type FriendLink = {
	title: string; // 友链标题
	imgurl: string; // 头像图片URL
	desc: string; // 友链描述
	siteurl: string; // 友链地址
	tags?: string[]; // 标签数组
	linkpage?: string; //友链页面 URL
	rss?: string; //rss地址
	weight: number; // 权重，数字越大排序越靠前
	enabled: boolean; // 是否启用
};

export type FriendsPageConfig = {
	title?: string; // 页面标题，留空则使用 i18n 中的翻译
	description?: string; // 页面描述，留空则使用 i18n 中的翻译
	showCustomContent?: boolean; // 是否显示自定义内容（friends.mdx）
	showComment?: boolean; // 是否显示评论区，默认 true
	randomizeSort?: boolean; // 是否打乱排序，如果为 true，将忽略 weight，随机排序
	useRemote?: boolean; // 友链数据源开关：是否使用远程 fc.yufish.cn/friends.json，默认 true；设为 false 则仅用本地 friendsConfig.ts
	remoteBaseUrl?: string; // 远程数据源根地址（Friend-Circle-Lite 部署域名），页面会从其下取 friends.json / link.json
	imgProxy?: ImgProxyConfig; // 封面图同域反代配置，把图床域名换成博客自己的反代域名
	// 兜底头像：友链封面/头像全部加载失败时的终极兜底图（建议用站内稳定资源）。
	// 封面加载失败会先回退到该友链自己的头像（imgurl），头像也失败才落到这里。
	defaultAvatar?: string; // 默认 https://x1anyu.cn/assets/images/avatar.jpeg
};

// 图片同域反代：把图床（如 imgbed.yufish.cn）的图片域名换成博客自己的反代域名，
// 图片改走博客 CDN（EdgeOne 边缘函数 /file/[...]），避免直连图床被墙或慢
export type ImgProxyConfig = {
	enabled?: boolean; // 是否启用反代，默认 true；设为 false 则直接使用图床原图
	fromHost?: string; // 图床域名，如 imgbed.yufish.cn
	toHost?: string; // 反代域名，如 x1anyu.cn（反代函数需自行部署到该域名）
};
