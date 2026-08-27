import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join, dirname } from "node:path";

/**
 * 搜索引擎即时收录集成（Bing IndexNow + 百度主动推送 + 头条/字节可选推送）
 * 构建完成后读取 dist 下的 sitemap，把其中的 URL 推送给各引擎，加速新文章被发现。
 *
 * 配置来自 src/config/indexNowConfig.ts：
 *   - enabled      总开关
 *   - key / host   Bing IndexNow 的 key 与 host（见下文）
 *   - baidu        百度主动推送（data.zz.baidu.com/urls），需 site + token
 *   - toutiao      头条/字节，官方无稳定公开 push API；endpoint 留空则仅打印提交 sitemap 的提示
 *
 * 调试开关（环境变量）：
 *   - INDEXNOW_VERBOSE=1  额外打印本次提交的全部 URL 列表，方便核对新文章是否纳入
 *
 * 基线文件 node_modules/.cache/indexnow-baseline.json 记录已成功提交的 URL，
 * 用于区分「本次新增」与「已提交过」；不污染仓库、不进部署产物。
 * （EdgeOne 构建环境每次为全新检出，基线不持久化，会退化为每次打印全部 URL。）
 *
 * @param {Object} config
 * @returns {Object} AstroIntegration
 */
export function indexNow(config = {}) {
	const enabled = config.enabled !== false;
	const key = config.key || process.env.INDEXNOW_KEY || "";
	const hostOverride = config.host || "";
	const verbose = process.env.INDEXNOW_VERBOSE === "1" || process.env.INDEXNOW_VERBOSE === "true";

	return {
		name: "search-submit",
		hooks: {
			"astro:build:done": async ({ dir }) => {
				if (!enabled) {
					console.log("[search-submit] 总开关关闭，跳过全部提交");
					return;
				}

				let urls;
				try {
					urls = await collectUrlsFromSitemaps(dir.pathname);
				} catch (e) {
					console.warn("[search-submit] 读取 sitemap 失败：", e.message);
					return;
				}
				if (urls.length === 0) {
					console.warn("[search-submit] sitemap 中未找到任何 URL，跳过提交");
					return;
				}

				// ---- Bing IndexNow ----
				await bingIndexNow(urls, { key, hostOverride, dir, verbose });

				// ---- 百度主动推送 ----
				await baiduPush(urls, config.baidu);

				// ---- 头条 / 字节（可选） ----
				await toutiaoPush(urls, config.toutiao);
			},
		},
	};
}

async function bingIndexNow(urls, { key, hostOverride, dir, verbose }) {
	if (!key) {
		console.warn("[bing] 未配置 key，跳过 IndexNow 提交");
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
		console.warn("[bing] 无法推导 host，跳过 IndexNow 提交");
		return;
	}

	const keyLocation = `https://${host}/${key}.txt`;
	const keyFilePath = join(dir.pathname, `${key}.txt`);
	if (!existsSync(keyFilePath)) {
		console.warn(
			`[bing] 验证文件未生成：${keyFilePath}，请确认 public/${key}.txt 存在并已部署。`,
		);
		return;
	}

	// 提交前自检：hook 自己能否从公网取到 key 文件（内容与 key 一致）
	let keyCheck = "未自检";
	try {
		const probe = await fetch(keyLocation, { method: "GET" });
		if (!probe.ok) {
			keyCheck = `HTTP ${probe.status}（Bing 抓取时也可能拿不到）`;
		} else {
			const probeBody = (await probe.text()).trim();
			keyCheck = probeBody === key ? "通过" : `内容不匹配（期望 ${key}，实际 ${probeBody.slice(0, 40)}）`;
		}
	} catch (e) {
		keyCheck = `请求异常：${e.message}`;
	}
	console.log(`[bing] key 文件自检：${keyCheck}（${keyLocation}）`);

	let ok = 0;
	let fail = 0;
	const MAX_BATCH = 10000;
	// Bing 官方 IndexNow endpoint；如仍报 403，可切回 https://api.indexnow.org/indexnow 再试
	const ENDPOINT = "https://www.bing.com/indexnow";
	for (let i = 0; i < urls.length; i += MAX_BATCH) {
		const batch = urls.slice(i, i + MAX_BATCH);
		try {
			const res = await fetch(ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ host, key, keyLocation, urlList: batch }),
			});
			if (res.ok) {
				ok += batch.length;
				if (verbose) {
					console.log(`[bing] HTTP ${res.status} OK（本批次 ${batch.length} 条）`);
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
					`[bing] 批次提交失败：HTTP ${res.status}${body ? `，响应：${body}` : ""}`,
				);
			}
		} catch (e) {
			fail += batch.length;
			console.warn("[bing] 请求异常：", e.message);
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

	console.log(
		`[bing] 提交完成：成功 ${ok} 条，失败 ${fail} 条（endpoint=${ENDPOINT}，host=${host}，keyLocation=${keyLocation}）`,
	);
	if (newUrls.length > 0) {
		console.log(`[bing] 本次新增 ${newUrls.length} 条：`);
		for (const u of newUrls) console.log(`[bing]   + ${u}`);
	} else {
		console.log(`[bing] 无新增 URL（共 ${urls.length} 条已提交过）`);
	}
	if (verbose) {
		console.log(`[bing] 完整 URL 列表（${urls.length} 条）：`);
		for (const u of urls) console.log(`[bing]   - ${u}`);
	}

	// 持久化基线（best-effort，写成功过的全集）
	try {
		await mkdir(dirname(baselinePath), { recursive: true });
		await writeFile(baselinePath, JSON.stringify({ urls }, null, 2));
	} catch {
		/* 写基线失败不影响提交 */
	}
}

/**
 * 百度主动推送（普通收录 / API 推送）
 * 接口：https://data.zz.baidu.com/urls?site=<domain>&token=<token>
 * 方式：POST，Content-Type: text/plain，body 为 URL 列表（每行一条）
 * 返回示例：{"success":N,"remain":M,"not_same_site":[],"errmsg":"ok"} 或 {"error":N,"message":"..."}
 */
async function baiduPush(urls, cfg) {
	if (!cfg || cfg.enabled === false) {
		console.log("[baidu] 未启用，跳过");
		return;
	}
	const site = cfg.site || "";
	const token = cfg.token || "";
	if (!site || !token) {
		console.warn(
			"[baidu] 未配置 site/token，跳过（去百度搜索资源平台 → 数据提交 → API推送 获取 16 位 token 填入 indexNowConfig.baidu）",
		);
		return;
	}
	const endpoint = "https://data.zz.baidu.com/urls";
	const body = urls.join("\n");
	try {
		const res = await fetch(
			`${endpoint}?site=${encodeURIComponent(site)}&token=${encodeURIComponent(token)}`,
			{
				method: "POST",
				headers: { "Content-Type": "text/plain" },
				body,
			},
		);
		const text = await res.text();
		let ok = 0;
		let remain = null;
		let errmsg = "";
		try {
			const j = JSON.parse(text);
			if (typeof j.success === "number") ok = j.success;
			if (typeof j.remain === "number") remain = j.remain;
			if (j.error) errmsg = `${j.error} ${j.message || ""}`;
		} catch {
			/* 非 JSON，按状态码判断 */
		}
		if (res.ok && !errmsg) {
			console.log(
				`[baidu] 提交完成：成功 ${ok} 条（当日剩余配额 ${remain ?? "未知"}）site=${site}`,
			);
		} else {
			console.warn(`[baidu] 提交失败：HTTP ${res.status}${errmsg ? `，${errmsg}` : `，响应：${text.slice(0, 200)}`}`);
		}
	} catch (e) {
		console.warn("[baidu] 请求异常：", e.message);
	}
}

/**
 * 头条 / 字节 推送（best-effort）
 * 说明：头条/豆包搜索官方无稳定公开的 URL 主动推送 REST API（其站长平台用 sitemap / 手动提交 / JS 自动收录）。
 * 因此默认 endpoint 留空时只打印「去站长平台提交 sitemap」的提示；
 * 若你后续拿到某个实时推送 endpoint（如 CDN/第三方站长平台提供），填到 config.toutiao.endpoint 即可自动推送。
 */
async function toutiaoPush(urls, cfg) {
	if (!cfg || cfg.enabled === false) {
		console.log("[toutiao] 未启用，跳过");
		return;
	}
	const endpoint = cfg.endpoint || "";
	if (!endpoint) {
		console.log(
			"[toutiao] 未配置 endpoint：头条/字节无公开 push API，请前往 zhanzhang.toutiao.com 验证站点后提交 sitemap（已放置 public/ByteDanceVerify.html 占位，替换为你站点验证文件即可完成所有权验证）。",
		);
		return;
	}
	const token = cfg.token || "";
	const sep = endpoint.includes("?") ? "&" : "?";
	const url = token ? `${endpoint}${sep}token=${encodeURIComponent(token)}` : endpoint;
	const body = urls.join("\n");
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
			body,
		});
		const text = await res.text();
		console.log(
			`[toutiao] 提交完成：HTTP ${res.status}（endpoint=${endpoint}）${text ? ` 响应：${text.slice(0, 200)}` : ""}`,
		);
	} catch (e) {
		console.warn("[toutiao] 请求异常：", e.message);
	}
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
