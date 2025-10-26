// Auto-save and state persistence for local matches

import { MatchStateLocal } from './matchTypes';

const SAVE_KEY = 'rami.localMatch.v1';
const SAVE_THROTTLE_MS = 400;

class SaveStateManager {
  private saveTimeout: NodeJS.Timeout | null = null;
  private lastSave: number = 0;

  saveMatch(state: MatchStateLocal) {
    // Throttle saves
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.doSave(state);
    }, SAVE_THROTTLE_MS);
  }

  private doSave(state: MatchStateLocal) {
    if (typeof window === 'undefined') return;

    try {
      const toSave = {
        ...state,
        lastSaved: Date.now(),
      };

      const serialized = JSON.stringify(toSave);
      localStorage.setItem(SAVE_KEY, serialized);
      this.lastSave = Date.now();
      
      console.debug('Match state saved');
    } catch (error) {
      console.error('Failed to save match state:', error);
    }
  }

  loadMatch(): MatchStateLocal | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored) as MatchStateLocal;
      
      // Validate version
      if (parsed.version !== 'localMatch.v1') {
        console.warn('Incompatible save version, ignoring');
        this.clearSave();
        return null;
      }

      // Validate basic structure
      if (!parsed.matchId || !parsed.players || !parsed.seats) {
        console.warn('Invalid save structure, ignoring');
        this.clearSave();
        return null;
      }

      // Check if save is recent (within 7 days)
      const ageMs = Date.now() - (parsed.lastSaved || parsed.createdAt);
      const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      if (ageMs > maxAgeMs) {
        console.warn('Save too old, ignoring');
        this.clearSave();
        return null;
      }

      console.debug('Match state loaded');
      return parsed;
    } catch (error) {
      console.error('Failed to load match state:', error);
      this.clearSave();
      return null;
    }
  }

  clearSave() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(SAVE_KEY);
      console.debug('Match state cleared');
    } catch (error) {
      console.error('Failed to clear match state:', error);
    }
  }

  hasSavedMatch(): boolean {
    return this.loadMatch() !== null;
  }

  getLastSaveTime(): number {
    const match = this.loadMatch();
    return match?.lastSaved || 0;
  }
}

export const saveStateManager = new SaveStateManager();
