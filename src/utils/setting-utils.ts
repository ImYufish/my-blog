import {
  DARK_MODE,
  DEFAULT_THEME,
  LIGHT_MODE,
  SYSTEM_MODE,
} from "@constants/constants";
import { siteConfig } from "../config";
import type { LIGHT_DARK_MODE } from "@/types/config";

export function getDefaultHue(): number {
  const fallback = "250";
  const configCarrier = document.getElementById("config-carrier");
  return Number.parseInt(configCarrier?.dataset.hue || fallback);
}

export function getDefaultTheme(): LIGHT_DARK_MODE {
  return siteConfig.themeColor.defaultMode || DEFAULT_THEME;
}

export function getSystemPreference(): LIGHT_DARK_MODE {
  if (typeof window === "undefined") return LIGHT_MODE;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK_MODE
    : LIGHT_MODE;
}

export function resolveTheme(theme: LIGHT_DARK_MODE): LIGHT_DARK_MODE {
  if (theme === SYSTEM_MODE) {
    return getSystemPreference();
  }
  return theme;
}

export function getHue(): number {
  const stored = localStorage.getItem("hue");
  return stored ? Number.parseInt(stored) : getDefaultHue();
}

export function setHue(hue: number): void {
  localStorage.setItem("hue", String(hue));
  const r = document.querySelector(":root") as HTMLElement;
  if (!r) {
    return;
  }
  r.style.setProperty("--hue", String(hue));
}

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
  // 解析主题，如果是系统模式则获取系统偏好
  const resolvedTheme = resolveTheme(theme);

  // 获取当前主题状态的完整信息
  const currentIsDark = document.documentElement.classList.contains("dark");
  const currentTheme = document.documentElement.getAttribute("data-theme");

  // 计算目标主题状态
  let targetIsDark: boolean = false; // 初始化默认值
  switch (resolvedTheme) {
    case LIGHT_MODE:
      targetIsDark = false;
      break;
    case DARK_MODE:
      targetIsDark = true;
      break;
    default:
      // 处理默认情况，使用当前主题状态
      targetIsDark = currentIsDark;
      break;
  }

  // 检测是否真的需要主题切换：
  // 1. dark类状态是否改变
  // 2. expressiveCode主题是否需要更新
  const needsThemeChange = currentIsDark !== targetIsDark;
  const expectedTheme = targetIsDark ? "github-dark" : "github-light";
  const needsCodeThemeUpdate = currentTheme !== expectedTheme;

  // 如果既不需要主题切换也不需要代码主题更新，直接返回
  if (!needsThemeChange && !needsCodeThemeUpdate) {
    return;
  }

  // 只在需要主题切换时添加过渡保护
  if (needsThemeChange) {
    document.documentElement.classList.add("is-theme-transitioning");
  }

  // 使用 requestAnimationFrame 确保在下一帧执行，避免闪屏
  requestAnimationFrame(() => {
    // 应用主题变化
    if (needsThemeChange) {
      if (targetIsDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    // Set the theme for Expressive Code based on current mode
    const expressiveTheme = targetIsDark ? "github-dark" : "github-light";
    document.documentElement.setAttribute("data-theme", expressiveTheme);

    // 强制重新渲染代码块 - 解决从首页进入文章页面时的渲染问题
    if (needsCodeThemeUpdate) {
      // 触发 expressice code 重新渲染
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("theme-change"));
      }, 0);
    }

    // 在下一帧快速移除保护类，使用微任务确保DOM更新完成
    if (needsThemeChange) {
      // 使用 requestAnimationFrame 确保在下一帧移除过渡保护类
      requestAnimationFrame(() => {
        document.documentElement.classList.remove("is-theme-transitioning");
      });
    }
  });
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
  localStorage.setItem("theme", theme);
  applyThemeToDocument(theme);

  // 如果设置为系统模式，监听系统偏好变化
  if (theme === SYSTEM_MODE && typeof window !== "undefined") {
    setupSystemThemeListener();
  }
}

// 设置系统主题变化监听器
let systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null;

export function setupSystemThemeListener(): void {
  if (typeof window === "undefined") return;

  // 移除之前的监听器
  if (systemThemeListener) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .removeListener(systemThemeListener);
  }

  // 添加新的监听器
  systemThemeListener = (e: MediaQueryListEvent) => {
    const currentTheme = getStoredTheme();
    if (currentTheme === SYSTEM_MODE) {
      applyThemeToDocument(SYSTEM_MODE);
    }
  };

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addListener(systemThemeListener);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
  return (
    (localStorage.getItem("theme") as LIGHT_DARK_MODE) || getDefaultTheme()
  );
}
