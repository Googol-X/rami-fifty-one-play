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
 * As peut être utilisé en A-2-3 ou Q-K-A
 */
function isValidRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  
  // Toutes les cartes doivent avoir la même couleur
  const firstSuit = cards[0].suit;
  if (!cards.every(c => c.suit === firstSuit)) return false;
  
  // Trier les cartes par rang
  const sorted = [...cards].sort((a, b) => getRankIndex(a.rank) - getRankIndex(b.rank));
  const ranks = sorted.map(c => c.rank);
  
  // Cas spécial Q-K-A : vérifier si on a Q, K, A
  const hasQueen = ranks.includes('Q');
  const hasKing = ranks.includes('K');
  const hasAce = ranks.includes('A');
  
  if (hasAce && hasQueen && hasKing && cards.length === 3) {
    // Q-K-A est valide
    return true;
  }
  
  // Vérifier la consécutivité normale (incluant A-2-3)
  for (let i = 1; i < sorted.length; i++) {
    const prevIndex = getRankIndex(sorted[i - 1].rank);
    const currIndex = getRankIndex(sorted[i].rank);
    
    // Les cartes doivent être consécutives
    if (currIndex !== prevIndex + 1) return false;
  }
  
  return true;
}

/**
 * Trie les cartes d'un meld selon leur rang (pour les suites)
 */
export function sortMeld(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => getRankIndex(a.rank) - getRankIndex(b.rank));
}

/**
 * Calcule les points d'une combinaison valide avec règles spéciales pour l'As
 * - As = 11 points dans une tierce (set)
 * - As = 10 points dans une suite se terminant par A (ex: 10-J-Q-K-A)
 * - As = 1 point dans une suite commençant par A (ex: A-2-3-4)
 */
function calculatePoints(cards: Card[]): number {
  if (cards.length === 0) return 0;
  
  // Déterminer le type de combinaison
  const allSameRank = cards.every(c => c.rank === cards[0].rank);
  const allSameSuit = cards.every(c => c.suit === cards[0].suit);
  
  // Tierce (set) : As = 11 points
  if (allSameRank) {
    return cards.reduce((sum, card) => sum + RANK_VALUES[card.rank], 0);
  }
  
  // Suite (run) : vérifier la position de l'As
  if (allSameSuit) {
    const sorted = sortMeld(cards);
    const ranks = sorted.map(c => c.rank);
    
    // Suite commençant par A (A-2-3-4...) : As = 1 point
    if (ranks[0] === 'A' && ranks[1] === '2') {
      let points = 1; // As = 1 point
      for (let i = 1; i < cards.length; i++) {
        points += RANK_VALUES[sorted[i].rank];
      }
      return points;
    }
    
    // Suite se terminant par A (...Q-K-A ou ...10-J-Q-K-A) : As = 10 points
    if (ranks[ranks.length - 1] === 'A' && ranks[ranks.length - 2] === 'K') {
      let points = 0;
      for (let i = 0; i < cards.length - 1; i++) {
        points += RANK_VALUES[sorted[i].rank];
      }
      points += 10; // As = 10 points
      return points;
    }
  }
  
  // Cas par défaut : valeurs normales
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

/**
 * Vérifie si une carte peut étendre une meld existante
 * Run : prolonger par extrémité (même couleur)
 * Set : même rang, couleur différente
 */
export function canExtendMeld(meld: Card[], card: Card): boolean {
  if (meld.length === 0) return false;
  
  const validation = validateMeld(meld);
  if (!validation.valid) return false;
  
  const type = validation.type;
  
  if (type === 'set') {
    // Série : même rang, couleur différente
    const sameRank = meld.every(c => c.rank === card.rank);
    const differentSuit = !meld.some(c => c.suit === card.suit);
    return sameRank && differentSuit && meld.length < 4;
  }
  
  if (type === 'run') {
    // Suite : même couleur, prolonger par extrémité
    const sameSuit = meld.every(c => c.suit === card.suit);
    if (!sameSuit || card.suit !== meld[0].suit) return false;
    
    const sorted = [...meld].sort((a, b) => getRankIndex(a.rank) - getRankIndex(b.rank));
    const firstRank = sorted[0].rank;
    const lastRank = sorted[sorted.length - 1].rank;
    const cardIndex = getRankIndex(card.rank);
    const firstIndex = getRankIndex(firstRank);
    const lastIndex = getRankIndex(lastRank);
    
    // Cas spécial Q-K-A
    const hasQueen = sorted.some(c => c.rank === 'Q');
    const hasKing = sorted.some(c => c.rank === 'K');
    const hasAce = sorted.some(c => c.rank === 'A');
    
    if (hasQueen && hasKing && hasAce) {
      // Q-K-A complet, ne peut pas être étendu
      return false;
    }
    
    if (hasQueen && hasKing && card.rank === 'A') {
      // Q-K + A → Q-K-A
      return true;
    }
    
    if (hasKing && hasAce && card.rank === 'Q') {
      // K-A + Q → Q-K-A (mais suite inversée, à vérifier)
      return false; // On autorise seulement dans l'ordre
    }
    
    // Cas A-2-3 : As en position basse
    if (firstRank === 'A' && lastRank === '3' && card.rank === '4') {
      return true;
    }
    
    if (firstRank === 'A' && lastRank === '2' && card.rank === '3') {
      return true;
    }
    
    // Prolongation normale : carte juste avant ou juste après
    return cardIndex === firstIndex - 1 || cardIndex === lastIndex + 1;
  }
  
  return false;
}

/**
 * Vérifie si les melds contiennent au moins une série (set)
 */
export function hasSetInMelds(melds: Card[][]): boolean {
  return melds.some(meld => {
    const validation = validateMeld(meld);
    return validation.valid && validation.type === 'set';
  });
}

/**
 * Calcule les cartes "orphelines" qui ne peuvent pas être couvertes par des combinaisons
 * Utilise une approche greedy : d'abord suites longues, puis séries
 */
export function computeDeadwood(hand: Card[]): Card[] {
  if (hand.length === 0) return [];
  
  const remaining = [...hand];
  const used = new Set<string>();
  
  // 1. Chercher les suites (runs) par couleur
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  for (const suit of suits) {
    const suitCards = remaining
      .filter(c => c.suit === suit && !used.has(c.id))
      .sort((a, b) => getRankIndex(a.rank) - getRankIndex(b.rank));
    
    if (suitCards.length < 3) continue;
    
    // Chercher la plus longue suite
    let i = 0;
    while (i < suitCards.length) {
      const run: Card[] = [suitCards[i]];
      let j = i + 1;
      
      while (j < suitCards.length) {
        const prevIndex = getRankIndex(suitCards[j - 1].rank);
        const currIndex = getRankIndex(suitCards[j].rank);
        
        if (currIndex === prevIndex + 1) {
          run.push(suitCards[j]);
          j++;
        } else {
          break;
        }
      }
      
      // Si suite valide (≥3), marquer comme utilisé
      if (run.length >= 3) {
        run.forEach(c => used.add(c.id));
      }
      
      i = j > i ? j : i + 1;
    }
    
    // Cas spécial Q-K-A
    const hasQ = suitCards.find(c => c.rank === 'Q' && !used.has(c.id));
    const hasK = suitCards.find(c => c.rank === 'K' && !used.has(c.id));
    const hasA = suitCards.find(c => c.rank === 'A' && !used.has(c.id));
    
    if (hasQ && hasK && hasA) {
      used.add(hasQ.id);
      used.add(hasK.id);
      used.add(hasA.id);
    }
  }
  
  // 2. Chercher les séries (sets) par rang
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  for (const rank of ranks) {
    const rankCards = remaining.filter(c => c.rank === rank && !used.has(c.id));
    
    if (rankCards.length >= 3) {
      // Vérifier couleurs uniques
      const uniqueSuits = new Set(rankCards.map(c => c.suit));
      if (uniqueSuits.size === rankCards.length) {
        rankCards.forEach(c => used.add(c.id));
      }
    }
  }
  
  // 3. Retourner les cartes non utilisées
  return remaining.filter(c => !used.has(c.id));
}

// Exposer dans window pour tests en console
if (typeof window !== 'undefined') {
  (window as any).testValidation = testValidation;
  (window as any).validateMeld = validateMeld;
  (window as any).canExtendMeld = canExtendMeld;
  (window as any).computeDeadwood = computeDeadwood;
}
