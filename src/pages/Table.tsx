import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { Table as GameTable } from '@/features/game/ui/Table';
import { Hand } from '@/features/game/ui/Hand';
import { ActionBar } from '@/features/game/ui/ActionBar';
import { Scoreboard } from '@/features/game/ui/Scoreboard';
import type { Move } from '@/types/game';

function TableContent() {
  const { state, deck, dispatch, initLocal } = useGame();
  const { toast } = useToast();
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [roundNumber, setRoundNumber] = useState(1);

  React.useEffect(() => {
    if (!state) {
      // Initialize local game with 2 players
      initLocal([
        { id: 'p1', displayName: 'Toi' },
        { id: 'p2', displayName: 'Bot' }
      ]);
    }
  }, [state, initLocal]);

  if (!state) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de la partie...</p>
        </div>
      </div>
    );
  }

  const me = state.players.find((p) => p.id === 'p1')!;
  const isMyTurn = state.activePlayer === 'p1';

  const toggleCard = (id: string) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const doMove = (move: Move) => {
    try {
      dispatch(move);
      if (move.kind === 'END_TURN') {
        setRoundNumber(prev => prev + 1);
      }
      setSelectedCards(new Set());
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Mouvement invalide',
        variant: 'destructive',
      });
    }
  };

  const handleDrawStock = () => {
    if (!isMyTurn) {
      toast({
        title: 'Ce n\'est pas votre tour',
        variant: 'destructive',
      });
      return;
    }
    doMove({ kind: 'DRAW_FROM_STOCK', playerId: 'p1' });
  };

  const handleDrawDiscard = () => {
    if (!isMyTurn) {
      toast({
        title: 'Ce n\'est pas votre tour',
        variant: 'destructive',
      });
      return;
    }
    doMove({ kind: 'DRAW_FROM_DISCARD', playerId: 'p1' });
  };

  const handleLayOpen = () => {
    if (selectedCards.size < 3) {
      toast({
        title: 'Sélection insuffisante',
        description: 'Sélectionnez au moins 3 cartes',
        variant: 'destructive',
      });
      return;
    }
    const meld = { type: 'run', cards: Array.from(selectedCards) } as any;
    doMove({ kind: 'LAY_OPEN', playerId: 'p1', melds: [meld] } as Move);
  };

  const handleLayMeld = () => {
    if (selectedCards.size < 3) {
      toast({
        title: 'Sélection insuffisante',
        description: 'Sélectionnez au moins 3 cartes',
        variant: 'destructive',
      });
      return;
    }
    const meld = { type: 'run', cards: Array.from(selectedCards) } as any;
    doMove({ kind: 'LAY_MELD', playerId: 'p1', meld } as Move);
  };

  const handleDiscard = () => {
    const [first] = Array.from(selectedCards);
    if (!first) {
      toast({
        title: 'Aucune carte sélectionnée',
        description: 'Sélectionnez une carte à défausser',
        variant: 'destructive',
      });
      return;
    }
    doMove({ kind: 'DISCARD', playerId: 'p1', cardId: first } as Move);
  };


  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Scoreboard */}
      <Scoreboard
        meldsCount={state.melds.length}
        stockCount={state.piles.draw.length}
        roundNumber={roundNumber}
        onQuit={() => window.location.href = '/lobby'}
      />

      {/* Main game table */}
      <div className="pt-16 pb-32 h-full">
        <GameTable
          state={state}
          deck={deck}
          currentPlayerId="p1"
        />
      </div>

      {/* Player's hand - sticky at bottom above action bar */}
      <div className="fixed bottom-24 left-0 right-0 z-30 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4">
        <div className="container mx-auto px-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Ta main ({me.hand.length} cartes)
          </h3>
          <Hand 
            cards={me.hand} 
            deck={deck} 
            selected={selectedCards} 
            onToggle={toggleCard} 
            size="md" 
          />
        </div>
      </div>

      {/* Action bar */}
      <ActionBar
        onDrawStock={handleDrawStock}
        onDrawDiscard={handleDrawDiscard}
        onLayOpen={handleLayOpen}
        onLayMeld={handleLayMeld}
        onDiscard={handleDiscard}
        onEndTurn={() => doMove({ kind: 'END_TURN', playerId: 'p1' })}
        hasOpened={me.hasOpened}
        canAct={isMyTurn}
      />
    </div>
  );
}

export default function Table() {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');

  return (
    <GameProvider roomId={gameId || undefined}>
      <TableContent />
    </GameProvider>
  );
}
