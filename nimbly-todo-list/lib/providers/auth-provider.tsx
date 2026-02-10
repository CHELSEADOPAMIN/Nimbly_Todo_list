"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, login as loginRequest } from "@/lib/api/auth";
import {
  clearAllTokens,
  getAccessToken,
  setAccessToken,
  setAuthCookie,
  setRefreshToken,
} from "@/lib/token";
import type { AuthContextValue, LoginRequest, User } from "@/lib/types/auth";

const toUser = (source: User): User => ({
  id: source.id,
  username: source.username,
  email: source.email,
  firstName: source.firstName,
  lastName: source.lastName,
  image: source.image,
});

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => null);
  const [isLoading, setIsLoading] = useState<boolean>(() => true);
  const [initialized, setInitialized] = useState<boolean>(() => false);

  const initializeAuth = useCallback(async () => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      clearAllTokens();
      setUser(null);
      setIsLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(toUser(currentUser));
      setAuthCookie();
    } catch {
      clearAllTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);

    try {
      const response = await loginRequest(credentials);
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setAuthCookie();
      setUser(toUser(response));
      setInitialized(true);
    } catch (error) {
      clearAllTokens();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAllTokens();
    setUser(null);
    setInitialized(true);
    setIsLoading(false);
    router.replace("/login");
  }, [router]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      state: {
        user,
        isAuthenticated: user !== null,
        isLoading,
      },
      actions: {
        login,
        logout,
      },
      meta: {
        initialized,
      },
    }),
    [initialized, isLoading, login, logout, user],
  );

  return <AuthContext value={contextValue}>{children}</AuthContext>;
};
