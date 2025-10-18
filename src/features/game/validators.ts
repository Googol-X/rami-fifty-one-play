// features/game/validators.ts
import type { Card, Meld } from '@/types/game';
import { SUITS, RANKS } from './deck';

/** Map rank -> valeur pour séquences (As=1, J=11, Q=12, K=13). */
export const RANK_VALUE: Record<string, number> = {
  A: 1,  '2': 2,  '3': 3,  '4': 4,  '5': 5,  '6': 6,  '7': 7,
  '8': 8,'9': 9, '10': 10, J: 11, Q: 12, K: 13,
};

export function isJoker(c: Card) { return !!c.joker; }

/** Utilitaire : set de valeurs uniques */
function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

/** ----- SET (brelan/carré) -----
 *  - Toutes les cartes non-jokers ont le même rang
 *  - Suits distinctes pour non-jokers
 *  - Taille 3..4 (jokers inclus)
 */
export function isValidSet(cards: Card[]): boolean {
  if (cards.length < 3 || cards.length > 4) return false;
  const nonJokers = cards.filter(c => !isJoker(c));
  if (nonJokers.length === 0) return false; // au moins une vraie carte

  const ranks = uniq(nonJokers.map(c => c.rank));
  if (ranks.length !== 1) return false;

  // pas de doublon de suit parmi les non-jokers (ex: deux hearts 10)
  const suits = nonJokers.map(c => c.suit);
  if (uniq(suits).length !== suits.length) return false;

  return true;
}

/** ----- RUN (suite) -----
 *  - Même suit pour toutes les non-jokers
 *  - Pas de doublon de rang parmi non-jokers
 *  - Longueur >= 3
 *  - Jokers comblent des "trous"
 *  - As par défaut LOW (1). Pour autoriser As HIGH (14), passer allowAceHigh=true.
 */
export function isValidRun(cards: Card[], allowAceHigh = false): boolean {
  if (cards.length < 3) return false;

  const nonJokers = cards.filter(c => !isJoker(c));
  if (nonJokers.length === 0) return false;

  // même suit pour toutes les non-jokers
  const suit = nonJokers[0].suit;
  if (!nonJokers.every(c => c.suit === suit)) return false;

  // valeurs (avec option As haut)
  const values = nonJokers.map(c => {
    if (c.rank === 'A' && allowAceHigh) return 14;
    return RANK_VALUE[c.rank];
  });

  // pas de doublon de rang
  const uniqVals = uniq(values);
  if (uniqVals.length !== values.length) return false;

  uniqVals.sort((a, b) => a - b);

  // nombre de trous entre les non-jokers
  let gaps = 0;
  for (let i = 1; i < uniqVals.length; i++) {
    const diff = uniqVals[i] - uniqVals[i - 1];
    if (diff < 1) return false;
    gaps += (diff - 1);
  }

  const jokerCount = cards.length - nonJokers.length;

  // Les jokers doivent couvrir tous les trous
  if (jokerCount < gaps) return false;

  // Et si des jokers restent, ils peuvent étendre la séquence aux extrémités
  return true;
}

/** Normalise un RUN en séquence explicite (avec jokers "résolus" en valeurs) */
export function normalizeRun(cards: Card[], allowAceHigh = false): {suit: string; values: number[]} {
  const nonJokers = cards.filter(c => !isJoker(c));
  const suit = nonJokers[0].suit;

  const v = nonJokers.map(c => (c.rank === 'A' && allowAceHigh) ? 14 : RANK_VALUE[c.rank]).sort((a,b)=>a-b);
  const jokerCount = cards.length - nonJokers.length;

  const min = v[0];
  const max = v[v.length-1];
  const needed = (max - min + 1);
  let extra = jokerCount - ((max - min + 1) - v.length); // jokers restants après comblement

  let start = min;
  let end = max;
  // Étendre aux extrémités avec les jokers restants
  while (extra > 0) { end += 1; extra -= 1; }
  const out: number[] = [];
  for (let x = start; x <= end; x++) out.push(x);

  const hi = allowAceHigh ? 14 : 13;
  const clamped = out.filter(n => n >= 1 && n <= hi);

  while (clamped.length > cards.length) clamped.pop();
  return { suit, values: clamped };
}

/** Calcul de points d'un meld */
export function scoreMeldCards(cards: Card[]): number {
  return cards.reduce((acc, c) => {
    if (c.joker) return acc; // le moteur assignera la valeur via la carte remplacée si besoin
    if (c.rank === 'A') return acc + 1;
    if (c.rank === 'J' || c.rank === 'Q' || c.rank === 'K') return acc + 10;
    return acc + (parseInt(c.rank as any, 10) || 0);
  }, 0);
}

/** Validation générale d'un Meld avec accès au deck index */
export function validateMeld(
  meld: Omit<Meld,'points'|'owner'>,
  deck: Record<string, Card>,
  opts?: { allowAceHigh?: boolean }
): { valid: boolean; type: 'set'|'run'|null; points: number } {
  const cards = meld.cards.map(id => deck[id]).filter(Boolean);
  if (cards.length !== meld.cards.length) return { valid: false, type: null, points: 0 };

  if (meld.type === 'set') {
    const ok = isValidSet(cards);
    return { valid: ok, type: ok ? 'set' : null, points: ok ? scoreMeldCards(cards) : 0 };
  }
  if (meld.type === 'run') {
    const ok = isValidRun(cards, opts?.allowAceHigh);
    return { valid: ok, type: ok ? 'run' : null, points: ok ? scoreMeldCards(cards) : 0 };
  }
  return { valid: false, type: null, points: 0 };
}
