"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, LogOut, MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Feedback List", href: "/admin/feedback", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-surface-900/50 backdrop-blur-md">
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-white/10">
        <div className="bg-primary-500/10 p-1.5 rounded-lg border border-primary-500/20">
          <MessageSquarePlus className="w-5 h-5 text-primary-400" />
        </div>
        <span className="font-semibold text-lg tracking-tight text-white">FeedPulse</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-500/10 text-primary-400"
                    : "text-slate-400 hover:bg-surface-800 hover:text-white"
                )}
              >
                <item.icon
                  className={cn("h-5 w-5 shrink-0", isActive ? "text-primary-400" : "text-slate-500 group-hover:text-slate-300")}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex items-center gap-3 px-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center text-xs font-medium text-white">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{user?.email || "Admin"}</span>
              <span className="text-xs text-slate-500 capitalize">{user?.role || "Admin"}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
