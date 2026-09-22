import { useState } from "react";
import type { NodeKind, Project } from "../types";
import type { ScoreDomain, Theme } from "../utils/heat";
import { categoryTopScore, roleTopScore } from "../utils/scores";
import FeedbackDot from "./FeedbackDot";
import ScoreBadge from "./ScoreBadge";
import ScoreMeter from "./ScoreMeter";

interface StructuredViewProps {
  project: Project;
  notes: Record<string, string>;
  onSaveNote: (nodeId: string, nodeKind: NodeKind, text: string) => void;
  theme: Theme;
  scoreDomain: ScoreDomain;
}

export default function StructuredView({
  project,
  notes,
  onSaveNote,
  theme,
  scoreDomain,
}: StructuredViewProps) {
  const [openRoles, setOpenRoles] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setOpenRoles((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="structured-view">
      <div className="structured-project">
        <FeedbackDot
          nodeId="project"
          nodeKind="project"
          note={notes["project"]}
          onSave={onSaveNote}
        />
        <h2>{project.title}</h2>
        <p>{project.description}</p>
      </div>

      {project.categories.map((category) => (
        <section key={category.id} className="structured-category">
          <div className="structured-category-header">
            <FeedbackDot
              nodeId={category.id}
              nodeKind="category"
              note={notes[category.id]}
              onSave={onSaveNote}
            />
            <h3>{category.title}</h3>
            <ScoreBadge score={categoryTopScore(category)} theme={theme} scoreDomain={scoreDomain} />
          </div>

          {category.roles.map((role) => {
            const isOpen = !!openRoles[role.id];
            return (
              <div key={role.id} className="structured-role">
                <div className="structured-role-header">
                  <button
                    type="button"
                    className="structured-role-toggle"
                    onClick={() => toggle(role.id)}
                  >
                    <span className={"chevron" + (isOpen ? " chevron-open" : "")}>
                      &#9656;
                    </span>
                    {role.title}
                  </button>
                  <ScoreBadge score={roleTopScore(role)} theme={theme} scoreDomain={scoreDomain} />
                  <FeedbackDot
                    nodeId={role.id}
                    nodeKind="role"
                    note={notes[role.id]}
                    onSave={onSaveNote}
                  />
                </div>

                {isOpen && (
                  <div className="structured-role-body">
                    <ul className="requirements-list">
                      {role.requirements.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>

                    <table className="candidate-table">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Match</th>
                          <th>Experience</th>
                          <th>Matched skills</th>
                          <th>Gaps</th>
                        </tr>
                      </thead>
                      <tbody>
                        {role.candidates.map((c) => (
                          <tr key={c.id}>
                            <td>{c.name}</td>
                            <td className="match-cell">
                              <ScoreMeter score={c.matchScore} theme={theme} scoreDomain={scoreDomain} />
                            </td>
                            <td>{c.yearsExperience} yrs</td>
                            <td>
                              {c.matchedSkills.map((s) => (
                                <span key={s} className="tag tag-match">
                                  {s}
                                </span>
                              ))}
                            </td>
                            <td>
                              {c.gaps.length
                                ? c.gaps.map((g) => (
                                    <span key={g} className="tag tag-gap">
                                      {g}
                                    </span>
                                  ))
                                : <span className="tag-none">&mdash;</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
