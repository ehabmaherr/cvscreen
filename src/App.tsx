import { useEffect, useMemo, useState } from "react";
import type { AppSection, NodeKind, Project } from "./types";
import type { Theme } from "./utils/heat";
import { computeMapScoreDomain, computeScoreDomain } from "./utils/scores";
import { collectFeedback } from "./utils/notes";
import { createProject } from "./data/mockData";
import Sidebar from "./components/Sidebar";
import ProjectForm from "./components/ProjectForm";
import MapView from "./components/MapView";
import StructuredView from "./components/StructuredView";
import ProjectsPanel from "./components/ProjectsPanel";
import FeedbackPanel from "./components/FeedbackPanel";
import PlaceholderPanel from "./components/PlaceholderPanel";
import SettingsPanel from "./components/SettingsPanel";
import "./app.css";

type View = "map" | "structured";

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("cvscreen-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const SECTION_TITLE: Record<AppSection, string> = {
  workspace: "Workspace",
  projects: "Projects",
  feedback: "Feedback review",
  history: "History",
  memory: "Memory",
  settings: "Settings",
};

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AppSection>("workspace");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("map");
  const [notesByProject, setNotesByProject] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;
  const notes = (activeProjectId && notesByProject[activeProjectId]) || {};

  const scoreDomain = useMemo(
    () => (activeProject ? computeScoreDomain(activeProject) : { min: 70, max: 100 }),
    [activeProject],
  );
  const mapScoreDomain = useMemo(
    () => (activeProject ? computeMapScoreDomain(activeProject) : { min: 70, max: 100 }),
    [activeProject],
  );
  const feedbackEntries = useMemo(
    () => collectFeedback(projects, notesByProject),
    [projects, notesByProject],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("cvscreen-theme", theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  function handleGenerate(title: string, description: string) {
    setLoading(true);
    // Mocked screening: swap in the sample dataset, keep the user's own title/description.
    window.setTimeout(() => {
      const project = createProject(title, description);
      setProjects((prev) => [project, ...prev]);
      setActiveProjectId(project.id);
      setActiveSection("workspace");
      setView("map");
      setLoading(false);
    }, 700);
  }

  function handleSaveNote(nodeId: string, _nodeKind: NodeKind, text: string) {
    if (!activeProjectId) return;
    setNotesByProject((prev) => {
      const projectNotes = { ...(prev[activeProjectId] ?? {}) };
      if (text.trim()) projectNotes[nodeId] = text.trim();
      else delete projectNotes[nodeId];
      return { ...prev, [activeProjectId]: projectNotes };
    });
  }

  function handleSelectProject(id: string) {
    setActiveProjectId(id);
    setActiveSection("workspace");
  }

  function handleNewProject() {
    setActiveProjectId(null);
    setActiveSection("workspace");
  }

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        activeSection={activeSection}
        feedbackCount={feedbackEntries.length}
        collapsed={sidebarCollapsed}
        onSelectProject={handleSelectProject}
        onSelectSection={setActiveSection}
        onNewProject={handleNewProject}
        onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="app-body">
        <header className="app-header">
          <h1>
            {SECTION_TITLE[activeSection]}
            {activeSection === "workspace" && activeProject ? ` — ${activeProject.title}` : ""}
          </h1>
          <div className="header-right">
            {activeSection === "workspace" && activeProject && (
              <div className="view-toggle">
                <button
                  type="button"
                  className={view === "map" ? "active" : ""}
                  onClick={() => setView("map")}
                >
                  Map
                </button>
                <button
                  type="button"
                  className={view === "structured" ? "active" : ""}
                  onClick={() => setView("structured")}
                >
                  Structured
                </button>
              </div>
            )}
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? "☀" : "☽"}
            </button>
          </div>
        </header>

        <main className="app-main">
          {activeSection === "workspace" && !activeProject && (
            <ProjectForm onSubmit={handleGenerate} loading={loading} />
          )}
          {activeSection === "workspace" && activeProject && view === "map" && (
            <MapView
              project={activeProject}
              notes={notes}
              onSaveNote={handleSaveNote}
              theme={theme}
              scoreDomain={scoreDomain}
              mapScoreDomain={mapScoreDomain}
            />
          )}
          {activeSection === "workspace" && activeProject && view === "structured" && (
            <StructuredView
              project={activeProject}
              notes={notes}
              onSaveNote={handleSaveNote}
              theme={theme}
              scoreDomain={scoreDomain}
            />
          )}
          {activeSection === "projects" && (
            <ProjectsPanel projects={projects} onOpen={handleSelectProject} theme={theme} />
          )}
          {activeSection === "feedback" && (
            <FeedbackPanel entries={feedbackEntries} onOpenProject={handleSelectProject} />
          )}
          {activeSection === "history" && (
            <PlaceholderPanel
              title="History"
              description="A timeline of past role-map generations and edits will live here."
            />
          )}
          {activeSection === "memory" && (
            <PlaceholderPanel
              title="Memory"
              description="Patterns CV Screen has learned from your feedback across projects will live here."
            />
          )}
          {activeSection === "settings" && (
            <SettingsPanel theme={theme} onToggleTheme={toggleTheme} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
