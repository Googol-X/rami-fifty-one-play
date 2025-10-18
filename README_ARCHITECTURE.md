# 🏗️ Architecture Rami 51 - Guide Développeur

## 📋 Vue d'ensemble

Ce document décrit l'architecture scalable mise en place pour supporter l'évolution du projet Rami 51 vers une application mobile multijoueur freemium.

---

## 🗂️ Structure des dossiers

```
src/
├── components/          # Composants UI existants (⚠️ NE PAS MODIFIER)
│   ├── Card.tsx
│   ├── GameHand.tsx
│   ├── GameControls.tsx
│   └── ui/             # Composants shadcn/ui
│
├── contexts/           # ✅ NOUVEAU - Contexts React globaux
│   ├── ThemeContext.tsx        # Système de thèmes (dark/light + skins)
│   ├── PremiumContext.tsx      # Gestion freemium (isPremium, features)
│   └── NotificationContext.tsx # Push notifications (placeholder)
│
├── features/          # ✅ NOUVEAU - Fonctionnalités modulaires
│   ├── matchmaking/
│   │   └── MatchmakingPanel.tsx  # Recherche automatique d'adversaires
│   ├── chat/
│   │   └── ChatPanel.tsx         # Communication en jeu
│   ├── profile/
│   │   └── ProfileCard.tsx       # Profil + stats joueur
│   ├── store/
│   │   └── StorePanel.tsx        # Boutique in-app
│   └── ranking/
│       └── RankingPanel.tsx      # Classements & leaderboards
│
├── hooks/             # Hooks React (existants + nouveaux)
│   ├── useMultiplayer.ts      # ⚠️ Existant - Sync temps réel
│   ├── useGameScore.ts        # ⚠️ Existant
│   └── useMatchmaking.ts      # ✅ NOUVEAU - Queue matchmaking
│
├── types/             # Types TypeScript
│   ├── game.ts               # ⚠️ Existant - Types de base
│   └── multiplayer.ts        # ✅ NOUVEAU - Types multijoueur
│
├── config/            # ✅ NOUVEAU - Configurations centralisées
│   └── app.config.ts         # Toutes les configs (game, premium, ads, etc.)
│
├── services/          # ✅ NOUVEAU - Services métier
│   └── analytics.service.ts  # Tracking événements (placeholder)
│
├── pages/             # Pages de l'app (existantes)
│   ├── Home.tsx
│   ├── Table.tsx       # ⚠️ Page de jeu principale
│   ├── Lobby.tsx       # ⚠️ Lobby multijoueur
│   └── Auth.tsx
│
└── utils/             # Utilitaires (existants)
    ├── deck.ts
    ├── validation.ts
    └── botAI.ts
```

---

## 🎯 Phases de développement

### ✅ Phase 1 - STRUCTURE (Actuel)
**Objectif:** Poser les fondations scalables sans casser l'existant

**Réalisé:**
- ✅ Contexts pour theme, premium, notifications
- ✅ Composants placeholder pour features futures
- ✅ Types multijoueur complets
- ✅ Configuration centralisée
- ✅ Hooks extensibles

**Fonctionnalités actives:**
- Jeu solo contre bot (intact)
- Multijoueur 1v1 basique (intact)
- Système de thème dark/light

### 🔨 Phase 2 - MULTIJOUEUR (À venir)
**Objectif:** Matchmaking, chat, classements

**À implémenter:**
```typescript
// 1. Matchmaking automatique
- Algorithme de matching par niveau
- File d'attente temps réel (WebSocket)
- Modes: classé, rapide, amical

// 2. Chat en jeu
- Messages temps réel (Supabase Realtime)
- Quick replies (emojis)
- Filtrage contenu

// 3. Classements
- Système ELO/MMR
- Ligues (Bronze → Maître)
- Leaderboards hebdo/global
```

### 💎 Phase 3 - MONETISATION (À venir)
**Objectif:** Premium, ads, store

**À implémenter:**
```typescript
// 1. Abonnement Premium
- Intégration Apple/Google Store
- Gestion abonnements
- Unlock features

// 2. Publicités
- AdMob interstitiel (après X parties)
- Banners
- Rewarded ads (bonus)

// 3. Boutique
- Skins premium
- Packs coins
- Items consommables
```

### 🎮 Phase 4 - AVANCÉ (Future)
- Tournois
- Achievements
- Système d'amis
- Replay des parties
- Mode entraînement IA

---

## 🔧 Configuration des features

**Fichier:** `src/config/app.config.ts`

```typescript
// Activer/désactiver des fonctionnalités
export const FEATURES = {
  multiplayer: true,      // ✅ Actif
  matchmaking: false,     // 🔨 Phase 2
  chat: false,            // 🔨 Phase 2
  ranking: false,         // 🔨 Phase 2
  premium: false,         // 💎 Phase 3
  ads: false,             // 💎 Phase 3
  notifications: false,   // 💎 Phase 3
  achievements: false,    // 🎮 Phase 4
  tournaments: false,     // 🎮 Phase 4
};
```

---

## 🎨 Système de thèmes

### Utilisation basique
```typescript
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { mode, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Mode: {mode}
    </button>
  );
}
```

### Thèmes premium (Phase 3)
```typescript
const { skin, setSkin } = useTheme();

// Skins disponibles pour premium
setSkin('royal');   // Table royale or/rouge
setSkin('neon');    // Cyberpunk néon
setSkin('vintage'); // Rétro années 50
```

---

## 💎 Système Premium

### Vérifier si premium
```typescript
import { usePremium } from '@/contexts/PremiumContext';

function MyComponent() {
  const { isPremium, hasAds, features } = usePremium();
  
  if (!features.customSkins) {
    return <UpgradePrompt />;
  }
  
  return <PremiumContent />;
}
```

### Features premium
- `unlimitedGames`: Parties illimitées
- `customSkins`: Skins exclusifs
- `noAds`: Pas de publicité
- `priorityMatching`: Matchmaking prioritaire
- `advancedStats`: Stats détaillées
- `chatEmojis`: Emojis personnalisés

---

## 📊 Analytics (Phase 3)

```typescript
import { analytics } from '@/services/analytics.service';

// Tracker des événements
analytics.trackGameStart('ranked');
analytics.trackGameEnd('player', 180);
analytics.trackPurchaseComplete('premium_monthly', 4.99);
```

---

## 🔐 Base de données Supabase

### Tables existantes (NE PAS MODIFIER)
```sql
-- Déjà en place
- profiles         # Profils utilisateurs
- games            # Sessions de jeu
- game_players     # Joueurs dans une partie
- game_state       # État synchronisé du jeu
- player_hands     # Mains des joueurs
```

### Tables à créer (Phase 2-3)
```sql
-- Phase 2: Multijoueur avancé
- matchmaking_queue    # File d'attente
- chat_messages        # Messages de chat
- player_stats         # Stats joueurs
- rankings             # Classements

-- Phase 3: Monétisation
- purchases            # Achats in-app
- achievements         # Succès débloqués
- skins_inventory      # Inventaire skins
```

---

## 🚀 Comment ajouter une nouvelle feature

### Exemple: Ajouter un système d'amis

1. **Créer les types** (`src/types/friends.ts`)
```typescript
export interface Friend {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'playing';
  addedAt: Date;
}
```

2. **Créer le hook** (`src/hooks/useFriends.ts`)
```typescript
export const useFriends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  
  const addFriend = async (userId: string) => {
    // TODO: Logique d'ajout
  };
  
  return { friends, addFriend };
};
```

3. **Créer le composant** (`src/features/friends/FriendsList.tsx`)
```typescript
export const FriendsList = () => {
  const { friends } = useFriends();
  
  return (
    <Card>
      {friends.map(friend => (
        <FriendCard key={friend.id} friend={friend} />
      ))}
    </Card>
  );
};
```

4. **Activer la feature** (`src/config/app.config.ts`)
```typescript
export const FEATURES = {
  // ...
  friends: true, // ✅ Activer
};
```

---

## 📱 Mobile-First

### Responsive design
- Tous les composants utilisent des breakpoints Tailwind
- Composants adaptés tactile (zones touch min 44x44px)
- Navigation mobile optimisée

### Performance
- Lazy loading des features lourdes
- Code splitting par route
- Images optimisées
- Animations GPU-accelerated

---

## ⚠️ Règles importantes

### ❌ NE JAMAIS MODIFIER
- `src/components/` existants (sauf extension)
- `src/pages/Table.tsx` core gameplay
- `src/utils/deck.ts` logique cartes
- `src/utils/validation.ts` règles du jeu

### ✅ ZONES EXTENSIBLES
- `src/contexts/` ajouter nouveaux contexts
- `src/features/` ajouter nouvelles features
- `src/hooks/` ajouter nouveaux hooks
- `src/config/app.config.ts` ajuster configs

### 🔒 SÉCURITÉ
- Jamais de secrets en dur dans le code
- Validation côté serveur (RLS Supabase)
- Sanitization des inputs utilisateur
- Rate limiting sur les actions

---

## 📚 Ressources

- **Documentation Supabase:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React Query:** https://tanstack.com/query
- **shadcn/ui:** https://ui.shadcn.com

---

## 🆘 Support

Pour toute question sur l'architecture:
1. Lire ce README
2. Consulter `src/config/app.config.ts`
3. Examiner les placeholders dans `src/features/`
4. Vérifier les TODOs dans le code

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2025  
**Statut:** ✅ Phase 1 complète - Structure posée
