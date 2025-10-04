'use client';
import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { FirebaseServices }from './index';

/**
 * The React Context for the Firebase services.
 */
export const FirebaseContext = createContext<FirebaseServices | undefined>(
  undefined
);

/**
 * A React component that provides the Firebase services to its children.
 *
 * @param {object} props - The properties for the component.
 * @param {FirebaseServices} props.value - The Firebase services to provide.
 * @param {ReactNode} props.children - The child components.
 * @returns {JSX.Element} A JSX element that provides the Firebase services.
 */
export function FirebaseProvider({
  value,
  children,
}: {
  value: FirebaseServices;
  children: ReactNode;
}) {
  const memoizedValue = useMemo(() => value, [value]);
  return (
    <FirebaseContext.Provider value={memoizedValue}>
      {children}
    </FirebaseContext.Provider>
  );
}

/**
 * A hook that returns the Firebase services.
 * @returns {FirebaseServices} The Firebase services.
 */
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
