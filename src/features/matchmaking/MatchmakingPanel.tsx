import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * MATCHMAKING PANEL - Recherche automatique d'adversaires
 * 
 * TODO (Phase 2):
 * - Algorithme de matchmaking par niveau
 * - File d'attente avec estimation de temps
 * - Annulation de recherche
 * - Modes de jeu (classé, rapide, amical)
 * - Intégration avec backend pour queue
 */

interface MatchmakingPanelProps {
  onCancel?: () => void;
}

export const MatchmakingPanel = ({ onCancel }: MatchmakingPanelProps) => {
  // TODO: Implémenter logique matchmaking
  const isSearching = false;

  const startMatchmaking = () => {
    console.log('[MATCHMAKING] Start searching - À implémenter');
    // TODO: Rejoindre file d'attente
    // TODO: WebSocket pour mise à jour temps réel
    // TODO: Créer partie quand adversaire trouvé
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">🎮 Matchmaking</h3>
        <p className="text-sm text-muted-foreground">
          Trouvez un adversaire de votre niveau
        </p>
      </div>

      {isSearching ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm">Recherche d'un adversaire...</p>
          <p className="text-xs text-muted-foreground">Temps estimé: ~30s</p>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={startMatchmaking}
            disabled
          >
            🏆 Partie Classée
          </Button>
          <Button 
            className="w-full" 
            variant="secondary"
            disabled
          >
            ⚡ Partie Rapide
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            disabled
          >
            🎲 Partie Amicale
          </Button>
          <p className="text-xs text-center text-muted-foreground pt-2">
            Fonctionnalité en développement
          </p>
        </div>
      )}
    </Card>
  );
};
