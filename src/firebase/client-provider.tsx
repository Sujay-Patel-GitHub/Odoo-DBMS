'use client';

import { AuthProvider } from '@/lib/firebase/auth';
import { initializeFirebase, FirebaseProvider } from '.';
import { ReactNode } from 'react';

const firebaseServices = initializeFirebase();

/**
 * Provides the Firebase services to its children on the client.
 *
* @param {object} props - The properties for the component.
 * @param {ReactNode} props.children - The child components.
 * @returns {JSX.Element} A JSX element that provides the Firebase services.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider value={firebaseServices}>
      <AuthProvider>
       {children}
      </AuthProvider>
    </FirebaseProvider>
  );
}
