import React from 'react';
import { useGame } from '@/contexts/GameContext';
import type { Move } from '@/types/game';
import { Hand } from '../ui/Hand';

const P1 = { id: 'p1', displayName: 'Toi' };
const P2 = { id: 'p2', displayName: 'Bot' };

type MeldKind = 'set' | 'run';

export default function Sandbox() {
  const { state, deck, initLocal, dispatch } = useGame();
  const [meldKind, setMeldKind] = React.useState<MeldKind>('run');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!state) initLocal([P1, P2]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!state) return <div className="p-4">Initialisation…</div>;

  const me = state.players.find((p) => p.id === P1.id)!;
  const topDiscard = state.piles.discard[state.piles.discard.length - 1];

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const doMove = (move: Move) => dispatch(move);

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
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Sandbox Rami 51 (offline)</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h2 className="font-semibold">État</h2>
          <div className="text-sm">Phase: <b>{state.phase}</b></div>
          <div className="text-sm">Actif: <b>{state.activePlayer}</b></div>
          <div className="text-sm">Défausse (top): <b>{topDiscard ? topDiscard : '—'}</b></div>
          <div className="text-sm">Melds posés: <b>{state.melds.length}</b></div>
          {state.winner && <div className="text-green-700 font-semibold">Gagnant: {state.winner}</div>}
          <pre className="bg-neutral-100 p-2 rounded text-xs max-h-72 overflow-auto">{JSON.stringify(state, null, 2)}</pre>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => doMove({ kind: 'DRAW_FROM_STOCK', playerId: P1.id } as Move)}>Piocher (pioche)</button>
            <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => doMove({ kind: 'DRAW_FROM_DISCARD', playerId: P1.id } as Move)}>Piocher (défausse)</button>
            <button className="px-3 py-1 rounded bg-amber-600 text-white" onClick={discardOne}>Défausser (1 sélection)</button>
            <button className="px-3 py-1 rounded bg-slate-700 text-white" onClick={() => doMove({ kind: 'END_TURN', playerId: P1.id } as Move)}>Fin de tour</button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1">
              <input type="radio" name="meld" checked={meldKind==='run'} onChange={()=>setMeldKind('run')} />
              <span>Suite (RUN)</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="meld" checked={meldKind==='set'} onChange={()=>setMeldKind('set')} />
              <span>Brelan/Carré (SET)</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {!me.hasOpened ? (
              <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={layOpen}>Poser 51 (avec sélection)</button>
            ) : (
              <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={layMeld}>Poser une combinaison</button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Ta main ({me.hand.length} cartes) — clique pour sélectionner</h2>
        <Hand cards={me.hand} deck={deck} selected={selected} onToggle={toggle} />
      </div>
    </div>
  );
}
