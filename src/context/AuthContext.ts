import { createContext, useContext } from "react";

/** The provider component lives in AuthProvider.tsx (kept separate so Vite Fast Refresh works). */
export interface AuthContextValue {
  isAdmin: boolean;
  /** Returns true when the credentials are correct. */
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
