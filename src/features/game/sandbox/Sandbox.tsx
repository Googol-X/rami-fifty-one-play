import React from 'react';
import { useGame } from '@/contexts/GameContext';
import type { Move } from '@/types/game';
import { Hand } from '../ui/Hand';
import { Table } from '../ui/Table';
import { ActionBar } from '../ui/ActionBar';
import { Scoreboard } from '../ui/Scoreboard';

const P1 = { id: 'p1', displayName: 'Toi' };
const P2 = { id: 'p2', displayName: 'Bot' };

type MeldKind = 'set' | 'run';

export default function Sandbox() {
  const { state, deck, initLocal, dispatch } = useGame();
  const [meldKind, setMeldKind] = React.useState<MeldKind>('run');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [handScale, setHandScale] = React.useState(1);
  const [playersCount, setPlayersCount] = React.useState(2);
  const [roundNumber, setRoundNumber] = React.useState(1);

  React.useEffect(() => {
    if (!state) initLocal([P1, P2]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!state) return <div className="p-4">Initialisation…</div>;

  const me = state.players.find((p) => p.id === P1.id)!;
  const isMyTurn = state.activePlayer === P1.id;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const doMove = (move: Move) => {
    dispatch(move);
    if (move.kind === 'END_TURN') {
      setRoundNumber(prev => prev + 1);
    }
  };

  const layOpen = () => {
    if (selected.size < 3) return alert('Sélectionne au moins 3 cartes');
    const meld = { type: meldKind, cards: Array.from(selected) } as any;
    doMove({ kind: 'LAY_OPEN', playerId: P1.id, melds: [meld] } as Move);
    setSelected(new Set());
  };

  const layMeld = () => {
    if (selected.size < 3) return alert('Sélectionne au moins 3 cartes');
    const meld = { type: meldKind, cards: Array.from(selected) } as any;
    doMove({ kind: 'LAY_MELD', playerId: P1.id, meld } as Move);
    setSelected(new Set());
  };

  const discardOne = () => {
    const [first] = Array.from(selected);
    if (!first) return alert('Sélectionne une carte à défausser');
    doMove({ kind: 'DISCARD', playerId: P1.id, cardId: first } as Move);
    setSelected(new Set());
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Scoreboard */}
      <Scoreboard
        meldsCount={state.melds.length}
        stockCount={state.piles.draw.length}
        roundNumber={roundNumber}
        onQuit={() => window.location.href = '/'}
      />

      {/* Main game table */}
      <div className="pt-16 pb-32 h-full">
        <Table
          state={state}
          deck={deck}
          currentPlayerId={P1.id}
        />
      </div>

      {/* Player's hand - sticky at bottom above action bar */}
      <div className="fixed bottom-16 md:bottom-24 left-0 right-0 z-30 bg-gradient-to-t from-background via-background to-transparent pt-2 md:pt-6 pb-2 md:pb-4">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h3 className="text-xs md:text-sm font-semibold text-muted-foreground">
              Ta main ({me.hand.length} cartes)
            </h3>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-2">
                <label className="flex items-center gap-1 text-sm">
                  <input 
                    type="radio" 
                    name="meld" 
                    checked={meldKind==='run'} 
                    onChange={()=>setMeldKind('run')} 
                  />
                  <span>Suite</span>
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input 
                    type="radio" 
                    name="meld" 
                    checked={meldKind==='set'} 
                    onChange={()=>setMeldKind('set')} 
                  />
                  <span>Brelan</span>
                </label>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <label className="text-sm">Zoom</label>
                <input 
                  type="range" 
                  min={0.8} 
                  max={1.2} 
                  step={0.05} 
                  value={handScale} 
                  onChange={(e)=>setHandScale(parseFloat(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          </div>
          <Hand 
            cards={me.hand} 
            deck={deck} 
            selected={selected} 
            onToggle={toggle} 
            size="md" 
            scale={handScale} 
          />
        </div>
      </div>

      {/* Action bar */}
      <ActionBar
        onDrawStock={() => doMove({ kind: 'DRAW_FROM_STOCK', playerId: P1.id })}
        onDrawDiscard={() => doMove({ kind: 'DRAW_FROM_DISCARD', playerId: P1.id })}
        onLayOpen={layOpen}
        onLayMeld={layMeld}
        onDiscard={discardOne}
        onEndTurn={() => doMove({ kind: 'END_TURN', playerId: P1.id })}
        hasOpened={me.hasOpened}
        canAct={isMyTurn}
      />
    </div>
  );
}
