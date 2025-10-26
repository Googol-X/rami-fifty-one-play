import React from 'react';
import { motion } from 'framer-motion';
import type { Card } from "@/types/game";
import { cardHoverVariants } from './animations';

function suitColor(s: string) {
  return s === '♥' || s === '♦' ? 'text-red-600' : 'text-gray-900';
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
      whileTap="tap"
      className={`
        ${sizeClasses[size]}
        relative rounded-lg overflow-hidden
        bg-white
        border-2 transition-all duration-300
        ${selected 
          ? 'border-primary shadow-xl shadow-primary/60 -translate-y-3 scale-105' 
          : 'border-gray-300 hover:border-primary/50 hover:shadow-lg shadow-md'
        }
        ${onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'}
      `}
      style={{
        boxShadow: selected 
          ? '0 8px 24px rgba(0,0,0,0.4), 0 0 20px hsl(var(--primary) / 0.6)' 
          : '0 4px 12px rgba(0,0,0,0.3)'
      }}
      title={`${card.rank}${card.joker ? ' (Joker)' : card.suit}`}
    >
      {/* Gold shimmer for selected cards */}
      {selected && (
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), transparent)',
            backgroundSize: '200% 100%'
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
      
      {/* Card content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-2 bg-white">
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
