// LQIP 方案来源: https://blog.cosine.ren/post/astro-lqip-implementation

import lqipData from "@constants/lqips.json";

const lqips: Record<string, string> = lqipData as Record<string, string>;

function normalizePath(p: string): string {
	return p.replace(/\/\.\//g, "/").replace(/\/+/g, "/");
}

/**
 * 将 LQIP 紧凑格式（18 字符 hex）解码为 CSS 线性渐变
 * 格式：6e3b38ae7472af7574 → linear-gradient(135deg, #6e3b38 0%, #ae7472 50%, #af7574 100%)
 */
export function getLqipGradient(
	src: string,
	basePath?: string,
): string | undefined {
	// 先尝试完整路径（basePath + src），再尝试 src 本身
	const fullPath = basePath ? normalizePath(`${basePath}/${src}`) : src;
	const compact = lqips[fullPath] || lqips[src];
	if (!compact || compact.length !== 18) return undefined;

	const c1 = `#${compact.slice(0, 6)}`;
	const c2 = `#${compact.slice(6, 12)}`;
	const c3 = `#${compact.slice(12, 18)}`;
	return `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
}
