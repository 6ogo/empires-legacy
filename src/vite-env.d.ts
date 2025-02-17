/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly supabaseUrl: string
    readonly supabaseAnonKey: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }