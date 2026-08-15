// 浏览器端拿一言，侧边栏组件和首页横幅共用
// local  = 读构建期生成的 public/hitokoto/hitokoto.json（零外部依赖）
// remote = 运行时拉远程包（默认 jsDelivr 上的 hitokoto-osc/sentences-bundle）
// fallbackToLocal: 远程拉不到时——开关开就退本地包；开关关且远程真挂了，侧边栏 / 页脚 / 文章内直接隐藏，横幅副标题退回英文 preset（没英文才隐藏）

export type HitokotoItem = {
  hitokoto: string;
  from: string;
  from_who: string;
  type: string;
};

export type HitokotoClientOptions = {
  bundleSource: "local" | "remote";
  remoteUrl: string;
  fallbackToLocal: boolean;
  enableCategories: Record<string, boolean>;
};

export type HitokotoFormatOptions = {
  showSource?: boolean;
  showAuthor?: boolean;
  showCategory?: boolean;
  catNames?: Record<string, string>;
};

// 统一整理成 { hitokoto, from, from_who, type }，顺手 trim 一下
function strip(arr: any[]): HitokotoItem[] {
  return (arr || []).map((x) => ({
    hitokoto: (x.hitokoto || "").trim(),
    from: (x.from || "").trim(),
    from_who: (x.from_who || "").trim(),
    type: x.type || "",
  }));
}

// 本地模式：读构建时生成的 public/hitokoto/hitokoto.json
async function loadLocal(): Promise<HitokotoItem[]> {
  const r = await fetch("/hitokoto/hitokoto.json");
  if (!r.ok) throw new Error("本地语句包 " + r.status);
  return strip(await r.json());
}

// 远程模式：按启用的分类分别拉，再合并到一起
async function loadRemote(opts: HitokotoClientOptions): Promise<HitokotoItem[]> {
  const cats = Object.keys(opts.enableCategories).filter((t) => opts.enableCategories[t]);
  const tasks = cats.map((t) =>
    fetch(opts.remoteUrl + "/" + t + ".json")
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
  );
  const lists = await Promise.all(tasks);
  let all: HitokotoItem[] = [];
  lists.forEach((arr, i) => {
    if (Array.isArray(arr)) {
      all = all.concat(strip(arr.map((x) => ({ ...x, type: cats[i] }))));
    }
  });
  if (all.length === 0) throw new Error("远程语句包为空");
  return all;
}

// 模块级缓存：同配置只拉一次；同时落 localStorage，跨刷新也复用。
// 注意：localStorage 缓存带 TTL，避免句子库更新后老访客永远读到旧库（之前没有 TTL，
// 部署更新了 hitokoto.json 也对已缓存的老访客无效，表现就是「换不了句子」）。
const HITOKOTO_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 小时
let _cacheKey = "";
let _cachePool: HitokotoItem[] | null = null;

async function getPool(opts: HitokotoClientOptions): Promise<HitokotoItem[]> {
  const cats = Object.keys(opts.enableCategories).filter((t) => opts.enableCategories[t]);
  const key = "firefly-hitokoto-" + opts.bundleSource + "-" + cats.join("") + "-" + (opts.remoteUrl || "");
  if (key === _cacheKey && _cachePool) return _cachePool;
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const obj = JSON.parse(cached);
      // 兼容旧格式（裸数组）：当成 ts=0，TTL 校验时必然失效、走重拉
      const arr = Array.isArray(obj) ? obj : obj?.data;
      const ts = Array.isArray(obj) ? 0 : obj?.ts || 0;
      if (Array.isArray(arr) && arr.length && Date.now() - ts < HITOKOTO_CACHE_TTL) {
        _cacheKey = key;
        _cachePool = arr;
        return arr;
      }
    }
  } catch (_) {}
  let p: HitokotoItem[];
  try {
    p = opts.bundleSource === "remote" ? await loadRemote(opts) : await loadLocal();
  } catch (e) {
    if (opts.bundleSource === "remote" && opts.fallbackToLocal) {
      console.warn("[hitokoto] 远程拉取失败，回退本地：", e);
      p = await loadLocal();
    } else {
      throw e;
    }
  }
  // 本地模式也按分类开关再过滤一遍（防止打包时带了、后来关了却没重打）
  if (opts.bundleSource !== "remote") {
    p = p.filter((x) => !x.type || opts.enableCategories[x.type]);
  }
  _cacheKey = key;
  _cachePool = p;
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: p }));
  } catch (_) {}
  return p;
}

// 随机取一条
export async function getRandomHitokoto(opts: HitokotoClientOptions): Promise<HitokotoItem> {
  const pool = await getPool(opts);
  if (!pool.length) throw new Error("语句池为空");
  return pool[Math.floor(Math.random() * pool.length)];
}

// 拼出处那行：分类标签 + 《出处》 + 作者，显不显示看开关
export function formatHitokoto(item: HitokotoItem, opts: HitokotoFormatOptions): string {
  const parts: string[] = [];
  if (opts.showCategory && item.type && opts.catNames?.[item.type]) {
    parts.push("【" + opts.catNames[item.type] + "】");
  }
  const tail: string[] = [];
  if (opts.showSource && item.from) tail.push("《" + item.from + "》");
  // 作者与出处相同时（原创/网络/抖机灵类投稿人既是来源也是作者）只在出处已显示的前提下跳过作者，
  // 避免「《X》 X」冗余；出处没开时作者仍照常显示，不会误删
  if (opts.showAuthor && item.from_who && !(opts.showSource && item.from && item.from_who === item.from)) {
    tail.push(item.from_who);
  }
  if (tail.length) parts.push("—— " + tail.join(" "));
  return parts.join(" ");
}