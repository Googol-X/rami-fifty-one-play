// features/matchmaking/api.ts
/**
 * API de matchmaking pour trouver des adversaires
 * Implémentation Firebase avec stratégie de regroupement par timestamp
 */

import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

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
 * Demander un match (matchmaking casual)
 * Stratégie simple : roomId basé sur la minute courante pour regrouper les joueurs
 * qui cherchent un match en même temps
 */
export async function requestMatch(req: MatchRequest): Promise<MatchFound> {
  console.log('[Matchmaking] Request match:', req);
  
  try {
    const db = getFirestore();
    
    // Stratégie simple : room = hash de minute courante pour regrouper rapidement
    // Cela regroupe automatiquement les joueurs qui cherchent en même temps
    const roomId = `${req.mode}_${Math.floor(Date.now() / 60000)}`;
    
    const ref = doc(db, 'rooms', roomId);
    const snap = await getDoc(ref);
    
    // Récupérer les seats existants ou initialiser un tableau vide
    const existingData = snap.exists() ? snap.data() : null;
    const seats: string[] = existingData?.seats ?? [];
    
    // Ajouter l'utilisateur s'il n'est pas déjà dans la room
    if (!seats.includes(req.userId)) {
      seats.push(req.userId);
      
      // Limite à 2 joueurs pour 1v1 (configurable)
      const maxPlayers = 2;
      const limitedSeats = seats.slice(0, maxPlayers);
      
      // Mettre à jour la room
      await setDoc(ref, {
        roomId,
        seats: limitedSeats,
        mode: req.mode,
        updatedAt: serverTimestamp(),
        createdAt: existingData?.createdAt ?? serverTimestamp(),
      }, { merge: true });
      
      console.log('[Matchmaking] Match found:', { roomId, seats: limitedSeats });
      
      return { 
        roomId, 
        seats: limitedSeats 
      };
    }
    
    // L'utilisateur est déjà dans la room
    console.log('[Matchmaking] User already in room:', { roomId, seats });
    return { roomId, seats };
    
  } catch (error) {
    console.error('[Matchmaking] Error:', error);
    
    // Fallback en cas d'erreur : créer une room locale
    const fallbackRoomId = `local_${Date.now()}`;
    console.log('[Matchmaking] Falling back to local room:', fallbackRoomId);
    
    return {
      roomId: fallbackRoomId,
      seats: [req.userId]
    };
  }
}
