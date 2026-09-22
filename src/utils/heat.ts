export type Theme = "light" | "dark";

export interface ScoreDomain {
  min: number;
  max: number;
}

// Single-hue blue sequential ramp (validated with
// dataviz/scripts/validate_palette.js --ordinal against each mode's page
// background: single hue, lightness-monotone, >=0.06 adjacent OKLCH L gap,
// light end clears 2:1 contrast). Low score -> lighter/brighter blue,
// high score -> deeper blue.
const LIGHT_BLUE = ["#1772e8", "#135fc3", "#104d9e", "#0c3b79", "#082954", "#05172e"];
const DARK_BLUE = ["#7db0f2", "#5396ee", "#2a7dea", "#1566d1", "#1154ac", "#0d4287"];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function scoreRgb(score: number, theme: Theme, domain: ScoreDomain): [number, number, number] {
  const stops = theme === "dark" ? DARK_BLUE : LIGHT_BLUE;
  const span = domain.max - domain.min || 1;
  const t = Math.min(1, Math.max(0, (score - domain.min) / span));
  const scaled = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(scaled));
  const localT = scaled - i;
  const c1 = hexToRgb(stops[i]);
  const c2 = hexToRgb(stops[i + 1]);
  return [
    lerp(c1[0], c2[0], localT),
    lerp(c1[1], c2[1], localT),
    lerp(c1[2], c2[2], localT),
  ];
}

/** Solid blue for a match score, scaled across this project's score range. */
export function heatColor(score: number, theme: Theme, domain: ScoreDomain): string {
  const [r, g, b] = scoreRgb(score, theme, domain).map(Math.round);
  return `rgb(${r}, ${g}, ${b})`;
}

/** A lighter tint of the same score color -- for meter tracks / node washes. */
export function heatColorAlpha(
  score: number,
  theme: Theme,
  domain: ScoreDomain,
  alpha: number,
): string {
  const [r, g, b] = scoreRgb(score, theme, domain).map(Math.round);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
