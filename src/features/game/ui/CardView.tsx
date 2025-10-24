import React from 'react';
import { motion } from 'framer-motion';
import type { Card } from "@/types/game";
import { cardHoverVariants } from './animations';

function suitColor(s: string) {
  return s === '♥' || s === '♦' ? 'text-red-500' : 'text-foreground';
}

export const CardView: React.FC<{
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm'|'md'|'lg';
}> = ({ card, selected, onClick, size='md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-16 text-xs',
    md: 'w-16 h-22 text-sm',
    lg: 'w-20 h-28 text-base'
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={cardHoverVariants}
      whileHover="hover"
      className={`
        ${sizeClasses[size]}
        relative rounded-lg overflow-hidden
        bg-gradient-to-br from-background to-muted
        border-2 transition-all duration-200
        ${selected 
          ? 'border-primary shadow-lg shadow-primary/50 -translate-y-2' 
          : 'border-border hover:border-primary/50'
        }
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      title={`${card.rank}${card.joker ? ' (Joker)' : card.suit}`}
    >
      {/* Card shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
      
      {/* Card content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
        {card.joker ? (
          <div className="text-center">
            <div className="text-2xl">🃏</div>
            <div className="text-xs font-semibold text-primary mt-1">Joker</div>
          </div>
        ) : (
          <>
            <div className={`text-xl font-bold ${suitColor(card.suit)}`}>
              {card.rank}
            </div>
            <div className={`text-2xl ${suitColor(card.suit)}`}>
              {card.suit}
            </div>
          </>
        )}
      </div>

      {/* Corner decorations */}
      {!card.joker && (
        <>
          <div className={`absolute top-1 left-1 text-xs font-bold ${suitColor(card.suit)}`}>
            {card.rank}
          </div>
          <div className={`absolute bottom-1 right-1 text-xs font-bold rotate-180 ${suitColor(card.suit)}`}>
            {card.rank}
          </div>
        </>
      )}
    </motion.button>
  );
};
