import { Card as CardType } from '@/types/game';
import { isRed } from '@/utils/deck';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  card: CardType | null;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  animate?: boolean;
  delay?: number;
}

export function Card({ card, onClick, selected, className, animate = true, delay = 0 }: CardProps) {
  if (!card) {
    return (
      <div className={cn(
        "w-16 sm:w-20 h-24 sm:h-28 rounded-lg bg-secondary/50 border-2 border-border",
        "flex items-center justify-center text-muted-foreground text-xs",
        "shadow-md hover:shadow-lg transition-shadow",
        className
      )}
      role="img"
      aria-label="Dos de carte">
        Pioche
      </div>
    );
  }

  const isRedCard = isRed(card.suit);
  const suitName = card.suit === '♠' ? 'pique' : card.suit === '♥' ? 'coeur' : card.suit === '♦' ? 'carreau' : 'trèfle';
  const ariaLabel = `${card.rank} de ${suitName}${selected ? ', sélectionnée' : ''}`;

  const cardVariants = {
    initial: { opacity: 0, y: -12, rotate: -2, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      rotate: 0, 
      scale: 1,
      transition: { duration: 0.18, ease: 'easeOut', delay }
    },
    selected: {
      scale: 1.10,
      y: -6,
      transition: { duration: 0.15, ease: 'easeOut' }
    },
    hover: onClick ? {
      scale: 1.04,
      y: -2,
      transition: { duration: 0.15 }
    } : {},
    tap: onClick ? {
      scale: 0.96,
      transition: { duration: 0.1 }
    } : {}
  };

  const MotionElement = motion[onClick ? 'button' : 'div'] as any;

  return (
    <MotionElement
      onClick={onClick}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      initial={animate ? "initial" : false}
      animate={animate ? (selected ? "selected" : "animate") : false}
      whileHover={animate ? "hover" : undefined}
      whileTap={animate ? "tap" : undefined}
      variants={animate ? cardVariants : undefined}
      className={cn(
        "w-16 sm:w-20 h-24 sm:h-28 rounded-lg bg-card border-2",
        "flex flex-col items-center justify-between p-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected ? "ring-4 ring-primary shadow-2xl shadow-primary/50" : "shadow-md",
        onClick && "cursor-pointer",
        !onClick && "cursor-default",
        className
      )}
      role={onClick ? "button" : "img"}
      aria-label={ariaLabel}
      aria-pressed={onClick ? selected : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={cn(
        "text-xl sm:text-2xl font-bold transition-colors",
        isRedCard ? "text-accent" : "text-card-foreground"
      )} aria-hidden="true">
        {card.rank}
      </div>
      <div className={cn(
        "text-2xl sm:text-3xl transition-colors",
        isRedCard ? "text-accent" : "text-card-foreground"
      )} aria-hidden="true">
        {card.suit}
      </div>
      <div className={cn(
        "text-xl sm:text-2xl font-bold transition-colors",
        isRedCard ? "text-accent" : "text-card-foreground"
      )} aria-hidden="true">
        {card.rank}
      </div>
    </MotionElement>
  );
}
