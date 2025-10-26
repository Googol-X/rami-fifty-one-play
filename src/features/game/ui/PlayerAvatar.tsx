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
  const [timer, setTimer] = React.useState(30);
  
  React.useEffect(() => {
    if (!isActive) {
      setTimer(30);
      return;
    }
    
    const interval = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive]);

  const positionClasses = {
    bottom: 'flex-col',
    top: 'flex-col',
    left: 'flex-row items-center gap-2',
    right: 'flex-row-reverse items-center gap-2'
  };

  return (
    <motion.div
      className={`flex ${positionClasses[position]} items-center gap-2`}
      initial="inactive"
      animate={isActive ? "active" : "inactive"}
    >
      <motion.div
        variants={playerHaloVariants}
        className="relative"
      >
        {/* Avatar circle with WSOP style */}
        <div className={`
          relative w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden
          border-4 transition-all duration-300
          ${isActive ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)]' : 'border-muted-foreground/30'}
          bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/10
        `}>
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <span className={`text-2xl md:text-3xl font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
              {player.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Active pulse halo */}
          {isActive && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.8, 0.3, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </>
          )}
        </div>

        {/* Timer ring - WSOP style */}
        {isActive && (
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray={`${(timer / 30) * 289} 289`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
        )}

        {/* Cards count badge */}
        <div className={`
          absolute -bottom-2 -right-2 rounded-full w-7 h-7 md:w-9 md:h-9 
          flex items-center justify-center shadow-lg
          ${isActive 
            ? 'bg-primary border-2 border-primary' 
            : 'bg-secondary border-2 border-muted-foreground/30'
          }
        `}>
          <span className={`text-xs md:text-sm font-bold ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
            {cardsCount}
          </span>
        </div>
      </motion.div>

      {/* Player info card */}
      <div className={`
        px-3 py-2 rounded-lg backdrop-blur-sm border-2 transition-all
        ${isActive 
          ? 'bg-primary/10 border-primary/30' 
          : 'bg-secondary/20 border-muted-foreground/20'
        }
      `}>
        <p className={`text-sm md:text-base font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          {player.displayName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs md:text-sm text-muted-foreground">
            {player.laidPoints} pts
          </span>
          {player.hasOpened && (
            <span className="text-[9px] md:text-xs bg-success/20 text-success px-1.5 py-0.5 rounded font-bold">
              OUVERT
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
