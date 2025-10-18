import { useState } from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { TableState, Move, Card as GameCard } from '@/types/game';

/**
 * Écran sandbox pour tester le nouveau moteur de jeu
 * Activable via feature flag sans impacter l'UX globale
 */
function SandboxContent() {
  const { state, dispatch, initGame, isMultiplayer } = useGame();

  const handleInitGame = () => {
    // Créer un deck de test
    const testCards: GameCard[] = [
      { id: '10-spades', rank: '10', suit: '♠' },
      { id: 'j-spades', rank: 'J', suit: '♠' },
      { id: 'q-spades', rank: 'Q', suit: '♠' },
      { id: 'k-spades', rank: 'K', suit: '♠' },
      { id: '9-hearts', rank: '9', suit: '♥' },
      { id: '10-hearts', rank: '10', suit: '♥' },
      { id: 'j-hearts', rank: 'J', suit: '♥' },
    ];

    const initialState: TableState = {
      id: 'sandbox-game',
      players: [
        {
          id: 'player-1',
          displayName: 'Test Player',
          hand: ['10-spades', 'j-spades', 'q-spades'],
          laidPoints: 0,
          hasOpened: false,
        },
        {
          id: 'player-2',
          displayName: 'Opponent',
          hand: ['9-hearts', '10-hearts', 'j-hearts'],
          laidPoints: 0,
          hasOpened: false,
        },
      ],
      activePlayer: 'player-1',
      melds: [],
      piles: {
        draw: ['k-spades'],
        discard: [],
      },
      phase: 'draw',
    };

    initGame(initialState);
  };

  const handleDrawFromStock = () => {
    const move: Move = {
      kind: 'DRAW_FROM_STOCK',
      playerId: 'player-1',
    };
    dispatch(move);
  };

  const handleDiscard = () => {
    const move: Move = {
      kind: 'DISCARD',
      playerId: 'player-1',
      cardId: '10-spades',
    };
    dispatch(move);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🎮 Game Sandbox</h1>
            <p className="text-muted-foreground mt-1">
              Environnement de test pour le nouveau moteur de jeu
            </p>
          </div>
          {isMultiplayer && (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Multijoueur actif
            </div>
          )}
        </div>

        {/* Controls */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contrôles</h2>
          <div className="flex gap-3">
            <Button onClick={handleInitGame} variant="default">
              Initialiser une partie
            </Button>
            <Button onClick={handleDrawFromStock} variant="outline" disabled={!state}>
              Piocher (Stock)
            </Button>
            <Button onClick={handleDiscard} variant="outline" disabled={!state}>
              Défausser 10♠
            </Button>
          </div>
        </Card>

        {/* State Display */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">État du jeu</h2>
          {state ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Informations</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID de partie:</span>{' '}
                    <span className="font-mono">{state.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phase:</span>{' '}
                    <span className="font-semibold">{state.phase}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Joueur actif:</span>{' '}
                    <span className="font-semibold">{state.activePlayer}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Combinaisons posées:</span>{' '}
                    <span className="font-semibold">{state.melds.length}</span>
                  </div>
                </div>
              </div>

              {/* Players */}
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Joueurs</h3>
                <div className="space-y-3">
                  {state.players.map((player) => (
                    <div
                      key={player.id}
                      className="p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{player.displayName}</span>
                        <span className="text-sm text-muted-foreground">
                          {player.hasOpened ? '✓ Ouvert' : '✗ Non ouvert'}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">Main:</span>{' '}
                          <span className="font-mono">{player.hand.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Points posés:</span>{' '}
                          <span className="font-semibold">{player.laidPoints}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Piles */}
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Piles</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Pioche:</span>{' '}
                    <span className="font-semibold">{state.piles.draw.length} cartes</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Défausse:</span>{' '}
                    <span className="font-semibold">{state.piles.discard.length} cartes</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">
              Aucune partie initialisée. Cliquez sur "Initialiser une partie" pour commencer.
            </p>
          )}
        </Card>

        {/* Debug */}
        <details className="bg-muted/30 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-sm">
            JSON brut de l'état
          </summary>
          <pre className="mt-4 text-xs overflow-auto">
            {state ? JSON.stringify(state, null, 2) : 'null'}
          </pre>
        </details>
      </div>
    </div>
  );
}

export function GameSandbox() {
  return (
    <GameProvider>
      <SandboxContent />
    </GameProvider>
  );
}
