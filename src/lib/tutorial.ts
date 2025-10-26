// Tutorial coach-marks system

export interface TutorialStep {
  id: string;
  targetSelector: string; // data-tutorial-id
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional action button text
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'draw-pile',
    targetSelector: '[data-tutorial-id="draw-pile"]',
    title: '🎴 Pioche',
    description: 'Piochez une carte pour commencer votre tour',
    position: 'bottom',
  },
  {
    id: 'discard-pile',
    targetSelector: '[data-tutorial-id="discard-pile"]',
    title: '♻️ Défausse',
    description: 'Ou prenez la carte du dessus de la défausse',
    position: 'bottom',
  },
  {
    id: 'player-hand',
    targetSelector: '[data-tutorial-id="player-hand"]',
    title: '🃏 Votre main',
    description: 'Tapez sur les cartes pour les sélectionner. Zoom avec le curseur.',
    position: 'top',
  },
  {
    id: 'lay-combo',
    targetSelector: '[data-tutorial-id="lay-combo"]',
    title: '✨ Poser 51',
    description: 'Sélectionnez au moins 51 points de combinaisons pour ouvrir',
    position: 'top',
  },
  {
    id: 'discard-action',
    targetSelector: '[data-tutorial-id="discard-action"]',
    title: '🗑️ Défausser',
    description: 'Terminez votre tour en défaussant une carte',
    position: 'top',
  },
];

class TutorialManager {
  private completed: Set<string> = new Set();
  private hasSeenTutorial: boolean = false;

  constructor() {
    this.loadState();
  }

  private loadState() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('tutorial.v1.state');
      if (stored) {
        const state = JSON.parse(stored);
        this.hasSeenTutorial = state.hasSeenTutorial || false;
        this.completed = new Set(state.completed || []);
      }
    } catch (error) {
      console.warn('Failed to load tutorial state:', error);
    }
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('tutorial.v1.state', JSON.stringify({
        hasSeenTutorial: this.hasSeenTutorial,
        completed: Array.from(this.completed),
      }));
    } catch (error) {
      console.warn('Failed to save tutorial state:', error);
    }
  }

  shouldShowTutorial(): boolean {
    return !this.hasSeenTutorial;
  }

  markAsCompleted() {
    this.hasSeenTutorial = true;
    this.saveState();
  }

  completeStep(stepId: string) {
    this.completed.add(stepId);
    this.saveState();
  }

  isStepCompleted(stepId: string): boolean {
    return this.completed.has(stepId);
  }

  reset() {
    this.hasSeenTutorial = false;
    this.completed.clear();
    this.saveState();
  }

  getProgress(): number {
    return this.completed.size / TUTORIAL_STEPS.length;
  }
}

export const tutorialManager = new TutorialManager();
