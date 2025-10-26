<script lang="ts">
import { DARK_MODE, LIGHT_MODE } from "@/constants/constants";
import Icon from "@iconify/svelte";
import {
	getStoredTheme,
	setTheme,
	applyThemeToDocument,
} from "@/utils/setting-utils";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";
import { onMount } from 'svelte';

const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE];
let mode: LIGHT_DARK_MODE = $state(LIGHT_MODE);

function switchScheme(newMode: LIGHT_DARK_MODE) {
	mode = newMode;
	setTheme(newMode);
}

function toggleScheme() {
	let i = 0;
	for (; i < seq.length; i++) {
		if (seq[i] === mode) {
			break;
		}
	}
	switchScheme(seq[(i + 1) % seq.length]);
}

// 使用onMount确保在组件挂载后正确初始化
onMount(() => {
	// 立即获取并设置正确的主题
	const storedTheme = getStoredTheme();
	mode = storedTheme;
	
	// 确保DOM状态与存储的主题一致
	const currentTheme = document.documentElement.classList.contains('dark') ? DARK_MODE : LIGHT_MODE;
	if (storedTheme !== currentTheme) {
		applyThemeToDocument(storedTheme);
	}
	
	// 添加Swup监听
	const handleContentReplace = () => {
		const newTheme = getStoredTheme();
		mode = newTheme;
	};
	
	// 检查Swup是否已经加载
	if ((window as any).swup && (window as any).swup.hooks) {
		(window as any).swup.hooks.on('content:replace', handleContentReplace);
	} else {
		document.addEventListener('swup:enable', () => {
			if ((window as any).swup && (window as any).swup.hooks) {
				(window as any).swup.hooks.on('content:replace', handleContentReplace);
			}
		});
	}
	
	// 监听主题变化事件
	const handleThemeChange = () => {
		const newTheme = getStoredTheme();
		mode = newTheme;
	};
	
	window.addEventListener('theme-change', handleThemeChange);
	
	// 清理函数
	return () => {
		window.removeEventListener('theme-change', handleThemeChange);
	};
});
</script>

<div class="relative z-50">
    <button aria-label="Light/Dark Mode" class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" id="scheme-switch" onclick={toggleScheme}>
        <div class="absolute" class:opacity-0={mode !== LIGHT_MODE}>
            <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
        <div class="absolute" class:opacity-0={mode !== DARK_MODE}>
            <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
    </button>
</div>