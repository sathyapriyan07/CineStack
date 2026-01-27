import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border border-white/20 bg-black/50 px-3 py-1 text-sm text-white shadow-sm outline-none transition placeholder:text-white/60 focus:border-red-500 focus:ring-1 focus:ring-red-500",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

