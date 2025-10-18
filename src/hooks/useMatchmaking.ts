import { useState } from 'react';
import { GameMode } from '@/types/multiplayer';

/**
 * MATCHMAKING HOOK - Gestion de la recherche d'adversaire
 * 
 * TODO (Phase 2):
 * - Connexion WebSocket pour queue temps réel
 * - Algorithme de matching par niveau
 * - Estimation du temps d'attente
 * - Annulation de recherche
 * - Notification quand match trouvé
 */

interface MatchmakingState {
  isSearching: boolean;
  estimatedWait: number;
  queuePosition?: number;
  matchFound: boolean;
  gameId?: string;
}

export const useMatchmaking = () => {
  const [state, setState] = useState<MatchmakingState>({
    isSearching: false,
    estimatedWait: 30,
    matchFound: false,
  });

  const startSearch = async (mode: GameMode) => {
    console.log('[MATCHMAKING] Start search:', mode);
    setState({ ...state, isSearching: true });
    
    // TODO: Rejoindre la queue
    // const ws = new WebSocket('wss://...');
    // ws.send(JSON.stringify({ action: 'join_queue', mode }));
  };

  const cancelSearch = () => {
    console.log('[MATCHMAKING] Cancel search');
    setState({ ...state, isSearching: false });
    
    // TODO: Quitter la queue
  };

  const acceptMatch = () => {
    console.log('[MATCHMAKING] Accept match:', state.gameId);
    
    // TODO: Confirmer participation
    // Navigation vers la table de jeu
  };

  const declineMatch = () => {
    console.log('[MATCHMAKING] Decline match');
    setState({ ...state, matchFound: false });
  };

  return {
    ...state,
    startSearch,
    cancelSearch,
    acceptMatch,
    declineMatch,
  };
};
