
declare const suppressTypeScriptDeclarationErrors: () => {
  name: string;
  enforce: string;
  transform: (code: string, id: string) => { code: string; map: null } | null;
  configResolved: (config: any) => void;
};

// Add stronger typings for the TS6310 workaround
declare namespace TSEmitSuppression {
  interface PluginOptions {
    name: string;
    enforce: 'pre' | 'post';
    transform: (code: string, id: string) => { code: string; map: null } | null;
    configResolved: (config: any) => void;
  }
}

export default suppressTypeScriptDeclarationErrors;
