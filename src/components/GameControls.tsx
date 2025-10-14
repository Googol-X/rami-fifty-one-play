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

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button 
        onClick={onLayCombo} 
        disabled={!canLayCombo}
        size="lg"
      >
        Déposer combinaison ({selectedCount})
      </Button>
      <Button 
        onClick={onDiscard} 
        disabled={!canDiscard} 
        variant="secondary"
        size="lg"
      >
        Défausser et finir le tour
      </Button>
    </div>
  );
}
