import { EmoteType } from './matchTypes';

export const EMOTES: Record<EmoteType, { emoji: string; label: string }> = {
  thumbsUp: { emoji: '👍', label: 'Super' },
  surprised: { emoji: '😮', label: 'Surpris' },
  cool: { emoji: '😎', label: 'Cool' },
  clap: { emoji: '👏', label: 'Bravo' },
  thinking: { emoji: '🤔', label: 'Hmm' },
  fire: { emoji: '🔥', label: 'Excellent' },
};

export const EMOTE_COOLDOWN_MS = 5000; // 5 seconds
export const EMOTE_DISPLAY_DURATION_MS = 2500; // 2.5 seconds

export interface EmoteAnimation {
  id: string;
  emote: EmoteType;
  startTime: number;
  duration: number;
}

class EmoteManager {
  private lastEmoteTime: Record<string, number> = {};
  private activeEmotes: Map<string, EmoteAnimation> = new Map();

  canEmote(playerId: string): boolean {
    const lastTime = this.lastEmoteTime[playerId] || 0;
    return Date.now() - lastTime >= EMOTE_COOLDOWN_MS;
  }

  getCooldownRemaining(playerId: string): number {
    const lastTime = this.lastEmoteTime[playerId] || 0;
    const elapsed = Date.now() - lastTime;
    return Math.max(0, EMOTE_COOLDOWN_MS - elapsed);
  }

  sendEmote(playerId: string, emote: EmoteType): EmoteAnimation | null {
    if (!this.canEmote(playerId)) {
      return null;
    }

    this.lastEmoteTime[playerId] = Date.now();
    
    const animation: EmoteAnimation = {
      id: `${playerId}-${Date.now()}`,
      emote,
      startTime: Date.now(),
      duration: EMOTE_DISPLAY_DURATION_MS,
    };

    this.activeEmotes.set(playerId, animation);
    
    // Auto-cleanup after duration
    setTimeout(() => {
      this.activeEmotes.delete(playerId);
    }, EMOTE_DISPLAY_DURATION_MS);

    return animation;
  }

  getActiveEmote(playerId: string): EmoteAnimation | null {
    return this.activeEmotes.get(playerId) || null;
  }

  clearEmote(playerId: string) {
    this.activeEmotes.delete(playerId);
  }
}

export const emoteManager = new EmoteManager();
