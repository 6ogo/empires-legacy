
/**
 * Declaration file for the vite-ts-suppression module
 */
declare module './src/vite-ts-suppression.js' {
  const suppressTypeScriptDeclarationErrors: () => {
    name: string;
    enforce: string;
    transform: (code: string, id: string) => { code: string; map: null } | null;
    configResolved: (config: any) => void;
  };
  export default suppressTypeScriptDeclarationErrors;
}
