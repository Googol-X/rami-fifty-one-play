import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AvatarHudProps {
  name: string;
  avatarUrl?: string;
  isTurn: boolean;
  timeLeftMs: number;
  timeTotalMs: number;
  score?: number;
  position?: 'top' | 'bottom';
}

export function AvatarHud({ 
  name, 
  avatarUrl, 
  isTurn, 
  timeLeftMs, 
  timeTotalMs, 
  score,
  position = 'top' 
}: AvatarHudProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (timeLeftMs <= 0 || timeTotalMs <= 0) {
      setProgress(0);
      return;
    }
    setProgress((timeLeftMs / timeTotalMs) * 100);
  }, [timeLeftMs, timeTotalMs]);

  const circumference = 2 * Math.PI * 20; // radius = 20
  const offset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className={cn(
        "relative inline-flex items-center gap-3 px-3 py-2 rounded-2xl",
        "bg-secondary/90 backdrop-blur-md border-2 transition-all duration-300",
        isTurn ? "border-primary shadow-lg shadow-primary/40" : "border-border shadow-md"
      )}
      animate={isTurn ? {
        boxShadow: [
          '0 4px 16px rgba(255, 213, 74, 0.4)',
          '0 4px 24px rgba(255, 213, 74, 0.6)',
          '0 4px 16px rgba(255, 213, 74, 0.4)',
        ]
      } : {}}
      transition={{ duration: 1.5, repeat: isTurn ? Infinity : 0 }}
    >
      {/* Avatar avec anneau de timer */}
      <div className="relative">
        <svg className="absolute -inset-1 w-12 h-12 -rotate-90" aria-hidden="true">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-border/30"
          />
          {/* Progress circle */}
          {isTurn && (
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-200",
                progress > 50 ? "text-primary" : 
                progress > 25 ? "text-accent" : 
                "text-destructive"
              )}
            />
          )}
        </svg>
        
        <div className={cn(
          "relative w-10 h-10 rounded-full overflow-hidden border-2",
          "flex items-center justify-center text-lg font-bold",
          isTurn ? "border-primary bg-primary/20" : "border-border bg-secondary"
        )}>
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-primary">{name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        {/* Indicateur tour actif */}
        {isTurn && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>

      {/* Info joueur */}
      <div className="flex flex-col min-w-[80px]">
        <span className={cn(
          "text-sm font-semibold transition-colors",
          isTurn ? "text-primary" : "text-foreground"
        )}>
          {name}
        </span>
        {score !== undefined && (
          <span className="text-xs text-muted-foreground">
            {score} pts
          </span>
        )}
      </div>

      {/* Timer numérique (optionnel, affiché seulement si < 10s) */}
      {isTurn && timeLeftMs < 10000 && timeLeftMs > 0 && (
        <motion.span
          className={cn(
            "text-xs font-mono font-bold",
            timeLeftMs < 5000 ? "text-destructive" : "text-accent"
          )}
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {Math.ceil(timeLeftMs / 1000)}s
        </motion.span>
      )}
    </motion.div>
  );
}
