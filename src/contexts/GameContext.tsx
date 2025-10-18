import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { TableState, Move, Card } from '@/types/game';
import { applyMove } from '@/features/game/engine';
import type { RTTransport, RTSubscription } from '@/services/realtime';
import { NoopTransport } from '@/services/realtime';

interface GameContextValue {
  state: TableState | null;
  dispatch: (move: Move) => void;
  initGame: (initialState: TableState, roomId?: string) => void;
  isMultiplayer: boolean;
  deck: Record<string, Card>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
  transport?: RTTransport;
  deck?: Record<string, Card>;
}

/**
 * Provider mince pour gérer l'état du jeu
 * - Maintient TableState local
 * - Dispatch des moves via applyMove
 * - Publie sur RTTransport si multijoueur
 * - Écoute les moves entrants en multijoueur
 */
export function GameProvider({ children, transport, deck = {} }: GameProviderProps) {
  const [state, setState] = useState<TableState | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [rtTransport] = useState<RTTransport>(transport || new NoopTransport());
  const [subscription, setSubscription] = useState<RTSubscription | null>(null);

  const isMultiplayer = roomId !== null;

  /**
   * Initialiser une nouvelle partie
   */
  const initGame = useCallback((initialState: TableState, gameRoomId?: string) => {
    console.log('[GameContext] Initializing game', { initialState, gameRoomId });
    setState(initialState);
    setRoomId(gameRoomId || null);

    // Rejoindre la room si multijoueur
    if (gameRoomId) {
      rtTransport.joinRoom(gameRoomId).catch((err) => {
        console.error('[GameContext] Failed to join room', err);
      });
    }
  }, [rtTransport]);

  /**
   * Dispatcher un move
   * - Applique localement via applyMove
   * - Publie sur RTTransport si multijoueur
   */
  const dispatch = useCallback((move: Move) => {
    if (!state) {
      console.warn('[GameContext] Cannot dispatch move: no game state');
      return;
    }

    console.log('[GameContext] Dispatching move', move);

    // Appliquer le move localement
    const newState = applyMove(state, move, deck);
    setState(newState);

    // Publier sur le transport si multijoueur
    if (isMultiplayer && roomId) {
      rtTransport.publish(roomId, { type: 'move', move, state: newState }).catch((err) => {
        console.error('[GameContext] Failed to publish move', err);
      });
    }
  }, [state, deck, isMultiplayer, roomId, rtTransport]);

  /**
   * Écouter les moves entrants (multijoueur)
   */
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    console.log('[GameContext] Subscribing to room', roomId);

    const sub = rtTransport.subscribe<{ type: string; move: Move; state: TableState }>(
      roomId,
      (payload) => {
        console.log('[GameContext] Received message', payload);

        if (payload.type === 'move' && payload.move && payload.state) {
          // Réappliquer le move pour synchroniser l'état
          setState(payload.state);
        }
      }
    );

    setSubscription(sub);

    return () => {
      console.log('[GameContext] Unsubscribing from room', roomId);
      sub.unsubscribe();
      rtTransport.leaveRoom(roomId).catch((err) => {
        console.error('[GameContext] Failed to leave room', err);
      });
    };
  }, [isMultiplayer, roomId, rtTransport]);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        initGame,
        isMultiplayer,
        deck,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte de jeu
 */
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
