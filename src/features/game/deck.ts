// features/game/deck.ts
import type { Card, Suit, Rank, TableState } from '@/types/game';

/** Suits & ranks canoniques */
export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

/** Génère 1 jeu standard (52 cartes) sans jokers */
export function buildStandardDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const id = `${suit}_${rank}_${Math.random().toString(36).slice(2, 8)}`;
      cards.push({ id, suit, rank });
    }
  }
  return cards;
}

/** Ajoute n jokers à un deck */
export function addJokers(deck: Card[], count: number): Card[] {
  const out = deck.slice();
  for (let i = 0; i < count; i++) {
    out.push({
      id: `joker_${Math.random().toString(36).slice(2, 10)}`,
      suit: '♠',          // suit arbitraire (inutile car joker)
      rank: 'A',          // rank placeholder (non utilisé)
      joker: true,
    });
  }
  return out;
}

/** Double deck (2×52) + jokers (par défaut 2 par deck → 4 au total) */
export function buildDoubleDeckWithJokers(jokersPerDeck = 2): Card[] {
  let deck = [
    ...buildStandardDeck(),
    ...buildStandardDeck(),
  ];
  deck = addJokers(deck, jokersPerDeck);
  deck = addJokers(deck, jokersPerDeck); // deux jeux → double jokers
  return deck;
}

/** Shuffle Fisher–Yates (in-place safe clone) */
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deal : renvoie {hands, draw, discard} */
export function deal(deck: Card[], players: string[], handSize = 13) {
  const drawIds = deck.map(c => c.id);
  const hands: Record<string, string[]> = {};
  for (const pid of players) hands[pid] = [];

  for (let r = 0; r < handSize; r++) {
    for (const pid of players) {
      const cid = drawIds.pop();
      if (!cid) throw new Error('Deck épuisé pendant la distribution');
      hands[pid].push(cid);
    }
  }
  // Démarrer la défausse avec 1 carte retournée
  const firstDiscard = drawIds.pop();
  const discard = firstDiscard ? [firstDiscard] : [];
  return { hands, draw: drawIds, discard };
}

/** Initialise un TableState prêt à jouer (hors réseau) */
export function createLocalTable(players: {id: string; displayName: string}[]): {
  table: TableState;
  deck: Record<string, Card>;
} {
  // 2×52 + 4 jokers
  const full = shuffle(buildDoubleDeckWithJokers(2));
  // index rapide id → Card
  const deckIndex: Record<string, Card> = {};
  for (const c of full) deckIndex[c.id] = c;

  const ids = players.map(p => p.id);
  const { hands, draw, discard } = deal(full, ids, 13);

  const table: TableState = {
    id: `local_${Date.now()}`,
    players: players.map(p => ({
      id: p.id,
      displayName: p.displayName,
      hand: hands[p.id],
      laidPoints: 0,
      hasOpened: false,
    })),
    activePlayer: players[0].id,
    melds: [],
    piles: { draw, discard },
    phase: 'draw',
  };

  return { table, deck: deckIndex };
}
