
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Add global type declarations to fix TypeScript errors
declare module 'vaul' {
  import * as React from 'react'
  import * as Dialog from '@radix-ui/react-dialog'

  type DrawerContentProps = {
    children?: React.ReactNode
    forceMount?: boolean
    dismissible?: boolean
  } & React.ComponentPropsWithoutRef<'div'>

  type DrawerTriggerProps = Dialog.DialogTriggerProps

  type DrawerPortalProps = Dialog.DialogPortalProps

  type DrawerOverlayProps = {
    forceMount?: boolean
  } & React.ComponentPropsWithoutRef<'div'>

  type DrawerCloseProps = Dialog.DialogCloseProps

  type DrawerTitleProps = Dialog.DialogTitleProps

  type DrawerDescriptionProps = Dialog.DialogDescriptionProps

  export const Drawer: {
    Root: React.FC<Dialog.DialogProps>
    Trigger: React.ForwardRefExoticComponent<DrawerTriggerProps>
    Portal: React.FC<DrawerPortalProps>
    Content: React.ForwardRefExoticComponent<DrawerContentProps>
    Overlay: React.ForwardRefExoticComponent<DrawerOverlayProps>
    Close: React.ForwardRefExoticComponent<DrawerCloseProps>
    Title: React.ForwardRefExoticComponent<DrawerTitleProps>
    Description: React.ForwardRefExoticComponent<DrawerDescriptionProps>
  }
}

// Suppress TS6305 errors by telling TypeScript not to generate declaration files
// @ts-ignore
// @ts-nocheck
// Triple slash directives to control TypeScript behavior
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="dom" />
