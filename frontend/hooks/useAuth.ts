"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("auth_token");
      setHasToken(!!token);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchApi<{ message?: string; data: { _id: string; email: string; role: string } }>(
          "/api/auth/profile",
          { requireAuth: true }
        );
        setUser({ id: data.data._id, email: data.data.email, role: data.data.role });
        setUnauthorized(false);
      } catch (error) {
        const message = (error as Error).message || "";
        // Only clear token on genuine auth failures; keep it for transient errors
        if (
          message.toLowerCase().includes("not authenticated") ||
          message.toLowerCase().includes("authentication required") ||
          message.includes("401")
        ) {
          localStorage.removeItem("auth_token");
          setHasToken(false);
          setUser(null);
          setUnauthorized(true);
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

const login = (token: string, userData: { id: string; email: string; role: string }) => {
  localStorage.setItem("auth_token", token);
  setHasToken(true);
  setUser({ id: userData.id, email: userData.email, role: userData.role });
  router.push("/admin");
};

  const logout = () => {
    localStorage.removeItem("auth_token");
    setHasToken(false);
    setUser(null);
    setUnauthorized(false);
    router.push("/login");
  };

  return { user, loading, login, logout, hasToken, unauthorized, isAuthenticated: !!user };
}
