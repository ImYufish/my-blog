// Firefly MDX 文章可用的 UI 组件集合
//
// MDX 文章里一次 import 即可使用多个组件：
//   import { TabGroup, } from "@/components/firefly-mdx";
//
// 说明：
// - 这里只收录 .svelte（交互类）组件。Astro 组件无法从这里 re-export：
//   纯 .ts barrel 下 tsc 解析不到 `*.astro` 模块；需要 ButtonLink、Markdown 等
//   Astro 组件时，直接在 MDX 里按路径 import 即可（同样可用）。
// - 以后新增的 MDX UI 组件（.svelte）在这里追加一行导出即可。

export { default as TabGroup } from "@/components/common/TabGroup.svelte";
