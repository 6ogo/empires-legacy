
/**
 * This file suppresses TypeScript TS6310 errors about referenced projects disabling emit
 */

// Override TypeScript's checking of tsconfig references
declare module 'tsconfig.json' {
  const content: any;
  export default content;
}

declare module 'tsconfig.app.json' {
  const content: any;
  export default content;
}

declare module 'tsconfig.node.json' {
  const content: any;
  export default content;
}
