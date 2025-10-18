import React from 'react';
import type { TableState, Card, Move } from "@/types/game";
import { applyMove } from "@/features/game/engine";
import { createLocalTable } from "@/features/game/deck";

interface GameContextValue {
  state: TableState | null;
  deck: Record<string, Card>;
  initLocal(players: { id: string; displayName: string }[]): void;
  dispatch(move: Move): void;
}

const GameContext = React.createContext<GameContextValue | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<TableState | null>(null);
  const deckRef = React.useRef<Record<string, Card>>({});

  const initLocal = React.useCallback((players: { id: string; displayName: string }[]) => {
    const { table, deck } = createLocalTable(players);
    deckRef.current = deck;
    setState(table);
  }, []);

  const dispatch = React.useCallback((move: Move) => {
    setState((prev) => {
      if (!prev) return prev;
      try {
        const next = applyMove(prev, move, deckRef.current);
        return next;
      } catch (e: any) {
        alert(e?.message ?? "Mouvement invalide");
        return prev;
      }
    });
  }, []);

  const value: GameContextValue = { state, deck: deckRef.current, initLocal, dispatch };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export function useGame() {
  const ctx = React.useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
