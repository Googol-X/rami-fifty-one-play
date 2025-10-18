# Game Engine - Architecture & Intégration

## Vue d'ensemble

Le nouveau moteur de jeu est conçu pour être scalable, testable et facilement intégrable avec le code existant sans le casser.

## Structure

```
features/game/
├── engine.ts              # Moteur de jeu pur (réducteur + utilitaires)
├── engine.spec.ts         # Tests de sanity / documentation vivante
└── sandbox/
    ├── GameSandbox.tsx    # Écran de test (activable par feature flag)
    └── index.ts
```

## Composants clés

### 1. GameContext (`contexts/GameContext.tsx`)

Provider React qui encapsule la logique de jeu:

- **Maintient l'état local** via `TableState`
- **Dispatch des moves** via `applyMove` (moteur pur)
- **Publie les moves** sur `RTTransport` si multijoueur actif
- **Consomme les messages entrants** et réapplique `applyMove` pour synchronisation

```typescript
const { state, dispatch, initGame, isMultiplayer } = useGame();

// Initialiser une partie
initGame(initialState, 'room-id');

// Dispatcher un move
dispatch({ kind: 'DRAW_FROM_STOCK', playerId: 'player-1' });
```

### 2. Engine (`features/game/engine.ts`)

Réducteur pur et utilitaires:

- `scoreCard(card)` - Calcule le score d'une carte
- `scoreMeld(meld, deck)` - Calcule le score d'une combinaison
- `canOpenAtLeast51(melds, deck)` - Vérifie si >= 51 points
- `applyMove(state, move, deck)` - Applique un move (immutabilité garantie)

### 3. Realtime Transport (`services/realtime.ts`)

Abstraction pour la couche temps réel:

- Interface `RTTransport` implémentable par différents backends
- `NoopTransport` pour développement offline
- Placeholders pour `SupabaseTransport`, `WebSocketTransport`

## Activation du Sandbox

Le sandbox est un écran de test isolé accessible uniquement si le feature flag est activé.

### Activer le sandbox

Dans `src/config/app.config.ts`:

```typescript
export const features = {
  // ...
  gameSandbox: true,  // Passer à true
};
```

### Accéder au sandbox

Une fois activé, naviguer vers `/sandbox` pour accéder à l'écran de test.

## Intégration progressive

L'architecture est conçue pour coexister avec le code existant:

1. **Aucun changement aux pages existantes** (`Home`, `Table`, etc.)
2. **GameContext optionnel** - Utilisé uniquement dans le sandbox pour l'instant
3. **Feature flags** - Permet d'activer/désactiver les nouvelles fonctionnalités
4. **Tests de sanity** - Documentation vivante du comportement attendu

## Prochaines étapes

1. **Phase 1** - Valider le moteur localement dans le sandbox
2. **Phase 2** - Implémenter les transports réels (Supabase Realtime)
3. **Phase 3** - Migrer progressivement `Table.tsx` vers le nouveau système
4. **Phase 4** - Supprimer l'ancien code une fois la migration complète

## Tests

Exécuter les tests de sanity dans la console:

```javascript
import { runAllTests } from '@/features/game/engine.spec';
runAllTests();
```

Les tests couvrent:
- ✓ Scoring des cartes (J/Q/K=10, A=1, etc.)
- ✓ Scoring des combinaisons
- ✓ Validation des 51 points
- ✓ Immutabilité du réducteur
