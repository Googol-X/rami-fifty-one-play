// features/matchmaking/api.ts
/**
 * API de matchmaking pour trouver des adversaires
 * Placeholders maintenant, logique complète à implémenter plus tard
 */

export interface MatchRequest {
  userId: string;
  rating?: number; // ELO futur
  mode: 'casual' | 'ranked';
}

export interface MatchFound {
  roomId: string;
  seats: string[]; // playerIds
}

/**
 * Demander un match (matchmaking)
 * TODO: brancher Firebase/Supabase/WS plus tard
 * TODO: implémenter la file d'attente et l'algorithme de matching
 */
export async function requestMatch(req: MatchRequest): Promise<MatchFound> {
  console.log('[Matchmaking] Request match:', req);
  
  // Simulation simple pour le développement
  return { 
    roomId: `room_${Date.now()}`, 
    seats: [req.userId] 
  };
}
