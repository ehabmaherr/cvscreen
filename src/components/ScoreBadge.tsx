import type { ScoreDomain, Theme } from "../utils/heat";
import { heatColor, heatColorAlpha } from "../utils/heat";

interface ScoreBadgeProps {
  score: number;
  theme: Theme;
  scoreDomain: ScoreDomain;
}

export default function ScoreBadge({ score, theme, scoreDomain }: ScoreBadgeProps) {
  return (
    <span
      className="score-badge"
      style={{
        background: heatColorAlpha(score, theme, scoreDomain, 0.14),
        color: heatColor(score, theme, scoreDomain),
      }}
    >
      <span
        className="score-badge-dot"
        style={{ background: heatColor(score, theme, scoreDomain) }}
      />
      {score}%
    </span>
  );
}
