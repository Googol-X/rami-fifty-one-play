import { Card as CardType } from '@/types/game';
import { Card } from './Card';

interface GamePileProps {
  drawPile: CardType[];
  discardPile: CardType[];
  onDrawCard: () => void;
  onPickDiscard: () => void;
  canTakeDiscard?: boolean;
}

export function GamePile({ drawPile, discardPile, onDrawCard, onPickDiscard, canTakeDiscard = true }: GamePileProps) {
  const topDiscard = discardPile[discardPile.length - 1];
  const topDiscardLabel = topDiscard 
    ? `${topDiscard.rank} de ${topDiscard.suit === '♠' ? 'pique' : topDiscard.suit === '♥' ? 'coeur' : topDiscard.suit === '♦' ? 'carreau' : 'trèfle'}`
    : 'vide';

  return (
    <div className="flex gap-8 items-center justify-center py-6 px-4" role="region" aria-label="Piles de jeu">
      {/* Pioche - à gauche */}
      <div className="text-center group">
        <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-2" id="draw-pile-label">
          <span className="text-lg">📚</span>
          <span>Pioche ({drawPile.length})</span>
        </p>
        <button
          onClick={onDrawCard}
          disabled={drawPile.length === 0}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          aria-label={`Piocher une carte de la pioche, ${drawPile.length} carte${drawPile.length > 1 ? 's' : ''} restante${drawPile.length > 1 ? 's' : ''}`}
          aria-describedby="draw-pile-label"
        >
          <div className="relative">
            <Card card={null} className="shadow-xl group-hover:shadow-2xl transition-shadow" />
            {drawPile.length > 0 && (
              <>
                <Card card={null} className="absolute top-0.5 left-0.5 -z-10 opacity-70" />
                <Card card={null} className="absolute top-1 left-1 -z-20 opacity-40" />
              </>
            )}
          </div>
        </button>
      </div>

      {/* Séparateur visuel circulaire */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="w-3 h-3 rounded-full bg-primary/30 animate-pulse" />
        <div className="w-px h-16 bg-gradient-to-t from-transparent via-border to-transparent" />
      </div>

      {/* Défausse - à droite */}
      <div className="text-center group">
        <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-2" id="discard-pile-label">
          <span className="text-lg">🗑️</span>
          <span>Défausse ({discardPile.length})</span>
        </p>
        <button
          onClick={onPickDiscard}
          disabled={!topDiscard || !canTakeDiscard}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          aria-label={!canTakeDiscard ? 'Action non permise' : `Prendre la carte de défausse: ${topDiscardLabel}`}
          aria-describedby="discard-pile-label"
          title={!canTakeDiscard && topDiscard ? 'Action non permise selon les règles' : undefined}
        >
          {topDiscard ? (
            <div className="relative">
              <Card card={topDiscard} className="shadow-xl group-hover:shadow-2xl transition-shadow" />
              {discardPile.length > 1 && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent/20 rounded-full blur-sm" />
              )}
            </div>
          ) : (
            <div 
              className="w-16 h-24 rounded-lg border-2 border-dashed border-border bg-secondary/20 flex items-center justify-center text-muted-foreground/50 text-xs" 
              role="img" 
              aria-label="Défausse vide"
            >
              Vide
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
