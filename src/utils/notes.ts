import type { NodeKind, Project } from "../types";

export interface FeedbackEntry {
  projectId: string;
  projectTitle: string;
  nodeId: string;
  nodeKind: NodeKind;
  nodeLabel: string;
  text: string;
}

function resolveNodeLabel(project: Project, nodeId: string, nodeKind: NodeKind): string {
  if (nodeKind === "project") return project.title;
  for (const category of project.categories) {
    if (nodeKind === "category" && category.id === nodeId) return category.title;
    for (const role of category.roles) {
      if (nodeKind === "role" && role.id === nodeId) return role.title;
    }
  }
  return nodeId;
}

/** Flattens every note left across every project into a reviewable list, newest project first. */
export function collectFeedback(
  projects: Project[],
  notesByProject: Record<string, Record<string, string>>,
): FeedbackEntry[] {
  const entries: FeedbackEntry[] = [];
  for (const project of projects) {
    const notes = notesByProject[project.id] ?? {};
    for (const [nodeId, text] of Object.entries(notes)) {
      const nodeKind: NodeKind =
        nodeId === "project" ? "project" : nodeId.startsWith("cat-") ? "category" : "role";
      entries.push({
        projectId: project.id,
        projectTitle: project.title,
        nodeId,
        nodeKind,
        nodeLabel: resolveNodeLabel(project, nodeId, nodeKind),
        text,
      });
    }
  }
  return entries;
}
