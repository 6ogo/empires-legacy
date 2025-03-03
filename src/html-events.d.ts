
/**
 * HTML Event Types for Empire's Legacy
 * This file ensures proper type definitions for HTML elements and events
 */

// Triple-slash directives
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// Extend HTMLInputElement and EventTarget for proper event handling
interface HTMLInputElement extends HTMLElement {
  value: string;
}

// Ensure EventTarget has value property for form input events
interface EventTarget {
  value: string;
}

// Ensure proper KeyboardEvent typing
interface KeyboardEvent extends Event {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  code: string;
}

// Make this a module
export {};
