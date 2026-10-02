// Meta description 的归一化工具。
//
// 站点里的 description 有三个来源：页面显式传入、文章/相册的 frontmatter、站点默认值。
// 前两个经常缺失，于是退化成五花八门的东西——空串、页面标题本身（/about/ 传的就是「关于我」）、
// 或者一句过短的标语。这些直接写进 <meta name="description"> 会被 SEO 工具判「太长或太短」，
// 而跟标题一模一样的描述对搜索引擎等于没写。
//
// 这里统一做三件事：丢掉无效候选（空 / 与标题相同 / 过短）→ 用兜底值 → 超长截断。

/** 短于此长度的描述视为无效候选：过短的描述不会出现在搜索结果摘要里 */
export const META_DESCRIPTION_MIN = 20;

/** 超过此长度会被搜索引擎截断，主动截到句读处更可控 */
export const META_DESCRIPTION_MAX = 160;

/** 截断时优先在这些字符处断开，避免把英文单词或句子切成两半 */
const BREAK_CHARS = [
	" ",
	"，",
	"。",
	"、",
	"；",
	"：",
	"！",
	"？",
	",",
	".",
	";",
	":",
	"!",
	"?",
];

/** 句尾冗余的标点：截断后拼上省略号会导致「。…」这种重复，先去掉 */
const TRAILING_PUNCTUATION = /[，。、；：,.;:!?！？\s-]+$/;

/**
 * 把描述截到指定长度以内，尽量在空格/标点处断开并补上省略号。
 * 长度判断按码点算，中文一个字算一个。
 */
export function truncateDescription(
	text: string,
	max: number = META_DESCRIPTION_MAX,
): string {
	const trimmed = text.trim();
	if ([...trimmed].length <= max) {
		return trimmed;
	}

	const clipped = [...trimmed].slice(0, max - 1).join("");
	let breakAt = -1;
	for (const char of BREAK_CHARS) {
		breakAt = Math.max(breakAt, clipped.lastIndexOf(char));
	}

	// 只在断点落在后半段时才用它，否则会使截出来的内容白白短一截
	const usable = breakAt >= Math.floor((max - 1) * 0.6);
	const body = usable ? clipped.slice(0, breakAt) : clipped;

	return `${body.replace(TRAILING_PUNCTUATION, "")}…`;
}

/**
 * 挑一条能用的页面描述。
 *
 * @param candidates 候选描述，按优先级排列（页面传入的排在最前）
 * @param options.title 页面标题，用来剔除「描述就是标题」这种无意义的情况
 * @param options.fallback 全部候选都不可用时用的兜底值，通常是站点描述
 */
export function resolveMetaDescription(
	candidates: Array<string | undefined | null>,
	options: {
		title?: string;
		fallback?: string;
		min?: number;
		max?: number;
	} = {},
): string {
	const min = options.min ?? META_DESCRIPTION_MIN;
	const max = options.max ?? META_DESCRIPTION_MAX;
	const title = (options.title ?? "").trim();
	const fallback = (options.fallback ?? "").trim();

	for (const candidate of candidates) {
		const text = (candidate ?? "").trim();
		if (!text) continue;
		if (title && text === title) continue;
		if ([...text].length < min) continue;
		return truncateDescription(text, max);
	}

	return truncateDescription(fallback, max);
}

/**
 * 从 Markdown 正文里摘一段纯文本，给没写 frontmatter description 的文章当描述。
 * 去掉代码块、图片、HTML 标签、各种 Markdown 记号，只留能读的文字。
 */
export function excerptFromMarkdown(
	markdown: string | undefined | null,
	max = 120,
): string {
	const text = (markdown ?? "")
		.replace(/^---[\s\S]*?\n---\n/, "") // 万一带上了 frontmatter
		.replace(/```[\s\S]*?```/g, " ") // 代码块
		.replace(/`[^`]*`/g, " ") // 行内代码
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 图片
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接只留文字
		.replace(/<[^>]+>/g, " ") // HTML 标签
		.replace(/^\s{0,3}#{1,6}\s+/gm, "") // 标题记号
		.replace(/^\s{0,3}>\s?/gm, "") // 引用记号
		.replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, "") // 列表记号
		.replace(/^\s*\|.*\|\s*$/gm, " ") // 表格行
		.replace(/^\s*[-*_]{3,}\s*$/gm, " ") // 分隔线
		.replace(/\*\*|__|~~/g, "")
		.replace(/\s+/g, " ")
		.trim();

	if ([...text].length <= max) {
		return text;
	}

	// 摘要是「掐头」不是「截尾」，所以固定长度切一刀，不带省略号以外的手续
	return `${[...text].slice(0, max - 1).join("")}…`;
}
