import { execSync } from "node:child_process";
import type { AstroIntegration } from "astro";

/**
 * Astro 集成，用于在构建结束时运行 Search 索引器
 * @returns AstroIntegration
 */
export default function searchIndexer() {
	const data: AstroIntegration = {
		name: "search-indexer",
		hooks: {
			"astro:build:done": async () => {
				console.log(
					`${"=".repeat(10)}Running Search Indexer...${"=".repeat(10)}`,
				);

				console.log("Running Pagefind Indexer...");
				try {
					execSync("pagefind --site dist", {
						encoding: "utf-8",
						stdio: "inherit",
					});
				} catch (error) {
					console.error("Pagefind Index Failed:", error.message);
				}

				console.log(`${"=".repeat(10)}Search Indexer Done.${"=".repeat(10)}`);
			},
		},
	};
	return data;
}
