"use client";

import { CognitoUser } from "amazon-cognito-identity-js";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService } from "./cognito-service";

interface AuthContextType {
  user: CognitoUser | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only check user on protected routes
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      // Don't check auth on public pages
      if (path === "/login" || path === "/signup" || path === "/") {
        setLoading(false);
        return;
      }
    }
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        await authService.getSession();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    authService.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
