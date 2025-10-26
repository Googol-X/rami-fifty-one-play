import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { MatchStateLocal, Player, Seat, TurnState, EmoteEvent, EmoteType } from '@/lib/matchTypes';
import type { TableState, Card, Move } from '@/types/game';
import { createLocalTable } from '@/features/game/deck';
import { applyMove, scoreMeld } from '@/features/game/engine';
import { saveStateManager } from '@/lib/saveState';
import { emoteManager } from '@/lib/emotes';

interface LocalMatchContextValue {
  match: MatchStateLocal | null;
  tableState: TableState | null;
  deck: Record<string, Card>;
  currentPlayer: Player | null;
  isCurrentPlayerTurn: (playerId: string) => boolean;
  
  // Actions
  initMatch: (players: Player[], botDifficulty?: 'easy' | 'medium' | 'hard') => void;
  dispatch: (move: Move) => void;
  nextTurn: () => void;
  sendEmote: (playerId: string, emote: EmoteType) => void;
  endMatch: () => void;
  loadSavedMatch: () => boolean;
  clearMatch: () => void;
}

const LocalMatchContext = createContext<LocalMatchContextValue | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

export function LocalMatchProvider({ children }: Props) {
  const [match, setMatch] = useState<MatchStateLocal | null>(null);
  const [tableState, setTableState] = useState<TableState | null>(null);
  const [deckRef] = useState<{ current: Record<string, Card> }>({ current: {} });
  const [emotes, setEmotes] = useState<EmoteEvent[]>([]);

  // Auto-save state on changes (throttled)
  useEffect(() => {
    if (match && tableState) {
      saveStateManager.saveMatch(match);
    }
  }, [match, tableState]);

  const initMatch = useCallback((players: Player[], botDifficulty?: 'easy' | 'medium' | 'hard') => {
    const matchId = `local-${Date.now()}`;
    const now = Date.now();
    
    // Create seats
    const seats: Seat[] = players.map((player, idx) => ({
      id: `seat-${idx}`,
      playerId: player.id,
      position: idx,
      isActive: true,
    }));

    // Create table state for game engine
    const gamePlayers = players.map(p => ({
      id: p.id,
      displayName: p.name,
    }));
    
    const { table, deck } = createLocalTable(gamePlayers);
    deckRef.current = deck;
    setTableState(table);

    // Create match state
    const hands: Record<string, string[]> = {};
    table.players.forEach(p => {
      hands[`seat-${players.findIndex(pl => pl.id === p.id)}`] = p.hand;
    });

    const scores: Record<string, number> = {};
    players.forEach(p => scores[p.id] = 0);

    const hasOpened: Record<string, boolean> = {};
    players.forEach(p => hasOpened[p.id] = false);

    const newMatch: MatchStateLocal = {
      version: 'localMatch.v1',
      matchId,
      players,
      seats,
      turnState: {
        currentSeatId: seats[0].id,
        phase: 'draw',
        turnNumber: 1,
        timeStarted: now,
      },
      hands,
      scores,
      piles: {
        draw: table.piles.draw,
        discard: table.piles.discard,
      },
      melds: table.melds.map(m => ({
        id: m.id,
        owner: m.owner || '',
        type: m.type,
        cards: m.cards,
        points: scoreMeld(m, deck),
      })),
      hasOpened,
      settings: {
        playerCount: players.length,
        botDifficulty,
      },
      createdAt: now,
      lastSaved: now,
    };

    setMatch(newMatch);
  }, [deckRef]);

  const dispatch = useCallback((move: Move) => {
    setTableState(prev => {
      if (!prev) return prev;
      try {
        const next = applyMove(prev, move, deckRef.current);
        
        // Sync match state
        setMatch(m => {
          if (!m) return m;
          return {
            ...m,
            piles: {
              draw: next.piles.draw,
              discard: next.piles.discard,
            },
            melds: next.melds.map(meld => ({
              id: meld.id,
              owner: meld.owner || '',
              type: meld.type,
              cards: meld.cards,
              points: scoreMeld(meld, deckRef.current),
            })),
            lastSaved: Date.now(),
          };
        });
        
        return next;
      } catch (e: any) {
        console.error('Move error:', e);
        return prev;
      }
    });
  }, [deckRef]);

  const nextTurn = useCallback(() => {
    setMatch(prev => {
      if (!prev) return prev;
      
      const currentSeatIdx = prev.seats.findIndex(s => s.id === prev.turnState.currentSeatId);
      const nextSeatIdx = (currentSeatIdx + 1) % prev.seats.length;
      const nextSeat = prev.seats[nextSeatIdx];

      return {
        ...prev,
        turnState: {
          currentSeatId: nextSeat.id,
          phase: 'draw',
          turnNumber: prev.turnState.turnNumber + 1,
          timeStarted: Date.now(),
        },
        lastSaved: Date.now(),
      };
    });
  }, []);

  const sendEmote = useCallback((playerId: string, emote: EmoteType) => {
    const animation = emoteManager.sendEmote(playerId, emote);
    if (animation) {
      const event: EmoteEvent = {
        id: animation.id,
        emote,
        playerId,
        timestamp: Date.now(),
      };
      setEmotes(prev => [...prev.slice(-10), event]);
      
      // Auto-cleanup
      setTimeout(() => {
        setEmotes(prev => prev.filter(e => e.id !== event.id));
      }, 2500);
    }
  }, []);

  const endMatch = useCallback(() => {
    saveStateManager.clearSave();
    setMatch(null);
    setTableState(null);
  }, []);

  const loadSavedMatch = useCallback(() => {
    const saved = saveStateManager.loadMatch();
    if (!saved) return false;

    // Reconstruct table state from saved match
    const gamePlayers = saved.players.map(p => ({
      id: p.id,
      displayName: p.name,
    }));
    
    const { deck } = createLocalTable(gamePlayers);
    deckRef.current = deck;

    // Reconstruct TableState
    const reconstructed: TableState = {
      id: saved.matchId,
      players: saved.players.map((p, idx) => ({
        id: p.id,
        displayName: p.name,
        hand: saved.hands[`seat-${idx}`] || [],
        laidPoints: 0,
        hasOpened: saved.hasOpened[p.id] || false,
      })),
      activePlayer: saved.players[saved.seats.findIndex(s => s.id === saved.turnState.currentSeatId)]?.id || saved.players[0].id,
      melds: saved.melds,
      piles: saved.piles,
      phase: saved.turnState.phase,
    };

    setMatch(saved);
    setTableState(reconstructed);
    return true;
  }, [deckRef]);

  const clearMatch = useCallback(() => {
    endMatch();
  }, [endMatch]);

  const currentPlayer = match 
    ? match.players[match.seats.findIndex(s => s.id === match.turnState.currentSeatId)]
    : null;

  const isCurrentPlayerTurn = useCallback((playerId: string) => {
    if (!match) return false;
    return currentPlayer?.id === playerId;
  }, [match, currentPlayer]);

  const value: LocalMatchContextValue = {
    match,
    tableState,
    deck: deckRef.current,
    currentPlayer,
    isCurrentPlayerTurn,
    initMatch,
    dispatch,
    nextTurn,
    sendEmote,
    endMatch,
    loadSavedMatch,
    clearMatch,
  };

  return (
    <LocalMatchContext.Provider value={value}>
      {children}
    </LocalMatchContext.Provider>
  );
}

export function useLocalMatch() {
  const ctx = useContext(LocalMatchContext);
  if (!ctx) throw new Error('useLocalMatch must be used within LocalMatchProvider');
  return ctx;
}
