import type { Card, Meld } from '@/types/game';
import { validateMeld } from './validation';

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
const RANK_VALUES: Record<string, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 10, 'Q': 10, 'K': 10
};

export type BotDifficulty = 'easy' | 'medium' | 'hard';

interface ComboAnalysis {
  combo: Card[];
  points: number;
  type: 'set' | 'run';
  efficiency: number; // points per card
}

interface CardPotential {
  card: Card;
  setCompletionScore: number;  // potential to complete sets
  runCompletionScore: number;  // potential to complete runs
  totalScore: number;
  isDeadwood: boolean;
}

/**
 * Classe principale pour l'IA avancée du bot
 */
export class AdvancedBotAI {
  private difficulty: BotDifficulty;

  constructor(difficulty: BotDifficulty = 'medium') {
    this.difficulty = difficulty;
  }

  /**
   * Décide si le bot doit piocher de la défausse plutôt que de la pioche
   */
  shouldDrawFromDiscard(
    discardCard: Card,
    hand: Card[],
    hasOpened: boolean,
    opponentMelds: Meld[],
    deck: Record<string, Card>
  ): boolean {
    if (!discardCard) return false;

    const potential = this.evaluateCardPotential(discardCard, hand);
    const threshold = this.getThresholdByDifficulty();

    // En mode facile, le bot est moins intelligent
    if (this.difficulty === 'easy') {
      return potential.totalScore > threshold * 0.5;
    }

    // En mode medium et hard, considérer aussi ce que l'adversaire pourrait utiliser
    const wouldHelpOpponent = this.wouldCardHelpOpponent(discardCard, opponentMelds, deck);
    
    if (this.difficulty === 'hard') {
      // En mode hard, évite de prendre une carte qui aide peu et révèle la stratégie
      if (potential.totalScore < threshold * 1.2 && hand.length > 8) {
        return false;
      }
      
      // Si la carte aide beaucoup, la prendre même si ça révèle la stratégie
      return potential.totalScore > threshold && !wouldHelpOpponent;
    }

    return potential.totalScore > threshold;
  }

  /**
   * Trouve les meilleures combinaisons à poser
   */
  findBestCombosToLay(
    hand: Card[],
    hasOpened: boolean,
    targetPoints: number = 51
  ): ComboAnalysis[] {
    const allCombos = this.findAllPossibleCombos(hand);
    
    if (!hasOpened) {
      // Si pas encore ouvert, chercher des combos qui atteignent 51+
      return this.findOpeningCombination(allCombos, targetPoints);
    }

    // Sinon, poser les combos les plus efficaces
    return allCombos
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, this.difficulty === 'hard' ? 3 : 2);
  }

  /**
   * Décide quelle carte défausser
   */
  selectCardToDiscard(
    hand: Card[],
    opponentMelds: Meld[],
    deck: Record<string, Card>,
    visibleDiscards: Card[]
  ): Card {
    const potentials = hand.map(card => this.evaluateCardPotential(card, hand));
    
    // Tri par utilité décroissante
    potentials.sort((a, b) => a.totalScore - b.totalScore);

    // En mode hard, éviter de défausser des cartes qui pourraient aider l'adversaire
    if (this.difficulty === 'hard') {
      for (const potential of potentials) {
        const wouldHelp = this.wouldCardHelpOpponent(potential.card, opponentMelds, deck);
        if (!wouldHelp) {
          return potential.card;
        }
      }
    }

    // Sinon défausser la carte la moins utile
    return potentials[0].card;
  }

  /**
   * Évalue si une carte pourrait aider l'adversaire
   */
  private wouldCardHelpOpponent(
    card: Card,
    opponentMelds: Meld[],
    deck: Record<string, Card>
  ): boolean {
    // Vérifier si la carte peut compléter un meld existant de l'adversaire
    for (const meld of opponentMelds) {
      const meldCards = meld.cards.map(id => deck[id]);
      
      if (meld.type === 'set') {
        // Vérifie si c'est le même rang
        if (meldCards[0] && card.rank === meldCards[0].rank) {
          return true;
        }
      } else if (meld.type === 'run') {
        // Vérifie si ça peut étendre la suite
        const sameSuit = meldCards[0] && card.suit === meldCards[0].suit;
        if (sameSuit) {
          const ranks = meldCards.map(c => RANK_ORDER.indexOf(c.rank as any));
          const cardRank = RANK_ORDER.indexOf(card.rank as any);
          const min = Math.min(...ranks);
          const max = Math.max(...ranks);
          
          // Si la carte est juste avant ou après la suite
          if (cardRank === min - 1 || cardRank === max + 1) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Évalue le potentiel d'une carte dans la main
   */
  private evaluateCardPotential(card: Card, hand: Card[]): CardPotential {
    let setScore = 0;
    let runScore = 0;

    // Compter les cartes du même rang (pour les sets)
    const sameRank = hand.filter(c => c.rank === card.rank && c.id !== card.id);
    setScore = sameRank.length * 15;

    // Compter les cartes de la même couleur proches (pour les runs)
    const sameSuit = hand.filter(c => c.suit === card.suit && c.id !== card.id);
    const cardRankIdx = RANK_ORDER.indexOf(card.rank as any);
    
    sameSuit.forEach(c => {
      const otherRankIdx = RANK_ORDER.indexOf(c.rank as any);
      const distance = Math.abs(cardRankIdx - otherRankIdx);
      
      if (distance === 1) runScore += 20; // Adjacent
      else if (distance === 2) runScore += 10; // Gap of 1
      else if (distance === 3) runScore += 5;  // Gap of 2
    });

    const totalScore = setScore + runScore;
    const isDeadwood = totalScore < 10 && sameRank.length === 0 && sameSuit.length === 0;

    return {
      card,
      setCompletionScore: setScore,
      runCompletionScore: runScore,
      totalScore,
      isDeadwood
    };
  }

  /**
   * Trouve toutes les combinaisons possibles dans une main
   */
  private findAllPossibleCombos(hand: Card[]): ComboAnalysis[] {
    const combos: ComboAnalysis[] = [];
    const used = new Set<string>();

    // Chercher les sets (même rang)
    const byRank = new Map<string, Card[]>();
    hand.forEach(card => {
      if (!byRank.has(card.rank)) byRank.set(card.rank, []);
      byRank.get(card.rank)!.push(card);
    });

    byRank.forEach(cards => {
      if (cards.length >= 3) {
        // Essayer toutes les combinaisons de 3+ cartes
        for (let size = Math.min(cards.length, 4); size >= 3; size--) {
          const combo = cards.slice(0, size);
          const validation = validateMeld(combo);
          
          if (validation.valid && !combo.some(c => used.has(c.id))) {
            const points = combo.reduce((sum, c) => sum + RANK_VALUES[c.rank], 0);
            combos.push({
              combo,
              points,
              type: 'set',
              efficiency: points / combo.length
            });
            combo.forEach(c => used.add(c.id));
            break;
          }
        }
      }
    });

    // Chercher les runs (même couleur, rangs consécutifs)
    const bySuit = new Map<string, Card[]>();
    hand.forEach(card => {
      if (used.has(card.id)) return;
      if (!bySuit.has(card.suit)) bySuit.set(card.suit, []);
      bySuit.get(card.suit)!.push(card);
    });

    bySuit.forEach(cards => {
      const sorted = [...cards].sort((a, b) => 
        RANK_ORDER.indexOf(a.rank as any) - RANK_ORDER.indexOf(b.rank as any)
      );

      // Trouver la plus longue suite possible
      let currentRun: Card[] = [];
      let lastRankIdx = -999;

      sorted.forEach(card => {
        const rankIdx = RANK_ORDER.indexOf(card.rank as any);
        
        if (currentRun.length === 0 || rankIdx === lastRankIdx + 1) {
          currentRun.push(card);
          lastRankIdx = rankIdx;
        } else {
          // Si on a une suite de 3+, la sauvegarder
          if (currentRun.length >= 3) {
            const validation = validateMeld(currentRun);
            if (validation.valid) {
              const points = currentRun.reduce((sum, c) => sum + RANK_VALUES[c.rank], 0);
              combos.push({
                combo: [...currentRun],
                points,
                type: 'run',
                efficiency: points / currentRun.length
              });
            }
          }
          // Recommencer une nouvelle suite
          currentRun = [card];
          lastRankIdx = rankIdx;
        }
      });

      // Vérifier la dernière suite
      if (currentRun.length >= 3) {
        const validation = validateMeld(currentRun);
        if (validation.valid) {
          const points = currentRun.reduce((sum, c) => sum + RANK_VALUES[c.rank], 0);
          combos.push({
            combo: currentRun,
            points,
            type: 'run',
            efficiency: points / currentRun.length
          });
        }
      }
    });

    return combos;
  }

  /**
   * Trouve la meilleure combinaison pour ouvrir (atteindre 51+)
   */
  private findOpeningCombination(
    allCombos: ComboAnalysis[],
    targetPoints: number
  ): ComboAnalysis[] {
    // Essayer différentes combinaisons pour atteindre le seuil
    const bestCombos: ComboAnalysis[] = [];
    const usedCards = new Set<string>();
    let totalPoints = 0;

    // Trier par efficacité (points/carte)
    const sorted = [...allCombos].sort((a, b) => b.efficiency - a.efficiency);

    for (const combo of sorted) {
      // Vérifier qu'aucune carte n'est déjà utilisée
      const hasOverlap = combo.combo.some(c => usedCards.has(c.id));
      if (hasOverlap) continue;

      bestCombos.push(combo);
      combo.combo.forEach(c => usedCards.add(c.id));
      totalPoints += combo.points;

      if (totalPoints >= targetPoints) break;
    }

    // Si on n'atteint pas le seuil, retourner vide
    if (totalPoints < targetPoints) return [];

    return bestCombos;
  }

  /**
   * Obtient le seuil de décision selon la difficulté
   */
  private getThresholdByDifficulty(): number {
    switch (this.difficulty) {
      case 'easy': return 15;
      case 'medium': return 25;
      case 'hard': return 35;
    }
  }

  /**
   * Change la difficulté du bot
   */
  setDifficulty(difficulty: BotDifficulty): void {
    this.difficulty = difficulty;
  }
}

// Export d'une instance par défaut
export const botAI = new AdvancedBotAI('medium');
