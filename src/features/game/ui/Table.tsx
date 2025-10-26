import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TableState } from '@/types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { MeldsBoard } from './MeldsBoard';
import { confettiVariants, winnerAppearVariants } from './animations';
import { audioService } from '@/utils/audioService';

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


  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[600px] bg-gradient-to-br from-[hsl(140,20%,8%)] via-[hsl(140,25%,6%)] to-[hsl(140,20%,8%)]">
      {/* Poker table texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)
        `,
        backgroundSize: '30px 30px'
      }} />

      {/* Center poker table */}
      <div className="absolute inset-0 flex items-center justify-center px-2 md:px-4">
        <div className="relative w-[96%] md:w-[85%] max-w-6xl aspect-[16/9] rounded-[45%] shadow-2xl overflow-hidden">
          {/* Table surface - dark felt with subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(140,25%,10%)] via-[hsl(140,20%,7%)] to-[hsl(140,25%,9%)]" />
          
          {/* Elegant border */}
          <div className="absolute inset-0 rounded-[45%] border-[6px] md:border-[10px] border-primary/80 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]" />
          
          {/* Inner glow */}
          <div className="absolute inset-6 md:inset-10 rounded-[40%] bg-gradient-radial from-primary/5 via-transparent to-transparent" />
          
          {/* Melds display board */}
          <MeldsBoard melds={state.melds} deck={deck} />

          {/* Discard pile - positioned on table edge */}
          {state.piles.discard.length > 0 && (
            <div className="absolute bottom-4 md:bottom-12 right-4 md:right-12 z-20">
              <motion.div 
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, ease: "backOut" }}
              >
                <div className="w-16 h-24 md:w-20 md:h-28 rounded-xl border-3 border-accent bg-card flex flex-col items-center justify-center shadow-2xl">
                  <div className="text-[9px] md:text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">Défausse</div>
                  {deck[state.piles.discard[state.piles.discard.length - 1]] && (() => {
                    const card = deck[state.piles.discard[state.piles.discard.length - 1]];
                    const isRed = card.suit === '♥' || card.suit === '♦';
                    return card.joker ? (
                      <span className="text-3xl">🃏</span>
                    ) : (
                      <>
                        <span className={`text-sm md:text-base font-bold ${isRed ? 'text-accent' : 'text-card-foreground'}`}>{card.rank}</span>
                        <span className={`text-2xl md:text-3xl ${isRed ? 'text-accent' : 'text-card-foreground'}`}>{card.suit}</span>
                      </>
                    );
                  })()}
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-xl border-2 border-accent/60"
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
              </motion.div>
            </div>
          )}

          {/* Draw pile - positioned on table edge */}
          <div className="absolute bottom-4 md:bottom-12 left-4 md:left-12 z-20">
            <motion.div 
              className="w-16 h-24 md:w-20 md:h-28 rounded-xl border-3 border-primary bg-gradient-to-br from-primary/30 to-primary/10 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm"
              whileHover={{ 
                scale: 1.08, 
                boxShadow: "0 0 30px hsl(var(--primary) / 0.6)",
                transition: { duration: 0.2 }
              }}
            >
              <div className="text-[9px] md:text-xs text-primary font-bold mb-1 uppercase tracking-wider">Pioche</div>
              <div className="text-2xl md:text-4xl font-bold text-primary drop-shadow-lg">
                {state.piles.draw.length}
              </div>
              <div className="text-[8px] md:text-xs text-primary/70 mt-1">cartes</div>
            </motion.div>
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
      <AnimatePresence>
        {state.winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => {
              const winnerPlayer = players.find(p => p.id === state.winner);
              if (winnerPlayer?.id === currentPlayerId) {
                audioService.playWin();
              } else {
                audioService.playLose();
              }
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50"
          >
            {/* Confetti particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={confettiVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '50%',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: `hsl(${Math.random() * 360}, 70%, 60%)`
                  }}
                />
              ))}
            </div>

            {/* Winner content */}
            <motion.div 
              variants={winnerAppearVariants}
              initial="hidden"
              animate="visible"
              className="text-center relative z-10"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl md:text-8xl mb-4 drop-shadow-2xl"
              >
                🏆
              </motion.div>
              
              <motion.h2 
                className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(234, 179, 8, 0.5)",
                    "0 0 40px rgba(234, 179, 8, 0.8)",
                    "0 0 20px rgba(234, 179, 8, 0.5)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {players.find(p => p.id === state.winner)?.displayName} gagne !
              </motion.h2>
              
              <motion.p 
                className="text-lg md:text-2xl text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                🎉 Partie terminée 🎉
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
