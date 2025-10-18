// services/entitlement.ts
/**
 * Service de gestion des droits et fonctionnalités premium
 * Vérifie si un utilisateur peut accéder à une fonctionnalité selon son statut
 */

export type Gate = 'ranked' | 'adFree' | 'extraSlots' | 'customSkins' | 'priorityMatch';

export interface UserEntitlement {
  premium?: boolean;
  // Futurs champs pour A/B testing, country-based features, etc.
  country?: string;
  abTestGroup?: string;
}

/**
 * Vérifie si un utilisateur peut utiliser une fonctionnalité
 * @param gate - La fonctionnalité à vérifier
 * @param user - L'utilisateur avec son statut premium
 * @returns true si l'utilisateur peut utiliser la fonctionnalité
 */
export function canUse(gate: Gate, user: UserEntitlement): boolean {
  // Mode classé réservé aux premium
  if (gate === 'ranked') return !!user.premium;
  
  // Pas de pub pour les premium
  if (gate === 'adFree') return !!user.premium;
  
  // Slots supplémentaires pour premium
  if (gate === 'extraSlots') return !!user.premium;
  
  // Skins personnalisés pour premium
  if (gate === 'customSkins') return !!user.premium;
  
  // Matchmaking prioritaire pour premium
  if (gate === 'priorityMatch') return !!user.premium;
  
  return false;
}

/**
 * Obtient le message d'erreur approprié pour un gate
 */
export function getGateMessage(gate: Gate): string {
  switch (gate) {
    case 'ranked':
      return 'Le mode classé est réservé aux membres premium';
    case 'adFree':
      return 'Passez premium pour retirer les publicités';
    case 'extraSlots':
      return 'Les slots supplémentaires sont réservés aux membres premium';
    case 'customSkins':
      return 'Les skins personnalisés sont réservés aux membres premium';
    case 'priorityMatch':
      return 'Le matchmaking prioritaire est réservé aux membres premium';
    default:
      return 'Cette fonctionnalité est réservée aux membres premium';
  }
}
