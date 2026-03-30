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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchApi<{ message?: string; _id: string; email: string; role: string }>(
          "/api/auth/profile",
          { requireAuth: true }
        );
        setUser({ id: data._id, email: data.email, role: data.role });
      } catch (error) {
        localStorage.removeItem("auth_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("auth_token", token);
    setUser(userData);
    router.push("/admin/feedback");
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    router.push("/login");
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
}
