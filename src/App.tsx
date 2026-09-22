import { useEffect, useMemo, useState } from "react";
import type { NodeKind, Project } from "./types";
import type { Theme } from "./utils/heat";
import { computeMapScoreDomain, computeScoreDomain } from "./utils/scores";
import { mockProject } from "./data/mockData";
import ProjectForm from "./components/ProjectForm";
import MapView from "./components/MapView";
import StructuredView from "./components/StructuredView";
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

function App() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("map");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const scoreDomain = useMemo(
    () => (project ? computeScoreDomain(project) : { min: 70, max: 100 }),
    [project],
  );
  const mapScoreDomain = useMemo(
    () => (project ? computeMapScoreDomain(project) : { min: 70, max: 100 }),
    [project],
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
      setProject({ ...mockProject, title, description });
      setLoading(false);
    }, 700);
  }

  function handleSaveNote(nodeId: string, _nodeKind: NodeKind, text: string) {
    setNotes((prev) => {
      const next = { ...prev };
      if (text.trim()) next[nodeId] = text.trim();
      else delete next[nodeId];
      return next;
    });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>CV Screen</h1>
        <div className="header-right">
          {project && (
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
              <button type="button" className="btn-link" onClick={() => setProject(null)}>
                New project
              </button>
            </div>
          )}
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? "☀" : "☽"}
          </button>
        </div>
      </header>

      <main className="app-main">
        {!project && <ProjectForm onSubmit={handleGenerate} loading={loading} />}
        {project && view === "map" && (
          <MapView
            project={project}
            notes={notes}
            onSaveNote={handleSaveNote}
            theme={theme}
            scoreDomain={scoreDomain}
            mapScoreDomain={mapScoreDomain}
          />
        )}
        {project && view === "structured" && (
          <StructuredView
            project={project}
            notes={notes}
            onSaveNote={handleSaveNote}
            theme={theme}
            scoreDomain={scoreDomain}
          />
        )}
      </main>
    </div>
  );
}

export default App;
