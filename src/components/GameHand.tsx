import { Card as CardType } from '@/types/game';
import { Card } from './Card';

interface GameHandProps {
  cards: CardType[];
  onCardClick?: (index: number) => void;
  selectedIndices?: number[];
  title: string;
}

export function GameHand({ cards, onCardClick, selectedIndices = [], title }: GameHandProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            onClick={onCardClick ? () => onCardClick(index) : undefined}
            selected={selectedIndices.includes(index)}
          />
        ))}
        {cards.length === 0 && (
          <p className="text-muted-foreground italic">Aucune carte</p>
        )}
      </div>
    </div>
  );
}
