import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 搜索引擎即时收录集成：构建时推送 Bing IndexNow + 百度
 * 构建完成后读取 dist 下的 sitemap，把其中的 URL 推送给各引擎，加速新文章被发现。
 *
 * 配置全部来自 src/config/indexNowConfig.ts（收录相关配置的唯一来源）：
 *   - enabled               总开关
 *   - bing.key / bing.host  Bing IndexNow 的 key 与 host（见下文）
 *   - baidu                 百度主动推送（data.zz.baidu.com/urls），需 site + token
 * 头条/字节不在本插件内：官方无稳定公开 push API，走客户端 push.js
 * （组件 src/components/analytics/ToutiaoAutoPush.astro，读取 indexNowConfig.toutiao）。
 *
 * 两个引擎的提交范围不同：
 *   - Bing：每次提交 sitemap 全量 URL（IndexNow 单次可带 1 万条，没有日配额压力，重复提交无害）
 *   - 百度：**只推「新增 / 内容变化」的 URL**。百度有日配额（实测约 10 条/天），
 *     而 sitemap 里排在前面的是首页、归档这些旧页，若每次全量推，旧 URL 会把配额吃光、
 *     真正的新文章反而推不上去。改动检测靠比对 dist 里各页 HTML 的哈希
 *     （sitemap 本身没有 <lastmod>，而给全站写构建时间的 lastmod 会每次都变、反而误导爬虫）。
 *
 * 基线文件（存于 node_modules/.cache/，不进仓库、不进部署产物）：
 *   - indexnow-baseline.json        Bing 用，记录出现过的 URL（仅用于打印「本次新增」）
 *   - indexnow-baseline-baidu.json  百度用，记录 { URL: 页面内容哈希 }
 *     · 文件不存在 → 视为首次运行：只建立基线、不推送，避免一次灌满配额
 *     · 想让百度全量重推：把该文件内容改成 {} 后重新构建
 *   （deploy-eo.ps1 是本地构建，基线会持久化；若换成每次全新检出的 CI 构建，
 *     基线不持久化，百度会退化成每次「首次运行」而不推送。）
 *
 * 调试开关（环境变量）：
 *   - INDEXNOW_VERBOSE=1  额外打印本次提交的全部 URL 列表，方便核对新文章是否纳入
 *
 * @param {Object} config
 * @returns {Object} AstroIntegration
 */
export function indexNow(config = {}) {
	const enabled = config.enabled !== false;
	const bing = config.bing || {};
	const key = bing.key || process.env.INDEXNOW_KEY || "";
	const hostOverride = bing.host || "";
	const verbose = process.env.INDEXNOW_VERBOSE === "1" || process.env.INDEXNOW_VERBOSE === "true";

	return {
		name: "search-submit",
		hooks: {
			"astro:build:done": async ({ dir }) => {
				if (!enabled) {
					console.log("[search-submit] 总开关关闭，跳过全部提交");
					return;
				}

				// Windows 下 dir.pathname 形如 "/F:/.../dist/"，直接 join 出来的路径 existsSync 读不到，
				// 必须用 fileURLToPath 转成真正的文件系统路径
				const distDir = toFsPath(dir);
				const cacheDir = join(distDir, "..", "node_modules", ".cache");

				let urls;
				try {
					urls = await collectUrlsFromSitemaps(distDir);
				} catch (e) {
					console.warn("[search-submit] 读取 sitemap 失败：", e.message);
					return;
				}
				if (urls.length === 0) {
					console.warn("[search-submit] sitemap 中未找到任何 URL，跳过提交");
					return;
				}

				// ---- Bing IndexNow ----
				await bingIndexNow(urls, { key, hostOverride, distDir, cacheDir, verbose });

				// ---- 百度主动推送（只推新增/变化）----
				await baiduPush(urls, config.baidu, { distDir, cacheDir, verbose });
			},
		},
	};
}

/** Astro 的 hook 给的是 URL；统一转成文件系统路径（见文件顶部 Windows 说明） */
function toFsPath(dir) {
	try {
		return typeof dir === "string" ? dir : fileURLToPath(dir);
	} catch {
		return String(dir);
	}
}

async function bingIndexNow(urls, { key, hostOverride, distDir, cacheDir, verbose }) {
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
	const keyFilePath = join(distDir, `${key}.txt`);
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

	// 读取基线，区分「本次新增」与「已提交过」（仅用于日志）
	const baselinePath = join(cacheDir, "indexnow-baseline.json");
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

	// 持久化基线（best-effort）
	await writeJson(baselinePath, { urls });
}

/**
 * 百度主动推送（普通收录 / API 推送）
 * 接口：https://data.zz.baidu.com/urls?site=<domain>&token=<token>
 * 方式：POST，Content-Type: text/plain，body 为 URL 列表（每行一条）
 * 返回示例：{"success":N,"remain":M,"not_same_site":[],"errmsg":"ok"} 或 {"error":N,"message":"..."}
 *
 * 只推「新增 / 内容变化」的 URL：见文件顶部说明。
 * 只有本次真正提交成功才把它们记进基线；失败不记，下次构建会自动重试。
 */
async function baiduPush(urls, cfg, { distDir, cacheDir, verbose }) {
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

	const baselinePath = join(cacheDir, "indexnow-baseline-baidu.json");
	const baseline = await readJson(baselinePath);

	// 各页内容指纹（sitemap 没有 lastmod，用 dist 里 HTML 的哈希判断内容有没有变）
	const fingerprints = {};
	for (const u of urls) {
		fingerprints[u] = await pageFingerprint(distDir, u);
	}

	// 首次运行（基线文件不存在）：只建立基线，不推送，避免一次把 sitemap 全量灌进去吃掉配额
	if (baseline === null) {
		await writeJson(baselinePath, fingerprints);
		console.log(
			`[baidu] 首次运行：已把 ${urls.length} 条记为基线，本次不推送；以后只推「新增 / 内容变化」的 URL。`,
		);
		console.log(`[baidu] （想让百度全量重推：把 ${baselinePath} 内容改成 {} 后重新构建）`);
		return;
	}

	const changed = urls.filter((u) => baseline[u] === undefined || baseline[u] !== fingerprints[u]);
	if (changed.length === 0) {
		console.log(`[baidu] 无新增/变化 URL，跳过推送（基线 ${Object.keys(baseline).length} 条）`);
		return;
	}

	const endpoint = "https://data.zz.baidu.com/urls";
	try {
		const res = await fetch(
			`${endpoint}?site=${encodeURIComponent(site)}&token=${encodeURIComponent(token)}`,
			{
				method: "POST",
				headers: { "Content-Type": "text/plain" },
				body: changed.join("\n"),
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
			// 提交成功才并入基线；失败不写，下次构建会重试这批 URL
			const merged = { ...baseline };
			for (const u of changed) merged[u] = fingerprints[u];
			await writeJson(baselinePath, merged);

			console.log(
				`[baidu] 提交完成：推 ${changed.length} 条新增/变化，成功 ${ok} 条（当日剩余配额 ${remain ?? "未知"}）site=${site}`,
			);
			for (const u of changed) console.log(`[baidu]   + ${u}`);
		} else {
			console.warn(
				`[baidu] 提交失败：HTTP ${res.status}${errmsg ? `，${errmsg}` : `，响应：${text.slice(0, 200)}`}`,
			);
			console.warn(`[baidu] 未更新基线，下次构建会重试这 ${changed.length} 条`);
		}
	} catch (e) {
		console.warn("[baidu] 请求异常：", e.message);
		console.warn(`[baidu] 未更新基线，下次构建会重试这 ${changed.length} 条`);
	}
}

/**
 * 页面内容指纹：URL → dist 里对应 HTML 的 sha1 前 16 位。
 * Astro 静态输出形如 /about/ → dist/about/index.html、/foo.html → dist/foo.html。
 * 返回 null 表示找不到对应文件（此时只能退化为「URL 有没有出现过」）。
 */
async function pageFingerprint(distDir, url) {
	let pathname;
	try {
		pathname = decodeURIComponent(new URL(url).pathname);
	} catch {
		return null;
	}
	const rel = pathname.replace(/^\/+/, "");
	const candidates = [];
	if (rel === "") {
		candidates.push("index.html");
	} else if (pathname.endsWith("/")) {
		candidates.push(join(rel, "index.html"));
	} else {
		candidates.push(rel, join(rel, "index.html"));
	}
	for (const c of candidates) {
		const p = join(distDir, c);
		try {
			if (existsSync(p)) {
				const buf = await readFile(p);
				return createHash("sha1").update(buf).digest("hex").slice(0, 16);
			}
		} catch {
			/* 试下一个候选路径 */
		}
	}
	return null;
}

/** 读 JSON 基线；文件不存在返回 null（= 首次运行），损坏也返回 null（避免误判为全量变化而灌满配额） */
async function readJson(path) {
	try {
		if (!existsSync(path)) return null;
		const raw = JSON.parse(await readFile(path, "utf-8"));
		if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
		return raw;
	} catch {
		console.warn(`[search-submit] 基线文件损坏，按首次运行处理：${path}`);
		return null;
	}
}

async function writeJson(path, obj) {
	try {
		await mkdir(dirname(path), { recursive: true });
		await writeFile(path, JSON.stringify(obj, null, 2));
	} catch {
		/* 写基线失败不影响提交 */
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
