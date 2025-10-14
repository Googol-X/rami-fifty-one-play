import { Card as CardType } from '@/types/game';
import { Card } from './Card';

interface GamePileProps {
  drawPile: CardType[];
  discardPile: CardType[];
  onDrawCard: () => void;
  onPickDiscard: () => void;
}

export function GamePile({ drawPile, discardPile, onDrawCard, onPickDiscard }: GamePileProps) {
  const topDiscard = discardPile[discardPile.length - 1];

  return (
    <div className="flex gap-6 items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Pioche ({drawPile.length})</p>
        <button
          onClick={onDrawCard}
          disabled={drawPile.length === 0}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Piocher une carte"
        >
          <Card card={null} />
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Défausse ({discardPile.length})</p>
        <button
          onClick={onPickDiscard}
          disabled={!topDiscard}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Prendre la défausse"
        >
          {topDiscard ? <Card card={topDiscard} /> : <div className="w-16 h-24 rounded-lg border-2 border-dashed border-border" />}
        </button>
      </div>
    </div>
  );
}
