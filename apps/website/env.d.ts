import type { TemplateCardData } from './scripts/render';

// Rspress sets import.meta.env.SSG_MD during the llms.txt markdown pass but ships no type for it.
// `declare global` because the shared tsconfig forces every file to be a module.
declare global {
  interface ImportMetaEnv {
    readonly SSG_MD: boolean;
    /** Defines from rspress.config.ts: the design-system version and the templates, in page order. */
    readonly DS_VERSION: string;
    readonly TEMPLATES: TemplateCardData[];
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
