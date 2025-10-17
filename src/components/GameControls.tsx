import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface GameControlsProps {
  hasDrawn: boolean;
  selectedCount: number;
  onLayCombo: () => void;
  onDiscard: () => void;
  disabled?: boolean;
}

export function GameControls({
  hasDrawn,
  selectedCount,
  onLayCombo,
  onDiscard,
  disabled = false
}: GameControlsProps) {
  const canLayCombo = hasDrawn && selectedCount >= 3 && !disabled;
  const canDiscard = hasDrawn && selectedCount === 1 && !disabled;

  const layComboLabel = !hasDrawn 
    ? "Piochez d'abord une carte pour déposer une combinaison"
    : selectedCount < 3
    ? `Sélectionnez au moins 3 cartes (actuellement ${selectedCount})`
    : `Déposer la combinaison de ${selectedCount} cartes`;

  const discardLabel = !hasDrawn
    ? "Piochez d'abord une carte pour défausser"
    : selectedCount !== 1
    ? `Sélectionnez exactement 1 carte à défausser (actuellement ${selectedCount})`
    : "Défausser la carte sélectionnée et finir votre tour";

  return (
    <div className="mobile-action-bar sm:relative sm:p-0 sm:bg-transparent sm:backdrop-filter-none sm:border-0">
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center max-w-2xl mx-auto" role="group" aria-label="Actions de jeu">
        <Button 
          onClick={onLayCombo} 
          disabled={!canLayCombo}
          size="lg"
          className={`flex-1 sm:flex-none transition-all shadow-lg ${canLayCombo ? 'action-valid' : ''}`}
          aria-label={layComboLabel}
          aria-disabled={!canLayCombo}
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          <span className="hidden sm:inline">Déposer combinaison</span>
          <span className="sm:hidden">Déposer</span>
          <span className="ml-1">({selectedCount})</span>
        </Button>
        <Button 
          onClick={onDiscard} 
          disabled={!canDiscard} 
          variant="secondary"
          size="lg"
          className={`flex-1 sm:flex-none transition-all shadow-lg ${canDiscard ? 'action-valid' : ''}`}
          aria-label={discardLabel}
          aria-disabled={!canDiscard}
        >
          <XCircle className="mr-2 h-5 w-5" />
          <span className="hidden sm:inline">Défausser et finir</span>
          <span className="sm:hidden">Finir</span>
        </Button>
      </div>
    </div>
  );
}
