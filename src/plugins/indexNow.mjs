import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/*
 * 搜索引擎即时收录：读 dist 的 sitemap，把 URL 推给 Bing IndexNow 与百度（配置见 src/config/indexNowConfig.ts）。
 * Bing 每次全量推；百度只推「新增 / 内容变化」（官方明确反复推旧链接会被下调配额），判定 = 各页 HTML 的 sha1。
 * 百度基线随部署发布、下次构建从线上读回（dist/indexnow-baseline.json）。⚠ 别放 node_modules/.cache：
 * EO 每次构建都是全新工作区，会被重置成「首次运行」（曾因此一条都没推出去）。
 * 环境变量：INDEXNOW_VERBOSE=1 / INDEXNOW_FORCE_FULL=1（忽略基线全量推一次）/ BAIDU_PUSH_TOKEN
 */
/** 读环境变量：进程环境变量优先，回退 .env（Astro 只把 .env 灌进 import.meta.env，不写 process.env） */
async function envOrFile(name) {
	const fromEnv = (process.env[name] || "").trim();
	if (fromEnv) return fromEnv;
	try {
		const txt = await readFile(join(process.cwd(), ".env"), "utf8");
		for (const line of txt.split(/\r?\n/)) {
			const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
			if (m && m[1] === name) return m[2].replace(/^["']|["']$/g, "").trim();
		}
	} catch {
		// 没有 .env 文件就跳过（例如在 CI 里靠平台环境变量）
	}
	return "";
}

export function indexNow(config = {}) {
	const enabled = config.enabled !== false;
	const bing = config.bing || {};
	const key = bing.key || process.env.INDEXNOW_KEY || "";
	const hostOverride = bing.host || "";
	const verbose =
		process.env.INDEXNOW_VERBOSE === "1" ||
		process.env.INDEXNOW_VERBOSE === "true";

	return {
		name: "search-submit",
		hooks: {
			"astro:build:done": async ({ dir }) => {
				if (!enabled) {
					console.log("[search-submit] 总开关关闭，跳过全部提交");
					return;
				}

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

				// 统一推导 host：bing.host 优先，否则取 sitemap 第一条
				const host = normalizeHost(hostOverride) || hostFromUrl(urls[0]);
				const published = await loadPublishedBaseline(host);

				// ---- Bing IndexNow（全量）----
				await bingIndexNow(urls, {
					key,
					hostOverride: host,
					distDir,
					cacheDir,
					verbose,
				});

				// ---- 百度主动推送（只推新增/变化）；返回新基线就写进部署产物，null = 不动线上那份 ----
				const nextBaseline = await baiduPush(urls, config.baidu, {
					distDir,
					published,
				});
				if (nextBaseline) {
					await writeJson(join(distDir, "indexnow-baseline.json"), {
						generatedAt: new Date().toISOString(),
						host,
						pages: nextBaseline,
					});
					console.log(
						`[search-submit] 基线已随部署发布（${Object.keys(nextBaseline).length} 条），下次构建从这里读回：https://${host}/indexnow-baseline.json`,
					);
				}
			},
		},
	};
}

/** Astro hook 给的是 URL，转成文件系统路径（Windows 下 dir.pathname 形如 "/F:/.../dist/"） */
function toFsPath(dir) {
	try {
		return typeof dir === "string" ? dir : fileURLToPath(dir);
	} catch {
		return String(dir);
	}
}

/** 统一成裸主机名 —— IndexNow 只接受裸主机名，传完整 URL 会被拒（实测 422） */
function normalizeHost(value) {
	const raw = String(value || "").trim();
	if (!raw) return "";
	try {
		return new URL(raw.includes("://") ? raw : `https://${raw}`).host;
	} catch {
		return "";
	}
}

/** 从 URL 取 host；失败返回空串 */
function hostFromUrl(raw) {
	try {
		return new URL(raw).host;
	} catch {
		return "";
	}
}

/**
 * 读上一版部署发布出去的基线。missing=true = 线上确实没有这个文件；
 * pages=null 且 missing=false = 网络异常等「状态未知」。
 */
async function loadPublishedBaseline(host) {
	if (!host) return { pages: null, missing: false, reason: "没有 host" };
	const url = `https://${host}/indexnow-baseline.json?ts=${Date.now()}`;
	try {
		const res = await fetch(url, {
			headers: { "cache-control": "no-cache", pragma: "no-cache" },
		});
		if (res.status === 404)
			return { pages: null, missing: true, reason: "HTTP 404" };
		if (!res.ok)
			return { pages: null, missing: false, reason: `HTTP ${res.status}` };
		let body = null;
		try {
			body = await res.json();
		} catch {
			// 拿到的多半是 404 页面（有些平台用 200 兜底返回 HTML）
			return { pages: null, missing: true, reason: "响应不是 JSON" };
		}
		const pages = body?.pages;
		if (!pages || typeof pages !== "object" || Array.isArray(pages)) {
			return { pages: null, missing: true, reason: "JSON 里没有合法的 pages" };
		}
		return { pages, missing: false, reason: "ok" };
	} catch (e) {
		return { pages: null, missing: false, reason: `请求异常：${e.message}` };
	}
}

async function bingIndexNow(
	urls,
	{ key, hostOverride, distDir, cacheDir, verbose },
) {
	if (!key) {
		console.warn("[bing] 未配置 key，跳过 IndexNow 提交");
		return;
	}

	const host =
		normalizeHost(hostOverride) ||
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

	// 提交前自检：能否从公网取到 key 文件
	let keyCheck = "未自检";
	try {
		const probe = await fetch(keyLocation, { method: "GET" });
		if (!probe.ok) {
			keyCheck = `HTTP ${probe.status}（Bing 抓取时也可能拿不到）`;
		} else {
			const probeBody = (await probe.text()).trim();
			keyCheck =
				probeBody === key
					? "通过"
					: `内容不匹配（期望 ${key}，实际 ${probeBody.slice(0, 40)}）`;
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
					console.log(
						`[bing] HTTP ${res.status} OK（本批次 ${batch.length} 条）`,
					);
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

	// 仅用于日志区分「本次新增」（Bing 每次全量推，与百度那份基线无关）
	const baselinePath = join(cacheDir, "indexnow-seen-urls.json");
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
 * 百度主动推送：POST https://data.zz.baidu.com/urls?site=<domain>&token=<token>（body 每行一条 URL）。
 * @returns {Promise<Object|null>} 本次要随部署发布的新基线（URL→哈希）；null = 别动线上那份
 */
async function baiduPush(urls, cfg, { distDir, published }) {
	if (!cfg || cfg.enabled === false) {
		console.log("[baidu] 未启用，跳过");
		return null;
	}
	const site = cfg.site || "";
	// token 不写进仓库：环境变量优先，.env 由 envOrFile 兜底
	const token = cfg.token || (await envOrFile("BAIDU_PUSH_TOKEN"));
	if (!site || !token) {
		console.warn(
			"[baidu] 未配置 site/token，跳过（百度搜索资源平台 → 数据提交 → API推送 取 16 位 token，配到环境变量 BAIDU_PUSH_TOKEN）",
		);
		return null;
	}

	// 各页内容指纹（sitemap 没有 lastmod，只能比 HTML 哈希）
	const fingerprints = {};
	for (const u of urls) {
		const fp = await pageFingerprint(distDir, u);
		if (fp) fingerprints[u] = fp;
	}

	const forceFull = /^(1|true|yes)$/i.test(
		(process.env.INDEXNOW_FORCE_FULL || "").trim(),
	);
	if (Object.keys(fingerprints).length === 0 && !forceFull) {
		// 一条都算不出来（dist 路径对不上？）→ 绝不能推，否则每次都会被判成全量变化
		console.warn(
			`[baidu] ${urls.length} 条 URL 在 dist 里都找不到对应 HTML，无法判断内容变化 → 跳过本次推送`,
		);
		return null;
	}
	if (Object.keys(fingerprints).length < urls.length) {
		console.warn(
			`[baidu] 有 ${urls.length - Object.keys(fingerprints).length} 条 URL 找不到对应 HTML，这些沿用上一版指纹、不当成变化`,
		);
	}

	// 算不出的沿用上一版指纹，免得被误判成变化
	const current = {};
	for (const u of urls) {
		const fp = fingerprints[u] ?? published.pages?.[u];
		if (fp) current[u] = fp;
	}

	const hasBaseline = published.pages !== null;

	if (!hasBaseline && !forceFull) {
		if (published.missing) {
			console.log(
				`[baidu] 线上还没有上一版基线（${published.reason}）→ 本次只记录基线、不推送，避免一次把 sitemap 全量灌进去吃掉配额`,
			);
			console.log(
				"[baidu] 想现在就把现有 URL 全推给百度：构建时加环境变量 INDEXNOW_FORCE_FULL=1，跑一次后去掉即可",
			);
			return current;
		}
		console.warn(
			`[baidu] 读取线上基线失败（${published.reason}）→ 本次跳过推送，并保留线上基线不动，下次构建再试`,
		);
		return null;
	}

	if (forceFull) {
		console.log(
			`[baidu] INDEXNOW_FORCE_FULL=1：本次忽略基线，全量提交 ${urls.length} 条`,
		);
	}

	const changed = forceFull
		? urls
		: urls.filter((u) => {
				const fp = fingerprints[u]; // 只对算得出指纹的做比对
				if (!fp) return false;
				return published.pages[u] === undefined || published.pages[u] !== fp;
			});
	if (changed.length === 0) {
		console.log(
			`[baidu] 无新增/变化 URL，跳过推送（基线 ${Object.keys(published.pages).length} 条）`,
		);
		return current;
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
			console.log(
				`[baidu] 提交完成：推 ${changed.length} 条新增/变化，成功 ${ok} 条（当日剩余配额 ${remain ?? "未知"}）site=${site}`,
			);
			for (const u of changed) console.log(`[baidu]   + ${u}`);
			// 提交成功 → current 即「已告知」状态（没变的本就在基线里）
			return current;
		}
		console.warn(
			`[baidu] 提交失败：HTTP ${res.status}${errmsg ? `，${errmsg}` : `，响应：${text.slice(0, 200)}`}`,
		);
		console.warn(
			`[baidu] 不更新基线（沿用线上那份），下次构建会重试这 ${changed.length} 条`,
		);
		return null;
	} catch (e) {
		console.warn("[baidu] 请求异常：", e.message);
		console.warn(
			`[baidu] 不更新基线（沿用线上那份），下次构建会重试这 ${changed.length} 条`,
		);
		return null;
	}
}

/** 页面内容指纹：URL → dist 里对应 HTML 的 sha1 前 16 位；找不到对应文件返回 null */
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
	const sitemaps = files.filter(
		(f) => f.startsWith("sitemap") && f.endsWith(".xml"),
	);
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
		const locs = [...content.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) =>
			m[1].trim(),
		);
		if (file === "sitemap-index.xml") {
			// index 里的 <loc> 指向子 sitemap，需要再展开
			for (const sub of locs) {
				try {
					const subPath = join(distDir, basename(new URL(sub).pathname));
					const subContent = await readFile(subPath, "utf-8");
					const subLocs = [...subContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(
						(m) => m[1].trim(),
					);
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
