import { useMemo, useState } from "react";
import type { NodeKind, Project, Role, RoleCategory } from "../types";
import type { ScoreDomain, Theme } from "../utils/heat";
import { heatColor, heatColorAlpha } from "../utils/heat";
import { categoryTopScore, roleTopScore } from "../utils/scores";
import FeedbackDot from "./FeedbackDot";
import CandidatePanel from "./CandidatePanel";
import ScoreBadge from "./ScoreBadge";

interface MapViewProps {
  project: Project;
  notes: Record<string, string>;
  onSaveNote: (nodeId: string, nodeKind: NodeKind, text: string) => void;
  theme: Theme;
  scoreDomain: ScoreDomain;
  mapScoreDomain: ScoreDomain;
}

interface Positioned {
  category: RoleCategory;
  x: number; // percent
  y: number; // percent
  dx: number; // unit direction from center
  dy: number;
  score: number;
}

const CENTER = 50;
const RING_RADIUS = 34;
const BUBBLE_STEPS = [0.2, 0.35, 0.5, 0.65, 0.8];

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
      score: categoryTopScore(category),
    };
  });
}

export default function MapView({
  project,
  notes,
  onSaveNote,
  theme,
  scoreDomain,
  mapScoreDomain,
}: MapViewProps) {
  const positioned = useMemo(() => layoutCategories(project.categories), [project]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  const hovered = positioned.find((p) => p.category.id === hoveredCategoryId) ?? null;

  return (
    <div className="map-view">
      <div className="map-canvas">
        <svg className="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {positioned.map((p) => {
            const active = hoveredCategoryId === p.category.id;
            const color = heatColor(p.score, theme, mapScoreDomain);
            return (
              <g key={p.category.id}>
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={p.x}
                  y2={p.y}
                  className="edge-guide"
                  strokeOpacity={active ? 0.3 : 0.15}
                />
                {BUBBLE_STEPS.map((t) => (
                  <circle
                    key={t}
                    cx={CENTER + (p.x - CENTER) * t}
                    cy={CENTER + (p.y - CENTER) * t}
                    r={(active ? 1 : 0.75) + t * 1.6}
                    fill={color}
                    opacity={(active ? 0.55 : 0.35) + t * 0.4}
                  />
                ))}
              </g>
            );
          })}
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

        {positioned.map((p) => {
          const color = heatColor(p.score, theme, mapScoreDomain);
          return (
            <div
              key={p.category.id}
              className={
                "node node-category" +
                (hoveredCategoryId === p.category.id ? " node-active" : "")
              }
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                borderColor: color,
                boxShadow: `0 0 0 1px ${heatColorAlpha(p.score, theme, mapScoreDomain, 0.25)}, 0 6px 24px -6px ${heatColorAlpha(p.score, theme, mapScoreDomain, 0.55)}`,
              }}
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
              <div className="node-count" style={{ color }}>
                {p.category.roles.length} role(s) &middot; avg {p.score}%
              </div>
            </div>
          );
        })}

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
                      <span>{role.title}</span>
                      <ScoreBadge score={roleTopScore(role)} theme={theme} scoreDomain={mapScoreDomain} />
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

      <CandidatePanel
        role={activeRole}
        onClose={() => setActiveRole(null)}
        theme={theme}
        scoreDomain={scoreDomain}
      />
    </div>
  );
}
