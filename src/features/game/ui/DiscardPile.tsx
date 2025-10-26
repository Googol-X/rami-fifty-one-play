import React from 'react';
import { motion } from 'framer-motion';
import type { Card } from '@/types/game';

interface DiscardPileProps {
  topCard?: Card;
  onPick?: () => void;
  disabled?: boolean;
}

export const DiscardPile: React.FC<DiscardPileProps> = ({ 
  topCard, 
  onPick,
  disabled = false 
}) => {
  const isRed = topCard && (topCard.suit === '♥' || topCard.suit === '♦');
  
  return (
    <motion.button
      className="relative w-16 h-24 md:w-20 md:h-28 rounded-xl border-3 border-accent bg-card flex flex-col items-center justify-center shadow-2xl hover:ring-2 hover:ring-accent/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title={topCard ? "Piocher la défausse" : "Défausse vide"}
      onClick={onPick}
      disabled={!topCard || disabled}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, ease: "backOut" }}
      whileHover={topCard && !disabled ? { 
        scale: 1.08, 
        boxShadow: "0 0 30px hsl(var(--accent) / 0.6)",
        transition: { duration: 0.2 }
      } : undefined}
    >
      <div className="text-[9px] md:text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">
        Défausse
      </div>
      {topCard ? (
        topCard.joker ? (
          <span className="text-3xl">🃏</span>
        ) : (
          <>
            <span className={`text-sm md:text-base font-bold ${isRed ? 'text-accent' : 'text-card-foreground'}`}>
              {topCard.rank}
            </span>
            <span className={`text-2xl md:text-3xl ${isRed ? 'text-accent' : 'text-card-foreground'}`}>
              {topCard.suit}
            </span>
          </>
        )
      ) : (
        <span className="text-xs text-muted-foreground/50">Vide</span>
      )}
      
      {/* Pulse animation when available */}
      {topCard && !disabled && (
        <motion.div
          className="absolute -inset-1 rounded-xl border-2 border-accent/60 pointer-events-none"
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.08, 1]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.button>
  );
};
