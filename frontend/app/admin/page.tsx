"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Activity, BarChart3, Clock, CheckCircle2, AlertCircle, Bot } from "lucide-react";

interface Stats {
  total: number;
  new: number;
  inReview: number;
  resolved: number;
  avgPriority?: number;
}

interface SummaryData {
  summary: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, summaryData] = await Promise.all([
          fetchApi<Stats>("/api/feedback/stats", { requireAuth: true }).catch(() => null),
          fetchApi<SummaryData>("/api/feedback/summary", { requireAuth: true }).catch(() => null),
        ]);
        if (statsData) setStats(statsData);
        if (summaryData?.summary) setSummary(summaryData.summary);
      } catch (err) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-8 w-1/4 bg-surface-800 rounded"></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-surface-800 rounded-xl"></div>)}
      </div>
      <div className="h-48 bg-surface-800 rounded-xl"></div>
    </div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2">Your product feedback at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-primary-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <Activity className="h-4 w-4 text-primary-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
            <p className="text-xs text-slate-500 mt-1">All time records</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.new || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting triage</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.inReview || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Currently being worked on</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.resolved || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface-800/30 border-primary-500/20 shadow-[0_4px_30px_rgba(139,92,246,0.05)] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[300px] h-[300px] bg-primary-500/10 blur-[80px] rounded-full pointer-events-none" />
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary-500/20 p-2 rounded-lg border border-primary-500/30">
              <Bot className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <CardTitle>AI Weekly Summary</CardTitle>
              <CardDescription>Generated automatically from the last 7 days of feedback</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="prose prose-invert prose-p:leading-relaxed max-w-none">
              <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{summary}</p>
            </div>
          ) : (
            <div className="text-slate-500 text-sm italic">
              No summary generated yet. This requires enough feedback volume in the past week.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
