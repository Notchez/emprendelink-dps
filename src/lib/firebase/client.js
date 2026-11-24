import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const config = getFirebaseConfig();
  const missingConfig = Object.values(config).some((value) => !value);

  if (missingConfig) {
    throw new Error(
      "Firebase no está configurado. Copia .env.example como .env.local y completa las variables."
    );
  }

  return initializeApp(config);
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}
