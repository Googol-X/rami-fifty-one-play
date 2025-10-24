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
      <div className="bg-background/95 backdrop-blur-lg border-t border-border shadow-2xl">
        <div className="container mx-auto px-2 md:px-4 py-2 md:py-4">
          <div className="flex flex-wrap justify-center gap-1 md:gap-2">
            <Button
              onClick={handleDrawStock}
              disabled={!canAct}
              variant="default"
              size="sm"
              className="gap-1 md:gap-2 text-xs md:text-sm min-w-[80px] md:min-w-[100px] h-8 md:h-10"
            >
              🎴 <span className="hidden xs:inline">Piocher</span><span className="xs:hidden">Pioche</span>
            </Button>
            
            <Button
              onClick={handleDrawDiscard}
              disabled={!canAct}
              variant="secondary"
              size="sm"
              className="gap-1 md:gap-2 text-xs md:text-sm min-w-[80px] md:min-w-[100px] h-8 md:h-10"
            >
              ♻️ <span className="hidden xs:inline">Défausse</span><span className="xs:hidden">Déf.</span>
            </Button>

            {!hasOpened ? (
              <Button
                onClick={handleLayOpen}
                disabled={!canAct}
                variant="default"
                size="sm"
                className="gap-1 md:gap-2 text-xs md:text-sm bg-gradient-to-r from-primary to-primary/80 min-w-[80px] md:min-w-[100px] h-8 md:h-10"
              >
                ✨ <span className="hidden xs:inline">Poser 51</span><span className="xs:hidden">51</span>
              </Button>
            ) : (
              <Button
                onClick={handleLayMeld}
                disabled={!canAct}
                variant="default"
                size="sm"
                className="gap-1 md:gap-2 text-xs md:text-sm min-w-[80px] md:min-w-[100px] h-8 md:h-10"
              >
                🃏 <span className="hidden xs:inline">Poser</span><span className="xs:hidden">Poser</span>
              </Button>
            )}

            <Button
              onClick={handleDiscard}
              disabled={!canAct}
              variant="destructive"
              size="sm"
              className="gap-1 md:gap-2 text-xs md:text-sm min-w-[80px] md:min-w-[100px] h-8 md:h-10"
            >
              🗑️ <span className="hidden xs:inline">Défausser</span><span className="xs:hidden">Déf.</span>
            </Button>

            <Button
              onClick={handleEndTurn}
              disabled={!canAct}
              variant="outline"
              size="sm"
              className="gap-1 md:gap-2 text-xs md:text-sm min-w-[80px] md:min-w-[100px] h-8 md:h-10"
            >
              ⏭️ <span className="hidden xs:inline">Fin tour</span><span className="xs:hidden">Fin</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
