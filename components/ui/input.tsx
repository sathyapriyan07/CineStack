import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl bg-white/5 px-4 py-2 text-base text-white soft-shadow outline-none transition-all duration-200 placeholder:text-white/60 focus-glow focus:bg-white/10 focus:border-blue-400 border border-white/10 backdrop-blur-md",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

