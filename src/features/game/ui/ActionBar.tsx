import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="bg-background/95 backdrop-blur-lg border-t border-border shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={onDrawStock}
              disabled={!canAct}
              variant="default"
              size="lg"
              className="gap-2"
            >
              🎴 Piocher
            </Button>
            
            <Button
              onClick={onDrawDiscard}
              disabled={!canAct}
              variant="secondary"
              size="lg"
              className="gap-2"
            >
              ♻️ Défausse
            </Button>

            {!hasOpened ? (
              <Button
                onClick={onLayOpen}
                disabled={!canAct}
                variant="default"
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                ✨ Poser 51
              </Button>
            ) : (
              <Button
                onClick={onLayMeld}
                disabled={!canAct}
                variant="default"
                size="lg"
                className="gap-2"
              >
                🃏 Poser combi
              </Button>
            )}

            <Button
              onClick={onDiscard}
              disabled={!canAct}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              🗑️ Défausser
            </Button>

            <Button
              onClick={onEndTurn}
              disabled={!canAct}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              ⏭️ Fin tour
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
