"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Loader2, Save } from "lucide-react";
import API from "@/lib/api";

type HomeSectionForm = {
  showHeroBanner: boolean;
  showFeatureBadgesRow: boolean;
  showBestDealsSection: boolean;
  showShopByCategorySection: boolean;
  showTrendingSection: boolean;
  showFeaturedSection: boolean;
};

export default function HomeSectionSettingsPage() {
  const [form, setForm] = useState<HomeSectionForm>({
    showHeroBanner: true,
    showFeatureBadgesRow: true,
    showBestDealsSection: true,
    showShopByCategorySection: true,
    showTrendingSection: true,
    showFeaturedSection: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/home-section-settings");
        const s = data?.data;
        if (s) {
          setForm({
            showHeroBanner: s.showHeroBanner !== false,
            showFeatureBadgesRow: s.showFeatureBadgesRow !== false,
            showBestDealsSection: s.showBestDealsSection !== false,
            showShopByCategorySection: s.showShopByCategorySection !== false,
            showTrendingSection: s.showTrendingSection !== false,
            showFeaturedSection: s.showFeaturedSection !== false,
          });
        }
      } catch (e) {
        console.error("Fetch home section settings:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggle = (key: keyof HomeSectionForm) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await API.put("/home-section-settings", form);
      if (!data?.success) throw new Error(data?.message || "Failed to save");
      alert("Home layout saved. The mobile app will reflect this after refresh.");
    } catch (e: unknown) {
      console.error(e);
      alert(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save home section settings",
      );
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

  const rows: { key: keyof HomeSectionForm; title: string; hint: string }[] = [
    {
      key: "showHeroBanner",
      title: "Hero banner carousel",
      hint: "Top promotional image slides on the home screen.",
    },
    {
      key: "showFeatureBadgesRow",
      title: "Trust badges row",
      hint: "The row with icons such as “100% Natural”, “Fast Delivery”, etc.",
    },
    {
      key: "showBestDealsSection",
      title: "Today’s deals",
      hint: "Horizontal “Best deals” product strip.",
    },
    {
      key: "showShopByCategorySection",
      title: "Shop by category",
      hint: "Category chips customers tap to filter products.",
    },
    {
      key: "showTrendingSection",
      title: "Trending now",
      hint: "Trending products section (still uses products marked trending when visible).",
    },
    {
      key: "showFeaturedSection",
      title: "Featured products",
      hint: "Featured products section (still uses products marked featured when visible).",
    },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Home screen sections</h1>
        <p className="text-muted-foreground mt-1">
          Turn entire home blocks on or off without changing products. Customers
          who already opened the app should pull to refresh on home to see updates.
        </p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <LayoutGrid className="h-5 w-5 text-primary" />
          Visible sections
        </div>

        <div className="space-y-2">
          {rows.map((row) => (
            <label
              key={row.key}
              className="flex items-start gap-3 p-4 bg-muted/40 rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form[row.key]}
                onChange={() => toggle(row.key)}
                className="w-4 h-4 rounded mt-0.5"
              />
              <div>
                <div className="font-medium text-sm">{row.title}</div>
                <div className="text-xs text-muted-foreground">{row.hint}</div>
              </div>
            </label>
          ))}
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
              Save layout
            </>
          )}
        </button>
      </div>
    </div>
  );
}
