
/**
 * DOM type declarations for Empire's Legacy
 * This file provides TypeScript type definitions for DOM objects and interfaces
 */

// Triple-slash directives for basic DOM libraries
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="es2020" />

// Declare Window interfaces
interface Window {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
}

// Declare Document interfaces
interface Document {
  createElement(tagName: string): HTMLElement;
  getElementById(elementId: string): HTMLElement | null;
}

// Declare HTMLElement interfaces
interface HTMLElement {
  clientWidth: number;
  clientHeight: number;
  getBoundingClientRect(): DOMRect;
  appendChild(node: Node): Node;
  removeChild(child: Node): Node;
}

// Extend specific HTML element interfaces
interface HTMLDivElement extends HTMLElement {}
interface HTMLCanvasElement extends HTMLElement {
  getContext(contextId: '2d'): CanvasRenderingContext2D | null;
  width: number;
  height: number;
}

// Declare Event interfaces
interface Event {
  preventDefault(): void;
}

interface KeyboardEvent extends Event {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
}

// Extend EventTarget to include value property
interface EventTarget {
  value?: string;
}

// Define HTML input element
interface HTMLInputElement extends HTMLElement {
  value: string;
}

// Define Navigator
interface Navigator {
  clipboard: {
    writeText(text: string): Promise<void>;
  };
}

// HTML Table elements
interface HTMLTableCellElement extends HTMLElement {}
interface HTMLTableCaptionElement extends HTMLElement {}

// Declare global objects
declare global {
  const window: Window & typeof globalThis;
  const document: Document;
  const navigator: Navigator;
}

// Make this a module
export {};
