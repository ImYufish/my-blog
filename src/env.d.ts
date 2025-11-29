/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly MEILI_MASTER_KEY: string;
}

declare global {
  interface Window {
    SidebarTOC: {
      manager: any;
    };
    FloatingTOC: {
      btn: HTMLElement | null;
      panel: HTMLElement | null;
      manager: any;
      isPostPage: () => boolean;
    };
    toggleFloatingTOC: () => void;
    tocInternalNavigation: boolean;
    iconifyLoaded: boolean;
    swup: any;
    spine: any;
    closeAnnouncement: () => void;
    __iconifyLoader: any;
    __iconifyLoaderInitialized: boolean;
    loadIconify: () => Promise<void>;
    preloadIcons: (icons: string | string[]) => void;
    onIconifyReady: (callback: () => void) => void;
  }
}

export {};
