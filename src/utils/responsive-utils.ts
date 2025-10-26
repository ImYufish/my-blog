import { sidebarLayoutConfig } from '../config';
import { widgetManager } from './widget-manager';

// 响应式侧边栏配置
export const getResponsiveSidebarConfig = () => {
	const globalSidebarEnabled = sidebarLayoutConfig.enable;
	const sidebarPosition = sidebarLayoutConfig.position || "left";
	
	return {
		globalSidebarEnabled,
		sidebarPosition,
		mobileShowSidebar: globalSidebarEnabled && widgetManager.shouldShowSidebar("mobile"),
		tabletShowSidebar: globalSidebarEnabled && widgetManager.shouldShowSidebar("tablet"),
		desktopShowSidebar: globalSidebarEnabled && widgetManager.shouldShowSidebar("desktop"),
	};
};

// 生成网格布局类名
export const generateGridClasses = (config: ReturnType<typeof getResponsiveSidebarConfig>) => {
	const { mobileShowSidebar, tabletShowSidebar, desktopShowSidebar, sidebarPosition } = config;
	
	const gridCols = `
		${mobileShowSidebar ? "grid-cols-1" : "grid-cols-1"}
		${tabletShowSidebar ? (sidebarPosition === "right" ? "md:grid-cols-[1fr_17.5rem]" : "md:grid-cols-[17.5rem_1fr]") : "md:grid-cols-1"}
		${desktopShowSidebar ? (sidebarPosition === "right" ? "lg:grid-cols-[1fr_17.5rem]" : "lg:grid-cols-[17.5rem_1fr]") : "lg:grid-cols-1"}
	`.trim().replace(/\s+/g, " ");

	return { gridCols };
};

// 生成侧边栏类名
export const generateSidebarClasses = (config: ReturnType<typeof getResponsiveSidebarConfig>) => {
	const { mobileShowSidebar, tabletShowSidebar, desktopShowSidebar, sidebarPosition } = config;
	
	return `
		mb-4 row-start-2 row-end-3 col-span-2 onload-animation
		${mobileShowSidebar ? "block" : "hidden"}
		${tabletShowSidebar ? `md:block md:row-start-1 md:row-end-2 md:max-w-[17.5rem] ${sidebarPosition === "right" ? "md:col-start-2 md:col-end-3" : "md:col-start-1 md:col-end-2"}` : "md:hidden"}
		${desktopShowSidebar ? `lg:block lg:row-start-1 lg:row-end-2 lg:max-w-[17.5rem] ${sidebarPosition === "right" ? "lg:col-start-2 lg:col-end-3" : "lg:col-start-1 lg:col-end-2"}` : "lg:hidden"}
	`.trim().replace(/\s+/g, " ");
};

// 生成主内容类名
export const generateMainContentClasses = (config: ReturnType<typeof getResponsiveSidebarConfig>) => {
	const { mobileShowSidebar, tabletShowSidebar, desktopShowSidebar, sidebarPosition } = config;
	
	return `
		transition-swup-fade overflow-hidden w-full
		${mobileShowSidebar ? "col-span-2" : "col-span-1"}
		${tabletShowSidebar ? `${sidebarPosition === "right" ? "md:col-start-1 md:col-end-2" : "md:col-start-2 md:col-end-3"}` : "md:col-span-1"}
		${desktopShowSidebar ? `${sidebarPosition === "right" ? "lg:col-start-1 lg:col-end-2" : "lg:col-start-2 lg:col-end-3"}` : "lg:col-span-1"}
	`.trim().replace(/\s+/g, " ");
};
