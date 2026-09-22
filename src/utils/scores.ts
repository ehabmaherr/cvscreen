import type { Project, Role, RoleCategory } from "../types";
import type { ScoreDomain } from "./heat";

/** Candidates are stored best-first, so the top candidate's score represents the role. */
export function roleTopScore(role: Role): number {
  return role.candidates[0]?.matchScore ?? 0;
}

export function categoryTopScore(category: RoleCategory): number {
  const scores = category.roles.map(roleTopScore);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

const MIN_DOMAIN_SPAN = 15;

function domainFromScores(scores: number[]): ScoreDomain {
  if (!scores.length) return { min: 70, max: 100 };

  let min = Math.min(...scores);
  let max = Math.max(...scores);
  if (max - min < MIN_DOMAIN_SPAN) {
    const mid = (max + min) / 2;
    min = mid - MIN_DOMAIN_SPAN / 2;
    max = mid + MIN_DOMAIN_SPAN / 2;
  }
  const pad = (max - min) * 0.1;
  return { min: min - pad, max: max + pad };
}

/**
 * The score range actually present in this project's candidates, so the
 * candidate list's heat scale spreads across the real spread instead of
 * clustering near one end. Shared across views for cross-role comparability.
 */
export function computeScoreDomain(project: Project): ScoreDomain {
  const scores = project.categories.flatMap((c) =>
    c.roles.flatMap((r) => r.candidates.map((cand) => cand.matchScore)),
  );
  return domainFromScores(scores);
}

/**
 * A tighter domain scoped to category/role top scores -- these cluster much
 * closer together than individual candidates, so the map gets its own scale
 * that actually spreads across its color range instead of reading as flat.
 */
export function computeMapScoreDomain(project: Project): ScoreDomain {
  const categoryScores = project.categories.map(categoryTopScore);
  const roleScores = project.categories.flatMap((c) => c.roles.map(roleTopScore));
  return domainFromScores([...categoryScores, ...roleScores]);
}
