import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  message: string;
  timestamp: number;
}

interface MiniLogProps {
  entries: LogEntry[];
  maxEntries?: number;
}

export function MiniLog({ entries, maxEntries = 3 }: MiniLogProps) {
  const visibleEntries = entries.slice(-maxEntries);

  return (
    <div 
      className="fixed bottom-24 right-4 z-30 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {visibleEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "mb-2 px-3 py-1.5 rounded-lg",
              "bg-secondary/90 backdrop-blur-sm border border-border",
              "text-xs text-foreground shadow-md"
            )}
          >
            {entry.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
