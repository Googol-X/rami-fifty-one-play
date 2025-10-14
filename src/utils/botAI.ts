import { Card, Rank, RANK_VALUES } from '@/types/game';
import { validateMeld } from './validation';

const RANK_ORDER: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function getRankIndex(rank: Rank): number {
  return RANK_ORDER.indexOf(rank);
}

/**
 * Trouve toutes les combinaisons valides dans une main
 */
export function findValidCombos(hand: Card[]): Card[][] {
  const combos: Card[][] = [];
  const used = new Set<string>();

  // Chercher séries (même rang)
  const byRank = new Map<Rank, Card[]>();
  hand.forEach(card => {
    if (!byRank.has(card.rank)) byRank.set(card.rank, []);
    byRank.get(card.rank)!.push(card);
  });

  byRank.forEach(cards => {
    if (cards.length >= 3) {
      for (let i = 0; i <= cards.length - 3; i++) {
        const combo = cards.slice(i, i + 3);
        if (validateMeld(combo).valid) {
          combos.push(combo);
          combo.forEach(c => used.add(c.id));
        }
      }
    }
  });

  // Chercher suites (même couleur)
  const bySuit = new Map<string, Card[]>();
  hand.forEach(card => {
    if (!bySuit.has(card.suit)) bySuit.set(card.suit, []);
    bySuit.get(card.suit)!.push(card);
  });

  bySuit.forEach(cards => {
    const sorted = cards.sort((a, b) => getRankIndex(a.rank) - getRankIndex(b.rank));
    for (let i = 0; i <= sorted.length - 3; i++) {
      for (let len = 3; len <= sorted.length - i; len++) {
        const combo = sorted.slice(i, i + len);
        if (validateMeld(combo).valid && !combo.some(c => used.has(c.id))) {
          combos.push(combo);
          combo.forEach(c => used.add(c.id));
          break;
        }
      }
    }
  });

  return combos.sort((a, b) => {
    const aPoints = a.reduce((sum, c) => sum + RANK_VALUES[c.rank], 0);
    const bPoints = b.reduce((sum, c) => sum + RANK_VALUES[c.rank], 0);
    return bPoints - aPoints;
  });
}

/**
 * Évalue l'utilité d'une carte (pour décider quoi défausser)
 */
export function evaluateCardUtility(card: Card, hand: Card[]): number {
  let score = 0;
  const sameRank = hand.filter(c => c.rank === card.rank && c.id !== card.id).length;
  const sameSuit = hand.filter(c => c.suit === card.suit && c.id !== card.id);
  
  score += sameRank * 10;
  sameSuit.forEach(c => {
    const diff = Math.abs(getRankIndex(c.rank) - getRankIndex(card.rank));
    if (diff <= 2) score += (3 - diff) * 5;
  });
  
  return score;
}
