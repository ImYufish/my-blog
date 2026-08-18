// scripts/sync-friends.mjs
// 构建/开发前自动把远程友链（friends.yufish.cn/friends.json）同步进本地兜底文件
// src/config/friendsConfig.ts 的 friendsConfig 数组。
//
// 设计原则：
// - 只重写 friendsConfig 数组，friendsPageConfig / getEnabledFriends 原样不动；
// - 任何失败（网络/解析/格式）都只告警并跳过，绝不阻塞构建（exit 0）；
// - 远程就是博客友链页与检测系统的唯一真源（check-flink 的 static/friends.json），
//   本脚本让"本地兜底"自动跟随真源，从此你只改 check-flink 一处即可。

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", "src", "config", "friendsConfig.ts");
const REMOTE = "https://friends.yufish.cn/friends.json";
const TIMEOUT_MS = 12000;

async function fetchRemote() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(REMOTE, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// 字段顺序与 friendsConfig.ts 现有风格保持一致；值为空则跳过该字段
const FIELD_ORDER = ["title", "imgurl", "desc", "siteurl", "linkpage", "rss", "tags", "weight", "enabled"];

function genEntry(f) {
  const lines = ["\t{"];
  for (const key of FIELD_ORDER) {
    const v = f[key];
    if (v === undefined || v === null) continue;
    if (key === "tags") {
      const arr = Array.isArray(v) ? v : [v];
      lines.push(`\t\t${key}: [${arr.map((t) => JSON.stringify(t)).join(", ")}],`);
    } else if (typeof v === "boolean" || typeof v === "number") {
      lines.push(`\t\t${key}: ${v},`);
    } else {
      lines.push(`\t\t${key}: ${JSON.stringify(v)},`);
    }
  }
  lines.push("\t},");
  return lines.join("\n");
}

async function main() {
  let data;
  try {
    data = await fetchRemote();
  } catch (e) {
    console.warn(`[sync-friends] 拉取远程友链失败，跳过同步（保留现有兜底文件）：${e.message}`);
    return;
  }

  const list = Array.isArray(data) ? data : data?.friends;
  if (!Array.isArray(list) || list.length === 0) {
    console.warn("[sync-friends] 远程数据为空或格式异常，跳过同步");
    return;
  }

  const body = list.map(genEntry).join("\n");
  const replacement = `export const friendsConfig: FriendLink[] = [\n${body}\n];`;

  let file;
  try {
    file = await readFile(SRC, "utf8");
  } catch {
    console.warn("[sync-friends] 找不到 friendsConfig.ts，跳过");
    return;
  }

  const re = /export const friendsConfig: FriendLink\[\] = \[[\s\S]*?\n\];/;
  if (!re.test(file)) {
    console.warn("[sync-friends] 未匹配到 friendsConfig 数组，跳过（文件结构可能变了）");
    return;
  }

  const next = file.replace(re, replacement);
  await writeFile(SRC, next, "utf8");
  console.log(`[sync-friends] 已同步 ${list.length} 条友链到本地兜底文件`);
}

main().catch((e) => {
  console.warn(`[sync-friends] 意外错误，跳过同步：${e?.message || e}`);
});
