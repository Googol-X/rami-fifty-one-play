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
        "w-16 h-24 rounded-lg bg-secondary/50 border-2 border-border",
        "flex items-center justify-center text-muted-foreground text-xs",
        className
      )}>
        Pioche
      </div>
    );
  }

  const isRedCard = isRed(card.suit);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-16 h-24 rounded-lg bg-card border-2 shadow-lg",
        "flex flex-col items-center justify-between p-2",
        "transition-all duration-200 hover:scale-105 hover:shadow-xl",
        selected && "ring-4 ring-primary -translate-y-2",
        onClick && "cursor-pointer",
        !onClick && "cursor-default",
        className
      )}
      aria-label={`${card.rank} de ${card.suit}`}
    >
      <div className={cn(
        "text-xl font-bold",
        isRedCard ? "text-accent" : "text-card-foreground"
      )}>
        {card.rank}
      </div>
      <div className={cn(
        "text-2xl",
        isRedCard ? "text-accent" : "text-card-foreground"
      )}>
        {card.suit}
      </div>
      <div className={cn(
        "text-xl font-bold",
        isRedCard ? "text-accent" : "text-card-foreground"
      )}>
        {card.rank}
      </div>
    </button>
  );
}
