# 🗺️ Roadmap Rami 51 - Développement Mobile Freemium

## 📊 Vue d'ensemble du projet

**Objectif:** Transformer le MVP actuel en application mobile multijoueur freemium scalable pour iOS et Android.

**État actuel:** ✅ Phase 1 complète - Fondations posées

---

## 🎯 Phase 1: FONDATIONS (✅ TERMINÉ)

**Durée:** 1 sprint  
**Statut:** ✅ Complété

### Objectifs
- [x] Structurer le projet pour accueillir les futures fonctionnalités
- [x] Créer des placeholders clairs pour chaque module
- [x] Mettre en place l'architecture scalable
- [x] Préserver tout le code existant fonctionnel

### Réalisations

#### Architecture
- [x] Dossier `contexts/` pour state management global
- [x] Dossier `features/` pour modules indépendants
- [x] Dossier `services/` pour logique métier
- [x] Dossier `config/` pour configurations centralisées
- [x] Types TypeScript complets pour multijoueur

#### Contexts créés
- [x] `ThemeContext` - Système de thèmes extensible
- [x] `PremiumContext` - Gestion freemium (isPremium, features)
- [x] `NotificationContext` - Push notifications (placeholder)

#### Features (Placeholders)
- [x] `MatchmakingPanel` - Recherche d'adversaires
- [x] `ChatPanel` - Communication en jeu
- [x] `ProfileCard` - Profil + stats joueur
- [x] `StorePanel` - Boutique in-app
- [x] `RankingPanel` - Classements

#### Configuration
- [x] `app.config.ts` - Configuration centralisée complète
- [x] Feature flags pour activer/désactiver modules
- [x] Configuration ads, premium, analytics

#### Documentation
- [x] `README_ARCHITECTURE.md` - Guide développeur complet
- [x] `ROADMAP.md` - Planning détaillé
- [x] Commentaires TODO dans tout le code

---

## 🔨 Phase 2: MULTIJOUEUR AVANCÉ (À VENIR)

**Durée estimée:** 3-4 sprints  
**Priorité:** 🔴 Haute

### 2.1 Matchmaking Automatique

**Objectifs:**
- [ ] File d'attente temps réel (WebSocket/Supabase Realtime)
- [ ] Algorithme de matching par niveau ELO
- [ ] Estimation temps d'attente
- [ ] Modes: Classé, Rapide, Amical
- [ ] Annulation de recherche

**Backend requis:**
```sql
CREATE TABLE matchmaking_queue (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES auth.users,
  mode TEXT, -- 'ranked', 'quick', 'friendly'
  elo INTEGER,
  joined_at TIMESTAMPTZ,
  preferences JSONB
);
```

**Composants:**
- `MatchmakingQueue` - Gestion file d'attente
- `QueueStatus` - Affichage position/temps
- `MatchFound` - Modal match trouvé

### 2.2 Chat en Temps Réel

**Objectifs:**
- [ ] Messages temps réel (Supabase Realtime)
- [ ] Quick replies (emojis prédéfinis)
- [ ] Filtrage contenu inapproprié
- [ ] Historique messages
- [ ] Notifications nouveaux messages
- [ ] Rate limiting anti-spam

**Backend requis:**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games,
  user_id UUID REFERENCES auth.users,
  message TEXT,
  type TEXT, -- 'text', 'emoji', 'system'
  created_at TIMESTAMPTZ
);
```

**Fonctionnalités:**
- Messages texte limités (200 chars)
- 6-8 emojis quick-reply
- 1 message max toutes les 2s (anti-spam)
- Premium: emojis personnalisés

### 2.3 Système de Classement

**Objectifs:**
- [ ] Calcul ELO/MMR par partie
- [ ] Système de ligues (Bronze → Maître)
- [ ] Leaderboard global
- [ ] Leaderboard hebdomadaire
- [ ] Leaderboard entre amis
- [ ] Points de saison
- [ ] Récompenses de fin de saison

**Backend requis:**
```sql
CREATE TABLE player_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  elo INTEGER DEFAULT 1000,
  league TEXT DEFAULT 'Bronze',
  division INTEGER DEFAULT 5,
  total_games INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  season_points INTEGER DEFAULT 0
);

CREATE TABLE rankings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  rank INTEGER,
  points INTEGER,
  period TEXT, -- 'weekly', 'global'
  season TEXT,
  updated_at TIMESTAMPTZ
);
```

**Ligues:**
- Bronze (0-999 ELO)
- Argent (1000-1499)
- Or (1500-1999)
- Platine (2000-2499)
- Diamant (2500-2999)
- Maître (3000+)

### 2.4 Système de Profil Avancé

**Objectifs:**
- [ ] Avatar personnalisable
- [ ] Stats détaillées
- [ ] Graphiques de progression
- [ ] Historique des 20 dernières parties
- [ ] Badges/Achievements affichés
- [ ] Titre personnalisé

**Métriques:**
- Ratio victoires/défaites
- Taux de victoire par mode
- Moyenne points par partie
- Temps de jeu total
- Records personnels

---

## 💎 Phase 3: MONÉTISATION (À VENIR)

**Durée estimée:** 2-3 sprints  
**Priorité:** 🟡 Moyenne

### 3.1 Abonnement Premium

**Objectifs:**
- [ ] Intégration Apple Store (StoreKit)
- [ ] Intégration Google Play Billing
- [ ] Gestion des abonnements
- [ ] Restauration des achats
- [ ] Validation côté serveur
- [ ] Période d'essai (7 jours)

**Prix proposés:**
- Mensuel: 4.99€
- Annuel: 39.99€ (-33% économie)

**Features Premium:**
- ✅ Parties illimitées (vs 5/jour gratuit)
- ✅ Aucune publicité
- ✅ Skins exclusifs (4+ designs)
- ✅ Stats avancées
- ✅ Matchmaking prioritaire
- ✅ Emojis chat personnalisés
- ✅ Badge premium visible

### 3.2 Système Publicitaire

**Objectifs:**
- [ ] Intégration AdMob
- [ ] Pub interstitielle (après 3 parties)
- [ ] Bannière en bas de lobby
- [ ] Rewarded ads (bonus XP/coins)
- [ ] Respect RGPD/GDPR
- [ ] Contrôle fréquence

**Placements:**
```typescript
Interstitial: 
  - Après défaite (sauf si victoire streak)
  - Après 3 parties consécutives
  - Jamais en partie

Banner:
  - Lobby uniquement
  - Masquable 5s après affichage
  
Rewarded:
  - +50 XP supplémentaire
  - +100 coins
  - Débloquer 1 partie bonus
```

### 3.3 Boutique In-App

**Objectifs:**
- [ ] Système de monnaie virtuelle (coins)
- [ ] Achats consommables
- [ ] Skins premium à l'unité
- [ ] Packs de démarrage
- [ ] Offres limitées (daily deals)

**Catalogue:**
```
Coins:
  - 100 coins: 0.99€
  - 500 coins: 3.99€
  - 1200 coins: 7.99€ (best value)

Skins (si pas premium):
  - Skin Royal: 2.99€ ou 300 coins
  - Skin Neon: 2.99€ ou 300 coins
  - Skin Vintage: 2.99€ ou 300 coins

Consommables:
  - XP Boost 2x (1h): 1.99€ ou 200 coins
  - 10 parties bonus: 0.99€ ou 100 coins
```

### 3.4 Push Notifications

**Objectifs:**
- [ ] Firebase Cloud Messaging (Android)
- [ ] APNs (iOS)
- [ ] Gestion permissions
- [ ] Notifications customisées

**Types de notifications:**
```
Gameplay:
  - "C'est votre tour!" (en partie)
  - "Partie trouvée!"
  - "Votre adversaire a joué"

Social:
  - "Invitation à jouer de [ami]"
  - "Nouveau message de [joueur]"
  - "[ami] vient de vous dépasser au classement!"

Engagement:
  - "Vous n'avez pas joué depuis 2 jours..."
  - "Nouvelle saison commencée!"
  - "Vos parties gratuites sont rechargées!"

Marketing (opt-in):
  - "Skin exclusif disponible pour 24h!"
  - "Offre spéciale -50% sur Premium"
```

---

## 🎮 Phase 4: FEATURES AVANCÉES (FUTURE)

**Durée estimée:** 4-5 sprints  
**Priorité:** 🟢 Basse

### 4.1 Système d'Amis

- [ ] Ajout d'amis par pseudo/code
- [ ] Liste d'amis en ligne
- [ ] Invitations directes
- [ ] Chat privé
- [ ] Statut personnalisé

### 4.2 Achievements

- [ ] 50+ succès à débloquer
- [ ] Catégories: Gameplay, Social, Spécial
- [ ] Récompenses (XP, coins, titres)
- [ ] Progression visible
- [ ] Succès secrets

**Exemples:**
```
Gameplay:
  - Première victoire
  - 10/50/100 victoires
  - Victoire avec +100 points
  - 5 victoires d'affilée

Social:
  - Inviter 5 amis
  - Jouer avec 10 joueurs différents
  - Envoyer 100 messages

Spécial:
  - Jouer à minuit pile
  - Gagner sans étaler de cartes
  - Finir partie en <5 min
```

### 4.3 Tournois

- [ ] Tournois hebdomadaires
- [ ] Format élimination directe
- [ ] Récompenses progressives
- [ ] Leaderboard dédié
- [ ] Replay des parties

### 4.4 Mode Entraînement

- [ ] Difficulté IA réglable (Facile → Expert)
- [ ] Tutoriels interactifs avancés
- [ ] Défis quotidiens vs IA
- [ ] Aucune limite de parties

### 4.5 Replay & Analyse

- [ ] Revoir les 10 dernières parties
- [ ] Analyse des coups
- [ ] Partage de parties remarquables
- [ ] Stats par phase de jeu

---

## 📱 Considérations Techniques Mobile

### Performance

**Objectifs:**
- [ ] Temps de chargement < 2s
- [ ] 60 FPS constant en jeu
- [ ] Taille app < 50 MB
- [ ] Utilisation mémoire < 200 MB
- [ ] Batterie: pas plus de 5%/h

**Optimisations:**
- Lazy loading des features
- Code splitting par route
- Images WebP optimisées
- Cache agressif
- Animations GPU-accelerated

### Responsive Design

**Breakpoints:**
```
Mobile S: 320px
Mobile M: 375px
Mobile L: 425px
Tablet:   768px
Desktop:  1024px
```

**Zones touch:**
- Minimum 44x44px (guidelines Apple/Google)
- Espacement 8px entre éléments interactifs
- Feedback visuel immédiat (<100ms)

### Offline Mode

- [ ] Partie vs IA disponible offline
- [ ] Cache des données utilisateur
- [ ] Queue d'actions en attente de connexion
- [ ] Message clair "Hors ligne"

---

## 🔐 Sécurité & Conformité

### Données Personnelles (RGPD)

- [ ] Consentement explicite pub/analytics
- [ ] Export de données utilisateur
- [ ] Suppression de compte
- [ ] Politique de confidentialité claire
- [ ] Cookies disclaimer

### Sécurité

- [ ] Validation input côté serveur
- [ ] Rate limiting sur toutes les actions
- [ ] Détection de triche (speedhack, etc.)
- [ ] Chiffrement des communications
- [ ] Authentification sécurisée (OAuth)

### Store Guidelines

**Apple App Store:**
- [ ] Respect Human Interface Guidelines
- [ ] Permissions justifiées
- [ ] Review avant soumission
- [ ] Compliance IAP

**Google Play Store:**
- [ ] Material Design respecté
- [ ] Permissions minimales
- [ ] Description claire
- [ ] Compliance Billing

---

## 📊 Métriques de Succès

### KPIs Phase 2 (Multijoueur)
- DAU (Daily Active Users) > 500
- Temps moyen session > 15min
- Parties multijoueur > 60% du total
- Taux de rétention J+7 > 40%

### KPIs Phase 3 (Monétisation)
- Taux conversion premium > 2%
- ARPU (Average Revenue Per User) > 0.50€
- LTV (Lifetime Value) > 5€
- Taux de désinstall < 10%

### KPIs Phase 4 (Avancé)
- MAU (Monthly Active Users) > 10 000
- Engagement social (amis/invites) > 30%
- Completion achievements > 25%
- Taux participation tournois > 15%

---

## 🛠️ Stack Technique

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Query

**Backend:**
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Realtime subscriptions
- Edge Functions

**Mobile:**
- Capacitor (iOS/Android)
- Push Notifications
- In-App Purchases
- AdMob

**DevOps:**
- Git / GitHub
- CI/CD (GitHub Actions)
- Monitoring (Sentry)
- Analytics (Firebase/GA)

---

## 📅 Timeline Estimé

```
Phase 1: ✅ Terminé (1 sprint)
Phase 2: 🔨 3-4 sprints (12-16 semaines)
Phase 3: 💎 2-3 sprints (8-12 semaines)
Phase 4: 🎮 4-5 sprints (16-20 semaines)

Total estimé: ~10-12 mois pour version complète
MVP Phase 2: ~3 mois
```

---

## ✅ Checklist Avant Lancement

### MVP (Phase 2)
- [ ] Matchmaking fonctionnel
- [ ] Chat temps réel
- [ ] Classements
- [ ] Tests utilisateurs (>20 personnes)
- [ ] Pas de bugs critiques
- [ ] Performance mobile OK

### Version Premium (Phase 3)
- [ ] Paiements testés (sandbox)
- [ ] Ads fonctionnelles
- [ ] RGPD compliant
- [ ] Legal: CGU/CGV/Confidentialité
- [ ] Soumis aux stores

### Version Complète (Phase 4)
- [ ] Toutes features implémentées
- [ ] Monitoring actif
- [ ] Support client en place
- [ ] Plan marketing activé
- [ ] Community management

---

**Dernière mise à jour:** 2025  
**Prochaine révision:** Fin Phase 2
