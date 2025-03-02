
// This file helps prevent TypeScript from generating declaration files

declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

// Set environment variables to help control TypeScript behavior
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TS_NODE_EMIT: 'false';
      TS_NODE_PRETTY: 'false';
      SKIP_PREFLIGHT_CHECK: 'true';
    }
  }
}
