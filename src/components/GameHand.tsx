import { Card as CardType } from '@/types/game';
import { Card } from './Card';

interface GameHandProps {
  cards: CardType[];
  onCardClick?: (index: number) => void;
  selectedIndices?: number[];
  title: string;
}

export function GameHand({ cards, onCardClick, selectedIndices = [], title }: GameHandProps) {
  const selectedCount = selectedIndices.length;
  
  return (
    <div className="w-full" role="region" aria-label={title}>
      <h3 className="text-lg font-semibold text-foreground mb-3" id={`hand-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        {title}
        {selectedCount > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            ({selectedCount} carte{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''})
          </span>
        )}
      </h3>
      <div 
        className="flex flex-wrap gap-2 justify-center md:justify-start"
        role={onCardClick ? "group" : "list"}
        aria-label={`${cards.length} carte${cards.length > 1 ? 's' : ''} dans la main`}
      >
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            onClick={onCardClick ? () => onCardClick(index) : undefined}
            selected={selectedIndices.includes(index)}
          />
        ))}
        {cards.length === 0 && (
          <p className="text-muted-foreground italic" role="status">Aucune carte</p>
        )}
      </div>
    </div>
  );
}
