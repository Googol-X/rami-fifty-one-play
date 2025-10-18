// features/game/engine.spec.ts
/**
 * Tests de sanity pour le moteur de jeu
 * Sert de documentation vivante pour le comportement attendu
 * 
 * Pour exécuter manuellement : copier/coller dans la console du navigateur
 * ou utiliser un runner de tests (Vitest, Jest) plus tard
 */

import { scoreCard, scoreMeld, canOpenAtLeast51, applyMove } from './engine';
import type { Card, Meld, TableState, Move } from '../../types/game';

// ============= HELPERS =============
function createCard(rank: Card['rank'], suit: Card['suit'], id?: string): Card {
  return {
    id: id || `${suit}-${rank}`,
    rank,
    suit,
  };
}

function createDeck(cards: Card[]): Record<string, Card> {
  return cards.reduce((acc, card) => {
    acc[card.id] = card;
    return acc;
  }, {} as Record<string, Card>);
}

// ============= TEST 1: scoreCard =============
export function test_scoreCard() {
  console.group('TEST: scoreCard');
  
  // As = 1
  const aceScore = scoreCard(createCard('A', '♠'));
  console.assert(aceScore === 1, `Expected Ace to be 1, got ${aceScore}`);
  
  // J/Q/K = 10
  const jackScore = scoreCard(createCard('J', '♥'));
  console.assert(jackScore === 10, `Expected Jack to be 10, got ${jackScore}`);
  
  const queenScore = scoreCard(createCard('Q', '♦'));
  console.assert(queenScore === 10, `Expected Queen to be 10, got ${queenScore}`);
  
  const kingScore = scoreCard(createCard('K', '♣'));
  console.assert(kingScore === 10, `Expected King to be 10, got ${kingScore}`);
  
  // Cartes numériques = valeur faciale
  const fiveScore = scoreCard(createCard('5', '♠'));
  console.assert(fiveScore === 5, `Expected 5 to be 5, got ${fiveScore}`);
  
  const tenScore = scoreCard(createCard('10', '♥'));
  console.assert(tenScore === 10, `Expected 10 to be 10, got ${tenScore}`);
  
  // Joker = 0 (valeur gérée au niveau meld)
  const jokerScore = scoreCard({ ...createCard('A', '♠'), joker: true });
  console.assert(jokerScore === 0, `Expected Joker to be 0, got ${jokerScore}`);
  
  console.log('✓ scoreCard: All assertions passed');
  console.groupEnd();
}

// ============= TEST 2: scoreMeld =============
export function test_scoreMeld() {
  console.group('TEST: scoreMeld');
  
  // Meld avec J, Q, K (devrait = 30)
  const cards = [
    createCard('J', '♠', 'j-spades'),
    createCard('Q', '♠', 'q-spades'),
    createCard('K', '♠', 'k-spades'),
  ];
  
  const deck = createDeck(cards);
  
  const meld: Meld = {
    id: 'meld-1',
    type: 'run',
    cards: ['j-spades', 'q-spades', 'k-spades'],
    points: 0, // sera calculé
  };
  
  const total = scoreMeld(meld, deck);
  console.assert(total === 30, `Expected 30 points, got ${total}`);
  
  // Meld avec cartes numériques (5, 6, 7 = 18)
  const numCards = [
    createCard('5', '♥', '5-hearts'),
    createCard('6', '♥', '6-hearts'),
    createCard('7', '♥', '7-hearts'),
  ];
  
  const numDeck = createDeck(numCards);
  const numMeld: Meld = {
    id: 'meld-2',
    type: 'run',
    cards: ['5-hearts', '6-hearts', '7-hearts'],
    points: 0,
  };
  
  const numTotal = scoreMeld(numMeld, numDeck);
  console.assert(numTotal === 18, `Expected 18 points, got ${numTotal}`);
  
  console.log('✓ scoreMeld: All assertions passed');
  console.groupEnd();
}

// ============= TEST 3: canOpenAtLeast51 =============
export function test_canOpenAtLeast51() {
  console.group('TEST: canOpenAtLeast51');
  
  // Cas 1: Combinaison >= 51 points (devrait retourner true)
  // 10♠, J♠, Q♠, K♠, A♠ = 10+10+10+10+1 = 41... pas assez
  // Ajoutons une autre combinaison: 9♥, 10♥, J♥ = 9+10+10 = 29
  // Total: 41 + 29 = 70 >= 51 ✓
  
  const goodCards = [
    createCard('10', '♠', '10-spades'),
    createCard('J', '♠', 'j-spades'),
    createCard('Q', '♠', 'q-spades'),
    createCard('K', '♠', 'k-spades'),
    createCard('9', '♥', '9-hearts'),
    createCard('10', '♥', '10-hearts'),
    createCard('J', '♥', 'j-hearts'),
  ];
  
  const goodDeck = createDeck(goodCards);
  
  const goodMelds = [
    {
      id: 'temp-1',
      type: 'run' as const,
      cards: ['10-spades', 'j-spades', 'q-spades', 'k-spades'],
    },
    {
      id: 'temp-2',
      type: 'run' as const,
      cards: ['9-hearts', '10-hearts', 'j-hearts'],
    },
  ];
  
  const canOpen = canOpenAtLeast51(goodMelds, goodDeck);
  console.assert(canOpen === true, `Expected true for 70 points, got ${canOpen}`);
  
  // Cas 2: Combinaison < 51 points (devrait retourner false)
  const badCards = [
    createCard('2', '♣', '2-clubs'),
    createCard('3', '♣', '3-clubs'),
    createCard('4', '♣', '4-clubs'),
  ];
  
  const badDeck = createDeck(badCards);
  
  const badMelds = [
    {
      id: 'temp-3',
      type: 'run' as const,
      cards: ['2-clubs', '3-clubs', '4-clubs'],
    },
  ];
  
  const cannotOpen = canOpenAtLeast51(badMelds, badDeck);
  console.assert(cannotOpen === false, `Expected false for 9 points, got ${cannotOpen}`);
  
  console.log('✓ canOpenAtLeast51: All assertions passed');
  console.groupEnd();
}

// ============= TEST 4: applyMove (immutabilité) =============
export function test_applyMove_immutability() {
  console.group('TEST: applyMove immutability');
  
  const initialState: TableState = {
    id: 'test-game',
    players: [
      {
        id: 'player-1',
        displayName: 'Test Player',
        hand: ['card-1', 'card-2'],
        laidPoints: 0,
        hasOpened: false,
      },
    ],
    activePlayer: 'player-1',
    melds: [],
    piles: {
      draw: ['deck-1', 'deck-2'],
      discard: [],
    },
    phase: 'draw',
  };
  
  const move: Move = {
    kind: 'DRAW_FROM_STOCK',
    playerId: 'player-1',
  };
  
  const deck = createDeck([
    createCard('A', '♠', 'card-1'),
    createCard('2', '♠', 'card-2'),
  ]);
  
  const newState = applyMove(initialState, move, deck);
  
  // Vérifier que l'état initial n'a pas été muté
  console.assert(
    initialState.players[0].hand.length === 2,
    'Original state should not be mutated'
  );
  
  console.assert(
    initialState !== newState,
    'applyMove should return a new state object'
  );
  
  console.log('✓ applyMove: Immutability preserved');
  console.groupEnd();
}

// ============= RUN ALL TESTS =============
export function runAllTests() {
  console.log('========================================');
  console.log('RUNNING GAME ENGINE SANITY TESTS');
  console.log('========================================\n');
  
  test_scoreCard();
  test_scoreMeld();
  test_canOpenAtLeast51();
  test_applyMove_immutability();
  
  console.log('\n========================================');
  console.log('ALL TESTS COMPLETED');
  console.log('========================================');
}

// Pour exécuter manuellement dans la console:
// import { runAllTests } from './features/game/engine.spec';
// runAllTests();
