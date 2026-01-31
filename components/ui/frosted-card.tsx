import * as React from "react";
import { cn } from "@/lib/utils";

const FrostedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "frosted rounded-2xl shadow-soft backdrop-blur-lg border-0 text-white/90 transition-all duration-200",
      className
    )}
    {...props}
  />
));
FrostedCard.displayName = "FrostedCard";

const FrostedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-8 pb-0", className)}
    {...props}
  />
));
FrostedCardHeader.displayName = "FrostedCardHeader";

const FrostedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-3xl font-light leading-tight tracking-tight text-white drop-shadow-md",
      className
    )}
    {...props}
  />
));
FrostedCardTitle.displayName = "FrostedCardTitle";

const FrostedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-8", className)} {...props} />
));
FrostedCardContent.displayName = "FrostedCardContent";

const FrostedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-8 pt-0", className)}
    {...props}
  />
));
FrostedCardFooter.displayName = "FrostedCardFooter";

export { FrostedCard, FrostedCardHeader, FrostedCardFooter, FrostedCardTitle, FrostedCardContent };
