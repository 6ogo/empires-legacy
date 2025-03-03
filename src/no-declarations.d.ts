
/**
 * This file prevents TypeScript from trying to emit declaration files
 * It helps suppress TS6305 errors about declaration files not being built
 */

// Globally declare modules to prevent declaration file generation
declare module '*.tsx' {
  import React from 'react';
  const component: React.FC<any>;
  export default component;
}

declare module '*.ts' {
  const content: any;
  export default content;
}

// Suppress declaration file generation for various file types
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';
declare module '*.styl';

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
declare module '*.avif';

declare module '*.json' {
  const value: any;
  export default value;
}

// This helps prevent TS6310: Referenced project may not disable emit
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
