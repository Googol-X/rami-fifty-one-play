// Types pour le mode multijoueur local (Pass & Play)

export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  isBot?: boolean;
}

export interface Seat {
  id: string;
  playerId: string;
  position: number; // 0-3 pour 2-4 joueurs
  isActive: boolean;
}

export interface TurnState {
  currentSeatId: string;
  phase: 'draw' | 'play' | 'discard';
  turnNumber: number;
  timeStarted: number;
}

export interface MatchStateLocal {
  version: string; // "localMatch.v1"
  matchId: string;
  players: Player[];
  seats: Seat[];
  turnState: TurnState;
  hands: Record<string, string[]>; // seatId -> cardIds[]
  scores: Record<string, number>; // playerId -> score
  piles: {
    draw: string[];
    discard: string[];
  };
  melds: Array<{
    id: string;
    owner: string;
    type: 'set' | 'run';
    cards: string[];
    points: number;
  }>;
  hasOpened: Record<string, boolean>; // playerId -> hasOpened
  settings: {
    playerCount: number;
    botDifficulty?: 'easy' | 'medium' | 'hard';
  };
  createdAt: number;
  lastSaved: number;
}

export type EmoteType = 'thumbsUp' | 'surprised' | 'cool' | 'clap' | 'thinking' | 'fire';

export interface EmoteEvent {
  id: string;
  emote: EmoteType;
  playerId: string;
  timestamp: number;
}
