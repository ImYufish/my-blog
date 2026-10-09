import { execFileSync } from "node:child_process";

// 「推送节奏」卡片的数据源，移植自 Jarvis0227/Aemeath（MIT）。与本地相关的差异：
// 统计站点仓库 + 内容仓库（文章都在内容仓库，只统计站点的话"只写文章"的日子会空白）、
// 只保留自己的提交（fork 仓库里大部分提交是上游作者写的）、回退本地 git 前先补深历史。
export const prerender = true;

// 每个仓库单独解析：先走 GitHub API（公开仓库匿名可读，私有仓库需 GITHUB_PUSHES_TOKEN），
// 该仓库拿不到就回退它自己的本地 .git。dir 是构建期该仓库的检出位置。
const REPOS = [
	{ repo: "ImYufish/my-blog", branch: "master", dir: "." },
	{ repo: "ImYufish/my-blog-content", branch: "main", dir: "src/content" },
];

const SINCE = "53 weeks ago";
const WINDOW_MS = 53 * 7 * 24 * 60 * 60 * 1000;
const MAX_PAGES = 20; // 单仓库 53 周约 1500 条 = 16 页（接口不支持按作者过滤，只能拉全量再筛）
const token = process.env.GITHUB_PUSHES_TOKEN || process.env.GITHUB_TOKEN || "";

// 只保留自己的提交。邮箱是两条路径的公共判据：API 有 author.login，本地 git log 只有邮箱。
// 换邮箱或 GitHub 账号时改这两个集合（大小写不敏感）。
const OWNER_EMAILS = new Set([
	"z1yum@foxmail.com",
	"106833435+imyufish@users.noreply.github.com",
]);
const OWNER_LOGINS = new Set(["imyufish"]);

const isOwner = (email?: string | null, login?: string | null): boolean =>
	OWNER_EMAILS.has((email || "").trim().toLowerCase()) ||
	OWNER_LOGINS.has((login || "").trim().toLowerCase());

type Repo = (typeof REPOS)[number];

/** GitHub API；公开仓库匿名即可，私有仓库需 GITHUB_PUSHES_TOKEN */
const fromGitHubApi = async (repo: Repo): Promise<string[]> => {
	const since = new Date(Date.now() - WINDOW_MS).toISOString();
	const dates: string[] = [];
	try {
		for (let page = 1; page <= MAX_PAGES; page += 1) {
			const response = await fetch(
				`https://api.github.com/repos/${repo.repo}/commits?sha=${repo.branch}&since=${since}&per_page=100&page=${page}`,
				{
					headers: {
						Accept: "application/vnd.github+json",
						"User-Agent": "firefly-analytics",
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
				},
			);
			if (!response.ok) break;
			const rows = (await response.json()) as Array<{
				author?: { login?: string } | null;
				commit?: {
					author?: { email?: string; name?: string } | null;
					committer?: { date?: string } | null;
				};
			}>;
			if (!Array.isArray(rows) || !rows.length) break;
			for (const row of rows) {
				const date = row.commit?.committer?.date;
				if (date && isOwner(row.commit?.author?.email, row.author?.login)) dates.push(date);
			}
			if (rows.length < 100) break;
		}
	} catch {
		return dates;
	}
	return dates;
};

/** 兜底：该仓库的本地 git 历史（浅克隆先补深，失败就继续用现有的） */
const fromLocalGit = (repo: Repo): string[] => {
	const git = (args: string[]): string =>
		execFileSync("git", ["-C", repo.dir, ...args], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
			maxBuffer: 32 * 1024 * 1024,
		});
	// dir 不存在 / 不是 git 仓库（比如本地没拉内容仓库）→ 该仓库直接跳过
	try {
		git(["rev-parse", "--git-dir"]);
	} catch {
		return [];
	}
	try {
		if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") {
			git(["fetch", "--deepen=2000", "--quiet"]);
		}
	} catch {
		// 补深失败不致命
	}
	try {
		const raw = git(["log", "HEAD", `--since=${SINCE}`, "--format=%cI%x09%ae"]);
		const out: string[] = [];
		for (const line of raw.split(/\r?\n/)) {
			const [date, email = ""] = line.split("\t");
			if (date && isOwner(email)) out.push(date.trim());
		}
		return out;
	} catch {
		return [];
	}
};

export async function GET(): Promise<Response> {
	const sources: Array<{ repo: string; via: "github-api" | "local-git"; count: number }> = [];
	const all: string[] = [];

	for (const repo of REPOS) {
		let dates = await fromGitHubApi(repo);
		let via: "github-api" | "local-git" = "github-api";
		if (!dates.length) {
			dates = fromLocalGit(repo);
			via = "local-git";
		}
		sources.push({ repo: repo.repo, via, count: dates.length });
		all.push(...dates);
	}

	// 两个仓库的时间戳合并去重（同一秒的罕见碰撞直接折叠），再按时间排好给前端
	const commits = [...new Set(all)].sort((a, b) => a.localeCompare(b));
	// 兼容旧字段：主仓库那条结果
	const primary = sources[0];

	return new Response(
		JSON.stringify({
			ok: true,
			source: primary?.via ?? "local-git",
			repository: REPOS[0].repo,
			branch: REPOS[0].branch,
			sources,
			generatedAt: new Date().toISOString(),
			commits,
		}),
		{
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Cache-Control": "public, max-age=300",
			},
		},
	);
}
