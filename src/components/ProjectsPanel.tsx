import type { Project } from "../types";
import type { Theme } from "../utils/heat";
import { categoryTopScore, computeMapScoreDomain } from "../utils/scores";
import ScoreBadge from "./ScoreBadge";

interface ProjectsPanelProps {
  projects: Project[];
  onOpen: (id: string) => void;
  theme: Theme;
}

function projectScore(project: Project): number {
  const scores = project.categories.map(categoryTopScore);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((s, n) => s + n, 0) / scores.length);
}

export default function ProjectsPanel({ projects, onOpen, theme }: ProjectsPanelProps) {
  return (
    <div className="panel">
      <h2 className="panel-title">Projects</h2>
      <p className="panel-sub">Every role map you've generated in this session.</p>

      {projects.length === 0 ? (
        <div className="panel-empty">No projects yet -- generate one from the sidebar.</div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => {
            const domain = computeMapScoreDomain(project);
            const score = projectScore(project);
            const roleCount = project.categories.reduce((s, c) => s + c.roles.length, 0);
            return (
              <button
                key={project.id}
                type="button"
                className="project-card"
                onClick={() => onOpen(project.id)}
              >
                <div className="project-card-top">
                  <span className="project-card-title">{project.title}</span>
                  <ScoreBadge score={score} theme={theme} scoreDomain={domain} />
                </div>
                <p className="project-card-desc">{project.description}</p>
                <div className="project-card-meta">
                  {project.categories.length} categories &middot; {roleCount} role(s) &middot;{" "}
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
