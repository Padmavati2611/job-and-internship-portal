import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe } from "../api/auth";
import { TOKEN_KEY } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [initialized, setInitialized] = useState(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setProfile(null);
    setCompany(null);
  }, []);

  const setSession = useCallback((sessionToken, sessionUser) => {
    if (!sessionToken) return;
    localStorage.setItem(TOKEN_KEY, sessionToken);
    setToken(sessionToken);
    setUser(sessionUser || null);
    setProfile(sessionUser?.profile || null);
    setCompany(sessionUser?.company || null);
    setInitialized(true);
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await getMe();
      setUser(data.user);
      setProfile(data.user?.profile || null);
      setCompany(data.user?.company || null);
      return data.user;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  const updateProfileState = useCallback((nextProfile) => {
    setProfile(nextProfile);
    setUser((current) =>
      current ? { ...current, profile: nextProfile } : current
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        setInitialized(true);
        return;
      }
      try {
        const data = await getMe();
        if (cancelled) return;
        setUser(data.user);
        setProfile(data.user?.profile || null);
        setCompany(data.user?.company || null);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    bootstrap();

    const handleUnauthorized = () => {
      clearSession();
      setLoading(false);
      setInitialized(true);
    };

    window.addEventListener("careerconnect:unauthorized", handleUnauthorized);
    return () => {
      cancelled = true;
      window.removeEventListener("careerconnect:unauthorized", handleUnauthorized);
    };
  }, [token, clearSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      profile,
      company,
      loading,
      initialized,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isStudent: user?.role === "student",
      isRecruiter: user?.role === "recruiter",
      setSession,
      refreshUser,
      logout: clearSession,
      setProfile,
      setCompany,
      updateProfileState,
    }),
    [
      token,
      user,
      profile,
      company,
      loading,
      initialized,
      setSession,
      refreshUser,
      clearSession,
      updateProfileState,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
