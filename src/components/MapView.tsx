import { useMemo, useState } from "react";
import type { NodeKind, Project, Role, RoleCategory } from "../types";
import type { ScoreDomain, Theme } from "../utils/heat";
import { categoryTopScore, roleTopScore } from "../utils/scores";
import FeedbackDot from "./FeedbackDot";
import CandidatePanel from "./CandidatePanel";

interface MapViewProps {
  project: Project;
  notes: Record<string, string>;
  onSaveNote: (nodeId: string, nodeKind: NodeKind, text: string) => void;
  theme: Theme;
  scoreDomain: ScoreDomain;
  mapScoreDomain: ScoreDomain;
}

interface PositionedCategory {
  category: RoleCategory;
  x: number; // percent
  y: number; // percent
  dx: number; // unit direction from center
  dy: number;
  score: number;
}

interface PositionedRole {
  role: Role;
  x: number;
  y: number;
}

const CENTER = 50;
const RING_RADIUS = 34;
const ROLE_RADIUS = 19;
const CAT_BUBBLE_STEPS = [0.2, 0.35, 0.5, 0.65, 0.8];
const ROLE_BUBBLE_STEPS = [0.3, 0.55, 0.8];

function layoutCategories(categories: RoleCategory[]): PositionedCategory[] {
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
      score: categoryTopScore(category),
    };
  });
}

function layoutRoles(category: RoleCategory, catX: number, catY: number, dx: number, dy: number): PositionedRole[] {
  const roles = category.roles;
  const n = roles.length;
  const baseAngle = Math.atan2(dy, dx);
  const spreadDeg = Math.min(130, 55 * Math.max(0, n - 1));
  const spreadRad = (spreadDeg * Math.PI) / 180;
  return roles.map((role, i) => {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    const angle = baseAngle + t * spreadRad;
    return {
      role,
      x: catX + ROLE_RADIUS * Math.cos(angle),
      y: catY + ROLE_RADIUS * Math.sin(angle),
    };
  });
}

function BubbleTrail({
  x1,
  y1,
  x2,
  y2,
  steps,
  active,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  steps: number[];
  active: boolean;
}) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className="edge-guide"
        strokeOpacity={active ? 0.4 : 0.2}
      />
      {steps.map((t) => (
        <circle
          key={t}
          className="map-bubble"
          cx={x1 + (x2 - x1) * t}
          cy={y1 + (y2 - y1) * t}
          r={(active ? 0.9 : 0.7) + t * 1.3}
        />
      ))}
    </g>
  );
}

export default function MapView({
  project,
  notes,
  onSaveNote,
  theme,
  scoreDomain,
}: MapViewProps) {
  const positioned = useMemo(() => layoutCategories(project.categories), [project]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  const hovered = positioned.find((p) => p.category.id === hoveredCategoryId) ?? null;
  const rolePositions = useMemo(
    () => (hovered ? layoutRoles(hovered.category, hovered.x, hovered.y, hovered.dx, hovered.dy) : []),
    [hovered],
  );

  return (
    <div className="map-view">
      <div className="map-canvas">
        <svg className="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {positioned.map((p) => (
            <BubbleTrail
              key={p.category.id}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              steps={CAT_BUBBLE_STEPS}
              active={hoveredCategoryId === p.category.id}
            />
          ))}
          {hovered &&
            rolePositions.map((rp) => (
              <BubbleTrail
                key={rp.role.id}
                x1={hovered.x}
                y1={hovered.y}
                x2={rp.x}
                y2={rp.y}
                steps={ROLE_BUBBLE_STEPS}
                active={activeRole?.id === rp.role.id}
              />
            ))}
        </svg>

        <div className="node node-center" style={{ left: `${CENTER}%`, top: `${CENTER}%` }}>
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
            <div className="node-score">{p.score}%</div>
            <div className="node-count">{p.category.roles.length} role(s)</div>
          </div>
        ))}

        {hovered &&
          rolePositions.map((rp) => (
            <div
              key={rp.role.id}
              className={
                "node node-role" + (activeRole?.id === rp.role.id ? " node-active" : "")
              }
              style={{ left: `${rp.x}%`, top: `${rp.y}%` }}
              onMouseEnter={() => setHoveredCategoryId(hovered.category.id)}
              onMouseLeave={() => setHoveredCategoryId(null)}
              onClick={() => setActiveRole(rp.role)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveRole(rp.role);
                }
              }}
            >
              <FeedbackDot
                nodeId={rp.role.id}
                nodeKind="role"
                note={notes[rp.role.id]}
                onSave={onSaveNote}
              />
              <div className="node-title">{rp.role.title}</div>
              <div className="node-score">{roleTopScore(rp.role)}%</div>
            </div>
          ))}
      </div>

      <CandidatePanel
        role={activeRole}
        onClose={() => setActiveRole(null)}
        theme={theme}
        scoreDomain={scoreDomain}
      />
    </div>
  );
}
