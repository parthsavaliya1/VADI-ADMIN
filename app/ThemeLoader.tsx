"use client";

import { useEffect } from "react";
import axios from "axios";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  isThemeKey,
} from "@/lib/appTheme";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://vadi-backend.onrender.com";

/**
 * Applies the colour theme chosen in Admin → Theme.
 * Uses the last known theme immediately, then refreshes it from the backend.
 */
export default function ThemeLoader() {
  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemeKey(cached)) applyTheme(cached);
    } catch {
      // ignore storage errors
    }

    let cancelled = false;
    axios
      .get(`${API_BASE}/app-theme`)
      .then(({ data }) => {
        const theme = data?.data?.theme;
        if (!cancelled && isThemeKey(theme)) applyTheme(theme);
      })
      .catch(() => {
        // Keep whatever theme is already applied.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
