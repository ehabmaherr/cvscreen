export interface Candidate {
  id: string;
  name: string;
  matchScore: number; // 0-100
  matchedSkills: string[];
  gaps: string[];
  yearsExperience: number;
}

export interface Role {
  id: string;
  title: string; // exact role, e.g. "Senior Backend Developer"
  requirements: string[];
  candidates: Candidate[];
}

export interface RoleCategory {
  id: string;
  title: string; // e.g. "Development", "Project Management"
  roles: Role[];
}

export interface Project {
  title: string;
  description: string;
  categories: RoleCategory[];
}

export type NodeKind = "project" | "category" | "role";

export interface FeedbackNote {
  nodeId: string;
  nodeKind: NodeKind;
  text: string;
}
