// services/realtime.firebase.ts
import { RTTransport, RTSubscription } from './realtime';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  type Firestore,
  doc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp, 
  collection, 
  addDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

/**
 * Transport temps réel Firebase (facile et gratuit)
 * Utilise Firestore pour la synchronisation en temps réel
 */
export class FirebaseTransport implements RTTransport {
  private db: Firestore;
  private app: FirebaseApp;

  constructor(firebaseConfig: object) {
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
  }

  /**
   * Rejoindre une room (crée ou met à jour le document room)
   */
  async joinRoom(roomId: string, _authToken?: string): Promise<void> {
    console.log('[FirebaseTransport] Joining room:', roomId);
    const roomRef = doc(this.db, 'rooms', roomId);
    await setDoc(
      roomRef, 
      { roomId, updatedAt: serverTimestamp() }, 
      { merge: true }
    );
  }

  /**
   * Quitter une room (optionnel : marquer lastSeen)
   */
  async leaveRoom(roomId: string): Promise<void> {
    console.log('[FirebaseTransport] Leaving room:', roomId);
    // No-op pour l'instant - pourrait marquer un lastSeen timestamp
  }

  /**
   * Publier un message/event dans la room
   */
  async publish<T = unknown>(roomId: string, payload: T): Promise<void> {
    console.log('[FirebaseTransport] Publishing to room:', roomId, payload);
    const eventsCol = collection(this.db, 'rooms', roomId, 'events');
    await addDoc(eventsCol, { 
      payload, 
      ts: serverTimestamp() 
    });
  }

  /**
   * S'abonner aux events d'une room
   */
  subscribe<T = unknown>(roomId: string, onMessage: (payload: T) => void): RTSubscription {
    console.log('[FirebaseTransport] Subscribing to room:', roomId);
    
    const eventsCol = collection(this.db, 'rooms', roomId, 'events');
    
    // Query pour récupérer les events triés par timestamp
    const q = query(eventsCol, orderBy('ts', 'asc'));
    
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        // Ne traiter que les nouveaux events
        if (change.type === 'added') {
          const data = change.doc.data();
          console.log('[FirebaseTransport] Event received:', data);
          onMessage(data.payload as T);
        }
      });
    }, (error) => {
      console.error('[FirebaseTransport] Subscription error:', error);
    });

    return { 
      unsubscribe: () => {
        console.log('[FirebaseTransport] Unsubscribing from room:', roomId);
        unsub();
      }
    };
  }
}
