import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore }from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase/config';

export * from './client-provider';
export * from './provider';

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const firebaseApp = app;

/**
 * An object that contains the initialized Firebase service instances.
 */
export type FirebaseServices = {
  app: typeof firebaseApp;
  auth: Auth;
  firestore: Firestore;
};

/**
 * Initializes and returns an object containing the Firebase services.
 *
 * @returns {FirebaseServices} An object containing the initialized Firebase services.
 */
export function initializeFirebase(): FirebaseServices {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return { app: firebaseApp, auth, firestore };
}
