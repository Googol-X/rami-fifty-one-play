import React from 'react';
import { motion } from 'framer-motion';
import type { Meld } from '@/types/game';

interface MeldsBoardProps {
  melds: Meld[];
  deck: Record<string, any>;
}

export const MeldsBoard: React.FC<MeldsBoardProps> = ({ melds, deck }) => {
  const renderCard = (cardId: string, index: number, total: number) => {
    const card = deck[cardId];
    if (!card) return null;
    
    const isRed = card.suit === '♥' || card.suit === '♦';
    const rotation = total > 1 ? (index - (total - 1) / 2) * 2 : 0;
    
    return (
      <motion.div
        key={cardId}
        className={`relative w-14 h-20 rounded-lg border-2 bg-white flex flex-col items-center justify-center font-bold shadow-xl
          ${isRed ? 'text-accent border-accent/50' : 'text-gray-800 border-gray-400'}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          marginLeft: index > 0 ? '-8px' : '0',
          zIndex: index,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        whileHover={{ 
          scale: 1.1, 
          zIndex: 100,
          transition: { duration: 0.2 }
        }}
      >
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent" />
        {card.joker ? (
          <span className="text-2xl">🃏</span>
        ) : (
          <>
            <span className="text-xs">{card.rank}</span>
            <span className="text-2xl">{card.suit}</span>
          </>
        )}
      </motion.div>
    );
  };

  const renderMeld = (meld: Meld) => {
    const ownerName = meld.owner === 'p1' ? 'Toi' : 'Bot';
    
    return (
      <motion.div
        key={meld.id}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative group"
      >
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-secondary/40 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 transition-all shadow-lg">
          {/* Owner tag */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10">
              {ownerName}
            </span>
            <span className="text-sm font-bold text-primary">
              {meld.points} pts
            </span>
          </div>
          
          {/* Cards fan */}
          <div className="flex items-center justify-center">
            {meld.cards.map((cardId, index) => 
              renderCard(cardId, index, meld.cards.length)
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (melds.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-8 rounded-2xl bg-secondary/20 backdrop-blur-sm border border-primary/10"
        >
          <div className="text-4xl mb-3">🎴</div>
          <p className="text-muted-foreground text-sm font-medium">
            Aucune combinaison posée
          </p>
          <p className="text-muted-foreground/70 text-xs mt-1">
            Soyez le premier à poser 51 points !
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 p-4 flex items-center justify-center overflow-auto">
      <div className="flex flex-wrap gap-4 justify-center items-center max-w-5xl" data-tutorial-id="melds-board">
        {melds.map(renderMeld)}
      </div>
    </div>
  );
};
