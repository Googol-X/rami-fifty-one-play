import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { audioService } from '@/utils/audioService';
import { soundManager } from '@/lib/sound';
import { haptics } from '@/lib/haptics';

interface ActionBarProps {
  onDrawStock: () => void;
  onDrawDiscard: () => void;
  onLayOpen: () => void;
  onLayMeld: () => void;
  onDiscard: () => void;
  onEndTurn: () => void;
  hasOpened: boolean;
  canAct: boolean;
  deck?: Record<string, any>;
  topDiscard?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onDrawStock,
  onDrawDiscard,
  onLayOpen,
  onLayMeld,
  onDiscard,
  onEndTurn,
  hasOpened,
  canAct,
  deck,
  topDiscard
}) => {
  const handleDrawStock = () => {
    audioService.playDraw();
    soundManager.play('pick');
    haptics.pick();
    onDrawStock();
  };

  const handleDrawDiscard = () => {
    audioService.playDraw();
    soundManager.play('pick');
    haptics.pick();
    onDrawDiscard();
  };

  const handleLayOpen = () => {
    audioService.playLayMeld();
    soundManager.play('uiClick');
    haptics.success();
    onLayOpen();
  };

  const handleLayMeld = () => {
    audioService.playLayMeld();
    soundManager.play('uiClick');
    haptics.success();
    onLayMeld();
  };

  const handleDiscard = () => {
    audioService.playDiscard();
    soundManager.play('discard');
    haptics.discard();
    onDiscard();
  };

  const handleEndTurn = () => {
    audioService.playTurnChange();
    soundManager.play('uiClick');
    haptics.tap();
    onEndTurn();
  };

  return (
    <div className="action-bar">
      <div className="flex flex-wrap justify-center items-center gap-2">
            <Button
              onClick={handleDrawStock}
              disabled={!canAct}
              variant="default"
              size="sm"
              className="h-9 px-3 text-sm font-bold shadow-lg hover:shadow-primary/30 transition-all"
            >
              🎴 <span className="hidden sm:inline">Piocher</span><span className="sm:hidden">Pioche</span>
            </Button>
            
            <Button
              onClick={handleDrawDiscard}
              disabled={!canAct || !topDiscard}
              variant="secondary"
              size="sm"
              className="h-9 px-3 text-sm font-bold shadow-lg hover:shadow-accent/20 transition-all"
            >
              {topDiscard && deck ? (
                deck[topDiscard].joker ? '🃏' : `${deck[topDiscard].rank}${deck[topDiscard].suit}`
              ) : (
                <>♻️ <span className="hidden sm:inline">Défausse</span><span className="sm:hidden">Déf.</span></>
              )}
            </Button>

            {!hasOpened ? (
              <Button
                onClick={handleLayOpen}
                disabled={!canAct}
                variant="default"
                size="sm"
                className="h-9 px-3 text-sm font-bold bg-gradient-to-r from-primary via-primary to-primary/90 shadow-lg shadow-primary/40 hover:shadow-primary/60 transition-all"
              >
                ✨ <span className="hidden sm:inline">Poser 51</span><span className="sm:hidden">51</span>
              </Button>
            ) : (
              <Button
                onClick={handleLayMeld}
                disabled={!canAct}
                variant="default"
                size="sm"
                className="h-9 px-3 text-sm font-bold shadow-lg hover:shadow-primary/30 transition-all"
              >
                🃏 <span className="hidden sm:inline">Poser</span><span className="sm:hidden">Poser</span>
              </Button>
            )}

            <Button
              onClick={handleDiscard}
              disabled={!canAct}
              variant="destructive"
              size="sm"
              className="h-9 px-3 text-sm font-bold shadow-lg hover:shadow-destructive/30 transition-all"
            >
              🗑️ <span className="hidden sm:inline">Défausser</span><span className="sm:hidden">Déf.</span>
            </Button>

            <Button
              onClick={handleEndTurn}
              disabled={!canAct}
              variant="outline"
              size="sm"
              className="h-9 px-3 text-sm font-bold border-2 shadow-lg hover:bg-primary/10 hover:border-primary transition-all"
            >
              ⏭️ <span className="hidden sm:inline">Fin tour</span><span className="sm:hidden">Fin</span>
            </Button>
      </div>
    </div>
  );
};
