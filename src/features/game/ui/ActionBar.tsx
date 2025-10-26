import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { audioService } from '@/utils/audioService';

interface ActionBarProps {
  onDrawStock: () => void;
  onDrawDiscard: () => void;
  onLayOpen: () => void;
  onLayMeld: () => void;
  onDiscard: () => void;
  onEndTurn: () => void;
  hasOpened: boolean;
  canAct: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onDrawStock,
  onDrawDiscard,
  onLayOpen,
  onLayMeld,
  onDiscard,
  onEndTurn,
  hasOpened,
  canAct
}) => {
  const handleDrawStock = () => {
    audioService.playDraw();
    onDrawStock();
  };

  const handleDrawDiscard = () => {
    audioService.playDraw();
    onDrawDiscard();
  };

  const handleLayOpen = () => {
    audioService.playLayMeld();
    onLayOpen();
  };

  const handleLayMeld = () => {
    audioService.playLayMeld();
    onLayMeld();
  };

  const handleDiscard = () => {
    audioService.playDiscard();
    onDiscard();
  };

  const handleEndTurn = () => {
    audioService.playTurnChange();
    onEndTurn();
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="bg-gradient-to-t from-background via-background to-transparent backdrop-blur-xl border-t-2 border-primary/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-3 md:px-6 py-2 md:py-3">
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
            <Button
              onClick={handleDrawStock}
              disabled={!canAct}
              variant="default"
              size="sm"
              className="gap-1.5 text-xs md:text-sm font-bold min-w-[90px] md:min-w-[110px] h-9 md:h-11 shadow-lg hover:shadow-primary/30 transition-all"
            >
              🎴 <span className="hidden sm:inline">Piocher</span><span className="sm:hidden">Pioche</span>
            </Button>
            
            <Button
              onClick={handleDrawDiscard}
              disabled={!canAct}
              variant="secondary"
              size="sm"
              className="gap-1.5 text-xs md:text-sm font-bold min-w-[90px] md:min-w-[110px] h-9 md:h-11 shadow-lg hover:shadow-accent/20 transition-all"
            >
              ♻️ <span className="hidden sm:inline">Défausse</span><span className="sm:hidden">Déf.</span>
            </Button>

            {!hasOpened ? (
              <Button
                onClick={handleLayOpen}
                disabled={!canAct}
                variant="default"
                size="sm"
                className="gap-1.5 text-xs md:text-sm font-bold bg-gradient-to-r from-primary via-primary to-primary/90 min-w-[90px] md:min-w-[110px] h-9 md:h-11 shadow-lg shadow-primary/40 hover:shadow-primary/60 transition-all"
              >
                ✨ <span className="hidden sm:inline">Poser 51</span><span className="sm:hidden">51</span>
              </Button>
            ) : (
              <Button
                onClick={handleLayMeld}
                disabled={!canAct}
                variant="default"
                size="sm"
                className="gap-1.5 text-xs md:text-sm font-bold min-w-[90px] md:min-w-[110px] h-9 md:h-11 shadow-lg hover:shadow-primary/30 transition-all"
              >
                🃏 <span className="hidden sm:inline">Poser</span><span className="sm:hidden">Poser</span>
              </Button>
            )}

            <Button
              onClick={handleDiscard}
              disabled={!canAct}
              variant="destructive"
              size="sm"
              className="gap-1.5 text-xs md:text-sm font-bold min-w-[90px] md:min-w-[110px] h-9 md:h-11 shadow-lg hover:shadow-destructive/30 transition-all"
            >
              🗑️ <span className="hidden sm:inline">Défausser</span><span className="sm:hidden">Déf.</span>
            </Button>

            <Button
              onClick={handleEndTurn}
              disabled={!canAct}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs md:text-sm font-bold border-2 min-w-[90px] md:min-w-[110px] h-9 md:h-11 shadow-lg hover:bg-primary/10 hover:border-primary transition-all"
            >
              ⏭️ <span className="hidden sm:inline">Fin tour</span><span className="sm:hidden">Fin</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
