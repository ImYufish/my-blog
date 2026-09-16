// 构建前 / 离线：用 sharp 解码壁纸，算主导色相（hue），就地更新
// src/config/wallpaperThemeConfig.ts 里 // >>> hues / // <<< hues 之间的 hues 表。
//
// 用法: node scripts/gen-wallpaper-hues.mjs
// 只覆盖 hues 表，enable / switchable 等手改项会保留。
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const GROUPS = [
  { dir: "src/assets/images/DesktopWallpaper", key: "assets/images/DesktopWallpaper" },
  { dir: "src/assets/images/MobileWallpaper", key: "assets/images/MobileWallpaper" },
];

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

async function dominantHue(file) {
  const { data, info } = await sharp(file)
    .resize(64, 64, { fit: "inside" })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const BINS = 36; // 10° 一档
  const hist = new Array(BINS).fill(0);
  let totalSat = 0, totalLum = 0, n = 0;
  for (let i = 0; i < data.length; i += ch) {
    const { h, s, l } = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    totalLum += l; n++;
    // 过滤接近灰/白/黑的像素，它们不携带"主色相"信息
    if (s < 0.12 || l < 0.07 || l > 0.95) continue;
    // 权重：饱和度优先，并压低过亮/过暗
    const w = s * (1 - Math.abs(l - 0.5) * 0.6);
    totalSat += s;
    hist[Math.floor(h / (360 / BINS)) % BINS] += w;
  }
  let best = 0;
  for (let i = 1; i < BINS; i++) if (hist[i] > hist[best]) best = i;
  // 相邻档做加权平均，得到更细的色相
  const binSize = 360 / BINS;
  let num = 0, den = 0;
  for (const off of [-1, 0, 1]) {
    const idx = (best + off + BINS) % BINS;
    const w = hist[idx];
    num += (idx * binSize + binSize / 2) * w;
    den += w;
  }
  const hue = den > 0 ? Math.round(num / den) % 360 : 0;
  return { hue, avgSat: +(totalSat / n).toFixed(3), avgLum: +(totalLum / n).toFixed(3) };
}

const out = {};
for (const g of GROUPS) {
  const abs = path.join(ROOT, g.dir);
  let files = [];
  try {
    files = (await readdir(abs)).filter((f) => /\.(avif|webp|png|jpe?g)$/i.test(f)).sort();
  } catch {
    continue;
  }
  for (const f of files) {
    const key = `${g.key}/${f}`;
    try {
      const r = await dominantHue(path.join(abs, f));
      out[key] = r;
      console.log(`${key}  ->  hue=${r.hue}  (sat=${r.avgSat} lum=${r.avgLum})`);
    } catch (e) {
      console.log(`${key}  ->  ERROR ${e.message}`);
    }
  }
}

// 就地替换 hues 表
const dest = path.join(ROOT, "src/config/wallpaperThemeConfig.ts");
let src = await readFile(dest, "utf8");
const BEGIN = "\t// >>> hues";
const END = "\t// <<< hues";
const i = src.indexOf(BEGIN);
const j = src.indexOf(END);
if (i < 0 || j < 0 || j < i) {
  console.error("✗ 未找到 // >>> hues 与 // <<< hues 标记，未写入任何内容");
  process.exit(1);
}
const block = [
  "\t// >>> hues（由 scripts/gen-wallpaper-hues.mjs 生成，勿手改）",
  "\thues: {",
  ...Object.entries(out).map(
    ([k, v]) => `\t\t"${k}": ${v.hue}, // sat ${v.avgSat} lum ${v.avgLum}`,
  ),
  "\t},",
  "\t// <<< hues",
].join("\n");
src = src.slice(0, i) + block + src.slice(j + END.length);
await writeFile(dest, src, "utf8");
console.log(`\n✓ 已更新 ${dest}（${Object.keys(out).length} 张壁纸）`);
