// features/game/engine.ts
import type { TableState, Move, Card, Meld } from '../../types/game';

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
 * Réducteur pur : applique un Move -> nouveau TableState (immutabilité)
 * TODO: valider le tour actif, la phase, la légalité des coups, le calcul des points, la fin de manche
 * Structure en place pour itérations futures
 */
export function applyMove(state: TableState, move: Move, deck: Record<string, Card>): TableState {
  // Structure extensible pour gérer tous les types de coups
  switch (move.kind) {
    case 'DRAW_FROM_STOCK':
      // TODO: implémenter pioche depuis le deck
      return state;
    
    case 'DRAW_FROM_DISCARD':
      // TODO: implémenter pioche depuis la défausse
      return state;
    
    case 'LAY_OPEN':
      // TODO: valider et poser la première combinaison >= 51 points
      return state;
    
    case 'ADD_TO_MELD':
      // TODO: ajouter une carte à une combinaison existante
      return state;
    
    case 'LAY_MELD':
      // TODO: poser une nouvelle combinaison
      return state;
    
    case 'DISCARD':
      // TODO: défausser une carte et passer au joueur suivant
      return state;
    
    case 'END_TURN':
      // TODO: passer au joueur suivant
      return state;
    
    default:
      return state;
  }
}
