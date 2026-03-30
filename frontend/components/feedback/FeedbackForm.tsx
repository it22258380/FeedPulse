"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

export function FeedbackForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Bug",
    submitterName: "",
    submitterEmail: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.length > 120) {
      return toast.error("Title must be 120 characters or less.");
    }
    if (formData.description.length < 20) {
      return toast.error("Description must be at least 20 characters.");
    }

    setLoading(true);
    try {
      await fetchApi("/api/feedback", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success("Feedback submitted successfully!", {
        description: "Thank you taking the time to help us improve.",
      });
      setFormData({
        title: "",
        description: "",
        category: "Bug",
        submitterName: "",
        submitterEmail: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Category</label>
        <Select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="Bug">Bug</option>
          <option value="Feature Request">Feature Request</option>
          <option value="Improvement">Improvement</option>
          <option value="Other">Other</option>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Title</label>
        <Input
          name="title"
          placeholder="Concise summary (max 120 chars)"
          value={formData.title}
          onChange={handleChange}
          maxLength={120}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Description</label>
        <Textarea
          name="description"
          placeholder="Please provide details... (min 20 chars)"
          value={formData.description}
          onChange={handleChange}
          minLength={20}
          required
          rows={5}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Your Name</label>
          <Input
            name="submitterName"
            placeholder="Jane Doe"
            value={formData.submitterName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email</label>
          <Input
            name="submitterEmail"
            type="email"
            placeholder="jane@example.com"
            value={formData.submitterEmail}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full h-12 text-md gap-2 group" disabled={loading}>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          )}
          {loading ? "Submitting..." : "Submit Feedback"}
        </Button>
      </div>
    </form>
  );
}
