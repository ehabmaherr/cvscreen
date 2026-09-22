import type { ScoreDomain, Theme } from "../utils/heat";
import { heatColor, heatColorAlpha } from "../utils/heat";

interface ScoreMeterProps {
  score: number;
  theme: Theme;
  scoreDomain: ScoreDomain;
}

export default function ScoreMeter({ score, theme, scoreDomain }: ScoreMeterProps) {
  return (
    <div className="score-meter" role="img" aria-label={`Match score ${score}%`}>
      <div
        className="score-meter-track"
        style={{ background: heatColorAlpha(score, theme, scoreDomain, 0.16) }}
      >
        <div
          className="score-meter-fill"
          style={{ width: `${score}%`, background: heatColor(score, theme, scoreDomain) }}
        />
      </div>
      <span className="score-meter-value">{score}%</span>
    </div>
  );
}
