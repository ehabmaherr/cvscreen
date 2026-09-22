import { useState } from "react";
import type { NodeKind } from "../types";

interface FeedbackDotProps {
  nodeId: string;
  nodeKind: NodeKind;
  note: string | undefined;
  onSave: (nodeId: string, nodeKind: NodeKind, text: string) => void;
}

export default function FeedbackDot({
  nodeId,
  nodeKind,
  note,
  onSave,
}: FeedbackDotProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(note ?? "");

  return (
    <div className="feedback-dot-wrap" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={"feedback-dot" + (note ? " has-note" : "")}
        title={note ? "Feedback note added" : "Add feedback"}
        onClick={() => setOpen((v) => !v)}
      >
        {note ? "✓" : "+"}
      </button>
      {open && (
        <div className="feedback-popover">
          <textarea
            autoFocus
            placeholder="Leave a note about this section..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="feedback-popover-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onSave(nodeId, nodeKind, draft);
                setOpen(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
