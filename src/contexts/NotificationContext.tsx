import React, { createContext, useContext, ReactNode } from 'react';

/**
 * NOTIFICATION CONTEXT - Push notifications & in-app
 * 
 * TODO (Phase 3):
 * - Intégration FCM (Firebase Cloud Messaging)
 * - APNs pour iOS
 * - Gestion des permissions
 * - Notifications de tour de jeu
 * - Invitations à rejoindre
 * - Messages chat
 */

interface NotificationContextType {
  isEnabled: boolean;
  requestPermission: () => Promise<void>;
  sendGameInvite: (playerId: string, gameId: string) => Promise<void>;
  sendTurnNotification: (gameId: string) => Promise<void>;
  // À étendre
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const requestPermission = async () => {
    console.log('[NOTIFICATIONS] Request permission - À implémenter');
    // TODO: Demander permission push
  };

  const sendGameInvite = async (playerId: string, gameId: string) => {
    console.log('[NOTIFICATIONS] Send invite:', { playerId, gameId });
    // TODO: Envoyer notification d'invitation
  };

  const sendTurnNotification = async (gameId: string) => {
    console.log('[NOTIFICATIONS] Turn notification:', gameId);
    // TODO: Notifier que c'est le tour du joueur
  };

  return (
    <NotificationContext.Provider 
      value={{
        isEnabled: false,
        requestPermission,
        sendGameInvite,
        sendTurnNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
