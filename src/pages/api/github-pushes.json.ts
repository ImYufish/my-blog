import { execFileSync } from "node:child_process";

// 「推送节奏」卡片的数据源（对应 src/pages/analytics.astro 里的 data-push-rhythm）。
// 移植自 Jarvis0227/Aemeath（MIT）的 src/pages/api/github-pushes.json.ts。
//
// 本地适配：
//   1. repository / branch 改成本站（ImYufish/my-blog · master）；
//   2. 本站仓库是**私有**的 → 走 GitHub API 必须带 token。在**构建环境**里配置
//      环境变量 GITHUB_PUSHES_TOKEN（细粒度 token 只需 Contents: Read 权限）即可；
//      这个 endpoint 是 `prerender = true`，token 只在构建期使用、不会进前端产物。
//   3. 没配 token 时回退本地 git（构建环境若保留完整 .git 也能用）。
export const prerender = true;

const repository = "ImYufish/my-blog";
const branch = "master";
const SINCE = "53 weeks ago";
const WINDOW_MS = 53 * 7 * 24 * 60 * 60 * 1000;
const MAX_PAGES = 5;

const token = process.env.GITHUB_PUSHES_TOKEN || process.env.GITHUB_TOKEN || "";

/** 主路径：GitHub API 读仓库提交历史（私有仓库必须带 token） */
const fromGitHubApi = async (): Promise<string[]> => {
	if (!token) return [];
	const since = new Date(Date.now() - WINDOW_MS).toISOString();
	const dates: string[] = [];
	try {
		for (let page = 1; page <= MAX_PAGES; page += 1) {
			const response = await fetch(
				`https://api.github.com/repos/${repository}/commits?sha=${branch}&since=${since}&per_page=100&page=${page}`,
				{
					headers: {
						Accept: "application/vnd.github+json",
						"User-Agent": "firefly-analytics",
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!response.ok) break;
			const rows = (await response.json()) as Array<{
				commit?: { committer?: { date?: string } };
			}>;
			if (!Array.isArray(rows) || !rows.length) break;
			for (const row of rows) {
				const date = row.commit?.committer?.date;
				if (date) dates.push(date);
			}
			if (rows.length < 100) break;
		}
	} catch {
		return dates;
	}
	return dates;
};

/** 兜底：构建环境若保留完整 .git，直接用本地提交历史（无限流） */
const fromLocalGit = (): string[] => {
	try {
		return execFileSync(
			"git",
			["log", "HEAD", `--since=${SINCE}`, "--format=%cI"],
			{ cwd: process.cwd(), encoding: "utf8" },
		)
			.split(/\r?\n/)
			.map((value) => value.trim())
			.filter(Boolean);
	} catch {
		return [];
	}
};

export async function GET(): Promise<Response> {
	let commits = await fromGitHubApi();
	let source = "github-api";
	if (!commits.length) {
		commits = fromLocalGit();
		source = "local-git";
	}

	return new Response(
		JSON.stringify({
			ok: true,
			source,
			repository,
			branch,
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
