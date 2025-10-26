import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { EMOTES, emoteManager, EMOTE_COOLDOWN_MS } from '@/lib/emotes';
import { EmoteType } from '@/lib/matchTypes';
import { haptics } from '@/lib/haptics';

interface EmoteBarProps {
  playerId: string;
  onEmote: (emote: EmoteType) => void;
  disabled?: boolean;
}

export function EmoteBar({ playerId, onEmote, disabled }: EmoteBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const interval = setInterval(() => {
      const remaining = emoteManager.getCooldownRemaining(playerId);
      setCooldownRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [cooldownRemaining, playerId]);

  const handleEmote = (emote: EmoteType) => {
    if (disabled || !emoteManager.canEmote(playerId)) return;

    haptics.tap();
    onEmote(emote);
    setCooldownRemaining(EMOTE_COOLDOWN_MS);
    setIsOpen(false);
  };

  const canEmote = emoteManager.canEmote(playerId);

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "h-9 w-9 p-0",
          !canEmote && "opacity-50"
        )}
        title={canEmote ? "Envoyer une emote" : `Cooldown: ${Math.ceil(cooldownRemaining / 1000)}s`}
      >
        <Smile className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-secondary/95 backdrop-blur-md border border-border rounded-lg p-2 shadow-xl z-50"
          >
            <div className="flex gap-1">
              {Object.entries(EMOTES).map(([key, { emoji, label }]) => (
                <button
                  key={key}
                  onClick={() => handleEmote(key as EmoteType)}
                  disabled={!canEmote}
                  className={cn(
                    "w-10 h-10 rounded-lg hover:bg-primary/20 transition-colors",
                    "flex items-center justify-center text-2xl",
                    !canEmote && "opacity-50 cursor-not-allowed"
                  )}
                  title={label}
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            {!canEmote && (
              <p className="text-[10px] text-center text-muted-foreground mt-1">
                {Math.ceil(cooldownRemaining / 1000)}s
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
