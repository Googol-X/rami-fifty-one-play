import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ScoreboardProps {
  meldsCount: number;
  stockCount: number;
  roundNumber: number;
  onQuit?: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  meldsCount,
  stockCount,
  roundNumber,
  onQuit
}) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-40"
    >
      <div className="bg-background/95 backdrop-blur-lg border-b border-border shadow-lg">
        <div className="container mx-auto px-2 md:px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-6">
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-lg md:text-2xl">🏆</span>
                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Melds</p>
                  <p className="text-sm md:text-lg font-bold text-foreground">{meldsCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-lg md:text-2xl">🎴</span>
                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Pioche</p>
                  <p className="text-sm md:text-lg font-bold text-foreground">{stockCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-lg md:text-2xl">🔥</span>
                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Tour</p>
                  <p className="text-sm md:text-lg font-bold text-foreground">{roundNumber}</p>
                </div>
              </div>
            </div>

            {onQuit && (
              <Button
                onClick={onQuit}
                variant="ghost"
                size="sm"
                className="gap-1 md:gap-2 h-7 md:h-9"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">Quitter</span>
                <span className="md:hidden">✕</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
