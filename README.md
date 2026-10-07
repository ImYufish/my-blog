
<img src="./docs/images/1131.png" width = "350" height = "500" alt="Firefly" align=right />

<div align="center">

# 流萤 / Firefly 
> 一款清新美观的 Astro 静态博客主题模板
> 
> ![Node.js >= 22](https://img.shields.io/badge/node.js-%3E%3D22-brightgreen) 
![pnpm >= 11](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro](https://img.shields.io/badge/Astro-7-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)
>
> [![Stars](https://img.shields.io/github/stars/CuteLeaf/Firefly?style=social)](https://github.com/CuteLeaf/Firefly/stargazers)
[![Forks](https://img.shields.io/github/forks/CuteLeaf/Firefly?style=social)](https://github.com/CuteLeaf/Firefly/network/members)
[![Issues](https://img.shields.io/github/issues/CuteLeaf/Firefly)](https://github.com/CuteLeaf/Firefly/issues)
> 
> [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z8Z41NQALY)
>
> **QQ交流群：[1087127207](https://qm.qq.com/q/ZGsFa8qX2G)**
> 
> ![GitHub License](https://img.shields.io/github/license/CuteLeaf/Firefly)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/CuteLeaf/Firefly)
[![爱发电打赏](https://img.shields.io/badge/爱发电-打赏作者-ff69b4.svg)](https://ifdian.net/a/cuteleaf)

</div>


---
📖 README：
**[简体中文](README.md)** | **[繁體中文](docs/README.zh-TW.md)** | **[English](README.en.md)** | **[日本語](docs/README.ja.md)** | **[한국어](docs/README.ko.md)**

🚀 快速指南：
[**🖥️在线预览**](https://firefly.cuteleaf.cn/) /
[**📝使用文档**](https://docs-firefly.cuteleaf.cn/) /
[**🍀我的博客**](https://blog.cuteleaf.cn) 

⚡ 静态站点生成: 基于 Astro 的超快加载速度和 SEO 优化

🎨 现代化设计: 简洁美观的界面，支持自定义主题色

📱 移动友好: 完美的响应式体验，移动端专项优化

🔧 高度可配置: 大部分功能模块均可通过配置文件自定义

<table width="100%" align="center">
  <tr>
    <td colspan="3" align="center">
      <img src="./docs/images/1.webp" >
      <br>横幅模式</td>
    </td>
  </tr>
  <tr>
    <td align="center"><img src="./docs/images/3.webp" width="300"><br>透明覆盖模式</td>
    <td align="center"><img src="./docs/images/2.webp" width="300"><br>全屏壁纸模式</td>
    <td align="center"><img src="./docs/images/4.webp" width="300"><br>纯色模式</td>
  </tr>
</table>
<img alt="Lighthouse" src="./docs/images/Lighthouse.png" />

>[!TIP]
>
>Firefly 是一款基于 Astro 框架和 Fuwari 模板开发的清新美观且现代化个人博客主题模板，专为技术爱好者和内容创作者设计。该主题融合了现代 Web 技术栈，提供了丰富的功能模块和高度可定制的界面，让您能够轻松打造出专业且美观的个人博客网站。
>
>**如果你参考或使用了 Firefly 的组件设计和相关代码，请注明来自 Firefly。**
>
>Firefly 也保留了原版 fuwari 的布局，可根据自己的喜好在配置文件中自由切换。
>
>**更多布局配置及演示请查看：[Firefly 布局系统详解](https://firefly.cuteleaf.cn/posts/guide/firefly-layout-system/)**
>
>Firefly 支持 i18n 多语言 UI，但除了简体中文，其他语言均为 AI 翻译转换，如有错误，欢迎提交 [Pull Request](https://github.com/CuteLeaf/Firefly/pulls) 修正。

## ✨ 功能特性

### 核心功能

- [x] **Astro + Tailwind CSS** - 基于现代技术栈的超快静态站点生成
- [x] **流畅动画** - Swup 页面过渡动画，提供丝滑的浏览体验
- [x] **响应式设计** - 完美适配桌面端、平板和移动设备
- [x] **多语言支持** - i18n 国际化，UI 支持简体中文、繁体中文、英文、日文、俄语、韩文
- [x] **全文搜索** - 基于 Pagefind 的客户端搜索，支持文章内容索引

### 个性化
- [x] **动态侧边栏** - 支持配置单侧边栏、双侧边栏
- [x] **文章布局** - 支持配置(单列)列表、网格(多列/瀑布流)布局
- [x] **字体管理** - 支持自定义字体，丰富的字体选择器
- [x] **页脚配置** - HTML 内容注入，完全自定义
- [x] **亮暗色模式** - 支持亮色/暗色/跟随系统三种模式
- [x] **导航栏自定义** - Logo、标题、链接全面自定义
- [x] **壁纸模式切换** - 横幅壁纸、全屏壁纸、全屏透明壁纸、纯色背景
- [x] **主题色自定义** - 360° 色相调节

如果你有好用的功能和优化，请提交 [Pull Request](https://github.com/CuteLeaf/Firefly/pulls)

## 🚀 快速开始

### 环境要求

- Node.js ≥ 22
- pnpm ≥ 11

### 本地开发部署

1. **克隆仓库：**
   ```bash
   git clone https://github.com/Cuteleaf/Firefly.git
   cd Firefly
   ```
   
   **先 [Fork](https://github.com/CuteLeaf/Firefly/fork) 到自己仓库再克隆（推荐），记得先点 Star 再 Fork 哦！**

   ```bash
   git clone https://github.com/you-github-name/Firefly.git
   cd Firefly
   ```
3. **安装依赖：**
   ```bash
   # 如果没有安装 pnpm，先安装
   npm install -g pnpm
   
   # 安装项目依赖
   pnpm install
   ```

4. **配置博客：**
   - 编辑 `src/config/` 目录下的配置文件自定义博客设置

5. **启动开发服务器：**
   ```bash
   pnpm dev
   ```
   博客将在 `http://localhost:4321` 可用

### 平台托管部署
- **参考[官方指南](https://docs.astro.build/zh-cn/guides/deploy/)将博客部署至 Vercel, Netlify, Cloudflare Pages, EdgeOne Pages 等。**
- **Vercel**、**Netlify** 等主流平台自动部署，会根据环境自动选择适配器。

   框架预设： `Astro`

   根目录： `./`

   输出目录： `dist`

   构建命令： `pnpm run build`

   安装命令： `pnpm install`

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CuteLeaf/Firefly&project-name=Firefly&repository-name=Firefly)
   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/CuteLeaf/Firefly)

## 🔒 内容与私有仓库

本仓库**只放主题与代码，不含博客内容**。文章、动态、足迹、项目、about 等都在私有仓库
`my-blog-content` 里，`src/content/` 已被 `.gitignore` 忽略。

`pnpm dev` 与 `pnpm build` 的**第一步**都会先同步内容：

```bash
node scripts/sync-content.mjs    # 等价于 pnpm sync:content
```

| 情况 | 行为 |
| --- | --- |
| `src/content` 不存在 | 克隆内容仓库（分支 `main`） |
| 已是工作副本且无未提交改动 | `git pull --ff-only` 更新到最新 |
| 工作副本有未提交改动 | **跳过更新**，保留你的改动 |
| 目录存在但不是 git 仓库 | 默认不动它（加 `--force` 会先改名备份再克隆） |
| 拉取失败但本地已有内容 | 只警告，继续用现有内容 |
| 拉取失败且本地**没有**内容 | **中止构建**（避免部署出空站） |

私有仓库需要凭据，在部署平台的环境变量里配（本地可放 `.env`，变量说明见 `.env.example`）：

| 变量 | 说明 |
| --- | --- |
| `CONTENT_REPO_URL` | 内容仓库地址，默认已内置 |
| `CONTENT_REPO_TOKEN` | GitHub 细粒度 PAT（`Contents: Read-only`）；本地 git 已记住凭据时可留空 |
| `CONTENT_REPO_BRANCH` | 分支名，默认 `main` |
| `CONTENT_SYNC=skip` | 临时跳过同步，直接用现有 `src/content` |

**本地写文章**：建议把内容仓库克隆到 `src/content` 当工作副本，之后就在那儿写、在那儿提交：

```bash
git clone git@github.com:ImYufish/my-blog-content.git src/content
```

> ⚠️ `pnpm new-post`（以及编辑器直接建文件）写入的都是 `src/content/posts/`，也就是这份工作副本 ——
> 写完记得在 `src/content` 里 `git commit && git push`，否则线上构建拉不到新文章。

## 🔑 部署环境变量清单

仓库里的密钥**一律留空**，构建时从环境变量读。用 EdgeOne Pages 等平台自动构建时，要先把它们配在
「项目设置 → 环境变量」（EdgeOne 支持把整个 `.env` 的内容粘进变量名输入框批量导入；也可用 CLI：
`edgeone pages env set <KEY> <VALUE>`）。

| 变量 | 不配的后果 | 申请入口 |
| --- | --- | --- |
| `CONTENT_REPO_TOKEN` | **构建直接中止**（私有内容仓库拉不到，本地有 `src/content` 副本时看不出来） | GitHub 细粒度 PAT：仅 `my-blog-content` 仓库、`Contents: Read-only` |
| `PUBLIC_AMAP_KEY_PLACES` | 足迹地图区域空白 | 高德开放平台 → Web端 (JS API) |
| `PUBLIC_QWEATHER_KEY` | 天气组件退回免 Key 的源 | 和风天气控制台 |
| `PUBLIC_TOUTIAO_TOKEN` | 不注入头条/字节自动收录脚本 | 字节跳动站长平台 |
| `BAIDU_PUSH_TOKEN` | 构建时不向百度推送 URL | 百度搜索资源平台 → API 提交 |
| `PUBLIC_MAL_CLIENT_ID` | 追番页不请求数据 | MAL API 配置页 |
| `GITHUB_PUSHES_TOKEN` | 统计页「推送节奏」退回读本地 `git log` | GitHub 细粒度 PAT：`Contents: Read-only` |

逐项说明（含变量通道、留空行为）见 [`.env.example`](./.env.example)。

> **Node 版本**：本仓库 `engines` 要求 `>=22.23.0`，而 EdgeOne Pages 预装的版本里没有这一档（最高 `24.5.0`），
> 默认环境会打印 `Unsupported engine` 警告。在「项目设置 → Node.js 版本」选 **24.5.0** 即可消除。

## 📖 配置说明

> 📚 **详细配置文档**: 查看 [Firefly 使用文档](https://docs-firefly.cuteleaf.cn/) 获取完整的配置指南

### 设置网站语言

要设置博客的默认语言，请编辑 `src/config/siteConfig.ts` 文件：

```typescript
// 定义站点语言
const SITE_LANG = "zh_CN";
```

**支持的语言代码：**
- `zh_CN` - 简体中文
- `zh_TW` - 繁体中文
- `en` - 英文
- `ja` - 日文
- `ru` - 俄文
- `ko` - 韩文

### 配置文件结构

```
src/
├── config/
│   ├── index.ts                  # 配置索引文件
│   ├── siteConfig.ts             # 站点基础配置
│   ├── analyticsConfig.ts        # 统计分析配置
│   ├── announcementConfig.ts     # 公告配置
│   ├── backgroundWallpaper.ts    # 背景壁纸配置
│   ├── commentConfig.ts          # 评论系统配置
│   ├── coverImageConfig.ts       # 封面图配置
│   ├── displaySettingsConfig.ts  # 设置面板配置
│   ├── dynamicConfig.ts          # 动态页面配置
│   ├── effectsConfig.ts          # 动画特效配置（樱花等）
│   ├── expressiveCodeConfig.ts   # 代码高亮配置
│   ├── fontConfig.ts             # 字体配置
│   ├── FooterConfig.html           # 页脚配置
│   ├── friendsConfig.ts          # 友链配置
│   ├── galleryConfig.ts          # 相册配置
│   ├── licenseConfig.ts          # 许可证配置
│   ├── musicConfig.ts            # 音乐播放器配置
│   ├── navBarConfig.ts           # 导航栏配置
│   ├── pioConfig.ts              # 看板娘配置
│   ├── mermaidConfig.ts          # Mermaid 图表配置
│   ├── plantumlConfig.ts         # PlantUML 图表配置
│   ├── profileConfig.ts          # 用户资料配置
│   ├── sidebarConfig.ts          # 侧边栏布局配置
│   └── sponsorConfig.ts          # 打赏配置
```

## ⚙️ 文章 Frontmatter

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg  # 或使用 "api" 来启用随机封面图
tags: [Foo, Bar]
category: Front-end
draft: false
lang: zh-CN      # 仅当文章语言与 `siteConfig.ts` 中的网站语言不同时需要设置
pinned: false    # 置顶
comment: true    # 是否允许评论
---
```

## 动态

动态文件保存在 `src/content/dynamic/` 中，一个 Markdown 文件对应一条动态。可以使用快捷命令创建：

```bash
pnpm new-d 今天心情不错，出去吃了一顿火锅
```

`pnpm new-dynamic <content>` 也可以使用，和 `new-d` 完全等价。

```yaml
---
published: 2026-07-15 16:15:29
pinned: true  # 置顶
location: China # 位置
---

动态内容可以使用 Markdown 语法。
```

也支持对接 [Memos](https://www.usememos.com/) 作为数据源，在 `src/config/dynamicConfig.ts` 中配置 `memos` 选项即可实时获取 Memos 动态，支持置顶同步和图片附件展示。详见[动态文档](https://docs-firefly.cuteleaf.cn/zh/guide/dynamic.html)。

## 🧩 Markdown 扩展语法

除了 Astro 默认支持的 [GitHub Flavored Markdown](https://github.github.com/gfm/) 之外，还包含了一些额外的 Markdown 功能：

- 提醒块（Admonitions） - 支持 GitHub, Obsidian, VitePress, Docusaurus 四种风格主题配置 ([预览和用法](https://firefly.cuteleaf.cn/posts/markdown-extended/))
- GitHub 仓库卡片 ([预览和用法](https://firefly.cuteleaf.cn/posts/markdown-extended/))
- 基于 Expressive Code 的增强代码块 ([预览](http://firefly.cuteleaf.cn/posts/code-examples/) / [文档](https://expressive-code.com/))

## 🧞 指令

下列指令均需要在项目根目录执行：

| Command                    | Action                                 |
| :------------------------- | :------------------------------------- |
| `pnpm install`             | 安装依赖                               |
| `pnpm dev`                 | 在 `localhost:4321` 启动本地开发服务器 |
| `pnpm build`               | 构建网站至 `./dist/`                   |
| `pnpm preview`             | 本地预览已构建的网站                   |
| `pnpm check`               | 检查代码中的错误                       |
| `pnpm format`              | 使用 Biome 格式化您的代码              |
| `pnpm new-post <filename>` | 创建新文章                             |
| `pnpm new-d <content>`     | 创建一条动态                           |
| `pnpm new-dynamic <content>` | 创建一条动态（完整命令）              |
| `pnpm astro ...`           | 执行 `astro add`, `astro check` 等指令 |
| `pnpm astro --help`        | 显示 Astro CLI 帮助                    |

## 🙏 致谢

非常感谢 [saicaca](https://github.com/saicaca) 开发的 [fuwari](https://github.com/saicaca/fuwari) 模板，Firefly 就是基于这个模板二次开发

流萤部分相关图片素材版权归游戏 [《崩坏：星穹铁道》](https://sr.mihoyo.com/) 开发商 [米哈游](https://www.mihoyo.com/) 所有

### 技术栈

- [Astro](https://astro.build) 
- [Tailwind CSS](https://tailwindcss.com) 
- [Iconify](https://iconify.design)

### 灵感项目

- [fuwari](https://github.com/saicaca/fuwari)
- [hexo-theme-shoka](https://github.com/amehime/hexo-theme-shoka)
- [astro-koharu](https://github.com/cosZone/astro-koharu)
- [Mizuki](https://github.com/matsuzaka-yuki/Mizuki)

### 其他参考
- 博主`霞葉`的 [Bangumi 收藏](https://kasuha.com/posts/fuwari-enhance-ep2/) 页面组件
- 哔哩哔哩up主 `公公的日常` 的Q版 [流萤看板娘 Spine 切片数据](https://www.bilibili.com/video/BV1fuVzzdE5y) 

## 📝 许可协议

本项目遵循 [MIT license](https://mit-license.org/) 开源协议，详细查看 [LICENSE](./LICENSE) 文件

最初 Fork 自 [saicaca/fuwari](https://github.com/saicaca/fuwari)，感谢原作者的贡献

**版权声明：**
- Copyright (c) 2024 [saicaca](https://github.com/saicaca) - [fuwari](https://github.com/saicaca/fuwari)
- Copyright (c) 2025 [CuteLeaf](https://github.com/CuteLeaf) - [Firefly](https://github.com/CuteLeaf/Firefly) 

根据 MIT 开源协议，你可以自由使用、修改、分发代码，但需保留上述版权声明。

## 🍀 贡献者

感谢以下贡献者对本项目做出的贡献，如有问题或建议，请提交 [Issue](https://github.com/CuteLeaf/Firefly/issues) 或 [Pull Request](https://github.com/CuteLeaf/Firefly/pulls)。

><a href="https://github.com/CuteLeaf/Firefly/graphs/contributors">
>  <img src="https://contrib.rocks/image?repo=CuteLeaf/Firefly" />
></a>

感谢以下贡献者对原项目 [fuwari](https://github.com/saicaca/fuwari) 做出的贡献，为本项目奠定了基础。

><a href="https://github.com/saicaca/fuwari/graphs/contributors">
>  <img src="https://contrib.rocks/image?repo=saicaca/fuwari" />
></a>

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=CuteLeaf/Firefly&type=Date)](https://star-history.com/#CuteLeaf/Firefly&Date)


<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
