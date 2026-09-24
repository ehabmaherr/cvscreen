export type Theme = "light" | "dark";

// Validated categorical palette (dataviz skill's reference instance), first
// six slots in fixed order. A 3D scatter is an "all-pairs" context, so past
// slot 3 CVD separation isn't guaranteed by hue alone -- every point also
// gets a distinct shape (see shapes.ts) as a CVD-independent second channel,
// and hover/click always surface the domain name as text.
export const DOMAIN_COLOR: Record<Theme, string[]> = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300"],
};

export interface ThemeTokens {
  bg: string;
  bgGlowA: string;
  bgGlowB: string;
  grid: string;
  surface: string;
  surfaceStrong: string;
  border: string;
  text: string;
  textMuted: string;
  textHeading: string;
  edgeColor: string;
  edgeHighlight: string;
  starColor: string;
  ambientLight: string;
  keyLight: string;
}

export const TOKENS: Record<Theme, ThemeTokens> = {
  light: {
    bg: "#eef2f8",
    bgGlowA: "rgba(47, 111, 224, 0.08)",
    bgGlowB: "rgba(235, 104, 52, 0.05)",
    grid: "rgba(90, 110, 150, 0.08)",
    surface: "rgba(255, 255, 255, 0.72)",
    surfaceStrong: "rgba(255, 255, 255, 0.9)",
    border: "rgba(70, 90, 130, 0.16)",
    text: "#4a5773",
    textMuted: "#7c88a3",
    textHeading: "#10192b",
    edgeColor: "rgba(90, 110, 150, 0.22)",
    edgeHighlight: "rgba(47, 111, 224, 0.85)",
    starColor: "rgba(90, 110, 150, 0.35)",
    ambientLight: "#ffffff",
    keyLight: "#ffffff",
  },
  dark: {
    bg: "#080b14",
    bgGlowA: "rgba(57, 135, 229, 0.1)",
    bgGlowB: "rgba(217, 89, 38, 0.06)",
    grid: "rgba(140, 170, 220, 0.06)",
    surface: "rgba(20, 27, 42, 0.72)",
    surfaceStrong: "rgba(20, 27, 42, 0.92)",
    border: "rgba(140, 170, 220, 0.14)",
    text: "#a9b4cc",
    textMuted: "#6d7896",
    textHeading: "#eef2fb",
    edgeColor: "rgba(140, 170, 220, 0.16)",
    edgeHighlight: "rgba(120, 180, 255, 0.9)",
    starColor: "rgba(180, 200, 240, 0.5)",
    ambientLight: "#4a5a80",
    keyLight: "#ffffff",
  },
};

export interface ThreeTokens {
  bg: number;
  fogNear: number;
  fogFar: number;
  ambientColor: number;
  ambientIntensity: number;
  keyColor: number;
  keyIntensity: number;
  edgeColor: number;
  edgeOpacity: number;
  edgeHighlight: number;
  starColor: number;
  starOpacity: number;
  emissiveIntensity: number;
  emissiveIntensityHover: number;
}

// Plain hex/numeric equivalents of TOKENS above, for three.js materials/lights
// (which don't parse CSS rgba() strings).
export const THREE_TOKENS: Record<Theme, ThreeTokens> = {
  light: {
    bg: 0xeef2f8,
    fogNear: 28,
    fogFar: 80,
    ambientColor: 0xffffff,
    ambientIntensity: 0.9,
    keyColor: 0xffffff,
    keyIntensity: 0.6,
    edgeColor: 0x5a6e96,
    edgeOpacity: 0.22,
    edgeHighlight: 0x2f6fe0,
    starColor: 0x5a6e96,
    starOpacity: 0.25,
    emissiveIntensity: 0.25,
    emissiveIntensityHover: 0.9,
  },
  dark: {
    bg: 0x080b14,
    fogNear: 28,
    fogFar: 82,
    ambientColor: 0x4a5a80,
    ambientIntensity: 0.7,
    keyColor: 0xffffff,
    keyIntensity: 0.5,
    edgeColor: 0x8caadc,
    edgeOpacity: 0.16,
    edgeHighlight: 0x78b4ff,
    starColor: 0xb4c8f0,
    starOpacity: 0.55,
    emissiveIntensity: 0.55,
    emissiveIntensityHover: 1.3,
  },
};

export function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("cvscreen-galaxy-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function persistTheme(theme: Theme) {
  try {
    localStorage.setItem("cvscreen-galaxy-theme", theme);
  } catch {
    /* storage unavailable */
  }
}
