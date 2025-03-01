
import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

// Properly type the drawer root component
type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root>
const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: DrawerProps) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)
Drawer.displayName = "Drawer"

// Define a generic type for the Drawer component forwardRefs
type DrawerComponent<T = any> = {
  displayName?: string
} & React.ForwardRefExoticComponent<
  React.PropsWithoutRef<T> & React.RefAttributes<HTMLElement>
>

// Add explicit type annotation for DrawerTrigger
const DrawerTrigger: DrawerComponent<React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Trigger>> = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Trigger>
>((props, ref) => (
  <DrawerPrimitive.Trigger ref={ref} {...props} />
))
DrawerTrigger.displayName = DrawerPrimitive.Trigger.displayName

// Portal doesn't accept a ref, so use function component declaration
const DrawerPortal = (props: React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Portal>) => (
  <DrawerPrimitive.Portal {...props} />
)
DrawerPortal.displayName = DrawerPrimitive.Portal.displayName

// Add explicit type annotation for DrawerClose
const DrawerClose: DrawerComponent<React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close>> = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close>
>((props, ref) => (
  <DrawerPrimitive.Close ref={ref} {...props} />
))
DrawerClose.displayName = DrawerPrimitive.Close.displayName

// Add explicit type annotation for DrawerOverlay
const DrawerOverlay: DrawerComponent<React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>> = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay> & {
    className?: string
  }
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

// Add explicit type annotation for DrawerContent
const DrawerContent: DrawerComponent<React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>> = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    className?: string
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

// Regular div component with better typing
interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const DrawerHeader = ({
  className,
  ...props
}: DrawerHeaderProps) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

// Regular div component with better typing
interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const DrawerFooter = ({
  className,
  ...props
}: DrawerFooterProps) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

// Add explicit type annotation for DrawerTitle
const DrawerTitle: DrawerComponent<React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>> = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title> & {
    className?: string
  }
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

// Add explicit type annotation for DrawerDescription
const DrawerDescription: DrawerComponent<React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>> = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description> & {
    className?: string
  }
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
