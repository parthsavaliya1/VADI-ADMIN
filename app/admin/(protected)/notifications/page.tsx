"use client";

import { FormEvent, useEffect, useState } from "react";
import { BellRing, Loader2, Send, Upload } from "lucide-react";
import API from "@/lib/api";
import { uploadImageToSupabase } from "@/lib/upload";

type BroadcastStats = {
  totalTokens: number;
  successCount: number;
  failureCount: number;
  invalidTokensRemoved?: number;
};

type NotificationItem = {
  _id: string;
  title: string;
  body: string;
  imageUrl?: string;
  createdAt: string;
  stats?: BroadcastStats;
};

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState<BroadcastStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const fetchNotifications = async () => {
    setLoadingList(true);
    try {
      const { data } = await API.get("/api/admin/notifications");
      setNotifications(data.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const uploadedUrl = await uploadImageToSupabase(file, "notification");
      if (uploadedUrl) setImageUrl(uploadedUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMessage("");
    setStats(null);

    try {
      const { data } = await API.post("/api/admin/notifications/broadcast", {
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      setMessage(data.message || "Notification sent");
      setStats(data.stats || null);
      setTitle("");
      setBody("");
      setImageUrl("");
      fetchNotifications();
    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to send notification",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <BellRing className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send push notifications to all app users
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-xl shadow-sm border p-4 md:p-6 space-y-5"
      >
        <div>
          <label className="text-sm font-medium block mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={120}
            placeholder="Big sale starts now"
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={500}
            rows={4}
            placeholder="Get up to 40% off on fresh vegetables today."
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">
            Image URL (optional)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/offer-banner.jpg"
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Use a public image URL. This will be sent as notification image.
          </p>
          <label className="mt-3 inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer text-sm hover:bg-muted/40">
            <Upload className="h-4 w-4" />
            Upload image to Bunny
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
          {uploading && (
            <p className="text-xs text-blue-600 mt-2">Uploading image...</p>
          )}
        </div>

        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send to All Users
            </>
          )}
        </button>
      </form>

      {message && (
        <div className="bg-card rounded-xl shadow-sm border p-4">
          <p className="text-sm font-medium">{message}</p>
          {stats && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Total Tokens</p>
                <p className="font-semibold">{stats.totalTokens}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Sent</p>
                <p className="font-semibold text-green-600">
                  {stats.successCount}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Failed</p>
                <p className="font-semibold text-red-600">{stats.failureCount}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Invalid Removed</p>
                <p className="font-semibold">{stats.invalidTokensRemoved || 0}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-card rounded-xl shadow-sm border p-4 md:p-6">
        <h2 className="text-lg font-semibold">Notification List</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Stored notifications from notification table
        </p>

        {loadingList ? (
          <div className="py-8 text-sm text-muted-foreground">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-sm text-muted-foreground">
            No notifications found
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {notifications.map((item) => (
              <div key={item._id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-20 rounded object-cover border"
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
