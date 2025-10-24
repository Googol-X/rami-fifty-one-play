import React from 'react';
import type { TableState, Card, Move } from "@/types/game";
import { applyMove } from "@/features/game/engine";
import { createLocalTable } from "@/features/game/deck";

export interface RTTransport {
  publish(roomId: string, payload: any): Promise<void>;
  subscribe(roomId: string, onMessage: (payload: any) => void): { unsubscribe(): void };
  loadState?(roomId: string): Promise<TableState | null>;
  saveState?(roomId: string, state: TableState): Promise<void>;
}

interface GameContextValue {
  state: TableState | null;
  deck: Record<string, Card>;
  initLocal(players: { id: string; displayName: string }[]): void;
  dispatch(move: Move): void;
  reorderHand(playerId: string, newOrder: string[]): void;
}

const GameContext = React.createContext<GameContextValue | undefined>(undefined);

type GameProviderProps = {
  children: React.ReactNode;
  transport?: RTTransport;
  roomId?: string;
};

export const GameProvider: React.FC<GameProviderProps> = ({ children, transport, roomId }) => {
  const [state, setState] = React.useState<TableState | null>(null);
  const deckRef = React.useRef<Record<string, Card>>({});

  const initLocal = React.useCallback((players: { id: string; displayName: string }[]) => {
    const { table, deck } = createLocalTable(players);
    deckRef.current = deck;
    setState(table);
  }, []);

  React.useEffect(() => {
    if (!roomId || !transport) return;
    let unsub: { unsubscribe(): void } | null = null;

    (async () => {
      if (transport.loadState) {
        const snap = await transport.loadState(roomId);
        if (snap) setState(snap);
      }
      unsub = transport.subscribe(roomId, (incomingMove) => {
        setState(prev => (prev ? applyMove(prev, incomingMove, deckRef.current) : prev));
      });
    })();

    return () => { if (unsub) unsub.unsubscribe(); };
  }, [roomId, transport]);

  const dispatch = React.useCallback((move: Move) => {
    setState((prev) => {
      if (!prev) return prev;
      try {
        const next = applyMove(prev, move, deckRef.current);
        // publier si realtime
        if (roomId && transport) transport.publish(roomId, move);
        // snapshot après discard/end_turn
        if (roomId && transport && (move.kind === 'DISCARD' || move.kind === 'END_TURN') && transport.saveState) {
          transport.saveState(roomId, next);
        }
        return next;
      } catch (e: any) {
        alert(e?.message ?? "Mouvement invalide");
        return prev;
      }
    });
  }, [roomId, transport]);

  const reorderHand = React.useCallback((playerId: string, newOrder: string[]) => {
    setState((prev) => {
      if (!prev) return prev;
      
      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return prev;
      
      const player = prev.players[playerIndex];
      
      // Verify all cards are present
      if (newOrder.length !== player.hand.length) return prev;
      const hasAllCards = newOrder.every(id => player.hand.includes(id));
      if (!hasAllCards) return prev;
      
      // Create new state with reordered hand
      const newPlayers = [...prev.players];
      newPlayers[playerIndex] = {
        ...player,
        hand: newOrder
      };
      
      return {
        ...prev,
        players: newPlayers
      };
    });
  }, []);

  const value: GameContextValue = { state, deck: deckRef.current, initLocal, dispatch, reorderHand };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export function useGame() {
  const ctx = React.useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
