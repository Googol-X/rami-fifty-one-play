/**
 * ANALYTICS SERVICE - Tracking des événements
 * 
 * TODO (Phase 3):
 * - Intégration Firebase Analytics
 * - Google Analytics
 * - Custom events tracking
 * - User properties
 * - Conversion tracking
 * - A/B testing support
 */

import { ANALYTICS_CONFIG } from '@/config/app.config';
import { Events, type EventName, type BaseEventProperties } from './analytics.events';

class AnalyticsService {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = ANALYTICS_CONFIG.enabled;
  }

  // Initialiser les analytics
  init() {
    if (!this.isEnabled) {
      console.log('[ANALYTICS] Service disabled');
      return;
    }
    console.log('[ANALYTICS] Initializing...');
    // TODO: Init Firebase/GA
  }

  // Tracker un événement normalisé
  trackEvent(eventName: EventName | string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    const enrichedProperties = {
      ...properties,
      timestamp: properties?.timestamp || Date.now(),
      platform: properties?.platform || 'web',
    };
    
    console.log('[ANALYTICS] Event:', eventName, enrichedProperties);
    // TODO: Send to analytics provider
  }

  // ========== MATCHMAKING ==========
  trackMatchRequest(mode: 'casual' | 'ranked', rating?: number) {
    this.trackEvent(Events.MATCH_REQUEST, { mode, rating });
  }

  trackMatchJoined(gameId: string) {
    this.trackEvent(Events.MATCH_JOINED, { gameId });
  }

  // ========== GAMEPLAY ==========
  trackMovePlayed(moveType: string, gameId: string, turnNumber: number) {
    this.trackEvent(Events.MOVE_PLAYED, { moveType, gameId, turnNumber });
  }

  trackOpenAttempt(points: number, success: boolean, gameId: string) {
    this.trackEvent(Events.OPEN_ATTEMPT, { points, success, gameId });
  }

  trackMeldLaid(meldType: string, points: number, gameId: string) {
    this.trackEvent(Events.MELD_LAID, { meldType, points, gameId });
  }

  trackGameWon(gameId: string, duration: number, finalScore: number) {
    this.trackEvent(Events.GAME_WON, { gameId, duration, finalScore });
  }

  trackGameLost(gameId: string, duration: number, finalScore: number) {
    this.trackEvent(Events.GAME_LOST, { gameId, duration, finalScore });
  }

  // ========== MONÉTISATION ==========
  trackPurchaseStart(productId: string) {
    this.trackEvent(Events.PURCHASE_START, { productId });
  }

  trackPurchaseSuccess(productId: string, price: number, currency: string) {
    this.trackEvent(Events.PURCHASE_SUCCESS, { productId, price, currency });
  }

  trackPurchaseCancelled(productId: string) {
    this.trackEvent(Events.PURCHASE_CANCELLED, { productId });
  }

  trackAdViewed(adType: string, placement: string) {
    this.trackEvent(Events.AD_VIEWED, { adType, placement });
  }

  // ========== ENGAGEMENT ==========
  trackSessionStart(sessionId: string) {
    this.trackEvent(Events.SESSION_START, { sessionId });
  }

  trackSessionEnd(sessionId: string, duration: number) {
    this.trackEvent(Events.SESSION_END, { sessionId, duration });
  }

  trackTutorialComplete() {
    this.trackEvent(Events.TUTORIAL_COMPLETE);
  }

  // ========== SOCIAL ==========
  trackFriendInviteSent(inviteId: string) {
    this.trackEvent(Events.FRIEND_INVITE_SENT, { inviteId });
  }

  trackChatMessageSent(gameId: string) {
    this.trackEvent(Events.CHAT_MESSAGE_SENT, { gameId });
  }

  // User properties
  setUserProperties(properties: Record<string, any>) {
    if (!this.isEnabled) return;
    console.log('[ANALYTICS] User properties:', properties);
    // TODO: Set user properties
  }

  setUserId(userId: string) {
    if (!this.isEnabled) return;
    console.log('[ANALYTICS] User ID:', userId);
    // TODO: Set user ID
  }
}

export const analytics = new AnalyticsService();
