// Haptic feedback using Vibration API

class HapticsManager {
  private enabled: boolean = true;
  private supported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      this.supported = true;
    }
    
    const stored = localStorage.getItem('haptics.enabled');
    if (stored !== null) {
      this.enabled = stored === 'true';
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('haptics.enabled', enabled.toString());
    }
  }

  isEnabled(): boolean {
    return this.enabled && this.supported;
  }

  isSupported(): boolean {
    return this.supported;
  }

  private vibrate(pattern: number | number[]) {
    if (!this.enabled || !this.supported) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  }

  // Short tap feedback
  tap() {
    this.vibrate(10);
  }

  // Card pick feedback
  pick() {
    this.vibrate(25);
  }

  // Discard feedback
  discard() {
    this.vibrate(30);
  }

  // Win celebration pattern
  win() {
    this.vibrate([40, 100, 60, 100, 40]);
  }

  // Error feedback
  error() {
    this.vibrate([20, 50, 20]);
  }

  // Success feedback
  success() {
    this.vibrate([15, 50, 30]);
  }
}

export const haptics = new HapticsManager();
