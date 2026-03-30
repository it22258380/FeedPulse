"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchApi<{ token: string; user: any }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      toast.success("Login successful.");
      login(data.token, data.user);
      // Navigation handled inside useAuth.login
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="absolute top-1/4 left-1/4 w-[30%] h-[30%] bg-primary-600/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="rounded-2xl border border-white/5 bg-surface-800/60 backdrop-blur-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-2 mb-8 text-center">
            <div className="bg-primary-500/10 p-3 rounded-full border border-primary-500/20 mb-2 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Lock className="w-6 h-6 text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Admin Login</h1>
            <p className="text-sm text-slate-400">Enter your credentials to manage feedback</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="h-12 bg-surface-900/50 focus-visible:bg-surface-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 bg-surface-900/50 focus-visible:bg-surface-900"
              />
            </div>

            <Button type="submit" className="w-full h-12 mt-4" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
