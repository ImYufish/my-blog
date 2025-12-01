
<img src="./docs/images/1131.png" width = "405" height = "511" alt="NapCat" align=right />

<div align="center">

# Firefly
> A Fresh and Beautiful Astro Blog Theme Template
> 
> ![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen) 
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro](https://img.shields.io/badge/Astro-5.16.3-orange)
</div>


---
🚀 Quick Guide:
[**🖥️Live Demo**](https://firefly.cuteleaf.cn/) /
[**📝Documentation**](https://docs-firefly.cuteleaf.cn/) /
[**🍀My Blog**](https://blog.cuteleaf.cn)

📖 README:
**[简体中文](README.md)** | **[繁體中文](docs/README.zh-TW.md)** | **[English](README.en.md)** | **[日本語](docs/README.ja.md)** | **[Русский](docs/README.ru.md)** 

⚡ Static Site Generation: Ultra-fast loading speed and SEO optimization based on Astro

🎨 Modern Design: Clean and beautiful interface with customizable theme colors

📱 Mobile-Friendly: Perfect responsive experience with mobile-specific optimizations

🔧 Highly Configurable: Most features can be customized through configuration files

<img alt="firefly" src="./docs/images/1.webp" />

>[!TIP]
>In important layouts, Firefly innovatively adds dual sidebars, article grid (two-column) layout,
>
>Includes site statistics, calendar component, table of contents and other widgets to enrich the sidebar,
>
>While also retaining Furwai's layout system, freely switchable in the configuration file.
>
>**For more layout configurations and demos, please see: [Firefly Layout System Details](https://firefly.cuteleaf.cn/posts/firefly-layout-system/)**

## ✨ Features

### Core Features

- [x] **Astro + Tailwind CSS** - Ultra-fast static site generation based on modern tech stack
- [x] **Smooth Animations** - Swup page transition animations for silky smooth browsing experience
- [x] **Responsive Design** - Perfect adaptation for desktop, tablet and mobile devices
- [x] **Multi-language Support** - i18n internationalization, supports Simplified Chinese, Traditional Chinese, English, Japanese, Russian
- [x] **Full-text Search** - Client-side search based on Pagefind, supports article content indexing. Also supports MeiliSearch search engine

### Personalization
- [x] **Sidebar** - Supports single sidebar, dual sidebar configuration, freely switchable in frontend
- [x] **Article Layout** - Supports list (single column) and grid (two-column) layout, freely switchable in frontend
- [x] **Font Management** - Custom font support with rich font selector
- [x] **Footer Configuration** - HTML content injection, fully customizable
- [x] **Navbar Customization** - Logo, title, links fully customizable
- [x] **Wallpaper Mode Switching** - Banner wallpaper, fullscreen wallpaper, solid background, freely switchable in frontend
- [x] **Theme Color Customization** - 360° hue adjustment, supports light/dark/system three modes, freely switchable in frontend

### Page Components
- [x] **Guestbook** - Supports guestbook page with integrated comment system
- [x] **Announcement Bar** - Top announcement notification, supports closing and custom styles
- [x] **Mascot** - Supports both Spine and Live2D animation engines
- [x] **Site Statistics** - Displays article, category, tag counts, total word count, running time, last update time
- [x] **Site Calendar** - Displays current month calendar and published articles for the month
- [x] **Sponsor Page** - Multiple payment methods, payment QR codes, sponsor list, in-article sponsor button
- [x] **Sakura Effect** - Supports sakura effect, fullscreen sakura animation
- [x] **Friend Links** - Beautiful friend link display cards
- [x] **Ad Component** - Supports custom sidebar advertising content
- [x] **Bangumi** - Display anime and game tracking based on Bangumi API
- [x] **Comment System** - Integrates Twikoo, Waline, Giscus, Disqus, Artalk comment systems
- [x] **Visit Counter** - Supports calling Waline, Twikoo built-in visit tracking
- [x] **Music Player** - Based on APlayer, supports local music and Meting API online music

### Content Enhancement
- [x] **Image Lightbox** - Fancybox image preview functionality
- [x] **Floating TOC** - Dynamically displays article table of contents, supports anchor jumping, shown when sidebar TOC is hidden
- [x] **Email Protection** - Prevent automated crawlers from directly scraping email addresses to avoid spam
- [x] **Sidebar TOC** - Dynamically displays article table of contents, supports anchor jumping
- [x] **Enhanced Code Blocks** - Based on Expressive Code, supports code folding, line numbers, language identification
- [x] **Math Formula Support** - KaTeX rendering engine, supports inline and block formulas
- [x] **Markdown Extensions** - [Markdown extended features](https://github.com/saicaca/fuwari?tab=readme-ov-file#-markdown-extended-syntax)
- [x] **Random Cover Images** - Supports fetching random cover images via API

### SEO
- [x] **SEO Optimization** - Complete meta tags and structured data
- [x] **RSS Feed** - Automatically generates RSS Feed
- [x] **Sitemap** - Automatically generates XML Sitemap with page filtering configuration


## 📝 Planned...

- [ ] **Refactor Live2D Mascot**
- [ ] **Optimize Grid Layout Article Covers**
- [ ] **Continuous Animation Smoothness Optimization**
- [ ] More features in continuous development...

If you have useful features and optimizations, please submit a [Pull Request](https://github.com/CuteLeaf/Firefly/pulls)

## 🚀 Quick Start

### Requirements

- Node.js ≤ 22
- pnpm ≤ 9

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Cuteleaf/Firefly.git
   cd Firefly
   ```
   **First [Fork](https://github.com/CuteLeaf/Firefly/fork) to your own repository then clone (recommended)**
   ```bash
   git clone https://github.com/you-github-name/Firefly.git
   cd Firefly
   ```
3. **Install dependencies:**
   ```bash
   # Install pnpm if not installed
   npm install -g pnpm
   
   # Install project dependencies
   pnpm install
   ```

4. **Configure blog:**
   - Edit configuration files in `src/config/` directory to customize blog settings

5. **Start development server:**
   ```bash
   pnpm dev
   ```
   Blog will be available at `http://localhost:4321`

### Platform Hosting Deployment
- **Refer to the [official guide](https://docs.astro.build/en/guides/deploy/) to deploy your blog to Vercel, Netlify, GitHub Pages, Cloudflare Pages, EdgeOne Pages, etc.**

   Framework Preset: `Astro`

   Root Directory: `./`

   Output Directory: `dist`

   Build Command: `pnpm run build`

   Install Command: `pnpm install`

## 📖 Configuration

> 📚 **Detailed Configuration Documentation**: Check [Firefly Documentation](https://docs-firefly.cuteleaf.cn/) for complete configuration guide

### Setting Website Language

To set the default language for your blog, edit the `src/config/siteConfig.ts` file:

```typescript
// Define site language
const SITE_LANG = "zh_CN";
```

**Supported language codes:**
- `zh_CN` - Simplified Chinese
- `zh_TW` - Traditional Chinese
- `en` - English
- `ja` - Japanese
- `ru` - Russian


### Configuration File Structure

```
src/
├── config/
│   ├── index.ts              # Configuration index file
│   ├── siteConfig.ts         # Site basic configuration
│   ├── profileConfig.ts      # User profile configuration
│   ├── commentConfig.ts      # Comment system configuration
│   ├── announcementConfig.ts # Announcement configuration
│   ├── licenseConfig.ts      # License configuration
│   ├── footerConfig.ts       # Footer configuration
│   ├── FooterConfig.html     # Footer HTML content
│   ├── expressiveCodeConfig.ts # Code highlighting configuration
│   ├── sakuraConfig.ts       # Sakura effect configuration
│   ├── fontConfig.ts         # Font configuration
│   ├── sidebarConfig.ts      # Sidebar layout configuration
│   ├── navBarConfig.ts       # Navbar configuration
│   ├── musicConfig.ts        # Music player configuration
│   ├── pioConfig.ts          # Mascot configuration
│   ├── adConfig.ts           # Ad configuration
│   ├── friendsConfig.ts      # Friend links configuration
│   ├── sponsorConfig.ts      # Sponsor configuration
│   └── coverImageConfig.ts   # Article random cover image configuration
```


## ⚙️ Article Frontmatter

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg  # Or use "api" to enable random cover images
tags: [Foo, Bar]
category: Front-end
draft: false
lang: zh-CN      # Only set when article language differs from site language in `siteConfig.ts`
---
```

## 🧞 Commands

All commands need to be executed in the project root directory:

| Command                           | Action                            |
|:----------------------------------|:----------------------------------|
| `pnpm install` and `pnpm add sharp` | Install dependencies                              |
| `pnpm dev`                        | Start local development server at `localhost:4321`      |
| `pnpm build`                      | Build site to `./dist/`                   |
| `pnpm preview`                    | Preview built site locally                        |
| `pnpm new-post <filename>`        | Create new article                             |
| `pnpm astro ...`                  | Execute `astro add`, `astro check` and other commands |
| `pnpm astro --help`               | Display Astro CLI help                   |

## 🙏 Acknowledgments

- Special thanks to [saicaca](https://github.com/saicaca) for developing the [Fuwari](https://github.com/saicaca/fuwari) template, which Firefly is based on
- Referenced blogger [Kasuka](https://kasuha.com)'s [Bangumi Collection Display](https://kasuha.com/posts/fuwari-enhance-ep2/) and [Email Protection/Image Title](https://kasuha.com/posts/fuwari-enhance-ep1/) solutions
- Referenced [Mizuki](https://github.com/matsuzaka-yuki/Mizuki)'s banner title, multi-level menu navbar, sakura effect, KaTeX, and Fancybox solutions
- Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com)
- Uses [MetingJS](https://github.com/metowolf/MetingJS) and [APlayer](https://github.com/MoePlayer/APlayer) music player
- Uses Chibi `Firefly` mascot spine model provided by Bilibili creator [公公的日常](https://space.bilibili.com/3546750017080050)
- Icons from [Iconify](https://iconify.design/)
- Firefly-related image assets are copyrighted by [miHoYo](https://www.mihoyo.com/), the developer of ["Honkai: Star Rail"](https://sr.mihoyo.com/).

## 🍀 Contributors

Thanks to the following contributors for their contributions to this project. If you have any questions or suggestions, please submit an [Issue](https://github.com/CuteLeaf/Firefly/issues) or [Pull Request](https://github.com/CuteLeaf/Firefly/pulls).

<a href="https://github.com/CuteLeaf/Firefly/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CuteLeaf/Firefly" />
</a>

![Alt](https://repobeats.axiom.co/api/embed/6139639d8e88da4d3dc9d45fd43f4e4b2d580086.svg "Repobeats analytics image")

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=CuteLeaf/Firefly&type=Date)](https://star-history.com/#CuteLeaf/Firefly&Date)


<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
