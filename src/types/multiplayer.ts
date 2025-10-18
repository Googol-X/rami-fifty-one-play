/**
 * TYPES MULTIJOUEUR - Structures pour le jeu en ligne
 * 
 * Ces types définissent les structures de données pour:
 * - Sessions de jeu multijoueur
 * - Matchmaking
 * - État synchronisé entre joueurs
 * - Messages chat
 * - Notifications
 */

import { Card } from './game';

// ============= GAME SESSION =============
export interface GameSession {
  id: string;
  hostId: string;
  players: SessionPlayer[];
  mode: GameMode;
  status: GameStatus;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  settings: GameSettings;
}

export interface SessionPlayer {
  id: string;
  username: string;
  avatar?: string;
  isReady: boolean;
  isHost: boolean;
  playerIndex: number;
}

export type GameMode = 'ranked' | 'quick' | 'friendly' | 'tournament';
export type GameStatus = 'waiting' | 'starting' | 'playing' | 'paused' | 'finished';

export interface GameSettings {
  maxPlayers: 2 | 3 | 4;
  timePerTurn: number; // secondes
  allowChat: boolean;
  isPrivate: boolean;
  password?: string;
}

// ============= MATCHMAKING =============
export interface MatchmakingQueue {
  playerId: string;
  mode: GameMode;
  estimatedWaitTime: number;
  joinedAt: Date;
  preferences?: MatchPreferences;
}

export interface MatchPreferences {
  preferredPlayers?: number;
  minLevel?: number;
  maxLevel?: number;
  region?: string;
}

// ============= SYNCHRONIZED STATE =============
export interface SyncedGameState {
  deck: Card[];
  discardPile: Card[];
  playerHands: { [playerId: string]: Card[] };
  playerMelds: { [playerId: string]: Card[][] };
  currentTurn: string; // playerId
  phase: 'draw' | 'play' | 'discard';
  lastAction: GameAction;
  turnStartedAt: Date;
}

export interface GameAction {
  type: 'draw' | 'discard' | 'meld' | 'extend' | 'knock';
  playerId: string;
  timestamp: Date;
  data: any;
}

// ============= CHAT =============
export interface ChatMessage {
  id: string;
  gameId: string;
  userId: string;
  username: string;
  text: string;
  type: 'text' | 'emoji' | 'system';
  timestamp: Date;
  isRead: boolean;
}

// ============= NOTIFICATIONS =============
export interface GameNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  isRead: boolean;
}

export type NotificationType = 
  | 'game_invite'
  | 'your_turn'
  | 'game_started'
  | 'game_ended'
  | 'player_joined'
  | 'player_left'
  | 'chat_message';

// ============= PLAYER STATS =============
export interface PlayerStats {
  userId: string;
  level: number;
  xp: number;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  rank: PlayerRank;
  league: League;
  elo: number;
}

export interface PlayerRank {
  name: string;
  division: number;
  points: number;
  nextRankAt: number;
}

export type League = 'Bronze' | 'Argent' | 'Or' | 'Platine' | 'Diamant' | 'Maître';

// ============= ACHIEVEMENTS =============
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  reward?: AchievementReward;
}

export type AchievementCategory = 'games' | 'wins' | 'special' | 'social';

export interface AchievementReward {
  type: 'xp' | 'coins' | 'skin' | 'title';
  value: number | string;
}
