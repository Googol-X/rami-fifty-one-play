import { Card, Suit, Rank } from '@/types/game';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/**
 * Crée un paquet de 52 cartes standard
 * @returns Tableau de 52 cartes
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}${suit}` });
    }
  }
  return deck;
}

/**
 * Mélange un paquet de cartes (algorithme Fisher-Yates)
 * @param deck Paquet à mélanger
 * @param seed Graine optionnelle pour reproduction déterministe
 * @returns Nouveau paquet mélangé (immutable)
 */
export function shuffleDeck(deck: Card[], seed?: number): Card[] {
  const shuffled = [...deck];
  const random = seed !== undefined ? seededRandom(seed) : Math.random;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Générateur de nombres aléatoires déterministe (LCG)
 */
function seededRandom(seed: number) {
  let currentSeed = seed;
  return function() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}

/**
 * Distribue n cartes depuis le haut du paquet
 * @param deck Paquet source
 * @param count Nombre de cartes à distribuer
 * @returns Tuple [cartes distribuées, paquet restant]
 */
export function deal(deck: Card[], count: number): [Card[], Card[]] {
  if (count < 0 || count > deck.length) {
    throw new Error(`Impossible de distribuer ${count} cartes (paquet: ${deck.length})`);
  }
  return [deck.slice(0, count), deck.slice(count)];
}

/**
 * Pioche une carte depuis le haut du paquet
 * @param deck Paquet source
 * @returns Tuple [carte piochée | null, paquet restant]
 */
export function draw(deck: Card[]): [Card | null, Card[]] {
  if (deck.length === 0) {
    return [null, []];
  }
  return [deck[0], deck.slice(1)];
}

/**
 * Ajoute une carte à la défausse (en haut de la pile)
 * @param pile Pile de défausse
 * @param card Carte à ajouter
 * @returns Nouvelle pile
 */
export function discard(pile: Card[], card: Card): Card[] {
  return [...pile, card];
}

/**
 * Récupère la carte du dessus de la défausse
 * @param pile Pile de défausse
 * @returns Tuple [carte récupérée | null, pile restante]
 */
export function pickFromDiscard(pile: Card[]): [Card | null, Card[]] {
  if (pile.length === 0) {
    return [null, []];
  }
  return [pile[pile.length - 1], pile.slice(0, -1)];
}

/**
 * Retourne la carte visible sur la défausse (sans la retirer)
 * @param pile Pile de défausse
 * @returns Carte visible ou null
 */
export function peekDiscard(pile: Card[]): Card | null {
  return pile.length > 0 ? pile[pile.length - 1] : null;
}

/**
 * Vérifie si une carte est rouge (♥ ou ♦)
 */
export function isRed(suit: Suit): boolean {
  return suit === '♥' || suit === '♦';
}

// ============= Utilitaires de test (console) =============

/**
 * Affiche un paquet dans la console pour debug
 */
export function debugDeck(deck: Card[], label = 'Deck'): void {
  console.log(`${label} (${deck.length} cartes):`, deck.map(c => c.id).join(', '));
}

/**
 * Teste les fonctions du moteur
 */
export function testDeckEngine(): void {
  console.group('🃏 Test Moteur de Cartes');
  
  // Test création
  const deck = createDeck();
  console.log('✓ Paquet créé:', deck.length, 'cartes');
  
  // Test shuffle déterministe
  const shuffled1 = shuffleDeck(deck, 42);
  const shuffled2 = shuffleDeck(deck, 42);
  console.log('✓ Shuffle déterministe:', shuffled1[0].id === shuffled2[0].id ? 'OK' : 'FAIL');
  
  // Test deal
  const [hand, remaining] = deal(shuffled1, 7);
  console.log('✓ Distribution:', hand.length, 'cartes distribuées,', remaining.length, 'restantes');
  debugDeck(hand, 'Main');
  
  // Test draw
  const [drawn, afterDraw] = draw(remaining);
  console.log('✓ Pioche:', drawn?.id, '→', afterDraw.length, 'cartes restantes');
  
  // Test discard
  const pile = discard([], hand[0]);
  console.log('✓ Défausse:', pile.length, 'carte(s) →', peekDiscard(pile)?.id);
  
  // Test pick
  const [picked, newPile] = pickFromDiscard(pile);
  console.log('✓ Récupération défausse:', picked?.id, '→', newPile.length, 'cartes restantes');
  
  console.groupEnd();
}

// Exposer pour debug en console: window.testDeck = testDeckEngine
if (typeof window !== 'undefined') {
  (window as any).testDeck = testDeckEngine;
}
