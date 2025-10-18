// services/realtime.ts
/**
 * Service de découplage pour la couche temps réel (WebSocket/Supabase/Firebase/etc.)
 * Permet de changer facilement le backend de communication sans impacter la logique métier
 */

export interface RTSubscription {
  unsubscribe(): void;
}

/**
 * Interface de transport temps réel abstraite
 * Implémentable par différents backends (Supabase Realtime, WebSocket, Firebase, etc.)
 */
export interface RTTransport {
  /**
   * Rejoindre une room/channel
   */
  joinRoom(roomId: string, authToken?: string): Promise<void>;
  
  /**
   * Quitter une room/channel
   */
  leaveRoom(roomId: string): Promise<void>;
  
  /**
   * Diffuser une action (Move) sérialisée à tous les participants
   */
  publish<T = unknown>(roomId: string, payload: T): Promise<void>;
  
  /**
   * Écouter les actions/états diffusés dans la room
   */
  subscribe<T = unknown>(roomId: string, onMessage: (payload: T) => void): RTSubscription;
}

/**
 * Implémentation no-op pour le mode offline (développement/tests)
 */
export class NoopTransport implements RTTransport {
  async joinRoom() {
    console.log('[NoopTransport] joinRoom called (no-op)');
  }
  
  async leaveRoom() {
    console.log('[NoopTransport] leaveRoom called (no-op)');
  }
  
  async publish() {
    console.log('[NoopTransport] publish called (no-op)');
  }
  
  subscribe<T = unknown>(_roomId: string, _cb: (p: T) => void): RTSubscription {
    console.log('[NoopTransport] subscribe called (no-op)');
    return { 
      unsubscribe() {
        console.log('[NoopTransport] unsubscribe called (no-op)');
      } 
    };
  }
}

/**
 * Placeholder pour implémentation Supabase Realtime
 * À implémenter avec le client Supabase existant
 */
export class SupabaseTransport implements RTTransport {
  // TODO: Implémenter avec supabase.channel() et presence
  async joinRoom(_roomId: string, _authToken?: string): Promise<void> {
    throw new Error('SupabaseTransport not implemented yet');
  }
  
  async leaveRoom(_roomId: string): Promise<void> {
    throw new Error('SupabaseTransport not implemented yet');
  }
  
  async publish<T = unknown>(_roomId: string, _payload: T): Promise<void> {
    throw new Error('SupabaseTransport not implemented yet');
  }
  
  subscribe<T = unknown>(_roomId: string, _onMessage: (payload: T) => void): RTSubscription {
    throw new Error('SupabaseTransport not implemented yet');
  }
}

/**
 * Placeholder pour implémentation WebSocket custom
 */
export class WebSocketTransport implements RTTransport {
  // TODO: Implémenter avec WebSocket natif
  async joinRoom(_roomId: string, _authToken?: string): Promise<void> {
    throw new Error('WebSocketTransport not implemented yet');
  }
  
  async leaveRoom(_roomId: string): Promise<void> {
    throw new Error('WebSocketTransport not implemented yet');
  }
  
  async publish<T = unknown>(_roomId: string, _payload: T): Promise<void> {
    throw new Error('WebSocketTransport not implemented yet');
  }
  
  subscribe<T = unknown>(_roomId: string, _onMessage: (payload: T) => void): RTSubscription {
    throw new Error('WebSocketTransport not implemented yet');
  }
}
