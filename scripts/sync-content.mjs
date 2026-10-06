#!/usr/bin/env node
/**
 * sync-content.mjs —— 把私有内容仓库同步到 src/content（构建前自动执行）
 *
 * 背景：博客正文（posts / dynamic / places / projects / spec）放在**私有仓库**里，
 * 主仓库开源时不带内容。dev 与 build 都会先跑本脚本，把内容拉到位再继续。
 *
 * 环境变量（都有默认值）：
 *   CONTENT_REPO_URL     内容仓库地址，默认 https://github.com/ImYufish/my-blog-content.git
 *   CONTENT_REPO_TOKEN   访问私有仓库的 token（GitHub 细粒度 PAT，Contents: Read-only 即可）
 *                        · 部署平台：配在环境变量里（EdgeOne / Cloudflare / Vercel 等）
 *                        · 本地：可放 .env；若 git 已记住凭据（凭据管理器 / SSH）也可不配
 *   CONTENT_REPO_BRANCH  分支名，默认 main
 *   CONTENT_DIR          落地目录，默认 src/content
 *   CONTENT_SYNC=skip    跳过同步（本地想直接编辑 src/content 里的工作副本时用，见下）
 *
 * 命令行：
 *   --force   当 CONTENT_DIR 存在但不是 git 仓库时，先改名备份再克隆（不会直接删你的内容）
 *   --check   只打印将要做什么，不实际改动
 *
 * 本地开发的两种用法：
 *   1）把 src/content 当成内容仓库的工作副本（推荐）：先 `git clone <内容仓库> src/content`，
 *      之后直接在 src/content 里改文章、在里面 commit & push；跑 dev/build 时本脚本会
 *      尝试 `git pull --ff-only`（本地有未提交改动时会自动跳过，不动你的东西）。
 *   2）想临时完全不碰内容：`CONTENT_SYNC=skip pnpm dev`
 */
import { execFileSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const FORCE = argv.includes("--force");
const CHECK = argv.includes("--check");

/* ── 0. 读 .env（Astro/Vite 只把 .env 灌进 import.meta.env，脚本里得自己读） ── */
function loadDotEnv() {
	try {
		const txt = readFileSync(resolve(ROOT, ".env"), "utf8");
		for (const line of txt.split(/\r?\n/)) {
			const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
			if (!m) continue;
			const value = m[2].replace(/^["']|["']$/g, "");
			if (process.env[m[1]] === undefined) process.env[m[1]] = value;
		}
	} catch {
		// 没有 .env 就跳过
	}
}
loadDotEnv();

const SKIP = ["skip", "off", "0", "false"].includes(
	(process.env.CONTENT_SYNC || "").toLowerCase(),
);
const REPO_URL = (
	process.env.CONTENT_REPO_URL || "https://github.com/ImYufish/my-blog-content.git"
).trim();
const BRANCH = (process.env.CONTENT_REPO_BRANCH || "main").trim();
const TOKEN = (process.env.CONTENT_REPO_TOKEN || "").trim();
const DIR = resolve(ROOT, (process.env.CONTENT_DIR || "src/content").trim());

const log = (msg) => console.log(`[content] ${msg}`);
const warn = (msg) => console.warn(`[content] ${msg}`);

if (SKIP) {
	log("CONTENT_SYNC=skip，跳过同步（使用现有 src/content）");
	process.exit(0);
}

/** 把 token 塞进 https 地址；日志里永远不打印 token */
function authedUrl(url) {
	if (!TOKEN) return url;
	try {
		const u = new URL(url);
		u.username = "x-access-token";
		u.password = TOKEN;
		return u.toString();
	} catch {
		return url;
	}
}
const masked = (url) =>
	TOKEN ? url.replace(TOKEN, "***").replace("x-access-token:***@", "") : url;

function git(args, opts = {}) {
	return execFileSync("git", args, {
		cwd: opts.cwd || ROOT,
		encoding: "utf8",
		stdio: opts.inherit ? "inherit" : ["ignore", "pipe", "pipe"],
		env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
	}).trim();
}

/** 内容目录看起来对不对（至少得有 posts/） */
function looksLikeContent(dir) {
	return existsSync(resolve(dir, "posts")) || existsSync(resolve(dir, "spec"));
}

function countFiles(dir) {
	try {
		return Number(git(["ls-files"], { cwd: dir }).split("\n").filter(Boolean).length);
	} catch {
		return -1;
	}
}

function summary(dir) {
	const n = countFiles(dir);
	const sub = ["posts", "dynamic", "places", "projects", "spec"].filter((d) =>
		existsSync(resolve(dir, d)),
	);
	return `${sub.length} 个子目录（${sub.join(" / ")}）${n >= 0 ? `、${n} 个受控文件` : ""}`;
}

/* ── 1. 情况判断 ── */
const hasDir = existsSync(DIR);
const isRepo = existsSync(resolve(DIR, ".git"));

if (CHECK) {
	log(`将同步 ${masked(REPO_URL)}（分支 ${BRANCH}）→ ${DIR}`);
	log(
		hasDir
			? isRepo
				? "现状：已是 git 工作副本，会尝试 git pull --ff-only"
				: "现状：目录存在但不是 git 仓库，需要 --force 才会替换（先改名备份）"
			: "现状：目录不存在，会执行 git clone",
	);
	process.exit(0);
}

/* ── 2. 目录已存在但不是仓库 ── */
if (hasDir && !isRepo) {
	if (!FORCE) {
		warn(`目标目录已存在且不是 git 仓库：${DIR}`);
		warn("内容已手动放好、或想保留现状 → 无需处理；要换成内容仓库的副本，加 --force 重跑：");
		warn("    node scripts/sync-content.mjs --force");
		warn("（--force 会先把该目录改名备份为 content.bak-<时间戳>，再克隆，不会直接删内容）");
		process.exit(0);
	}
	const bak = `${DIR}.bak-${Date.now()}`;
	try {
		renameSync(DIR, bak);
		log(`已把原目录改名备份：${bak}`);
	} catch (e) {
		// 不删任何东西，交给用户手动处理
		warn(`改名备份失败（${String(e.code || e.message)}）：${DIR}`);
		warn(`请手动把该目录移走（例如改名成 content.old）后重跑：node scripts/sync-content.mjs`);
		process.exit(1);
	}
}

/* ── 3. 克隆 / 更新 ── */
try {
	if (!existsSync(DIR)) {
		log(`克隆 ${masked(REPO_URL)}（分支 ${BRANCH}）→ ${DIR}`);
		// 不用浅克隆：内容仓库很小，而浅克隆下 FETCH_HEAD 的父提交缺失，
		// 后续 `merge --ff-only` 会被判成"历史不相干"而失败（实测踩过）
		git(["clone", "--single-branch", "--branch", BRANCH, authedUrl(REPO_URL), DIR]);
		log(`克隆完成：${summary(DIR)}`);
		process.exit(0);
	}

	// 已是工作副本：有本地改动就不动它，否则快进
	const dirty = git(["status", "--porcelain"], { cwd: DIR });
	if (dirty) {
		log("src/content 有未提交改动，跳过更新（保留你的工作副本）");
		log(`当前内容：${summary(DIR)}`);
		process.exit(0);
	}
	try {
		const remote = git(["remote", "get-url", "origin"], { cwd: DIR });
		if (TOKEN) git(["remote", "set-url", "origin", authedUrl(REPO_URL)], { cwd: DIR });
		else if (!remote) git(["remote", "add", "origin", authedUrl(REPO_URL)], { cwd: DIR });
		git(["fetch", "origin", BRANCH], { cwd: DIR });
		git(["merge", "--ff-only", "FETCH_HEAD"], { cwd: DIR });
		log(`已更新到最新：${summary(DIR)}`);
	} catch (e) {
		const why = String(e.stderr || e.message || e).trim().split("\n")[0];
		warn(`更新失败（继续用现有内容）：${why}`);
		warn("常见原因：网络/凭据问题，或本地有未推送的提交（后者请手动 git pull）");
		log(`当前内容：${summary(DIR)}`);
	}
} catch (e) {
	const detail = String(e.stderr || e.message || e).trim().split("\n").slice(0, 4).join("\n");
	// 已有可用内容时不要把构建打断
	if (existsSync(DIR) && looksLikeContent(DIR)) {
		warn(`同步失败，沿用现有 src/content：${detail}`);
		log(`当前内容：${summary(DIR)}`);
		process.exit(0);
	}
	warn("同步内容失败，且本地没有可用内容 —— 构建会缺少全部文章，已中止。");
	warn(`仓库：${masked(REPO_URL)}（分支 ${BRANCH}）`);
	warn(detail);
	warn("排查：① 仓库地址是否正确 ② 私有仓库需要在环境变量里配 CONTENT_REPO_TOKEN");
	warn("      ③ 本地可先手动 `git clone <内容仓库> src/content` 再构建");
	process.exit(1);
}

if (!looksLikeContent(DIR)) {
	warn(`同步完成，但 ${DIR} 里没有 posts/ 或 spec/ —— 请确认内容仓库的结构。`);
} else {
	log(`内容就绪：${summary(DIR)}`);
}
