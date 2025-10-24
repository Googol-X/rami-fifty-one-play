import React from 'react';
import { motion } from 'framer-motion';
import { playerHaloVariants } from './animations';
import type { PlayerState } from '@/types/game';

interface PlayerAvatarProps {
  player: PlayerState;
  isActive: boolean;
  position: 'bottom' | 'top' | 'left' | 'right';
  cardsCount: number;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  isActive,
  position,
  cardsCount
}) => {
  const positionClasses = {
    bottom: 'flex-col',
    top: 'flex-col',
    left: 'flex-row items-center gap-3',
    right: 'flex-row-reverse items-center gap-3'
  };

  return (
    <motion.div
      className={`flex ${positionClasses[position]} items-center gap-1 md:gap-2`}
      initial="inactive"
      animate={isActive ? "active" : "inactive"}
    >
      <motion.div
        variants={playerHaloVariants}
        className="relative"
      >
        {/* Avatar circle */}
        <div className={`
          relative w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden
          border-2 transition-colors duration-300
          ${isActive ? 'border-primary' : 'border-muted'}
          bg-gradient-to-br from-primary/20 to-secondary/20
        `}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg md:text-2xl font-bold text-foreground">
              {player.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Active indicator */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>

        {/* Cards count badge */}
        <div className="absolute -bottom-1 -right-1 bg-background border-2 border-primary rounded-full w-5 h-5 md:w-7 md:h-7 flex items-center justify-center">
          <span className="text-[10px] md:text-xs font-bold text-primary">{cardsCount}</span>
        </div>
      </motion.div>

      {/* Player info */}
      <div className="text-center">
        <p className={`text-xs md:text-sm font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          {player.displayName}
        </p>
        <p className="text-[10px] md:text-xs text-muted-foreground">
          {player.laidPoints} pts
        </p>
      </div>
    </motion.div>
  );
};
