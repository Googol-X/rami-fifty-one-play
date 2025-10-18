# Matchmaking System

## Vue d'ensemble

Système de matchmaking simple basé sur Firebase Firestore qui regroupe automatiquement les joueurs cherchant un match au même moment.

## Stratégie de matchmaking

### Mode Casual (implémenté)

**Regroupement par timestamp:**
- Un `roomId` est généré basé sur la minute courante
- Tous les joueurs cherchant un match dans la même minute sont regroupés
- Limite à 2 joueurs pour 1v1

**Exemple:**
```
Joueur A cherche un match à 14:35:00 → roomId: "casual_28756320"
Joueur B cherche un match à 14:35:45 → roomId: "casual_28756320" (même room!)
Joueur C cherche un match à 14:36:10 → roomId: "casual_28756321" (nouvelle room)
```

**Avantages:**
- ✅ Simple à implémenter
- ✅ Pas de serveur de matchmaking nécessaire
- ✅ Regroupement automatique rapide (<60s)
- ✅ Fonctionne hors-ligne avec fallback

**Limites:**
- ⚠️ Pas de matching par niveau/ELO
- ⚠️ Peut créer des rooms avec 1 seul joueur si personne d'autre ne cherche

### Mode Ranked (à implémenter)

TODO: Implémenter un système de file d'attente avec matching par ELO

## Utilisation

### Chercher un match

```typescript
import { requestMatch } from '@/features/matchmaking/api';

const result = await requestMatch({
  userId: 'player-123',
  mode: 'casual'
});

console.log(result);
// { roomId: 'casual_28756320', seats: ['player-123', 'player-456'] }
```

### Avec Firebase configuré

1. Assurez-vous que Firebase est configuré dans `firebase.config.ts`
2. Les règles Firestore doivent permettre l'accès aux rooms:

```javascript
match /rooms/{roomId} {
  allow read, write: if request.auth != null;
}
```

### Intégration avec GameProvider

```typescript
import { requestMatch } from '@/features/matchmaking/api';
import { FirebaseTransport } from '@/services/realtime.firebase';
import { firebaseConfig } from '@/config/firebase.config';

async function startMultiplayerGame(userId: string) {
  // 1. Trouver un match
  const { roomId, seats } = await requestMatch({
    userId,
    mode: 'casual'
  });
  
  // 2. Vérifier si on a trouvé un adversaire
  if (seats.length < 2) {
    console.log('En attente d\'un adversaire...');
    // TODO: Écouter les changements sur la room pour détecter l'arrivée d'un adversaire
    return;
  }
  
  // 3. Initialiser le transport Firebase
  const transport = new FirebaseTransport(firebaseConfig);
  
  // 4. Initialiser le jeu
  // ... (voir GameContext)
}
```

## Gestion de l'attente

Si un seul joueur est dans la room, vous devez écouter les changements:

```typescript
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

function waitForOpponent(roomId: string, onOpponentJoined: (seats: string[]) => void) {
  const db = getFirestore();
  const ref = doc(db, 'rooms', roomId);
  
  const unsubscribe = onSnapshot(ref, (snap) => {
    const data = snap.data();
    const seats = data?.seats ?? [];
    
    if (seats.length >= 2) {
      onOpponentJoined(seats);
      unsubscribe(); // Arrêter l'écoute
    }
  });
  
  return unsubscribe;
}
```

## Améliorations futures

### Phase 2: Matching avancé
- [ ] Système de file d'attente avec priorités
- [ ] Matching par ELO/niveau
- [ ] Matching par région (latence)
- [ ] Timeout après X secondes sans adversaire

### Phase 3: Ranked mode
- [ ] Système ELO complet
- [ ] Historique des matchs
- [ ] Prévention du match dodging
- [ ] Pénalités pour abandon

### Phase 4: Features sociales
- [ ] Invitations directes
- [ ] Parties privées
- [ ] Tournois
- [ ] Spectateur mode

## Fallback mode

En cas d'erreur Firebase ou configuration manquante:
- Le système crée automatiquement une room locale
- Permet de tester en mode offline
- Pas de synchronisation temps réel

```typescript
// Résultat en mode fallback:
{
  roomId: 'local_1234567890',
  seats: ['player-123']
}
```

## Structure Firestore

```
rooms/
  └── casual_28756320/
      ├── roomId: "casual_28756320"
      ├── seats: ["player-123", "player-456"]
      ├── mode: "casual"
      ├── createdAt: Timestamp
      ├── updatedAt: Timestamp
      └── events/
          ├── event_001/
          │   ├── payload: {...}
          │   └── ts: Timestamp
          └── event_002/
              ├── payload: {...}
              └── ts: Timestamp
```
