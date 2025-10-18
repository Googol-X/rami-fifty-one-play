import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { applyMove } from '@/features/game/engine';
import type { TableState, Move, Card as GameCard } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/services/analytics.service';

/**
 * Crée un deck complet de cartes pour les tests
 */
function createTestDeck(): Record<string, GameCard> {
  const suits: GameCard['suit'][] = ['♠', '♥', '♦', '♣'];
  const ranks: GameCard['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Record<string, GameCard> = {};

  suits.forEach(suit => {
    ranks.forEach(rank => {
      const id = `${rank}-${suit}`;
      deck[id] = { id, rank, suit };
    });
  });

  return deck;
}

/**
 * Écran sandbox pour tester le nouveau moteur de jeu (offline)
 */
export function GameSandbox() {
  const { toast } = useToast();
  const deck = useMemo(() => createTestDeck(), []);
  
  const [state, setState] = useState<TableState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dispatcher un move avec gestion d'erreur
  const dispatch = (move: Move) => {
    if (!state) {
      setError('Aucune partie initialisée');
      return;
    }

    try {
      const newState = applyMove(state, move, deck);
      setState(newState);
      setError(null);
      
      // Track move played
      analytics.trackMovePlayed(move.kind, state.id, state.players[0].hand.length);
      
      // Track open attempt specifically
      if (move.kind === 'LAY_OPEN') {
        const player = state.players.find(p => p.id === move.playerId);
        const success = !player?.hasOpened; // Will succeed if player hasn't opened yet
        analytics.trackOpenAttempt(player?.laidPoints || 0, success, state.id);
      }
      
      toast({
        title: "✓ Move appliqué",
        description: `${move.kind}`,
      });
    } catch (e: any) {
      setError(e.message);
      
      // Track failed open attempt
      if (move.kind === 'LAY_OPEN') {
        analytics.trackOpenAttempt(0, false, state?.id || 'sandbox');
      }
      
      toast({
        title: "Erreur",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  // Initialiser une partie
  const handleInit = () => {
    const initialState: TableState = {
      id: 'sandbox',
      players: [
        {
          id: 'p1',
          displayName: 'Toi',
          hand: ['10-♠', 'J-♠', 'Q-♠', 'K-♠', 'A-♥', '2-♥', '3-♥', '4-♥', '5-♥', '6-♥'],
          laidPoints: 0,
          hasOpened: false,
        },
        {
          id: 'p2',
          displayName: 'Bot',
          hand: ['9-♥', '10-♥', 'J-♥', 'Q-♥', 'K-♥', 'A-♦', '2-♦', '3-♦', '4-♦', '5-♦'],
          laidPoints: 0,
          hasOpened: false,
        },
      ],
      activePlayer: 'p1',
      melds: [],
      piles: {
        draw: ['7-♥', '8-♥', '9-♠', '8-♠', '7-♠', '6-♠', '5-♠', '4-♠', '3-♠', '2-♠'],
        discard: [],
      },
      phase: 'draw',
    };
    setState(initialState);
    setError(null);
  };

  const player = state?.players[0];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">🎮 Sandbox Rami 51</h1>
          <p className="text-sm text-muted-foreground mt-1">Mode offline - Test du moteur</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Phase & Active Player */}
        {state && (
          <div className="flex gap-2 text-sm">
            <span className="px-2 py-1 bg-muted rounded">Phase: {state.phase}</span>
            <span className="px-2 py-1 bg-muted rounded">Actif: {state.activePlayer}</span>
            {state.winner && <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-300 rounded">🏆 Gagnant: {state.winner}</span>}
          </div>
        )}

        {/* Controls */}
        <Card className="p-4">
          {!state ? (
            <Button onClick={handleInit} size="lg" className="w-full">
              🎲 Initialiser une partie
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => dispatch({ kind: 'DRAW_FROM_STOCK', playerId: 'p1' })}
                  variant="outline" 
                  size="sm"
                  disabled={state.phase !== 'draw'}
                >
                  📥 Piocher stock
                </Button>
                <Button 
                  onClick={() => dispatch({ kind: 'DRAW_FROM_DISCARD', playerId: 'p1' })}
                  variant="outline"
                  size="sm"
                  disabled={state.phase !== 'draw' || state.piles.discard.length === 0}
                >
                  ♻️ Piocher défausse
                </Button>
              </div>
              
              <Button 
                onClick={() => dispatch({
                  kind: 'LAY_OPEN',
                  playerId: 'p1',
                  melds: [
                    { id: '', type: 'run', cards: ['10-♠', 'J-♠', 'Q-♠', 'K-♠'] },
                    { id: '', type: 'run', cards: ['A-♥', '2-♥', '3-♥', '4-♥', '5-♥', '6-♥'] },
                  ],
                })}
                variant="default"
                size="sm"
                className="w-full"
                disabled={state.phase !== 'play' || player?.hasOpened}
              >
                🎯 Poser ≥51 pts (10♠-K♠ + A♥-6♥)
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => dispatch({ kind: 'DISCARD', playerId: 'p1', cardId: player?.hand[0] || '' })}
                  variant="outline"
                  size="sm"
                  disabled={state.phase !== 'play' || !player?.hand[0]}
                >
                  🗑️ Défausser 1ère carte
                </Button>
                <Button 
                  onClick={() => dispatch({ kind: 'END_TURN', playerId: 'p1' })}
                  variant="secondary" 
                  size="sm"
                  disabled={state.phase !== 'discard'}
                >
                  ⏭️ Fin tour
                </Button>
              </div>

              <Button onClick={handleInit} variant="ghost" size="sm" className="w-full">
                🔄 Nouvelle partie
              </Button>
            </div>
          )}
        </Card>

        {/* State Display */}
        {state && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">État du jeu</h3>
            <div className="space-y-3 text-sm">
              {state.players.map((p) => (
                <div key={p.id} className="p-3 bg-muted/50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{p.displayName}</span>
                    <span className="text-xs">{p.hasOpened ? '✓ Ouvert' : '✗ Fermé'}</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div>Main: {p.hand.join(', ')}</div>
                    <div>Points: {p.laidPoints}</div>
                  </div>
                </div>
              ))}
              
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <span className="text-muted-foreground">Pioche:</span>{' '}
                  <span className="font-mono">{state.piles.draw.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Défausse:</span>{' '}
                  <span className="font-mono">{state.piles.discard.length}</span>
                  {state.piles.discard.length > 0 && (
                    <span className="ml-1">({state.piles.discard[state.piles.discard.length - 1]})</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Melds:</span>{' '}
                  <span className="font-mono">{state.melds.length}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Debug JSON */}
        <details className="text-xs">
          <summary className="cursor-pointer font-medium p-2 bg-muted rounded">
            JSON brut
          </summary>
          <pre className="mt-2 p-3 bg-muted/50 rounded overflow-auto max-h-96">
            {state ? JSON.stringify(state, null, 2) : 'null'}
          </pre>
        </details>
      </div>
    </div>
  );
}
