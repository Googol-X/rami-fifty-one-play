import { Button } from '@/components/ui/button';

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
    <div className="flex flex-wrap gap-3 justify-center" role="group" aria-label="Actions de jeu">
      <Button 
        onClick={onLayCombo} 
        disabled={!canLayCombo}
        size="lg"
        aria-label={layComboLabel}
        aria-disabled={!canLayCombo}
      >
        Déposer combinaison ({selectedCount})
      </Button>
      <Button 
        onClick={onDiscard} 
        disabled={!canDiscard} 
        variant="secondary"
        size="lg"
        aria-label={discardLabel}
        aria-disabled={!canDiscard}
      >
        Défausser et finir le tour
      </Button>
    </div>
  );
}
