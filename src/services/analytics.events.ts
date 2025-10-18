// services/analytics.events.ts
/**
 * Définitions normalisées des événements analytics
 * Utilisé par analytics.service.ts pour tracker les actions utilisateur
 */

export const Events = {
  // Matchmaking
  MATCH_REQUEST: 'match_request',
  MATCH_JOINED: 'match_joined',
  MATCH_CANCELLED: 'match_cancelled',
  MATCH_TIMEOUT: 'match_timeout',
  
  // Gameplay
  MOVE_PLAYED: 'move_played',
  OPEN_ATTEMPT: 'open_attempt', // tentative d'atteindre 51
  OPEN_SUCCESS: 'open_success',
  OPEN_FAILURE: 'open_failure',
  MELD_LAID: 'meld_laid',
  CARD_DRAWN: 'card_drawn',
  CARD_DISCARDED: 'card_discarded',
  GAME_WON: 'game_won',
  GAME_LOST: 'game_lost',
  
  // Monétisation
  PURCHASE_START: 'purchase_start',
  PURCHASE_SUCCESS: 'purchase_success',
  PURCHASE_CANCELLED: 'purchase_cancelled',
  PURCHASE_FAILED: 'purchase_failed',
  AD_VIEWED: 'ad_viewed',
  AD_CLICKED: 'ad_clicked',
  AD_FAILED: 'ad_failed',
  
  // Engagement
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  TUTORIAL_START: 'tutorial_start',
  TUTORIAL_COMPLETE: 'tutorial_complete',
  SETTINGS_OPENED: 'settings_opened',
  PROFILE_VIEWED: 'profile_viewed',
  
  // Social
  FRIEND_INVITE_SENT: 'friend_invite_sent',
  FRIEND_ADDED: 'friend_added',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
} as const;

export type EventName = typeof Events[keyof typeof Events];

/**
 * Propriétés communes à tous les événements
 */
export interface BaseEventProperties {
  timestamp?: number;
  sessionId?: string;
  userId?: string;
  platform?: 'web' | 'ios' | 'android';
}

/**
 * Propriétés spécifiques par type d'événement
 */
export interface MatchRequestProperties extends BaseEventProperties {
  mode: 'casual' | 'ranked';
  rating?: number;
}

export interface MovePlayedProperties extends BaseEventProperties {
  moveType: string;
  gameId: string;
  turnNumber: number;
}

export interface OpenAttemptProperties extends BaseEventProperties {
  points: number;
  success: boolean;
  gameId: string;
}

export interface PurchaseProperties extends BaseEventProperties {
  productId: string;
  price: number;
  currency: string;
}
