import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * UI-only admin gate. The credentials live in the bundle, so this hides the
 * admin screens from students but is not real security — replace `login`
 * with an API call once a backend exists.
 */
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin@123";
const STORAGE_KEY = "library.admin";

interface AuthContextValue {
  isAdmin: boolean;
  /** Returns true when the credentials are correct. */
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readSession = (): boolean => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const writeSession = (signedIn: boolean) => {
  try {
    if (signedIn) sessionStorage.setItem(STORAGE_KEY, "1");
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable: the session just won't survive a refresh */
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(readSession);

  const login = useCallback((email: string, password: string) => {
    const ok = email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    if (ok) {
      writeSession(true);
      setIsAdmin(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    writeSession(false);
    setIsAdmin(false);
  }, []);

  const value = useMemo(() => ({ isAdmin, login, logout }), [isAdmin, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
