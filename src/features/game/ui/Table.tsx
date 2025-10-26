import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TableState } from '@/types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { MeldsBoard } from './MeldsBoard';
import { Hand } from './Hand';
import { DiscardPile } from './DiscardPile';
import { DrawPile } from './DrawPile';
import { confettiVariants, winnerAppearVariants } from './animations';
import { audioService } from '@/utils/audioService';

interface TableProps {
  state: TableState;
  deck: Record<string, any>;
  currentPlayerId: string;
  onDrawStock?: () => void;
  onDrawDiscard?: () => void;
}

export const Table: React.FC<TableProps> = ({ 
  state, 
  deck, 
  currentPlayerId,
  onDrawStock,
  onDrawDiscard 
}) => {
  const [W, setW] = React.useState(window.innerWidth);
  
  React.useEffect(() => {
    const handleResize = () => setW(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
          <div className="absolute bottom-4 md:bottom-12 right-4 md:right-12 z-20">
            {(() => {
              const topId = state.piles.discard[state.piles.discard.length - 1];
              const topCard = topId ? deck[topId] : undefined;
              
              return (
                <DiscardPile 
                  topCard={topCard}
                  onPick={onDrawDiscard}
                  disabled={!onDrawDiscard}
                />
              );
            })()}
          </div>

          {/* Draw pile - positioned on table edge */}
          <div className="absolute bottom-4 md:bottom-12 left-4 md:left-12 z-20">
            <DrawPile 
              count={state.piles.draw.length}
              onDraw={onDrawStock}
              disabled={!onDrawStock}
            />
          </div>
        </div>
      </div>

      {/* Players positioned around table */}
      {(() => {
        const opponents = players.filter(p => p.id !== currentPlayerId);
        const opp1 = opponents[0]; // top
        const opp2 = opponents[1]; // left
        const opp3 = opponents[2]; // right

        return (
          <>
            {/* Haut */}
            {opp1 && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <Hand
                  faceDown
                  cards={Array(Math.min(13, opp1.hand.length)).fill('face')}
                  deck={deck}
                  selected={new Set()}
                  onToggle={() => {}}
                  radius={W < 740 ? 176 : 200}
                  spread={46}
                  tilt={6}
                  overlap={64}
                  scale={0.82}
                />
                <PlayerAvatar
                  player={opp1}
                  isActive={state.activePlayer === opp1.id}
                  position="top"
                  cardsCount={opp1.hand.length}
                />
              </div>
            )}

            {/* Gauche */}
            {opp2 && (
              <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 -rotate-90 z-20">
                <Hand
                  faceDown
                  cards={Array(Math.min(13, opp2.hand.length)).fill('face')}
                  deck={deck}
                  selected={new Set()}
                  onToggle={() => {}}
                  radius={W < 740 ? 168 : 190}
                  spread={44}
                  tilt={6}
                  overlap={64}
                  scale={0.8}
                />
                <div className="rotate-90 origin-left">
                  <PlayerAvatar
                    player={opp2}
                    isActive={state.activePlayer === opp2.id}
                    position="left"
                    cardsCount={opp2.hand.length}
                  />
                </div>
              </div>
            )}

            {/* Droite */}
            {opp3 && (
              <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 rotate-90 z-20">
                <Hand
                  faceDown
                  cards={Array(Math.min(13, opp3.hand.length)).fill('face')}
                  deck={deck}
                  selected={new Set()}
                  onToggle={() => {}}
                  radius={W < 740 ? 168 : 190}
                  spread={44}
                  tilt={6}
                  overlap={64}
                  scale={0.8}
                />
                <div className="-rotate-90 origin-right">
                  <PlayerAvatar
                    player={opp3}
                    isActive={state.activePlayer === opp3.id}
                    position="right"
                    cardsCount={opp3.hand.length}
                  />
                </div>
              </div>
            )}
          </>
        );
      })()}

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
