"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type User = FirebaseUser | { email: string } | null;

interface AuthContextType {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isUsingLocalAuth: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isUsingLocalAuth, setIsUsingLocalAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsUsingLocalAuth(false);
      } else {
        // Check local storage for user
        const localUser = localStorage.getItem('user');
        if (localUser) {
          setUser(JSON.parse(localUser));
          setIsUsingLocalAuth(true);
        } else {
          setUser(null);
        }
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Try Firebase auth first
      await signInWithEmailAndPassword(auth, email, password);
    } catch (firebaseError) {
      console.log("Falling back to local auth...");
      // Fallback to local auth
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error("Invalid credentials");
      }

      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsUsingLocalAuth(true);
    }
  };

  const logout = async () => {
    if (!isUsingLocalAuth) {
      await auth.signOut();
    }
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const value = { user, login, logout, isUsingLocalAuth };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
