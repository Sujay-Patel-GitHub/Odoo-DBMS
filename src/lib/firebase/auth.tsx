"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { Loader } from "@/components/ui/loader";
import { useFirebase } from "@/firebase";

interface UserProfile {
  name: string;
  country: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) {
      // Firebase services might not be available yet on initial render.
      // The useFirebase hook will trigger a re-render once they are.
      return;
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(firestore, "users", user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        }, () => {
           setUserProfile(null);
           setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
