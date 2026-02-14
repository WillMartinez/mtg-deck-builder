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
  userEmail: string | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to extract email from user
function getUserEmail(user: CognitoUser | null): string | null {
  if (!user) return null;

  try {
    // Try to get email from idToken in storage
    const storage = (user as any).storage;
    const keyPrefix = (user as any).keyPrefix;
    const username = user.getUsername();

    if (storage && keyPrefix) {
      const idTokenKey = `${keyPrefix}.${username}.idToken`;
      const idToken = storage[idTokenKey];

      if (idToken) {
        // Decode JWT payload (format: header.payload.signature)
        const payload = JSON.parse(atob(idToken.split(".")[1]));
        return payload.email || null;
      }
    }
  } catch (error) {
    console.error("Error extracting email from user:", error);
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        await authService.getSession();
        setUser(currentUser);
        setUserEmail(getUserEmail(currentUser));
      } else {
        setUser(null);
        setUserEmail(null);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
      setUserEmail(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    authService.signOut();
    setUser(null);
    setUserEmail(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, userEmail, loading, signOut }}>
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
