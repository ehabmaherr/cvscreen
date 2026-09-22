import type { AppSection, Project } from "../types";
import {
  IconChevron,
  IconFeedback,
  IconHistory,
  IconMemory,
  IconPlus,
  IconProjects,
  IconSettings,
  IconWorkspace,
} from "./icons";

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  activeSection: AppSection;
  feedbackCount: number;
  collapsed: boolean;
  onSelectProject: (id: string) => void;
  onSelectSection: (section: AppSection) => void;
  onNewProject: () => void;
  onToggleCollapsed: () => void;
}

const NAV_ITEMS: { section: AppSection; label: string; Icon: typeof IconProjects }[] = [
  { section: "projects", label: "Projects", Icon: IconProjects },
  { section: "feedback", label: "Feedback", Icon: IconFeedback },
  { section: "history", label: "History", Icon: IconHistory },
  { section: "memory", label: "Memory", Icon: IconMemory },
  { section: "settings", label: "Settings", Icon: IconSettings },
];

export default function Sidebar({
  projects,
  activeProjectId,
  activeSection,
  feedbackCount,
  collapsed,
  onSelectProject,
  onSelectSection,
  onNewProject,
  onToggleCollapsed,
}: SidebarProps) {
  if (collapsed) {
    return (
      <aside className="rail">
        <span className="rail-logo" aria-hidden="true" />
        <button
          type="button"
          className={"rail-item" + (activeSection === "workspace" ? " active" : "")}
          onClick={() => onSelectSection("workspace")}
          title="Workspace"
        >
          <IconWorkspace />
        </button>
        {NAV_ITEMS.map(({ section, label, Icon }) => (
          <button
            key={section}
            type="button"
            className={"rail-item" + (activeSection === section ? " active" : "")}
            onClick={() => onSelectSection(section)}
            title={label}
          >
            <Icon />
            {section === "feedback" && feedbackCount > 0 && (
              <span className="rail-item-badge">{feedbackCount}</span>
            )}
          </button>
        ))}
        <button
          type="button"
          className="rail-expand"
          onClick={onToggleCollapsed}
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <IconChevron />
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo" aria-hidden="true" />
        CV Screen
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapsed}
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <IconChevron style={{ transform: "rotate(180deg)" }} />
        </button>
      </div>

      <button type="button" className="sidebar-new-btn" onClick={onNewProject}>
        <IconPlus />
        New project
      </button>

      <div className="sidebar-section-label">Recent projects</div>
      <div className="sidebar-projects">
        {projects.length === 0 && <div className="sidebar-empty">No projects yet</div>}
        {projects.map((p) => (
          <button
            key={p.id}
            type="button"
            className={
              "sidebar-project" +
              (activeSection === "workspace" && p.id === activeProjectId ? " active" : "")
            }
            onClick={() => onSelectProject(p.id)}
            title={p.title}
          >
            {p.title}
          </button>
        ))}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ section, label, Icon }) => (
          <button
            key={section}
            type="button"
            className={"sidebar-nav-item" + (activeSection === section ? " active" : "")}
            onClick={() => onSelectSection(section)}
          >
            <Icon />
            {label}
            {section === "feedback" && feedbackCount > 0 && (
              <span className="sidebar-nav-badge">{feedbackCount}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
