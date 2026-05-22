"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Timer } from "lucide-react";
import API from "@/lib/api";

export default function DealSettingsPage() {
  const [dealEndsAt, setDealEndsAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDealSettings = async () => {
      try {
        const { data } = await API.get("/deal-settings");
        const settings = data?.data;

        if (settings?.dealEndsAt) {
          const parsed = new Date(settings.dealEndsAt);
          if (!Number.isNaN(parsed.getTime())) {
            setDealEndsAt(parsed.toISOString().slice(0, 16));
          }
        }

        if (typeof settings?.isActive === "boolean") {
          setIsActive(settings.isActive);
        }
      } catch (error) {
        console.error("Fetch deal settings error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDealSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      let payloadDealEndsAt: string | null = null;
      if (dealEndsAt.trim()) {
        const parsed = new Date(dealEndsAt.trim());
        if (Number.isNaN(parsed.getTime())) {
          alert("Invalid date format. Use YYYY-MM-DDTHH:mm");
          return;
        }
        payloadDealEndsAt = parsed.toISOString();
      }

      const { data } = await API.put("/deal-settings", {
        dealEndsAt: payloadDealEndsAt,
        isActive,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save");
      }

      alert("Deal settings saved");
    } catch (error: any) {
      console.error("Save deal settings error:", error);
      alert(error?.response?.data?.message || "Failed to save deal settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deal Settings</h1>
        <p className="text-muted-foreground mt-1">
          Mega sale countdown (like Big Billion Days): when the timer is active,
          every product page shows this same &quot;Sale ends in&quot; time until
          the sale ends. You can still set a different end time on individual
          products — that overrides the mega sale timer for that product only.
        </p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border p-6 space-y-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Timer className="h-5 w-5 text-primary" />
          Mega sale timer (all products)
        </div>

        <label className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <div>
            <div className="font-medium text-sm">Timer Active</div>
            <div className="text-xs text-muted-foreground">
              When on, the same sale countdown appears on every product in the
              app (unless that product has its own &quot;Offer ends at&quot; below).
            </div>
          </div>
        </label>

        <div>
          <label className="block text-sm font-medium mb-2">Deal Ends At</label>
          <input
            type="datetime-local"
            value={dealEndsAt}
            onChange={(e) => setDealEndsAt(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Leave empty to clear timer.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 font-medium flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
