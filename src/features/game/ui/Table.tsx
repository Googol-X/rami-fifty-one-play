import React from 'react';
import { motion } from 'framer-motion';
import type { TableState, Meld } from '@/types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { meldPlacementVariants } from './animations';

interface TableProps {
  state: TableState;
  deck: Record<string, any>;
  currentPlayerId: string;
}

export const Table: React.FC<TableProps> = ({ state, deck, currentPlayerId }) => {
  const players = state.players;
  const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
  
  // Arrange players: current player at bottom, others distributed around
  const getPlayerPosition = (index: number) => {
    const relativeIndex = (index - currentPlayerIndex + players.length) % players.length;
    if (relativeIndex === 0) return 'bottom';
    if (players.length === 2) return 'top';
    if (players.length === 3) {
      return relativeIndex === 1 ? 'left' : 'right';
    }
    // 4 players
    if (relativeIndex === 1) return 'left';
    if (relativeIndex === 2) return 'top';
    return 'right';
  };

  const renderMeld = (meld: Meld) => (
    <motion.div
      key={meld.id}
      variants={meldPlacementVariants}
      initial="hidden"
      animate="visible"
      className="flex gap-1 p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/20"
    >
      {meld.cards.map(cardId => {
        const card = deck[cardId];
        if (!card) return null;
        return (
          <div
            key={cardId}
            className="w-12 h-16 rounded border border-border bg-background flex items-center justify-center text-xs"
          >
            {card.joker ? '🃏' : `${card.rank}${card.suit}`}
          </div>
        );
      })}
      <div className="flex items-center justify-center text-xs text-primary font-bold ml-1">
        {meld.points}
      </div>
    </motion.div>
  );

  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[600px] bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
      {/* Table felt effect */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />

      {/* Center table area */}
      <div className="absolute inset-0 flex items-center justify-center px-2 md:px-0">
        <div className="relative w-[95%] md:w-[80%] max-w-4xl aspect-[16/10] rounded-[40%] bg-gradient-to-br from-emerald-700 to-emerald-800 border-4 md:border-8 border-amber-900/50 shadow-2xl">
          {/* Inner table glow */}
          <div className="absolute inset-2 md:inset-4 rounded-[35%] bg-gradient-to-br from-emerald-600/30 to-transparent" />
          
          {/* Melds display in center */}
          <div className="absolute inset-0 flex items-center justify-center p-2 md:p-8">
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center max-h-full overflow-y-auto">
              {state.melds.length === 0 ? (
                <div className="text-emerald-200/50 text-sm md:text-lg font-semibold">
                  Aucune combinaison posée
                </div>
              ) : (
                state.melds.map(renderMeld)
              )}
            </div>
          </div>

          {/* Discard pile indicator */}
          {state.piles.discard.length > 0 && (
            <div className="absolute bottom-2 md:bottom-8 right-2 md:right-8">
              <div className="relative">
                <div className="w-12 h-16 md:w-16 md:h-22 rounded-lg border-2 border-amber-500 bg-background/90 flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="text-[10px] md:text-xs text-muted-foreground mb-1">Défausse</div>
                    {deck[state.piles.discard[state.piles.discard.length - 1]] && (
                      <div className="text-sm font-bold">
                        {deck[state.piles.discard[state.piles.discard.length - 1]].joker 
                          ? '🃏' 
                          : `${deck[state.piles.discard[state.piles.discard.length - 1]].rank}${deck[state.piles.discard[state.piles.discard.length - 1]].suit}`
                        }
                      </div>
                    )}
                  </div>
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-lg border-2 border-amber-500"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          )}

          {/* Draw pile indicator */}
          <div className="absolute bottom-2 md:bottom-8 left-2 md:left-8">
            <div className="w-12 h-16 md:w-16 md:h-22 rounded-lg border-2 border-primary bg-primary/20 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-[10px] md:text-xs text-primary-foreground mb-1">Pioche</div>
                <div className="text-sm md:text-lg font-bold text-primary-foreground">
                  {state.piles.draw.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Players positioned around table */}
      {players.map((player, index) => {
        const position = getPlayerPosition(index);
        const isActive = player.id === state.activePlayer;
        
        const positionStyles = {
          bottom: 'bottom-4 left-1/2 -translate-x-1/2',
          top: 'top-4 left-1/2 -translate-x-1/2',
          left: 'left-4 top-1/2 -translate-y-1/2',
          right: 'right-4 top-1/2 -translate-y-1/2'
        };

        return (
          <div
            key={player.id}
            className={`absolute ${positionStyles[position]} z-10`}
          >
            <PlayerAvatar
              player={player}
              isActive={isActive}
              position={position}
              cardsCount={player.hand.length}
            />
          </div>
        );
      })}

      {/* Winner overlay */}
      {state.winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
        >
          <div className="text-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl mb-4"
            >
              🏆
            </motion.div>
            <h2 className="text-4xl font-bold text-primary mb-2">
              {players.find(p => p.id === state.winner)?.displayName} gagne !
            </h2>
            <p className="text-xl text-muted-foreground">
              Partie terminée
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
