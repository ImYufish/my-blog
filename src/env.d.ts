/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly MEILI_MASTER_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
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
  }
}
