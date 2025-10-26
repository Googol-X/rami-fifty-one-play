import React from 'react';
import { motion } from 'framer-motion';
import type { TableState, Meld } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PlayersAreaProps {
  state: TableState;
  deck: Record<string, any>;
  currentPlayerId: string;
  selectedCards: Set<string>;
  onAddToMeld?: (meldId: string) => void;
}

export const PlayersArea: React.FC<PlayersAreaProps> = ({ 
  state, 
  deck, 
  currentPlayerId,
  selectedCards,
  onAddToMeld 
}) => {
  const players = state.players;

  const renderCard = (cardId: string, index: number, total: number) => {
    const card = deck[cardId];
    if (!card) return null;
    
    const isRed = card.suit === '♥' || card.suit === '♦';
    
    // Calculate fan effect
    const maxRotation = 15; // degrees
    const rotation = total > 1 
      ? (index - (total - 1) / 2) * (maxRotation / Math.max(total - 1, 1))
      : 0;
    
    const translateY = Math.abs(rotation) * 0.5; // Slight vertical curve
    
    return (
      <div
        key={cardId}
        className={`absolute w-10 h-14 rounded border-2 bg-background flex flex-col items-center justify-center text-xs font-bold shadow-md transition-all hover:z-10 hover:-translate-y-2
          ${isRed ? 'text-red-500 border-red-300' : 'text-foreground border-border'}`}
        style={{
          transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
          left: `${index * 8}px`,
          transformOrigin: 'bottom center',
        }}
      >
        {card.joker ? (
          <span className="text-lg">🃏</span>
        ) : (
          <>
            <span className="text-[10px]">{card.rank}</span>
            <span className="text-base">{card.suit}</span>
          </>
        )}
      </div>
    );
  };

  const renderMeld = (meld: Meld, playerHasOpened: boolean) => {
    const cardCount = meld.cards.length;
    const fanWidth = Math.max(cardCount * 8 + 32, 60); // Calculate width based on card overlap
    
    return (
      <motion.div
        key={meld.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors">
          {/* Fan of cards */}
          <div 
            className="relative flex items-center justify-center py-1"
            style={{ 
              minWidth: `${fanWidth}px`,
              height: '60px'
            }}
          >
            {meld.cards.map((cardId, index) => renderCard(cardId, index, cardCount))}
          </div>
          
          {/* Points display */}
          <div className="flex items-center justify-center text-xs text-primary font-bold px-1 shrink-0">
            {meld.points}
          </div>
          
          {/* Button to add cards to this meld */}
          {playerHasOpened && selectedCards.size > 0 && onAddToMeld && (
            <Button
              size="sm"
              variant="ghost"
              className="h-auto px-1 py-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={() => onAddToMeld(meld.id)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full bg-background/80 backdrop-blur-sm border-y border-border py-3 px-2">
      <div className="container mx-auto">
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
          Combinaisons des joueurs
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {players.map((player) => {
            const playerMelds = state.melds.filter(m => m.owner === player.id);
            const isCurrentPlayer = player.id === currentPlayerId;
            
            return (
              <div
                key={player.id}
                className={`p-2 rounded-lg border-2 transition-all ${
                  isCurrentPlayer
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-muted/30 border-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      player.id === state.activePlayer 
                        ? 'bg-green-500 animate-pulse' 
                        : 'bg-muted-foreground/30'
                    }`} />
                    <span className="text-xs font-semibold truncate max-w-[80px]">
                      {player.displayName}
                    </span>
                  </div>
                  {player.hasOpened && (
                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                      Ouvert
                    </span>
                  )}
                </div>
                
                <div className="space-y-1.5 min-h-[60px]">
                  {playerMelds.length === 0 ? (
                    <div className="text-[10px] text-muted-foreground/50 italic text-center py-4">
                      Aucune combinaison
                    </div>
                  ) : (
                    playerMelds.map(meld => renderMeld(meld, player.hasOpened))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
