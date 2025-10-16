import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card as CardType } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

interface GameState {
  deck: CardType[];
  discard_pile: CardType[];
  player_hands: { [key: number]: CardType[] };
  player_melds: { [key: number]: CardType[][] };
  current_turn: number;
  phase: 'draw' | 'play' | 'discard';
  last_action: string;
}

export const useMultiplayer = (gameId: string | null) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!gameId || !userId) return;

    loadGameData();

    const gameChannel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_state',
          filter: `game_id=eq.${gameId}`
        },
        () => loadGameState()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `game_id=eq.${gameId}`
        },
        () => loadPlayers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [gameId, userId]);

  const loadGameData = async () => {
    await loadPlayers();
    await loadGameState();
  };

  const loadPlayers = async () => {
    if (!gameId) return;

    const { data: game } = await supabase
      .from('games')
      .select('host_id')
      .eq('id', gameId)
      .single();

    if (game && userId) {
      setIsHost(game.host_id === userId);
    }

    const { data: gamePlayers, error } = await supabase
      .from('game_players')
      .select(`
        player_index,
        player_id,
        profiles(username)
      `)
      .eq('game_id', gameId)
      .order('player_index');

    if (error) {
      console.error('Error loading players:', error);
      return;
    }

    setPlayers(gamePlayers || []);
    
    const currentPlayer = gamePlayers?.find(p => p.player_id === userId);
    if (currentPlayer) {
      setCurrentPlayerIndex(currentPlayer.player_index);
    }
  };

  const loadGameState = async () => {
    if (!gameId) return;

    const { data, error } = await supabase
      .from('game_state')
      .select('*')
      .eq('game_id', gameId)
      .single();

    if (error) {
      console.error('Error loading game state:', error);
      return;
    }

    if (data) {
      setGameState({
        deck: data.deck as unknown as CardType[],
        discard_pile: data.discard_pile as unknown as CardType[],
        player_hands: data.player_hands as unknown as { [key: number]: CardType[] },
        player_melds: data.player_melds as unknown as { [key: number]: CardType[][] },
        current_turn: data.current_turn,
        phase: data.phase as 'draw' | 'play' | 'discard',
        last_action: data.last_action || '',
      });
    }
  };

  const updateGameState = async (newState: Partial<GameState>) => {
    if (!gameId) return;

    const { error } = await supabase
      .from('game_state')
      .update(newState as any)
      .eq('game_id', gameId);

    if (error) {
      console.error('Error updating game state:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la partie',
        variant: 'destructive',
      });
    }
  };

  const initializeGame = async (initialState: GameState) => {
    if (!gameId) return;

    const { error } = await supabase
      .from('game_state')
      .insert({
        game_id: gameId,
        ...initialState as any,
      });

    if (error) {
      console.error('Error initializing game:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'initialiser la partie',
        variant: 'destructive',
      });
    }

    await supabase
      .from('games')
      .update({ status: 'playing', started_at: new Date().toISOString() })
      .eq('id', gameId);
  };

  return {
    gameState,
    players,
    currentPlayerIndex,
    isHost,
    isMultiplayer: !!gameId,
    updateGameState,
    initializeGame,
  };
};
