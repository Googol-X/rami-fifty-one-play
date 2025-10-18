# Firebase Realtime Transport

## Configuration rapide

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet (ou utilisez un existant)
3. Activez **Firestore Database** (mode production)

### 2. Obtenir la configuration

1. Dans Firebase Console, allez dans **Paramètres du projet** (⚙️)
2. Dans la section **Général**, descendez jusqu'à "Vos applications"
3. Cliquez sur l'icône Web `</>`
4. Enregistrez l'application avec un nom (ex: "Rami51 Web")
5. Copiez l'objet `firebaseConfig`

### 3. Configurer dans le projet

Ouvrez `src/config/firebase.config.ts` et remplacez la configuration:

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSy...", // Votre clé API
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 4. Configurer les règles de sécurité Firestore

1. Dans Firebase Console, allez dans **Firestore Database**
2. Cliquez sur l'onglet **Règles**
3. Copiez-collez le contenu de `src/config/firebase.rules.txt`
4. Cliquez sur **Publier**

## Utilisation

### Initialiser le transport

```typescript
import { FirebaseTransport } from '@/services/realtime.firebase';
import { firebaseConfig } from '@/config/firebase.config';

const transport = new FirebaseTransport(firebaseConfig);
```

### Avec GameProvider

```typescript
import { GameProvider } from '@/contexts/GameContext';
import { FirebaseTransport } from '@/services/realtime.firebase';
import { firebaseConfig, isFirebaseConfigured } from '@/config/firebase.config';

function App() {
  const transport = isFirebaseConfigured() 
    ? new FirebaseTransport(firebaseConfig)
    : undefined; // Fallback vers NoopTransport

  return (
    <GameProvider transport={transport}>
      {/* Votre app */}
    </GameProvider>
  );
}
```

### Tester en multijoueur

1. Activez le sandbox: `features.gameSandbox = true` dans `app.config.ts`
2. Modifiez `GameSandbox.tsx` pour utiliser Firebase:

```typescript
import { FirebaseTransport } from '@/services/realtime.firebase';
import { firebaseConfig } from '@/config/firebase.config';
import { GameProvider } from '@/contexts/GameContext';

export function GameSandbox() {
  const transport = new FirebaseTransport(firebaseConfig);
  
  return (
    <GameProvider transport={transport}>
      <SandboxContent />
    </GameProvider>
  );
}
```

3. Ouvrez `/sandbox` dans deux navigateurs différents
4. Initialisez une partie avec le même `roomId`
5. Les moves seront synchronisés en temps réel!

## Sécurité

⚠️ **Important**: Les clés API Firebase sont publiques et peuvent être exposées côté client.

La sécurité est assurée par:
- Les **règles Firestore** côté serveur
- L'**authentification Firebase** (optionnelle mais recommandée)

Les règles fournies permettent:
- ✅ Lecture publique des rooms et events (nécessaire pour le gameplay)
- ✅ Écriture authentifiée uniquement
- ❌ Events immutables (pas de modification/suppression)

## Coûts

Firebase offre un **quota gratuit généreux**:
- 50,000 lectures/jour
- 20,000 écritures/jour
- 20,000 suppressions/jour
- 1 GiB de stockage

Pour un jeu de cartes, cela représente:
- ~500 parties complètes par jour (gratuit)
- Au-delà: ~$0.06 par 100,000 opérations

## Alternatives

Si vous préférez ne pas utiliser Firebase:

1. **Supabase Realtime** (intégré à Lovable Cloud)
2. **WebSocket custom** (nécessite un serveur)
3. **NoopTransport** (mode offline pour dev/tests)

Voir `src/services/realtime.ts` pour l'interface commune.
