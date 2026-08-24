import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join, dirname } from "node:path";

/**
 * IndexNow 自动收录集成
 * 构建完成后读取 dist 下的 sitemap，把其中的 URL 批量推送给 IndexNow（Bing / Yandex 等均支持）。
 * 配置来自 src/config/indexNowConfig.ts：
 *   - enabled: 是否启用
 *   - key: IndexNow API key，同时是 public/<key>.txt 验证文件名与内容
 *   - host: 站点 host（如 blog.x1anyu.cn），留空则从 sitemap 里的 URL 自动推导。
 *          注意：这个 host 必须和你 Bing Webmaster Tools 里看统计的那个 property 一致，
 *          否则 Bing 后台计数会显示为 0。
 *
 * 调试开关（环境变量）：
 *   - INDEXNOW_VERBOSE=1  额外打印本次提交的全部 URL 列表，方便核对新文章是否纳入
 *
 * 基线文件 node_modules/.cache/indexnow-baseline.json 记录已成功提交的 URL，
 * 用于区分「本次新增」与「已提交过」；不污染仓库、不进部署产物。
 * （EdgeOne 构建环境每次为全新检出，基线不持久化，会退化为每次打印全部 URL。）
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
	const verbose = process.env.INDEXNOW_VERBOSE === "1" || process.env.INDEXNOW_VERBOSE === "true";

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

				const keyLocation = `https://${host}/${key}.txt`;
				const keyFilePath = join(dir.pathname, `${key}.txt`);
				if (!existsSync(keyFilePath)) {
					console.warn(
						`[indexnow] 验证文件未生成：${keyFilePath}，请确认 public/${key}.txt 存在并已部署。`
					);
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
							body: JSON.stringify({ host, key, keyLocation, urlList: batch }),
						});
						if (res.ok) {
							ok += batch.length;
							if (verbose) {
								console.log(`[indexnow] HTTP ${res.status} OK（本批次 ${batch.length} 条）`);
							}
						} else {
							fail += batch.length;
							let body = "";
							try {
								body = await res.text();
							} catch {
								/* ignore */
							}
							console.warn(
								`[indexnow] 批次提交失败：HTTP ${res.status}${body ? `，响应：${body}` : ""}`
							);
						}
					} catch (e) {
						fail += batch.length;
						console.warn("[indexnow] 请求异常：", e.message);
					}
				}

				// 读取基线，区分「本次新增」与「已提交过」
				const baselinePath = join(dir.pathname, "..", "node_modules", ".cache", "indexnow-baseline.json");
				let baseline = new Set();
				try {
					if (existsSync(baselinePath)) {
						const raw = JSON.parse(await readFile(baselinePath, "utf-8"));
						baseline = new Set(raw.urls || []);
					}
				} catch {
					/* 基线损坏则忽略，当作首次 */
				}
				const newUrls = urls.filter((u) => !baseline.has(u));

				console.log(`[indexnow] 提交完成：成功 ${ok} 条，失败 ${fail} 条（host=${host}，keyLocation=${keyLocation}）`);
				if (newUrls.length > 0) {
					console.log(`[indexnow] 本次新增 ${newUrls.length} 条：`);
					for (const u of newUrls) console.log(`[indexnow]   + ${u}`);
				} else {
					console.log(`[indexnow] 无新增 URL（共 ${urls.length} 条已提交过）`);
				}
				if (verbose) {
					console.log(`[indexnow] 完整 URL 列表（${urls.length} 条）：`);
					for (const u of urls) console.log(`[indexnow]   - ${u}`);
				}

				// 持久化基线（best-effort，写成功过的全集）
				try {
					await mkdir(dirname(baselinePath), { recursive: true });
					await writeFile(baselinePath, JSON.stringify({ urls }, null, 2));
				} catch {
					/* 写基线失败不影响提交 */
				}
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
