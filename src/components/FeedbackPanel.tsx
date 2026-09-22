import type { FeedbackEntry } from "../utils/notes";

interface FeedbackPanelProps {
  entries: FeedbackEntry[];
  onOpenProject: (projectId: string) => void;
}

const KIND_LABEL: Record<FeedbackEntry["nodeKind"], string> = {
  project: "Project",
  category: "Category",
  role: "Role",
};

export default function FeedbackPanel({ entries, onOpenProject }: FeedbackPanelProps) {
  return (
    <div className="panel">
      <h2 className="panel-title">Feedback review</h2>
      <p className="panel-sub">
        Notes left on map and structured-view nodes, across every project.
      </p>

      {entries.length === 0 ? (
        <div className="panel-empty">
          No feedback yet -- notes you leave on a project, category, or role show up here.
        </div>
      ) : (
        <ul className="feedback-review-list">
          {entries.map((entry) => (
            <li key={`${entry.projectId}-${entry.nodeId}`} className="feedback-review-item">
              <div className="feedback-review-top">
                <span className="feedback-review-kind">{KIND_LABEL[entry.nodeKind]}</span>
                <span className="feedback-review-node">{entry.nodeLabel}</span>
              </div>
              <p className="feedback-review-text">{entry.text}</p>
              <button
                type="button"
                className="feedback-review-project"
                onClick={() => onOpenProject(entry.projectId)}
              >
                in {entry.projectTitle} &rarr;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
