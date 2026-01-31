import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FloatingModal({ open, onClose, children, className, ...props }: FloatingModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: "circOut" }}
          onClick={onClose}
        >
          <motion.div
            className={cn("glass rounded-2xl shadow-soft p-8 max-w-lg w-full relative", className)}
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.24, ease: "circOut" }}
            onClick={e => e.stopPropagation()}
            {...props}
          >
            {children}
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white/90 text-2xl font-light focus-glow"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
