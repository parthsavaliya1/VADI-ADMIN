"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Season = "winter" | "summer" | "monsoon";

type Piece = {
  id: number;
  x: number;
  delay: number;
  dur: number;
  drift: number;
  op: number;
  size: number;
};

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function piecesFor(season: Season, preview: boolean): Piece[] {
  const next = rand(season === "winter" ? 11 : season === "monsoon" ? 29 : 47);
  const count = preview
    ? season === "monsoon"
      ? 7
      : season === "winter"
        ? 6
        : 0
    : season === "monsoon"
      ? 14
      : season === "winter"
        ? 34
        : 10;
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: next() * 100,
    delay: next() * (season === "monsoon" ? 1.6 : 10),
    dur:
      season === "monsoon"
        ? 0.75 + next() * 0.7
        : season === "winter"
          ? 8 + next() * 8
          : 10 + next() * 8,
    drift: -28 + next() * 56,
    op: 0.55 + next() * 0.4,
    size: season === "monsoon" ? 5 + next() * 3 : 12 + next() * 12,
  }));
}

const WEATHER_CSS = `
@keyframes vadi-snow {
  0% { transform: translate3d(0, -8vh, 0) rotate(0deg); }
  50% { transform: translate3d(var(--drift), 50vh, 0) rotate(180deg); }
  100% { transform: translate3d(0, 108vh, 0) rotate(360deg); }
}
@keyframes vadi-snow-card {
  0% { transform: translate3d(0, -16px, 0) rotate(0deg); }
  100% { transform: translate3d(var(--drift), 160px, 0) rotate(300deg); }
}
@keyframes vadi-rain {
  0% { transform: translate3d(14px, -12vh, 0); }
  100% { transform: translate3d(-42px, 112vh, 0); }
}
@keyframes vadi-rain-card {
  0% { transform: translate3d(8px, -16px, 0); }
  100% { transform: translate3d(-14px, 160px, 0); }
}
@keyframes vadi-sun {
  0%, 100% { opacity: 0.75; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}
`;

function flakeStyle(piece: Piece, preview: boolean, kind: "flake" | "drop"): CSSProperties {
  const name =
    kind === "flake" ? (preview ? "vadi-snow-card" : "vadi-snow") : preview ? "vadi-rain-card" : "vadi-rain";
  return {
    position: "absolute",
    top: -28,
    left: `${piece.x}%`,
    pointerEvents: "none",
    animation: `${name} ${piece.dur}s linear ${piece.delay}s infinite`,
    ["--drift" as string]: `${piece.drift}px`,
    ...(kind === "flake"
      ? {
          color: "#ffffff",
          opacity: piece.op,
          filter: "drop-shadow(0 0 1px rgba(40, 80, 120, 0.65))",
        }
      : null),
  };
}

function Snowflake({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M12 1.5v21M12 4.2 9.6 2.2M12 4.2l2.4-2M12 19.8 9.6 21.8M12 19.8l2.4 2" />
        <path d="M3.2 6.8 20.8 17.2M5.2 6.2l.2 2.6M5.2 6.2 7.6 5.4M18.8 17.8l-.2-2.6M18.8 17.8l-2.4.8" />
        <path d="M20.8 6.8 3.2 17.2M18.8 6.2l-.2 2.6M18.8 6.2 16.4 5.4M5.2 17.8l.2-2.6M5.2 17.8l2.4.8" />
      </g>
    </svg>
  );
}

function WeatherBits({ season, preview }: { season: Season; preview?: boolean }) {
  const pieces = useMemo(() => piecesFor(season, Boolean(preview)), [season, preview]);

  if (season === "summer") {
    return (
      <span
        style={{
          position: "absolute",
          top: preview ? -8 : -48,
          right: preview ? -6 : -36,
          width: preview ? 56 : 180,
          height: preview ? 56 : 180,
          borderRadius: 999,
          background:
            "radial-gradient(circle, rgba(255, 196, 64, 0.7), rgba(255, 196, 64, 0) 68%)",
          animation: "vadi-sun 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
    );
  }

  if (season === "winter") {
    return (
      <>
        {pieces.map((piece) => (
          <span key={piece.id} style={flakeStyle(piece, Boolean(preview), "flake")}>
            <Snowflake size={piece.size} />
          </span>
        ))}
      </>
    );
  }

  return (
    <>
      {pieces.map((piece) => (
        <span key={piece.id} style={flakeStyle(piece, Boolean(preview), "drop")}>
          <span
            style={{
              display: "block",
              width: Math.max(6, piece.size * 0.72),
              height: Math.max(6, piece.size * 0.72),
              background: "linear-gradient(135deg, #ffffff 0%, #7ec8ee 45%, #2b86be 100%)",
              borderRadius: "0 70% 70% 70%",
              transform: "rotate(45deg)",
              boxShadow: "inset -1px -1px 0 rgba(255,255,255,0.75)",
            }}
          />
        </span>
      ))}
    </>
  );
}

export function ThemePreviewWeather({ theme }: { theme: Season }) {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}
    >
      <WeatherBits season={theme} preview />
    </div>
  );
}

/** Full-page snow, raindrops or sun for the active admin theme. */
export default function SeasonalWeather() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme ?? null);
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  const season: Season | null =
    theme === "winter" || theme === "summer" || theme === "monsoon" ? theme : null;

  return (
    <>
      <style>{WEATHER_CSS}</style>
      {season && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 30,
          }}
        >
          <WeatherBits season={season} />
        </div>
      )}
    </>
  );
}
