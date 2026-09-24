export interface Domain {
  id: string;
  label: string;
  /** Fixed categorical color, one hue per surface (light/dark) -- see theme.ts. */
  skills: string[];
}

export interface Candidate {
  id: string;
  name: string;
  domainId: string;
  skills: string[];
  experienceYears: number;
  score: number;
}

export interface Edge {
  a: string; // candidate id
  b: string; // candidate id
  shared: number;
}

export const DOMAINS: Domain[] = [
  {
    id: "backend",
    label: "Backend",
    skills: ["Python", "Go", "Java", "Kafka", "Postgres", "Distributed Systems", "API Design", "Microservices"],
  },
  {
    id: "frontend",
    label: "Frontend",
    skills: ["React", "TypeScript", "CSS", "Vue", "Accessibility", "Design Systems", "WebGL", "API Design"],
  },
  {
    id: "ml",
    label: "ML / Data",
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Data Pipelines", "Statistics", "SQL", "Distributed Systems"],
  },
  {
    id: "design",
    label: "Design",
    skills: ["Figma", "UX Research", "Prototyping", "Design Systems", "Accessibility", "Motion Design"],
  },
  {
    id: "qa",
    label: "QA",
    skills: ["Playwright", "Cypress", "API Testing", "CI/CD", "Test Planning", "API Design"],
  },
  {
    id: "pm",
    label: "Product / PM",
    skills: ["Roadmapping", "Stakeholder Mgmt", "Agile", "Analytics", "Budgeting", "UX Research"],
  },
];

const FIRST_NAMES = [
  "Elena", "Marcus", "Sofia", "Kenji", "Grace", "Amina", "Dara", "Liam", "Priya", "Tom",
  "Noah", "Isabella", "Ravi", "Mei", "Owen", "Yusuf", "Hannah", "Carlos", "Aisha", "Peter",
  "Fatima", "Jonas", "Chloe", "Diego", "Wei", "Julia", "Samuel", "Nina", "Ahmed", "Lucy",
  "Ines", "Tobias", "Zara", "Felix", "Maya", "Leon", "Nadia", "Hugo", "Sara", "Mateo",
];
const LAST_NAMES = [
  "Petrova", "Webb", "Rinaldi", "Watanabe", "Adeyemi", "Khalil", "Osei", "Foster", "Nair", "Vance",
  "Bergstrom", "Cruz", "Chandran", "Lin", "Fitzgerald", "Demir", "Kessler", "Mendoza", "Rahman", "Novak",
  "Zahra", "Weber", "Martin", "Alvarez", "Zhang", "Andersson", "Okoro", "Kovac", "Farouk", "Bennett",
];

function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(rand() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export function generateCandidates(perDomain = 9, seed = 42): Candidate[] {
  const rand = mulberry32(seed);
  const candidates: Candidate[] = [];
  let nameIdx = 0;
  for (const domain of DOMAINS) {
    for (let i = 0; i < perDomain; i++) {
      const first = FIRST_NAMES[nameIdx % FIRST_NAMES.length];
      const last = LAST_NAMES[(nameIdx * 7 + i) % LAST_NAMES.length];
      nameIdx++;
      const skillCount = 3 + Math.floor(rand() * 2);
      const skills = pickN(domain.skills, skillCount, rand);
      candidates.push({
        id: `${domain.id}-${i}`,
        name: `${first} ${last}`,
        domainId: domain.id,
        skills,
        experienceYears: 2 + Math.floor(rand() * 10),
        score: 70 + Math.floor(rand() * 28),
      });
    }
  }
  return candidates;
}

function sharedSkillCount(a: Candidate, b: Candidate): number {
  const setB = new Set(b.skills);
  let n = 0;
  for (const s of a.skills) if (setB.has(s)) n++;
  return n;
}

/** k-nearest-by-shared-skills edges, capped per node so the graph reads as a constellation, not a hairball. */
export function computeEdges(candidates: Candidate[], k = 3, minShared = 2): Edge[] {
  const edgeSet = new Map<string, Edge>();
  for (const a of candidates) {
    const scored = candidates
      .filter((b) => b.id !== a.id)
      .map((b) => ({ b, shared: sharedSkillCount(a, b) }))
      .filter((x) => x.shared >= minShared)
      .sort((x, y) => y.shared - x.shared)
      .slice(0, k);
    for (const { b, shared } of scored) {
      const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
      if (!edgeSet.has(key)) edgeSet.set(key, { a: a.id, b: b.id, shared });
    }
  }
  return [...edgeSet.values()];
}
