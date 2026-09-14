"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface Membership {
  id: string;
  organization_id: string;
  organization_name: string;
  organization_type: string;
  role: string;
  is_primary: boolean;
}

export interface UserProfile {
  id: string;
  display_name: string;
  email: string | null;
  platform_role: string;
  is_active: boolean;
  created_at: string;
  memberships: Membership[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (display_name: string, email: string, password: string) => Promise<void>;
  sendMobileOtp: (phone: string) => Promise<{ status: string; message: string; otp_code?: string }>;
  verifyMobileOtp: (phone: string, code: string, display_name?: string, platform_role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }
    await refreshUser();
  };

  const register = async (display_name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ display_name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }
    await refreshUser();
  };

  const sendMobileOtp = async (phone: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/mobile-otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to send OTP");
    }
    return await res.json();
  };

  const verifyMobileOtp = async (phone: string, code: string, display_name?: string, platform_role?: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/mobile-otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone, code, display_name, platform_role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "OTP verification failed");
    }
    await refreshUser();
  };

  const logout = async () => {
    try {
      let csrfToken = "";
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|; )nirnay_csrf=([^;]*)/);
        if (match) csrfToken = decodeURIComponent(match[1]);
      }
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // Ignore network/API errors on logout
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        try {
          localStorage.clear();
          sessionStorage.clear();
          document.cookie = "nirnay_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "nirnay_csrf=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } catch {
          // ignore storage clearing errors
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, sendMobileOtp, verifyMobileOtp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
