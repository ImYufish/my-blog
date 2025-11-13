import { sidebarLayoutConfig } from '../config';
import { widgetManager } from './widget-manager';

// 响应式侧边栏配置
export const getResponsiveSidebarConfig = () => {
	const globalSidebarEnabled = sidebarLayoutConfig.enable;
	const sidebarPosition = sidebarLayoutConfig.position || "left";
	const isBothSidebars = sidebarPosition === "both";
	const autoHideConfig = sidebarLayoutConfig.responsive?.autoHide;
	
	return {
		globalSidebarEnabled,
		sidebarPosition,
		isBothSidebars,
		mobileShowSidebar: globalSidebarEnabled && widgetManager.shouldShowSidebar("mobile"),
		tabletShowSidebar: globalSidebarEnabled && widgetManager.shouldShowSidebar("tablet"),
		desktopShowSidebar: globalSidebarEnabled && widgetManager.shouldShowSidebar("desktop"),
		// 检查左右侧边栏是否有组件
		hasLeftComponents: isBothSidebars && widgetManager.hasComponentsInSidebar("left"),
		hasRightComponents: isBothSidebars && widgetManager.hasComponentsInSidebar("right"),
		// 自动隐藏配置
		autoHide: autoHideConfig,
	};
};

// 生成网格布局类名
export const generateGridClasses = (config: ReturnType<typeof getResponsiveSidebarConfig>) => {
	const { mobileShowSidebar, tabletShowSidebar, desktopShowSidebar, sidebarPosition, isBothSidebars, hasLeftComponents, hasRightComponents, autoHide } = config;
	
	let gridCols = "";
	
	// 检查是否启用自动隐藏并且当前处于断点以下
	const shouldAutoHide = autoHide?.enable && isBothSidebars;
	const hideLeft = shouldAutoHide && autoHide?.hideSide === "left";
	const hideRight = shouldAutoHide && autoHide?.hideSide === "right";
	const breakpoint = autoHide?.breakpoint || "xl"; // 默认使用 xl
	
	if (isBothSidebars) {
		// 双侧边栏布局 - 根据实际有无组件决定布局
		if (hasLeftComponents && hasRightComponents) {
			// 左右都有组件:三栏布局
			if (shouldAutoHide) {
				// 启用自动隐藏时，在指定断点以下变为两栏布局
				gridCols = `
					${mobileShowSidebar ? "grid-cols-1" : "grid-cols-1"}
					${tabletShowSidebar ? (hideRight ? "md:grid-cols-[17.5rem_1fr]" : "md:grid-cols-[1fr_17.5rem]") : "md:grid-cols-1"}
					${desktopShowSidebar ? (hideRight ? "lg:grid-cols-[17.5rem_1fr]" : "lg:grid-cols-[1fr_17.5rem]") : "lg:grid-cols-1"}
					${breakpoint}:grid-cols-[17.5rem_1fr_17.5rem]
				`.trim().replace(/\s+/g, " ");
			} else {
				gridCols = `
					${mobileShowSidebar ? "grid-cols-1" : "grid-cols-1"}
					${tabletShowSidebar ? "md:grid-cols-[17.5rem_1fr_17.5rem]" : "md:grid-cols-1"}
					${desktopShowSidebar ? "lg:grid-cols-[17.5rem_1fr_17.5rem]" : "lg:grid-cols-1"}
				`.trim().replace(/\s+/g, " ");
			}
		} else if (hasLeftComponents) {
			// 只有左侧:两栏布局
			gridCols = `
				${mobileShowSidebar ? "grid-cols-1" : "grid-cols-1"}
				${tabletShowSidebar ? "md:grid-cols-[17.5rem_1fr]" : "md:grid-cols-1"}
				${desktopShowSidebar ? "lg:grid-cols-[17.5rem_1fr]" : "lg:grid-cols-1"}
			`.trim().replace(/\s+/g, " ");
		} else if (hasRightComponents) {
			// 只有右侧:两栏布局
			gridCols = `
				${mobileShowSidebar ? "grid-cols-1" : "grid-cols-1"}
				${tabletShowSidebar ? "md:grid-cols-[1fr_17.5rem]" : "md:grid-cols-1"}
				${desktopShowSidebar ? "lg:grid-cols-[1fr_17.5rem]" : "lg:grid-cols-1"}
			`.trim().replace(/\s+/g, " ");
		} else {
			// 都没有:单栏布局
			gridCols = "grid-cols-1";
		}
	} else {
		// 单侧边栏布局
		gridCols = `
			${mobileShowSidebar ? "grid-cols-1" : "grid-cols-1"}
			${tabletShowSidebar ? (sidebarPosition === "right" ? "md:grid-cols-[1fr_17.5rem]" : "md:grid-cols-[17.5rem_1fr]") : "md:grid-cols-1"}
			${desktopShowSidebar ? (sidebarPosition === "right" ? "lg:grid-cols-[1fr_17.5rem]" : "lg:grid-cols-[17.5rem_1fr]") : "lg:grid-cols-1"}
		`.trim().replace(/\s+/g, " ");
	}

	return { gridCols };
};

// 生成侧边栏类名（用于单侧边栏或双侧边栏中的左侧）
export const generateSidebarClasses = (config: ReturnType<typeof getResponsiveSidebarConfig>) => {
	const { mobileShowSidebar, tabletShowSidebar, desktopShowSidebar, sidebarPosition, isBothSidebars, autoHide } = config;
	
	if (isBothSidebars) {
		// 检查是否应该在中等屏幕隐藏左侧边栏
		const shouldAutoHideLeft = autoHide?.enable && autoHide?.hideSide === "left";
		const breakpoint = autoHide?.breakpoint || "xl";
		
		// 左侧边栏
		if (shouldAutoHideLeft) {
			// 启用自动隐藏左侧时，在指定断点以下隐藏
			return `
				mb-4 row-start-2 row-end-3 col-span-2 onload-animation
				${mobileShowSidebar ? "block" : "hidden"}
				md:hidden lg:hidden
				${breakpoint}:block ${breakpoint}:row-start-1 ${breakpoint}:row-end-2 ${breakpoint}:max-w-[17.5rem] ${breakpoint}:col-start-1 ${breakpoint}:col-end-2
			`.trim().replace(/\s+/g, " ");
		}
		
		return `
			mb-4 row-start-2 row-end-3 col-span-2 onload-animation
			${mobileShowSidebar ? "block" : "hidden"}
			${tabletShowSidebar ? "md:block md:row-start-1 md:row-end-2 md:max-w-[17.5rem] md:col-start-1 md:col-end-2" : "md:hidden"}
			${desktopShowSidebar ? "lg:block lg:row-start-1 lg:row-end-2 lg:max-w-[17.5rem] lg:col-start-1 lg:col-end-2" : "lg:hidden"}
		`.trim().replace(/\s+/g, " ");
	}
	
	return `
		mb-4 row-start-2 row-end-3 col-span-2 onload-animation
		${mobileShowSidebar ? "block" : "hidden"}
		${tabletShowSidebar ? `md:block md:row-start-1 md:row-end-2 md:max-w-[17.5rem] ${sidebarPosition === "right" ? "md:col-start-2 md:col-end-3" : "md:col-start-1 md:col-end-2"}` : "md:hidden"}
		${desktopShowSidebar ? `lg:block lg:row-start-1 lg:row-end-2 lg:max-w-[17.5rem] ${sidebarPosition === "right" ? "lg:col-start-2 lg:col-end-3" : "lg:col-start-1 lg:col-end-2"}` : "lg:hidden"}
	`.trim().replace(/\s+/g, " ");
};

// 生成右侧边栏类名（仅用于双侧边栏）
export const generateRightSidebarClasses = (config: ReturnType<typeof getResponsiveSidebarConfig>) => {
	const { mobileShowSidebar, tabletShowSidebar, desktopShowSidebar, hasLeftComponents, autoHide } = config;
	
	// 检查是否应该在中等屏幕隐藏右侧边栏
	const shouldAutoHideRight = autoHide?.enable && autoHide?.hideSide === "right";
	const breakpoint = autoHide?.breakpoint || "xl";
	
	// 根据是否有左侧边栏决定列位置
	const tabletCol = hasLeftComponents ? "md:col-start-3 md:col-end-4" : "md:col-start-2 md:col-end-3";
	const desktopCol = hasLeftComponents ? "lg:col-start-3 lg:col-end-4" : "lg:col-start-2 lg:col-end-3";
	const breakpointCol = hasLeftComponents ? `${breakpoint}:col-start-3 ${breakpoint}:col-end-4` : `${breakpoint}:col-start-2 ${breakpoint}:col-end-3`;
	
	if (shouldAutoHideRight) {
		// 启用自动隐藏右侧时，在指定断点以下隐藏
		return `
			mb-4 row-start-3 row-end-4 col-span-2 onload-animation
			${mobileShowSidebar ? "block" : "hidden"}
			md:hidden lg:hidden
			${breakpoint}:block ${breakpoint}:row-start-1 ${breakpoint}:row-end-2 ${breakpoint}:max-w-[17.5rem] ${breakpointCol}
		`.trim().replace(/\s+/g, " ");
	}
	
	return `
		mb-4 row-start-3 row-end-4 col-span-2 onload-animation
		${mobileShowSidebar ? "block" : "hidden"}
		${tabletShowSidebar ? `md:block md:row-start-1 md:row-end-2 md:max-w-[17.5rem] ${tabletCol}` : "md:hidden"}
		${desktopShowSidebar ? `lg:block lg:row-start-1 lg:row-end-2 lg:max-w-[17.5rem] ${desktopCol}` : "lg:hidden"}
	`.trim().replace(/\s+/g, " ");
};

// 生成主内容类名
export const generateMainContentClasses = (config: ReturnType<typeof getResponsiveSidebarConfig>) => {
	const { mobileShowSidebar, tabletShowSidebar, desktopShowSidebar, sidebarPosition, isBothSidebars, autoHide } = config;
	
	if (isBothSidebars) {
		// 双侧边栏布局：主内容区位置根据实际布局调整
		const { hasLeftComponents, hasRightComponents } = config;
		const shouldAutoHide = autoHide?.enable;
		const hideLeft = shouldAutoHide && autoHide?.hideSide === "left";
		const hideRight = shouldAutoHide && autoHide?.hideSide === "right";
		const breakpoint = autoHide?.breakpoint || "xl";
		
		if (hasLeftComponents && hasRightComponents) {
			// 三栏布局:主内容在中间
			if (shouldAutoHide) {
				// 启用自动隐藏时，中等屏幕下主内容区位置会变化
				return `
					transition-swup-fade overflow-hidden w-full
					${mobileShowSidebar ? "col-span-2" : "col-span-1"}
					${tabletShowSidebar ? (hideRight ? "md:col-start-2 md:col-end-3" : "md:col-start-1 md:col-end-2") : "md:col-span-1"}
					${desktopShowSidebar ? (hideRight ? "lg:col-start-2 lg:col-end-3" : "lg:col-start-1 lg:col-end-2") : "lg:col-span-1"}
					${breakpoint}:col-start-2 ${breakpoint}:col-end-3
				`.trim().replace(/\s+/g, " ");
			}
			return `
				transition-swup-fade overflow-hidden w-full
				${mobileShowSidebar ? "col-span-2" : "col-span-1"}
				${tabletShowSidebar ? "md:col-start-2 md:col-end-3" : "md:col-span-1"}
				${desktopShowSidebar ? "lg:col-start-2 lg:col-end-3" : "lg:col-span-1"}
			`.trim().replace(/\s+/g, " ");
		} else if (hasLeftComponents) {
			// 左侧边栏+主内容
			return `
				transition-swup-fade overflow-hidden w-full
				${mobileShowSidebar ? "col-span-2" : "col-span-1"}
				${tabletShowSidebar ? "md:col-start-2 md:col-end-3" : "md:col-span-1"}
				${desktopShowSidebar ? "lg:col-start-2 lg:col-end-3" : "lg:col-span-1"}
			`.trim().replace(/\s+/g, " ");
		} else if (hasRightComponents) {
			// 主内容+右侧边栏
			return `
				transition-swup-fade overflow-hidden w-full
				${mobileShowSidebar ? "col-span-2" : "col-span-1"}
				${tabletShowSidebar ? "md:col-start-1 md:col-end-2" : "md:col-span-1"}
				${desktopShowSidebar ? "lg:col-start-1 lg:col-end-2" : "lg:col-span-1"}
			`.trim().replace(/\s+/g, " ");
		} else {
			// 只有主内容
			return "transition-swup-fade overflow-hidden w-full col-span-1";
		}
	}
	
	return `
		transition-swup-fade overflow-hidden w-full
		${mobileShowSidebar ? "col-span-2" : "col-span-1"}
		${tabletShowSidebar ? `${sidebarPosition === "right" ? "md:col-start-1 md:col-end-2" : "md:col-start-2 md:col-end-3"}` : "md:col-span-1"}
		${desktopShowSidebar ? `${sidebarPosition === "right" ? "lg:col-start-1 lg:col-end-2" : "lg:col-start-2 lg:col-end-3"}` : "lg:col-span-1"}
	`.trim().replace(/\s+/g, " ");
};
