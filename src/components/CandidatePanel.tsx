import type { Role } from "../types";

interface CandidatePanelProps {
  role: Role | null;
  onClose: () => void;
}

export default function CandidatePanel({ role, onClose }: CandidatePanelProps) {
  if (!role) return null;

  return (
    <aside className="candidate-panel">
      <div className="candidate-panel-header">
        <div>
          <h3>{role.title}</h3>
          <p className="candidate-panel-sub">Top 5 candidates</p>
        </div>
        <button type="button" className="panel-close" onClick={onClose}>
          &times;
        </button>
      </div>

      <details className="requirements">
        <summary>Requirements</summary>
        <ul>
          {role.requirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </details>

      <ol className="candidate-list">
        {role.candidates.map((c) => (
          <li key={c.id} className="candidate-card">
            <div className="candidate-card-top">
              <span className="candidate-name">{c.name}</span>
              <span className="candidate-score">{c.matchScore}%</span>
            </div>
            <div className="candidate-meta">{c.yearsExperience} yrs experience</div>
            <div className="candidate-tags">
              {c.matchedSkills.map((s) => (
                <span key={s} className="tag tag-match">
                  {s}
                </span>
              ))}
              {c.gaps.map((g) => (
                <span key={g} className="tag tag-gap">
                  {g}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
