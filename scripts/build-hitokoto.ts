// 一言语句包构建脚本（用 tsx 跑：npx tsx scripts/build-hitokoto.ts）
// 直接读 src/config/hitokotoConfig.ts 的开关：只打包启用的分类、按 samplePerCategory 抽样，
// 生成 public/hitokoto/hitokoto.json，供 Hitokoto.astro 的「本地模式」用。
// 想用远程语句包的人根本不用跑这个脚本——组件运行时直接拉远程，零构建步骤。
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { hitokotoConfig, HITOKOTO_CATEGORIES, HITOKOTO_CAT_NAMES } from "../src/config/hitokotoConfig";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "hitokoto");
const BASE = "https://cdn.jsdelivr.net/gh/hitokoto-osc/sentences-bundle@master/sentences";

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  const all: any[] = [];
  for (const t of HITOKOTO_CATEGORIES) {
    if (!hitokotoConfig.enableCategories[t]) {
      console.log(`  跳过 ${t} ${HITOKOTO_CAT_NAMES[t]}：配置已关闭`);
      continue;
    }
    try {
      const r = await fetch(`${BASE}/${t}.json`);
      if (!r.ok) {
        console.warn(`  ${t} 拉取失败 ${r.status}，跳过`);
        continue;
      }
      const arr: any[] = await r.json();
      let picked = arr.map((x: any) => ({
        hitokoto: (x.hitokoto || "").trim(),
        from: (x.from || "").trim(),
        from_who: (x.from_who || "").trim(),
        type: t,
      }));
      const n = hitokotoConfig.samplePerCategory;
      if (n > 0 && picked.length > n) picked = shuffle(picked).slice(0, n);
      all.push(...picked);
      console.log(`  ${t} ${HITOKOTO_CAT_NAMES[t]}：${arr.length} 条 → 取 ${picked.length}`);
    } catch (e: any) {
      console.warn(`  ${t} 出错 ${e?.message}，跳过`);
    }
  }
  shuffle(all);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, "hitokoto.json"), JSON.stringify(all), "utf8");
  console.log(`\n生成完成：${all.length} 条 → ${OUT_DIR}/hitokoto.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});