import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * PREMIUM CONTEXT - Gestion du système freemium
 * 
 * TODO (Phase 2):
 * - Intégration avec store (Apple/Google)
 * - Gestion des abonnements
 * - Tracking des achats in-app
 * - Sync avec backend pour validation
 */

interface PremiumFeatures {
  unlimitedGames: boolean;
  customSkins: boolean;
  noAds: boolean;
  priorityMatching: boolean;
  advancedStats: boolean;
  chatEmojis: boolean;
}

interface PremiumContextType {
  isPremium: boolean;
  hasAds: boolean;
  features: PremiumFeatures;
  // Placeholders pour futur
  purchasePremium: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  checkPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const [isPremium, setIsPremium] = useState(false);

  const features: PremiumFeatures = {
    unlimitedGames: isPremium,
    customSkins: isPremium,
    noAds: isPremium,
    priorityMatching: isPremium,
    advancedStats: isPremium,
    chatEmojis: isPremium,
  };

  // TODO: Implémenter avec store
  const purchasePremium = async () => {
    console.log('[PREMIUM] Purchase flow - À implémenter');
    // Future: Appel au store (Apple/Google)
    // Future: Validation backend
    // setIsPremium(true);
  };

  const restorePurchases = async () => {
    console.log('[PREMIUM] Restore purchases - À implémenter');
    // Future: Vérifier achats existants
  };

  const checkPremiumStatus = async () => {
    console.log('[PREMIUM] Check status - À implémenter');
    // Future: Sync avec backend
  };

  return (
    <PremiumContext.Provider 
      value={{ 
        isPremium, 
        hasAds: !isPremium, 
        features,
        purchasePremium,
        restorePurchases,
        checkPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};
