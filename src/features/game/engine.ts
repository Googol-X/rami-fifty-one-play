// features/game/engine.ts
import type { TableState, Move, Card, Meld, PlayerState } from '../../types/game';

/**
 * Clone profond d'un objet via JSON (simple et efficace pour nos besoins)
 */
function clone<T>(x: T): T { 
  return JSON.parse(JSON.stringify(x)); 
}

/**
 * Calcule le score d'une carte selon les règles du Rami 51
 */
export function scoreCard(c: Card): number {
  if (c.joker) return 0;       // joker prend la valeur de remplacement, géré au niveau du meld
  if (c.rank === 'A') return 1;
  if (['J','Q','K'].includes(c.rank)) return 10;
  return parseInt(c.rank as string, 10);
}

/**
 * Calcule le score total d'une combinaison (meld)
 */
export function scoreMeld(m: Meld, deck: Record<string, Card>): number {
  return m.cards.reduce((acc, id) => acc + scoreCard(deck[id]), 0);
}

/**
 * Vérifie si les combinaisons permettent d'ouvrir avec au moins 51 points
 */
export function canOpenAtLeast51(melds: Omit<Meld, 'points'|'owner'>[], deck: Record<string, Card>): boolean {
  const tmp: Meld[] = melds.map((m, i) => ({...m, id: String(i), points: 0}));
  const total = tmp.reduce((acc, m) => acc + scoreMeld(m as Meld, deck), 0);
  return total >= 51;
}

/**
 * Vérifie que c'est bien le tour du joueur
 */
function ensureTurn(state: TableState, playerId: string) {
  if (state.activePlayer !== playerId) throw new Error('Not your turn');
}

/**
 * Récupère un joueur par son ID
 */
function getPlayer(state: TableState, playerId: string): PlayerState {
  const p = state.players.find(pl => pl.id === playerId);
  if (!p) throw new Error('Player not found');
  return p;
}

/**
 * Détermine le joueur suivant
 */
function nextPlayer(state: TableState): string {
  const idx = state.players.findIndex(p => p.id === state.activePlayer);
  const next = (idx + 1) % state.players.length;
  return state.players[next].id;
}

/**
 * Retire un élément d'un tableau selon un prédicat
 */
function removeFrom<T>(arr: T[], pred: (x: T) => boolean): T {
  const i = arr.findIndex(pred);
  if (i < 0) throw new Error('Item not found');
  const [x] = arr.splice(i, 1);
  return x;
}

/**
 * Réducteur pur : applique un Move -> nouveau TableState (immutabilité)
 * Gère toutes les phases du jeu : pioche, pose, ajout, défausse, fin de manche
 */
export function applyMove(state: TableState, move: Move, deck: Record<string, Card>): TableState {
  const s = clone(state);
  if (s.phase === 'ended') return s;

  const player = getPlayer(s, (move as any).playerId);
  ensureTurn(s, player.id);

  switch (move.kind) {
    case 'DRAW_FROM_STOCK': {
      if (s.phase !== 'draw') throw new Error('You must draw first');
      const cid = s.piles.draw.pop();
      if (!cid) throw new Error('Stock empty');
      player.hand.push(cid);
      s.phase = 'play';
      return s;
    }

    case 'DRAW_FROM_DISCARD': {
      if (s.phase !== 'draw') throw new Error('You must draw first');
      const cid = s.piles.discard.pop();
      if (!cid) throw new Error('Discard empty');
      player.hand.push(cid);
      s.phase = 'play';
      return s;
    }

    case 'LAY_OPEN': {
      if (s.phase !== 'play') throw new Error('Not the right phase');
      if (player.hasOpened) throw new Error('Already opened');

      if (!canOpenAtLeast51(move.melds, deck)) throw new Error('Need at least 51 points');

      // consomme les cartes de la main
      for (const m of move.melds) {
        m.cards.forEach(cid => {
          removeFrom(player.hand, c => c === cid);
        });
      }

      // insère les melds avec owner + points
      move.melds.forEach((m, i) => {
        const inserted: Meld = {
          id: `${Date.now()}_${i}`,
          type: m.type,
          cards: m.cards,
          owner: player.id,
          points: 0,
        };
        inserted.points = scoreMeld(inserted, deck);
        s.melds.push(inserted);
      });

      player.hasOpened = true;
      player.laidPoints = s.melds
        .filter(m => m.owner === player.id)
        .reduce((acc, m) => acc + m.points, 0);

      return s;
    }

    case 'LAY_MELD': {
      if (s.phase !== 'play') throw new Error('Not the right phase');
      if (!player.hasOpened) throw new Error('Must open first (≥51)');
      
      // retire cartes de la main
      move.meld.cards.forEach(cid => removeFrom(player.hand, c => c === cid));

      const inserted: Meld = {
        id: `${Date.now()}`,
        type: move.meld.type,
        cards: move.meld.cards,
        owner: player.id,
        points: 0,
      };
      inserted.points = scoreMeld(inserted, deck);
      s.melds.push(inserted);
      
      return s;
    }

    case 'ADD_TO_MELD': {
      if (s.phase !== 'play') throw new Error('Not the right phase');
      if (!player.hasOpened) throw new Error('Must open first (≥51)');

      const target = s.melds.find(m => m.id === move.meldId);
      if (!target) throw new Error('Meld not found');

      // retire de la main et ajoute
      removeFrom(player.hand, c => c === move.cardId);
      target.cards.push(move.cardId);
      target.points = scoreMeld(target, deck);
      
      return s;
    }

    case 'DISCARD': {
      if (s.phase !== 'play') throw new Error('You must discard at the end');
      
      // défausser une carte de la main
      removeFrom(player.hand, c => c === move.cardId);
      s.piles.discard.push(move.cardId);

      // si le joueur a vidé sa main → fin de manche
      if (player.hand.length === 0) {
        s.phase = 'ended';
        s.winner = player.id;
        return s;
      }

      s.phase = 'discard';
      return s;
    }

    case 'END_TURN': {
      if (s.phase !== 'discard') throw new Error('Discard before ending the turn');
      s.activePlayer = nextPlayer(s);
      s.phase = 'draw';
      return s;
    }

    default:
      return s;
  }
}
