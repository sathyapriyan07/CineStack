import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white/90 shadow-sm outline-none transition placeholder:text-white/40 focus:border-[--accent] focus:ring-1 focus:ring-[--accent]",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

