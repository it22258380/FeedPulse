"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2, MessageSquareWarning } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface FeedbackItem {
  _id: string;
  title: string;
  category: string;
  status: string;
  submitterName: string;
  createdAt: string;
}

interface PaginationResponse {
  data: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function FeedbackList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state sync
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialStatus = searchParams.get("status") || "All";
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [data, setData] = useState<PaginationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [page, setPage] = useState(initialPage);
  const [status, setStatus] = useState(initialStatus);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("page", page.toString());
      query.set("limit", "10");
      if (status !== "All") query.set("status", status);
      if (category !== "All") query.set("category", category);
      if (debouncedSearch) query.set("search", debouncedSearch);

      // update URL without refresh
      router.replace(`/admin/feedback?${query.toString()}`);

      const result = await fetchApi<PaginationResponse>(`/api/feedback?${query.toString()}`, {
        requireAuth: true,
      });
      setData(result);
    } catch (err) {
      console.error("Failed to fetch feedback", err);
    } finally {
      setLoading(false);
    }
  }, [page, status, category, debouncedSearch, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleFilterChange = (key: "status" | "category", value: string) => {
    if (key === "status") setStatus(value);
    if (key === "category") setCategory(value);
    setPage(1); // Reset page on filter change
  };

  const statusColorMap: Record<string, "default" | "warning" | "success" | "secondary"> = {
    New: "secondary",
    "In Review": "warning",
    Resolved: "success",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Feedback Hub</h1>
          <p className="text-slate-400 mt-2">Manage, prioritize, and resolve user submissions.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="bg-surface-900 border-white/5">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-800/50"
            />
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="w-40">
              <Select value={status} onChange={(e) => handleFilterChange("status", e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
              </Select>
            </div>
            <div className="w-48">
              <Select value={category} onChange={(e) => handleFilterChange("category", e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Bug">Bug</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Improvement">Improvement</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {loading && !data ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-20 border border-white/5 rounded-xl bg-surface-900/50">
            <MessageSquareWarning className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No feedback found</h3>
            <p className="text-slate-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          data?.data.map((item) => (
            <Link key={item._id} href={`/admin/feedback/${item._id}`}>
              <Card className="group hover:bg-surface-800/80 hover:border-primary-500/30 transition-all cursor-pointer bg-surface-900/30">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex gap-2 items-center mb-2">
                      <Badge variant={statusColorMap[item.status] || "default"}>{item.status}</Badge>
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="text-xs text-slate-500">
                        • {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400">from {item.submitterName}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-primary-500 transition-colors hidden md:block" />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="text-sm text-slate-400">
            Showing <span className="text-white font-medium">{(page - 1) * 10 + 1}</span> to{" "}
            <span className="text-white font-medium">{Math.min(page * 10, data.total)}</span> of{" "}
            <span className="text-white font-medium">{data.total}</span> results
          </div>
          <div className="flex gap-2">

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
