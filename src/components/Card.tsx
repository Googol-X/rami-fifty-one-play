import { Card as CardType } from '@/types/game';
import { isRed } from '@/utils/deck';
import { cn } from '@/lib/utils';

interface CardProps {
  card: CardType | null;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function Card({ card, onClick, selected, className }: CardProps) {
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

  const Element = onClick ? 'button' : 'div';

  return (
    <Element
      onClick={onClick}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      className={cn(
        "w-16 sm:w-20 h-24 sm:h-28 rounded-lg bg-card border-2 shadow-lg",
        "flex flex-col items-center justify-between p-2",
        "transition-all duration-300 card-slide-in",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected && "ring-4 ring-primary -translate-y-3 scale-110 shadow-2xl shadow-primary/50",
        onClick && "cursor-pointer hover:scale-105 hover:shadow-xl hover:-translate-y-1 active:scale-95",
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
    </Element>
  );
}
