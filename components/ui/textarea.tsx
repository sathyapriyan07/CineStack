import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-xl bg-white/5 px-4 py-3 text-base text-white/90 soft-shadow outline-none transition-all duration-200 placeholder:text-white/50 focus-glow focus:bg-white/10 focus:border-blue-400 border border-white/10 backdrop-blur-md",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

