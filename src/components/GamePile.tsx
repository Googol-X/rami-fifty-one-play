import { Card as CardType } from '@/types/game';
import { Card } from './Card';

interface GamePileProps {
  drawPile: CardType[];
  discardPile: CardType[];
  onDrawCard: () => void;
  onPickDiscard: () => void;
  canTakeDiscard?: boolean; // NEW
}

export function GamePile({ drawPile, discardPile, onDrawCard, onPickDiscard, canTakeDiscard = true }: GamePileProps) {
  const topDiscard = discardPile[discardPile.length - 1];
  const drawDisabled = drawPile.length === 0;
  const discardDisabled = !topDiscard || !canTakeDiscard;

  return (
    <div className="flex items-center justify-center gap-6 sm:gap-10 my-2 select-none">
      {/* Pioche */}
      <div className="text-center group">
        <p className="text-sm font-medium text-muted-foreground mb-2">Pioche</p>
        <button
          onClick={onDrawCard}
          disabled={drawDisabled}
          className={`relative w-16 sm:w-20 h-24 sm:h-28 rounded-lg border-2 ${drawDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} transition`}
          aria-label={drawDisabled ? 'Pioche vide' : 'Piocher une carte'}
        >
          <div className="absolute inset-0 rounded-lg bg-secondary/60 border-border" />
          <div className="absolute -top-2 -left-2 w-16 sm:w-20 h-24 sm:h-28 rounded-lg bg-secondary/80 border border-border rotate-2" />
          <div className="absolute -top-4 -left-3 w-16 sm:w-20 h-24 sm:h-28 rounded-lg bg-secondary/90 border border-border -rotate-1" />
        </button>
      </div>

      {/* Séparateur */}
      <div className="flex flex-col items-center gap-2" aria-hidden>
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="w-3 h-3 rounded-full bg-primary/30 animate-pulse" />
        <div className="w-px h-16 bg-gradient-to-t from-transparent via-border to-transparent" />
      </div>

      {/* Défausse */}
      <div className="text-center group">
        <p className="text-sm font-medium text-muted-foreground mb-2">Défausse</p>
        <button
          onClick={onPickDiscard}
          disabled={discardDisabled}
          className={`relative transition ${discardDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          aria-label={
            !topDiscard ? 'Défausse vide'
            : discardDisabled ? 'Prise depuis la défausse non autorisée'
            : `Prendre ${topDiscard.rank} ${topDiscard.suit}`
          }
          title={
            !topDiscard ? 'Défausse vide'
            : discardDisabled ? 'Action non permise'
            : ''
          }
          data-discard-top
        >
          <Card card={topDiscard ?? null} />
        </button>
      </div>
    </div>
  );
}
