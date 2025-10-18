/**
 * CONFIGURATION GLOBALE DE L'APPLICATION
 * 
 * Centralise toutes les configurations pour faciliter
 * les ajustements et la maintenance.
 */

// ============= APP INFO =============
export const APP_CONFIG = {
  name: 'Rami 51',
  version: '1.0.0',
  environment: import.meta.env.MODE || 'development',
} as const;

// ============= GAME RULES =============
export const GAME_RULES = {
  initialHandSize: 10,
  minimumMeldValue: 51, // Points minimum pour premier dépôt
  turnTimeLimit: 60, // secondes
  maxPlayers: 4,
  deckCount: 1, // Nombre de jeux de cartes
} as const;

// ============= MULTIPLAYER CONFIG =============
export const MULTIPLAYER_CONFIG = {
  // Matchmaking
  matchmaking: {
    enabled: false, // À activer en Phase 2
    maxWaitTime: 120, // secondes
    regionMatching: false,
  },
  
  // Chat
  chat: {
    enabled: false, // À activer en Phase 2
    maxMessageLength: 200,
    rateLimitMs: 2000, // Anti-spam: 1 message par 2s
    allowEmojis: true,
  },
  
  // Notifications
  notifications: {
    enabled: false, // À activer en Phase 3
    turnReminder: true,
    gameInvites: true,
    chatMessages: true,
  },
} as const;

// ============= PREMIUM FEATURES =============
export const PREMIUM_CONFIG = {
  features: {
    unlimitedGames: false, // Free: 5 parties/jour
    customSkins: false,
    noAds: false,
    priorityMatching: false,
    advancedStats: false,
    chatEmojis: false,
  },
  
  pricing: {
    monthly: 4.99,
    yearly: 39.99, // ~66% économie
    currency: 'EUR',
  },
  
  freeUserLimits: {
    gamesPerDay: 5,
    friendsLimit: 10,
  },
} as const;

// ============= ADS CONFIG =============
export const ADS_CONFIG = {
  enabled: false, // À activer en Phase 3
  providers: {
    admob: {
      ios: 'ca-app-pub-XXXXXXXX~XXXXXXXX',
      android: 'ca-app-pub-XXXXXXXX~XXXXXXXX',
    },
  },
  placements: {
    interstitial: {
      frequency: 3, // Après X parties
      enabled: true,
    },
    banner: {
      enabled: true,
      position: 'bottom',
    },
    rewarded: {
      enabled: true,
      rewards: {
        extraLife: 1,
        coins: 50,
      },
    },
  },
} as const;

// ============= UI CONFIG =============
export const UI_CONFIG = {
  themes: ['light', 'dark'] as const,
  defaultTheme: 'dark' as const,
  
  // Animations
  animations: {
    enabled: true,
    cardDuration: 300, // ms
    transitionDuration: 200,
  },
  
  // Mobile
  mobile: {
    minWidth: 320,
    breakpoint: 640,
    enableHaptics: true,
  },
} as const;

// ============= ANALYTICS CONFIG =============
export const ANALYTICS_CONFIG = {
  enabled: false, // À activer en Phase 3
  trackingId: '', // Google Analytics / Firebase
  events: {
    gameStart: true,
    gameEnd: true,
    purchaseComplete: true,
    levelUp: true,
  },
} as const;

// ============= API ENDPOINTS =============
export const API_CONFIG = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // Futurs endpoints
  matchmaking: '/api/matchmaking',
  leaderboard: '/api/leaderboard',
  notifications: '/api/notifications',
} as const;

// ============= STORAGE KEYS =============
export const STORAGE_KEYS = {
  theme: 'rami51_theme',
  userId: 'rami51_user',
  settings: 'rami51_settings',
  tutorialCompleted: 'rami51_tutorial_done',
  lastPlayedDate: 'rami51_last_played',
} as const;

// ============= FEATURE FLAGS =============
export const FEATURES = {
  multiplayer: true,
  matchmaking: false, // Phase 2
  chat: false, // Phase 2
  ranking: false, // Phase 2
  premium: false, // Phase 3
  ads: false, // Phase 3
  notifications: false, // Phase 3
  achievements: false, // Phase 3
  tournaments: false, // Phase 4
} as const;
