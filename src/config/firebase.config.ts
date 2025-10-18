/**
 * Configuration Firebase
 * 
 * IMPORTANT: Les clés API Firebase sont publiques et peuvent être exposées côté client.
 * La sécurité est assurée par les règles Firestore côté serveur.
 * 
 * Pour obtenir votre configuration Firebase:
 * 1. Allez sur https://console.firebase.google.com/
 * 2. Créez un projet (ou utilisez un existant)
 * 3. Allez dans Paramètres du projet > Général
 * 4. Dans "Vos applications", ajoutez une application Web
 * 5. Copiez la configuration firebaseConfig
 */

export const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

/**
 * Vérifie si Firebase est correctement configuré
 */
export function isFirebaseConfigured(): boolean {
  return firebaseConfig.apiKey !== "VOTRE_API_KEY" && 
         firebaseConfig.projectId !== "VOTRE_PROJECT_ID";
}
