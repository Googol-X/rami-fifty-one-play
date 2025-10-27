import React from 'react';
import type { Card } from '@/types/game';

interface DiscardPileProps {
  topCard?: Card;
  onPick?: () => void;
  disabled?: boolean;
  canTakeDiscard?: boolean;
}

export const DiscardPile: React.FC<DiscardPileProps> = ({ 
  topCard, 
  onPick,
  disabled = false,
  canTakeDiscard = true
}) => {
  const isRed = topCard && (topCard.suit === '♥' || topCard.suit === '♦');
  const isDisabled = !topCard || disabled || !canTakeDiscard;
  
  return (
    <button
      data-tutorial-id="discard-pile"
      className="rounded-xl border-2 border-accent bg-card/90 px-3 py-2 shadow-xl hover:ring-2 hover:ring-accent/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title={
        !topCard 
          ? 'Défausse vide' 
          : !canTakeDiscard 
          ? 'Action non permise' 
          : 'Piocher la défausse'
      }
      aria-label={
        !topCard 
          ? 'Défausse vide' 
          : isDisabled 
          ? 'Prise depuis la défausse non autorisée' 
          : `Prendre ${topCard.rank} ${topCard.suit}`
      }
      onClick={onPick}
      disabled={isDisabled}
    >
      {topCard ? (
        <div className="flex flex-col items-center gap-1">
          <div className="text-[9px] md:text-xs text-muted-foreground font-bold uppercase tracking-wider">
            Défausse
          </div>
          <div className="w-12 h-16 md:w-14 md:h-20 rounded-lg bg-white border-2 border-gray-300 flex flex-col items-center justify-center font-bold shadow-md">
            {topCard.joker ? (
              <span className="text-2xl">🃏</span>
            ) : (
              <>
                <span className={`text-xs md:text-sm ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                  {topCard.rank}
                </span>
                <span className={`text-xl md:text-2xl ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                  {topCard.suit}
                </span>
              </>
            )}
          </div>
        </div>
      ) : (
        <span className="text-sm opacity-70">Défausse vide</span>
      )}
    </button>
  );
};
