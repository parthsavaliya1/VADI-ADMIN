"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Palette, Save } from "lucide-react";
import API from "@/lib/api";
import {
  DEFAULT_THEME,
  THEME_PREVIEWS,
  applyTheme,
  isThemeKey,
  type ThemeKey,
  type ThemePreview,
} from "@/lib/appTheme";

function ThemeSwatches({ theme }: { theme: ThemePreview }) {
  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.page, borderColor: theme.soft }}
    >
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="text-xs font-semibold" style={{ color: theme.ink }}>
          Farm Fresh
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: theme.badge, color: theme.badgeText }}
        >
          20% OFF
        </span>
      </div>
      <div className="flex gap-2 p-3">
        <div
          className="h-12 flex-1 rounded-md border"
          style={{ backgroundColor: theme.card, borderColor: theme.soft }}
        />
        <div
          className="h-12 w-12 rounded-md"
          style={{ backgroundColor: theme.soft }}
        />
      </div>
      <div className="px-3 pb-3">
        <div
          className="rounded-md py-1.5 text-center text-xs font-semibold text-white"
          style={{ backgroundColor: theme.primary }}
        >
          Add to cart
        </div>
      </div>
    </div>
  );
}

export default function ThemeSettingsPage() {
  const [selected, setSelected] = useState<ThemeKey>(DEFAULT_THEME);
  const [saved, setSaved] = useState<ThemeKey>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/api/admin/app-theme");
        const theme = data?.data?.theme;
        if (isThemeKey(theme)) {
          setSelected(theme);
          setSaved(theme);
        }
      } catch (e) {
        console.error("Fetch app theme:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await API.put("/api/admin/app-theme", { theme: selected });
      if (!data?.success) throw new Error(data?.message || "Failed to save");
      setSaved(selected);
      applyTheme(selected);
      alert(
        "Theme saved. The admin panel and website update now; the mobile app picks it up on next launch.",
      );
    } catch (e: unknown) {
      console.error(e);
      alert(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save theme",
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

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Theme</h1>
        <p className="text-muted-foreground mt-1">
          Pick the colour combination used across the mobile app, this admin
          panel and the website. Layout and content stay the same; only colours change.
        </p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border p-6 space-y-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Palette className="h-5 w-5 text-primary" />
          Colour combinations
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {THEME_PREVIEWS.map((theme) => {
            const active = selected === theme.key;
            return (
              <button
                key={theme.key}
                type="button"
                onClick={() => setSelected(theme.key)}
                aria-pressed={active}
                className={`rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <ThemeSwatches theme={theme} />
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-sm">
                      {theme.name}
                      {saved === theme.key && (
                        <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-foreground">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {theme.description}
                    </div>
                  </div>
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {active && <Check className="h-3 w-3" />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || selected === saved}
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
              Apply theme
            </>
          )}
        </button>
      </div>
    </div>
  );
}
