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

  // Tracker un événement
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;
    console.log('[ANALYTICS] Event:', eventName, properties);
    // TODO: Send to analytics provider
  }

  // Événements de jeu
  trackGameStart(mode: string) {
    this.trackEvent('game_start', { mode });
  }

  trackGameEnd(winner: string, duration: number) {
    this.trackEvent('game_end', { winner, duration });
  }

  trackMeldPlayed(meldType: string, points: number) {
    this.trackEvent('meld_played', { meldType, points });
  }

  // Événements premium
  trackPurchaseAttempt(product: string) {
    this.trackEvent('purchase_attempt', { product });
  }

  trackPurchaseComplete(product: string, amount: number) {
    this.trackEvent('purchase_complete', { product, amount });
  }

  // Événements sociaux
  trackInviteSent(gameId: string) {
    this.trackEvent('invite_sent', { gameId });
  }

  trackMessageSent() {
    this.trackEvent('message_sent');
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
