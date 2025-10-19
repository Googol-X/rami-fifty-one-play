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
  const [handScale, setHandScale] = React.useState(1);
  const [playersCount, setPlayersCount] = React.useState(2);

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
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b p-2 flex flex-wrap items-center gap-2">
        <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={() => doMove({ kind: 'DRAW_FROM_STOCK', playerId: P1.id } as Move)}>Piocher (pioche)</button>
        <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={() => doMove({ kind: 'DRAW_FROM_DISCARD', playerId: P1.id } as Move)}>Piocher (défausse)</button>
        <button className="px-3 py-1 rounded bg-amber-600 text-white text-sm" onClick={discardOne}>Défausser</button>
        <button className="px-3 py-1 rounded bg-slate-700 text-white text-sm" onClick={() => doMove({ kind: 'END_TURN', playerId: P1.id } as Move)}>Fin de tour</button>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input type="radio" name="meld" checked={meldKind==='run'} onChange={()=>setMeldKind('run')} />
            <span>Suite</span>
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="radio" name="meld" checked={meldKind==='set'} onChange={()=>setMeldKind('set')} />
            <span>Brelan</span>
          </label>
        </div>

        {!me.hasOpened ? (
          <button className="px-3 py-1 rounded bg-emerald-600 text-white text-sm" onClick={layOpen}>Poser 51</button>
        ) : (
          <button className="px-3 py-1 rounded bg-emerald-600 text-white text-sm" onClick={layMeld}>Poser combi</button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm">Zoom main</label>
          <input 
            type="range" 
            min={0.8} 
            max={1.2} 
            step={0.05} 
            value={handScale} 
            onChange={(e)=>setHandScale(parseFloat(e.target.value))}
            className="w-24"
          />
          <label className="text-sm">Joueurs</label>
          <select 
            value={playersCount} 
            onChange={(e)=>{ 
              const n=Number(e.target.value); 
              setPlayersCount(n); 
              initLocal(Array.from({length:n}).map((_,i)=>({id:`p${i+1}`,displayName:i===0?'Toi':`Bot ${i}`}))); 
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
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
            <h2 className="font-semibold">Tous les joueurs</h2>
            {state.players.map((p) => (
              <div key={p.id} className="text-sm border-l-2 pl-2 border-primary/20">
                <div className="font-semibold">{p.displayName} {p.id === state.activePlayer && '🎯'}</div>
                <div>Main: {p.hand.length} cartes</div>
                <div>Ouvert: {p.hasOpened ? '✅' : '❌'} ({p.laidPoints} pts)</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Adversaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {state.players.filter(p=>p.id!==me.id).map(p=>(
              <div key={p.id} className={`border rounded p-2 ${state.activePlayer===p.id?'ring-2 ring-blue-400':''}`}>
                <div className="font-semibold">{p.displayName}</div>
                <div className="text-sm text-gray-500">Cartes: {p.hand.length}</div>
                <div className="text-xs text-gray-400">Main cachée</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Melds sur table ({state.melds.length})</h3>
          <div className="flex flex-wrap gap-2">
            {state.melds.map(m=>(
              <div key={m.id} className="border rounded px-2 py-1 text-sm">
                <span className="mr-2">{m.type.toUpperCase()}</span>
                {m.cards.map(cid=> <span key={cid} className="inline-block mr-1">{deck[cid]?.joker?'🃏':`${deck[cid]?.rank}${deck[cid]?.suit}`}</span>)}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Ta main ({me.hand.length} cartes) — clique pour sélectionner</h2>
          <Hand cards={me.hand} deck={deck} selected={selected} onToggle={toggle} size="sm" scale={handScale} />
        </div>
      </div>
    </div>
  );
}
