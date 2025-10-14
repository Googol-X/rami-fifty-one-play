import { Card, RANK_VALUES } from '@/types/game';
import { validateMeld } from '@/utils/validation';
import { Badge } from '@/components/ui/badge';

interface ComboPreviewProps {
  selectedCards: Card[];
  hasInitialMeld: boolean;
}

export function ComboPreview({ selectedCards, hasInitialMeld }: ComboPreviewProps) {
  if (selectedCards.length === 0) return null;

  const validation = validateMeld(selectedCards);
  const points = selectedCards.reduce((sum, card) => sum + RANK_VALUES[card.rank], 0);

  return (
    <div className="bg-card border-2 border-border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground">Combinaison sélectionnée</h4>
        <Badge variant={validation.valid ? "default" : "destructive"}>
          {points} points
        </Badge>
      </div>
      
      <div className="text-sm">
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedCards.map(card => (
            <span key={card.id} className="text-foreground font-medium">
              {card.rank}{card.suit}
            </span>
          ))}
        </div>
        
        {validation.valid ? (
          <p className="text-green-600 dark:text-green-400 font-medium">
            ✓ {validation.details}
          </p>
        ) : (
          <p className="text-destructive text-xs">
            {validation.error}: {validation.details}
          </p>
        )}
      </div>

      {!hasInitialMeld && validation.valid && (
        <div className={`text-xs font-semibold ${points >= 51 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
          {points >= 51 
            ? `✓ Dépôt initial valide (≥51 points)` 
            : `⚠ Dépôt initial requis: ${51 - points} points manquants`
          }
        </div>
      )}
    </div>
  );
}
