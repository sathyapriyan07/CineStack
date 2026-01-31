import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-glow soft-shadow disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 text-white hover:bg-white/20 active:bg-white/30 backdrop-blur-md",
        outline:
          "border border-white/20 bg-transparent text-white/90 hover:bg-white/10 hover:border-blue-400",
        ghost: "bg-transparent hover:bg-white/10 text-white/85 hover:text-blue-400",
        soft: "bg-white/5 text-white/90 hover:bg-white/15",
        destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-500",
      },
      size: {
        default: "h-11 px-7 text-lg",
        sm: "h-9 px-4 text-base",
        lg: "h-14 px-10 text-xl",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface SoftButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const SoftButton = forwardRef<HTMLButtonElement, SoftButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
SoftButton.displayName = "SoftButton";
