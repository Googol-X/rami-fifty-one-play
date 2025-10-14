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
  const topDiscardLabel = topDiscard 
    ? `${topDiscard.rank} de ${topDiscard.suit === '♠' ? 'pique' : topDiscard.suit === '♥' ? 'coeur' : topDiscard.suit === '♦' ? 'carreau' : 'trèfle'}`
    : 'vide';

  return (
    <div className="flex gap-6 items-center justify-center" role="region" aria-label="Piles de jeu">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2" id="draw-pile-label">
          Pioche ({drawPile.length})
        </p>
        <button
          onClick={onDrawCard}
          disabled={drawPile.length === 0}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          aria-label={`Piocher une carte de la pioche, ${drawPile.length} carte${drawPile.length > 1 ? 's' : ''} restante${drawPile.length > 1 ? 's' : ''}`}
          aria-describedby="draw-pile-label"
        >
          <Card card={null} />
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2" id="discard-pile-label">
          Défausse ({discardPile.length})
        </p>
        <button
          onClick={onPickDiscard}
          disabled={!topDiscard}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          aria-label={`Prendre la carte de défausse: ${topDiscardLabel}`}
          aria-describedby="discard-pile-label"
        >
          {topDiscard ? (
            <Card card={topDiscard} />
          ) : (
            <div 
              className="w-16 h-24 rounded-lg border-2 border-dashed border-border" 
              role="img" 
              aria-label="Défausse vide"
            />
          )}
        </button>
      </div>
    </div>
  );
}
