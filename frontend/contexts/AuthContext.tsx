"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  getValidToken: () => Promise<string | null>;
}

// Helper function to decode JWT and get expiration time
function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch (e) {
    return null;
  }
}

// Helper function to check if token is expired or will expire soon (within 5 minutes)
function isTokenExpiringSoon(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return expiration - now < fiveMinutes;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Stop token refresh interval
  const stopTokenRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) {
      // Already refreshing, wait for it to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isRefreshingRef.current) {
            clearInterval(checkInterval);
            // Check if we have a valid token now
            const token = localStorage.getItem("auth_token");
            resolve(!!token);
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, 5000);
      });
    }

    const storedRefreshToken = localStorage.getItem("refresh_token");
    if (!storedRefreshToken) {
      return false;
    }

    isRefreshingRef.current = true;

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      
      // Update tokens in localStorage and state
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setToken(data.access_token);
      
      isRefreshingRef.current = false;
      return true;
    } catch (error) {
      // Refresh failed, clear auth state and logout
      isRefreshingRef.current = false;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      stopTokenRefresh();
      return false;
    }
  }, [stopTokenRefresh]);

  // Get valid token, refreshing if necessary
  const getValidToken = useCallback(async (): Promise<string | null> => {
    const storedToken = localStorage.getItem("auth_token");
    if (!storedToken) {
      return null;
    }

    // Check if token is expiring soon or expired
    if (isTokenExpiringSoon(storedToken)) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return localStorage.getItem("auth_token");
      }
      return null;
    }

    return storedToken;
  }, [refreshToken]);

  // Start automatic token refresh interval
  const startTokenRefresh = useCallback(() => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Check token every 4 minutes (tokens expire in 1 hour, refresh 5 min before)
    refreshIntervalRef.current = setInterval(async () => {
      const storedToken = localStorage.getItem("auth_token");
      if (storedToken && isTokenExpiringSoon(storedToken)) {
        await refreshToken();
      }
    }, 4 * 60 * 1000); // Check every 4 minutes
  }, [refreshToken]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedRefreshToken = localStorage.getItem("refresh_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Start token refresh interval if we have a refresh token
  useEffect(() => {
    const storedRefreshToken = localStorage.getItem("refresh_token");
    if (storedRefreshToken && token) {
      startTokenRefresh();
    }
    return () => {
      stopTokenRefresh();
    };
  }, [token, startTokenRefresh, stopTokenRefresh]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const validToken = await getValidToken();
    if (!validToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });

      if (!response.ok) {
        // Try refreshing token once more
        const refreshed = await refreshToken();
        if (!refreshed) {
          throw new Error("Invalid token");
        }
        // Retry with new token
        const retryResponse = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        if (!retryResponse.ok) {
          throw new Error("Invalid token");
        }
        const userData = await retryResponse.json();
        setUser(userData);
        setToken(localStorage.getItem("auth_token"));
        return true;
      }

      const userData = await response.json();
      setUser(userData);
      setToken(validToken);
      return true;
    } catch (error) {
      // Token is invalid, clear auth state
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      stopTokenRefresh();
      return false;
    }
  }, [getValidToken, refreshToken, stopTokenRefresh]);

  const login = (newToken: string, newRefreshToken: string, newUser: User) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("refresh_token", newRefreshToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    // Start automatic token refresh
    startTokenRefresh();
  };

  const logout = () => {
    stopTokenRefresh();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        checkAuth,
        refreshToken,
        getValidToken,
      }}
    >
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
