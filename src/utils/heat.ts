export type Theme = "light" | "dark";

export interface ScoreDomain {
  min: number;
  max: number;
}

// Amber -> red "heat" ramp, one step set per surface (validated with
// dataviz/scripts/validate_palette.js --ordinal against each mode's page
// background: lightness-monotone, >=0.06 adjacent OKLCH L gap, light end
// clears 2:1 contrast). Multi-hue by design -- this is a heat scale, not a
// single-series sequential ramp.
const LIGHT_HEAT = ["#e9980c", "#c2540a", "#99270a", "#760d0a", "#580912", "#3c0713"];
const DARK_HEAT = ["#f3c968", "#f3933f", "#f1521e", "#df1f11", "#bc1021", "#950f2e"];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function heatRgb(score: number, theme: Theme, domain: ScoreDomain): [number, number, number] {
  const stops = theme === "dark" ? DARK_HEAT : LIGHT_HEAT;
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

/** Solid heat color for a match score, scaled across this project's score range. */
export function heatColor(score: number, theme: Theme, domain: ScoreDomain): string {
  const [r, g, b] = heatRgb(score, theme, domain).map(Math.round);
  return `rgb(${r}, ${g}, ${b})`;
}

/** A lighter tint of the same heat color -- for meter tracks / node washes. */
export function heatColorAlpha(
  score: number,
  theme: Theme,
  domain: ScoreDomain,
  alpha: number,
): string {
  const [r, g, b] = heatRgb(score, theme, domain).map(Math.round);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Relative luminance (WCAG) to pick legible text color on a heat fill. */
export function textColorOn(score: number, theme: Theme, domain: ScoreDomain): string {
  const [r, g, b] = heatRgb(score, theme, domain);
  const lin = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  return luminance > 0.42 ? "#1a1005" : "#fff7ec";
}
