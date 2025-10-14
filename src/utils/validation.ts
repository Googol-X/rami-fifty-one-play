import { Card, Rank, Suit, RANK_VALUES } from '@/types/game';

export type MeldType = 'set' | 'run' | 'invalid';

export interface ValidationResult {
  valid: boolean;
  type?: MeldType;
  points?: number;
  error?: string;
  details?: string;
}

const RANK_ORDER: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/**
 * Obtient l'index numérique d'une carte dans l'ordre
 */
function getRankIndex(rank: Rank): number {
  return RANK_ORDER.indexOf(rank);
}

/**
 * Vérifie si un groupe de cartes forme une série (set)
 * Série = 3+ cartes de même valeur, couleurs différentes
 */
function isValidSet(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  
  // Toutes les cartes doivent avoir le même rang
  const firstRank = cards[0].rank;
  if (!cards.every(c => c.rank === firstRank)) return false;
  
  // Toutes les couleurs doivent être différentes
  const suits = cards.map(c => c.suit);
  const uniqueSuits = new Set(suits);
  return uniqueSuits.size === suits.length;
}

/**
 * Vérifie si un groupe de cartes forme une suite (run)
 * Suite = 3+ cartes consécutives de même couleur
 * As peut être utilisé en A-2-3 uniquement (pas Q-K-A)
 */
function isValidRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  
  // Toutes les cartes doivent avoir la même couleur
  const firstSuit = cards[0].suit;
  if (!cards.every(c => c.suit === firstSuit)) return false;
  
  // Trier les cartes par rang
  const sorted = [...cards].sort((a, b) => getRankIndex(a.rank) - getRankIndex(b.rank));
  
  // Vérifier la consécutivité
  for (let i = 1; i < sorted.length; i++) {
    const prevIndex = getRankIndex(sorted[i - 1].rank);
    const currIndex = getRankIndex(sorted[i].rank);
    
    // Les cartes doivent être consécutives
    if (currIndex !== prevIndex + 1) return false;
  }
  
  return true;
}

/**
 * Calcule les points d'une combinaison valide
 */
function calculatePoints(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + RANK_VALUES[card.rank], 0);
}

/**
 * Valide une combinaison de cartes selon les règles du Rami 51
 */
export function validateMeld(cards: Card[]): ValidationResult {
  // Vérifications de base
  if (!cards || cards.length === 0) {
    return {
      valid: false,
      error: "Aucune carte sélectionnée",
      details: "Sélectionnez au moins 3 cartes"
    };
  }
  
  if (cards.length < 3) {
    return {
      valid: false,
      error: "Combinaison trop courte",
      details: `${cards.length} carte(s) sélectionnée(s), minimum 3 requis`
    };
  }
  
  // Vérifier si c'est une série
  if (isValidSet(cards)) {
    return {
      valid: true,
      type: 'set',
      points: calculatePoints(cards),
      details: `Série de ${cards[0].rank} (${cards.length} cartes)`
    };
  }
  
  // Vérifier si c'est une suite
  if (isValidRun(cards)) {
    const sorted = [...cards].sort((a, b) => getRankIndex(a.rank) - getRankIndex(b.rank));
    const rangeStr = `${sorted[0].rank}-${sorted[sorted.length - 1].rank}`;
    return {
      valid: true,
      type: 'run',
      points: calculatePoints(cards),
      details: `Suite ${cards[0].suit} (${rangeStr})`
    };
  }
  
  // Analyser pourquoi c'est invalide
  const ranks = cards.map(c => c.rank);
  const suits = cards.map(c => c.suit);
  const uniqueRanks = new Set(ranks).size;
  const uniqueSuits = new Set(suits).size;
  
  if (uniqueRanks === 1) {
    // Même rang mais couleurs répétées
    return {
      valid: false,
      error: "Série invalide",
      details: "Les cartes de même valeur doivent avoir des couleurs différentes"
    };
  }
  
  if (uniqueSuits === 1) {
    // Même couleur mais pas consécutives
    return {
      valid: false,
      error: "Suite invalide",
      details: "Les cartes de même couleur doivent être consécutives (ex: 3-4-5)"
    };
  }
  
  return {
    valid: false,
    error: "Combinaison invalide",
    details: "Les cartes ne forment ni une série (même valeur) ni une suite (valeurs consécutives)"
  };
}

/**
 * Fonction de test rapide en console
 */
export function testValidation() {
  console.log('🧪 Tests de validation des combinaisons\n');
  
  // Test 1: Série valide
  const set1: Card[] = [
    { rank: '7', suit: '♠', id: '7♠' },
    { rank: '7', suit: '♥', id: '7♥' },
    { rank: '7', suit: '♦', id: '7♦' }
  ];
  console.log('Test 1 - Série valide (7♠ 7♥ 7♦):', validateMeld(set1));
  
  // Test 2: Série invalide (couleurs répétées)
  const set2: Card[] = [
    { rank: 'K', suit: '♠', id: 'K♠' },
    { rank: 'K', suit: '♠', id: 'K♠2' },
    { rank: 'K', suit: '♥', id: 'K♥' }
  ];
  console.log('Test 2 - Série invalide (K♠ K♠ K♥):', validateMeld(set2));
  
  // Test 3: Suite valide
  const run1: Card[] = [
    { rank: '3', suit: '♣', id: '3♣' },
    { rank: '4', suit: '♣', id: '4♣' },
    { rank: '5', suit: '♣', id: '5♣' }
  ];
  console.log('Test 3 - Suite valide (3♣ 4♣ 5♣):', validateMeld(run1));
  
  // Test 4: Suite invalide (non consécutive)
  const run2: Card[] = [
    { rank: '2', suit: '♥', id: '2♥' },
    { rank: '4', suit: '♥', id: '4♥' },
    { rank: '6', suit: '♥', id: '6♥' }
  ];
  console.log('Test 4 - Suite invalide (2♥ 4♥ 6♥):', validateMeld(run2));
  
  // Test 5: Suite longue valide
  const run3: Card[] = [
    { rank: '9', suit: '♦', id: '9♦' },
    { rank: '10', suit: '♦', id: '10♦' },
    { rank: 'J', suit: '♦', id: 'J♦' },
    { rank: 'Q', suit: '♦', id: 'Q♦' },
    { rank: 'K', suit: '♦', id: 'K♦' }
  ];
  console.log('Test 5 - Suite longue valide (9♦-K♦):', validateMeld(run3));
  
  // Test 6: As en début de suite
  const run4: Card[] = [
    { rank: 'A', suit: '♠', id: 'A♠' },
    { rank: '2', suit: '♠', id: '2♠' },
    { rank: '3', suit: '♠', id: '3♠' }
  ];
  console.log('Test 6 - Suite avec As (A♠ 2♠ 3♠):', validateMeld(run4));
  
  // Test 7: Trop peu de cartes
  const short: Card[] = [
    { rank: 'J', suit: '♣', id: 'J♣' },
    { rank: 'J', suit: '♥', id: 'J♥' }
  ];
  console.log('Test 7 - Trop court (2 cartes):', validateMeld(short));
  
  // Test 8: Combinaison mixte invalide
  const mixed: Card[] = [
    { rank: '5', suit: '♠', id: '5♠' },
    { rank: '6', suit: '♥', id: '6♥' },
    { rank: '7', suit: '♦', id: '7♦' }
  ];
  console.log('Test 8 - Mixte invalide (5♠ 6♥ 7♦):', validateMeld(mixed));
  
  console.log('\n✅ Tests terminés');
}

// Exposer dans window pour tests en console
if (typeof window !== 'undefined') {
  (window as any).testValidation = testValidation;
  (window as any).validateMeld = validateMeld;
}
