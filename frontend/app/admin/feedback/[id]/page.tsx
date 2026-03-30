"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Zap, Loader2, User, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FeedbackDetail {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  submitterName: string;
  submitterEmail: string;
  createdAt: string;
  aiSentiment?: string;
  aiPriority?: number;
}

export default function FeedbackDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchApi<FeedbackDetail>(`/api/feedback/${id}`, { requireAuth: true });
        setData(result);
      } catch (err: any) {
        toast.error("Failed to load feedback details");
        router.push("/admin/feedback");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  const updateStatus = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      await fetchApi(`/api/feedback/${id}`, {
        method: "PATCH",
        requireAuth: true,
        body: JSON.stringify({ status: newStatus }),
      });
      setData((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success("Status updated to " + newStatus);
    } catch (err: any) {
      toast.error("Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const reanalyze = async () => {
    setReanalyzing(true);
    try {
      await fetchApi(`/api/feedback/${id}/reanalyze`, {
        method: "POST",
        requireAuth: true,
      });
      toast.success("AI Reanalysis triggered successfully");
      // Refetch data to see updated sentiment/priority
      const result = await fetchApi<FeedbackDetail>(`/api/feedback/${id}`, { requireAuth: true });
      setData(result);
    } catch (err: any) {
      toast.error("Failed to reanalyze feedback");
    } finally {
      setReanalyzing(false);
    }
  };

  const deleteFeedback = async () => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    setDeleting(true);
    try {
      await fetchApi(`/api/feedback/${id}`, { method: "DELETE", requireAuth: true });
      toast.success("Feedback deleted");
      router.push("/admin/feedback");
    } catch (err: any) {
      toast.error("Failed to delete feedback");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/feedback"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to List
        </Link>
        <div className="flex items-center gap-3">
          <Select
            value={data.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={statusUpdating}
            className="w-40"
          >
            <option value="New">New</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </Select>
          <Button variant="danger" size="sm" onClick={deleteFeedback} disabled={deleting}>
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-surface-800/50">
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline">{data.category}</Badge>
                <Badge variant="secondary">{formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}</Badge>
              </div>
              <CardTitle className="text-2xl">{data.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none text-slate-300">
                <p className="whitespace-pre-wrap">{data.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-surface-800/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Submitter Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-surface-900 p-2 rounded-lg border border-white/5">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm font-medium text-white">{data.submitterName}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-surface-900 p-2 rounded-lg border border-white/5">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm font-medium text-white break-all">{data.submitterEmail}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-500/5 border-primary-500/20 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-500/10 blur-[40px] rounded-full pointer-events-none" />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  AI Analysis
                </CardTitle>
                <Button size="icon" variant="ghost" onClick={reanalyze} disabled={reanalyzing} title="Reanalyze">
                  <Zap className={cn("w-4 h-4 text-yellow-400", reanalyzing && "animate-pulse")} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Sentiment</div>
                <div className="text-sm text-white capitalize">{data.aiSentiment || "Pending"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Priority Score</div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold text-white">{data.aiPriority !== undefined ? data.aiPriority : "-"}</div>
                  <span className="text-xs text-slate-500">/ 10</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
