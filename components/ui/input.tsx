import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border border-white/15 bg-slate-950 px-3 py-1 text-sm text-white/90 shadow-sm outline-none transition placeholder:text-white/40 focus:border-[--accent] focus:ring-1 focus:ring-[--accent]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

