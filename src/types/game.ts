// ===== Types de base (existants, conservés pour compatibilité) =====
export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
  joker?: boolean;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  laid: Card[][];
  score: number;
}

export const RANK_VALUES: Record<Rank, number> = {
  'A': 11,
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 10, 'Q': 10, 'K': 10
};

// ===== Nouveaux types pour structure Rami 51 avancée =====
export type CardId = string;
export type MeldType = 'set' | 'run'; // brelan/carré ou suite

/**
 * Représentation d'une combinaison posée sur la table
 */
export interface Meld {
  id: string;
  type: MeldType;
  cards: CardId[];        // références par id (immuable, facile à sérialiser)
  points: number;         // total compté selon Rami 51
  owner?: string;         // playerId qui l'a posée
}

/**
 * État d'un joueur dans une partie
 */
export interface PlayerState {
  id: string;
  displayName: string;
  hand: CardId[];
  laidPoints: number;     // points déjà posés (>=51 requis au premier coup)
  hasOpened: boolean;     // a déjà atteint 51 ?
}

/**
 * Piles de cartes (pioche et défausse)
 */
export interface Piles {
  draw: CardId[];         // pioche (face cachée)
  discard: CardId[];      // défausse (top = dernier)
}

/**
 * État complet de la table de jeu
 */
export interface TableState {
  id: string;             // roomId / matchId
  players: PlayerState[];
  activePlayer: string;   // playerId du tour en cours
  melds: Meld[];
  piles: Piles;
  phase: 'draw' | 'play' | 'discard' | 'ended';
  winner?: string;
}

/**
 * Actions possibles dans le jeu (pattern Command)
 */
export type Move =
  | { kind: 'DRAW_FROM_STOCK'; playerId: string }
  | { kind: 'DRAW_FROM_DISCARD'; playerId: string }
  | { kind: 'LAY_OPEN'; playerId: string; melds: Omit<Meld, 'points' | 'owner'>[] } // première pose >=51
  | { kind: 'ADD_TO_MELD'; playerId: string; meldId: string; cardId: CardId }
  | { kind: 'LAY_MELD'; playerId: string; meld: Omit<Meld, 'points' | 'owner'> }
  | { kind: 'DISCARD'; playerId: string; cardId: CardId }
  | { kind: 'END_TURN'; playerId: string };
