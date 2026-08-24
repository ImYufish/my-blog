import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

/**
 * IndexNow 自动收录集成
 * 构建完成后读取 dist 下的 sitemap，把其中的 URL 批量推送给 IndexNow（Bing / Yandex 等均支持）。
 * 配置来自 src/config/indexNowConfig.ts：
 *   - enabled: 是否启用
 *   - key: IndexNow API key，同时是 public/<key>.txt 验证文件名与内容
 *   - host: 站点 host（如 blog.x1anyu.cn），留空则从 sitemap 里的 URL 自动推导
 *
 * @param {Object} config
 * @param {boolean} [config.enabled]
 * @param {string}  [config.key]
 * @param {string}  [config.host]
 * @returns {Object} AstroIntegration
 */
export function indexNow(config = {}) {
	const enabled = config.enabled !== false;
	const key = config.key || process.env.INDEXNOW_KEY || "";
	const hostOverride = config.host || "";

	return {
		name: "indexnow-submit",
		hooks: {
			"astro:build:done": async ({ dir }) => {
				if (!enabled) {
					console.log("[indexnow] 已禁用，跳过提交");
					return;
				}
				if (!key) {
					console.warn("[indexnow] 未配置 key，跳过提交");
					return;
				}

				let urls;
				try {
					urls = await collectUrlsFromSitemaps(dir.pathname);
				} catch (e) {
					console.warn("[indexnow] 读取 sitemap 失败：", e.message);
					return;
				}
				if (urls.length === 0) {
					console.warn("[indexnow] sitemap 中未找到任何 URL，跳过提交");
					return;
				}

				const host =
					hostOverride ||
					(() => {
						try {
							return new URL(urls[0]).host;
						} catch {
							return "";
						}
					})();
				if (!host) {
					console.warn("[indexnow] 无法推导 host，跳过提交");
					return;
				}

				let ok = 0;
				let fail = 0;
				const MAX_BATCH = 10000;
				for (let i = 0; i < urls.length; i += MAX_BATCH) {
					const batch = urls.slice(i, i + MAX_BATCH);
					try {
						const res = await fetch("https://api.indexnow.org/indexnow", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ host, key, urlList: batch }),
						});
						if (res.ok) {
							ok += batch.length;
						} else {
							fail += batch.length;
							console.warn(`[indexnow] 批次提交失败：HTTP ${res.status}`);
						}
					} catch (e) {
						fail += batch.length;
						console.warn("[indexnow] 请求异常：", e.message);
					}
				}
				console.log(`[indexnow] 提交完成：成功 ${ok} 条，失败 ${fail} 条`);
			},
		},
	};
}

async function collectUrlsFromSitemaps(distDir) {
	const files = await readdir(distDir);
	const sitemaps = files.filter((f) => f.startsWith("sitemap") && f.endsWith(".xml"));
	const seen = new Set();
	const out = [];
	const add = (u) => {
		if (!seen.has(u)) {
			seen.add(u);
			out.push(u);
		}
	};

	for (const file of sitemaps) {
		const content = await readFile(join(distDir, file), "utf-8");
		const locs = [...content.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
		if (file === "sitemap-index.xml") {
			// index 里的 <loc> 指向子 sitemap，需要再展开
			for (const sub of locs) {
				try {
					const subPath = join(distDir, basename(new URL(sub).pathname));
					const subContent = await readFile(subPath, "utf-8");
					const subLocs = [...subContent.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
					subLocs.forEach(add);
				} catch {
					/* 子 sitemap 缺失则忽略 */
				}
			}
		} else {
			locs.forEach(add);
		}
	}
	return out;
}
