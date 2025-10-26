import React from 'react';
import { Card as CardType } from '@/types/game';

interface OpponentAreaProps {
  cards: CardType[];
  playerName?: string;
}

export function OpponentArea({ cards, playerName = 'Adversaire' }: OpponentAreaProps) {
  const cardsPerRow = 12;
  const rows: CardType[][] = [];
  
  // Split cards into rows of max 12 cards
  for (let i = 0; i < cards.length; i += cardsPerRow) {
    rows.push(cards.slice(i, i + cardsPerRow));
  }

  return (
    <div 
      className="w-full px-2 md:px-4 py-2" 
      role="region" 
      aria-label={`Main de ${playerName}`}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-xs md:text-sm font-semibold text-muted-foreground">
          {playerName}
        </span>
        <span className="text-xs text-muted-foreground/70">
          ({cards.length} carte{cards.length > 1 ? 's' : ''})
        </span>
      </div>
      
      <div className="flex flex-col gap-1 items-center">
        {rows.map((row, rowIndex) => (
          <div 
            key={rowIndex}
            className="flex flex-wrap gap-1 justify-center"
            role="list"
            aria-label={`Rangée ${rowIndex + 1} de cartes`}
          >
            {row.map((card, cardIndex) => (
              <div
                key={`${rowIndex}-${cardIndex}`}
                className="w-12 h-18 sm:w-14 sm:h-20 rounded-lg border-2 border-border bg-gradient-to-br from-secondary/80 to-secondary/40 shadow-md flex items-center justify-center text-muted-foreground/50"
                role="img"
                aria-label="Carte face cachée"
                title="Carte de l'adversaire"
              >
                <span className="text-2xl opacity-30">🂠</span>
              </div>
            ))}
          </div>
        ))}
        
        {cards.length === 0 && (
          <p className="text-xs text-muted-foreground/50 italic py-2" role="status">
            Aucune carte
          </p>
        )}
      </div>
    </div>
  );
}
