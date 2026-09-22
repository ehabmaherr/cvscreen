import { useMemo, useState } from "react";
import type { NodeKind, Project, Role, RoleCategory } from "../types";
import FeedbackDot from "./FeedbackDot";
import CandidatePanel from "./CandidatePanel";

interface MapViewProps {
  project: Project;
  notes: Record<string, string>;
  onSaveNote: (nodeId: string, nodeKind: NodeKind, text: string) => void;
}

interface Positioned {
  category: RoleCategory;
  x: number; // percent
  y: number; // percent
  dx: number; // unit direction from center
  dy: number;
}

const CENTER = 50;
const RING_RADIUS = 34;

function layoutCategories(categories: RoleCategory[]): Positioned[] {
  const n = categories.length;
  return categories.map((category, i) => {
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    return {
      category,
      x: CENTER + RING_RADIUS * dx,
      y: CENTER + RING_RADIUS * dy,
      dx,
      dy,
    };
  });
}

export default function MapView({ project, notes, onSaveNote }: MapViewProps) {
  const positioned = useMemo(() => layoutCategories(project.categories), [project]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  const hovered = positioned.find((p) => p.category.id === hoveredCategoryId) ?? null;

  return (
    <div className="map-view">
      <div className="map-canvas">
        <svg className="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="var(--border-strong)" />
            </marker>
          </defs>
          {positioned.map((p) => (
            <line
              key={p.category.id}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              className={
                "edge" + (hoveredCategoryId === p.category.id ? " edge-active" : "")
              }
              markerEnd="url(#arrow)"
            />
          ))}
        </svg>

        <div
          className="node node-center"
          style={{ left: `${CENTER}%`, top: `${CENTER}%` }}
        >
          <FeedbackDot
            nodeId="project"
            nodeKind="project"
            note={notes["project"]}
            onSave={onSaveNote}
          />
          <div className="node-title">{project.title}</div>
          <div className="node-desc">{project.description}</div>
        </div>

        {positioned.map((p) => (
          <div
            key={p.category.id}
            className={
              "node node-category" +
              (hoveredCategoryId === p.category.id ? " node-active" : "")
            }
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            onMouseEnter={() => setHoveredCategoryId(p.category.id)}
            onMouseLeave={() => setHoveredCategoryId(null)}
          >
            <FeedbackDot
              nodeId={p.category.id}
              nodeKind="category"
              note={notes[p.category.id]}
              onSave={onSaveNote}
            />
            <div className="node-title">{p.category.title}</div>
            <div className="node-count">{p.category.roles.length} role(s)</div>
          </div>
        ))}

        {hovered && (
          <div
            className="role-flyout"
            style={{
              left: `${hovered.x + hovered.dx * 16}%`,
              top: `${hovered.y + hovered.dy * 16}%`,
            }}
            onMouseEnter={() => setHoveredCategoryId(hovered.category.id)}
            onMouseLeave={() => setHoveredCategoryId(null)}
          >
            <div className="role-flyout-title">{hovered.category.title}</div>
            <ul>
              {hovered.category.roles.map((role) => (
                <li key={role.id}>
                  <div
                    className={
                      "role-chip" + (activeRole?.id === role.id ? " role-chip-active" : "")
                    }
                  >
                    <button
                      type="button"
                      className="role-chip-btn"
                      onClick={() => setActiveRole(role)}
                    >
                      {role.title}
                    </button>
                    <FeedbackDot
                      nodeId={role.id}
                      nodeKind="role"
                      note={notes[role.id]}
                      onSave={onSaveNote}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <CandidatePanel role={activeRole} onClose={() => setActiveRole(null)} />
    </div>
  );
}
