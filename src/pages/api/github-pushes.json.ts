import { execFileSync } from "node:child_process";

// 「推送节奏」卡片的数据源，移植自 Jarvis0227/Aemeath（MIT）。与本地相关的三处差异：
// 仓库改成本站、只统计自己的提交（fork 仓库里大部分提交是上游作者写的）、回退本地 git 前先补深历史。
export const prerender = true;

const repository = "ImYufish/my-blog";
const branch = "master";
const SINCE = "53 weeks ago";
const WINDOW_MS = 53 * 7 * 24 * 60 * 60 * 1000;
const MAX_PAGES = 20; // 53 周约 1500 条 = 16 页（接口不支持按作者过滤，只能拉全量再筛）
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

/** GitHub API；公开仓库匿名即可，私有仓库需 GITHUB_PUSHES_TOKEN */
const fromGitHubApi = async (): Promise<string[]> => {
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

/** 兜底：本地 git 历史（浅克隆先补深，失败就继续用现有的） */
const fromLocalGit = (): string[] => {
	const cwd = process.cwd();
	try {
		const shallow = execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
			cwd,
			encoding: "utf8",
		}).trim();
		if (shallow === "true") {
			execFileSync("git", ["fetch", "--deepen=2000", "--quiet"], {
				cwd,
				encoding: "utf8",
				stdio: ["ignore", "pipe", "pipe"],
			});
		}
	} catch {
		// 补深失败不致命
	}
	try {
		const raw = execFileSync("git", ["log", "HEAD", `--since=${SINCE}`, "--format=%cI%x09%ae"], {
			cwd,
			encoding: "utf8",
		});
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
