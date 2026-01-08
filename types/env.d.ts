/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly NUXT_PUBLIC_DIRECTUS_URL: string;
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
