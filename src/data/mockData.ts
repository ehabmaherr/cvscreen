import type { Project } from "../types";

function candidates(
  names: [string, number, string[], string[], number][],
) {
  return names.map(([name, matchScore, matchedSkills, gaps, years], i) => ({
    id: `${name}-${i}`.toLowerCase().replace(/\s+/g, "-"),
    name,
    matchScore,
    matchedSkills,
    gaps,
    yearsExperience: years,
  }));
}

export const mockProject: Project = {
  title: "Customer Insights Platform",
  description:
    "A web platform that ingests support tickets and product usage data to surface churn risk and customer health scores for the CS team. Includes a React dashboard, a data pipeline, and an ML model serving predictions.",
  categories: [
    {
      id: "cat-pm",
      title: "Project Management",
      roles: [
        {
          id: "role-pm",
          title: "Project Manager",
          requirements: [
            "5+ years leading cross-functional software projects",
            "Experience with agile/scrum delivery",
            "Stakeholder communication",
          ],
          candidates: candidates([
            ["Amina Khalil", 92, ["Agile", "Stakeholder mgmt", "Roadmapping"], ["No ML background"], 7],
            ["Dara Osei", 88, ["Scrum", "Budgeting", "Cross-functional leadership"], [], 6],
            ["Liam Foster", 85, ["Agile", "Risk management"], ["Limited technical depth"], 5],
            ["Priya Nair", 81, ["Stakeholder mgmt", "Reporting"], ["New to SaaS domain"], 4],
            ["Tom Vance", 77, ["Scrum", "Vendor coordination"], ["No data platform experience"], 5],
          ]),
        },
      ],
    },
    {
      id: "cat-dev",
      title: "Development",
      roles: [
        {
          id: "role-senior-dev",
          title: "Senior Backend Developer",
          requirements: [
            "5+ years backend development",
            "Experience with distributed data pipelines",
            "Python or Go proficiency",
          ],
          candidates: candidates([
            ["Elena Petrova", 95, ["Python", "Kafka", "Postgres"], [], 8],
            ["Marcus Webb", 90, ["Go", "Distributed systems"], ["Less Python depth"], 7],
            ["Sofia Rinaldi", 87, ["Python", "API design"], ["No Kafka experience"], 6],
            ["Kenji Watanabe", 84, ["Python", "Postgres"], ["Junior-level pipeline work"], 4],
            ["Grace Adeyemi", 80, ["Go", "Docker"], ["No ML pipeline exposure"], 5],
          ]),
        },
        {
          id: "role-frontend-dev",
          title: "Frontend Developer",
          requirements: [
            "3+ years React experience",
            "Data visualization familiarity",
            "Design collaboration",
          ],
          candidates: candidates([
            ["Noah Bergström", 93, ["React", "D3.js", "TypeScript"], [], 5],
            ["Isabella Cruz", 89, ["React", "Design systems"], ["Limited dataviz"], 4],
            ["Ravi Chandran", 86, ["React", "TypeScript"], ["No dashboard experience"], 3],
            ["Mei Lin", 82, ["Vue", "React (basic)"], ["Primarily Vue background"], 4],
            ["Owen Fitzgerald", 78, ["React", "CSS architecture"], ["No data viz"], 3],
          ]),
        },
        {
          id: "role-mlops",
          title: "MLOps Engineer",
          requirements: [
            "Experience deploying ML models to production",
            "CI/CD for ML pipelines",
            "Cloud infra (AWS/GCP)",
          ],
          candidates: candidates([
            ["Yusuf Demir", 91, ["MLflow", "Kubernetes", "AWS"], [], 6],
            ["Hannah Kessler", 88, ["GCP", "CI/CD", "Docker"], ["Less model-serving depth"], 5],
            ["Carlos Mendoza", 85, ["AWS", "Terraform"], ["New to MLflow"], 4],
            ["Aisha Rahman", 83, ["Kubernetes", "Model monitoring"], ["Limited CI/CD tooling"], 4],
            ["Peter Novak", 79, ["Docker", "AWS"], ["No production ML experience"], 3],
          ]),
        },
      ],
    },
    {
      id: "cat-testing",
      title: "Testing",
      roles: [
        {
          id: "role-qa",
          title: "QA Engineer",
          requirements: [
            "Test automation experience",
            "API and UI testing",
            "CI pipeline integration",
          ],
          candidates: candidates([
            ["Fatima Zahra", 90, ["Playwright", "API testing", "CI/CD"], [], 5],
            ["Jonas Weber", 86, ["Selenium", "Test planning"], ["Less API testing depth"], 4],
            ["Chloe Martin", 84, ["Playwright", "Cypress"], ["New to backend testing"], 3],
            ["Diego Alvarez", 80, ["Manual QA", "Automation basics"], ["Limited automation depth"], 4],
            ["Wei Zhang", 76, ["API testing"], ["No UI automation"], 2],
          ]),
        },
      ],
    },
    {
      id: "cat-design",
      title: "Design",
      roles: [
        {
          id: "role-product-designer",
          title: "Product Designer",
          requirements: [
            "Dashboard/data-heavy product design",
            "Figma proficiency",
            "User research",
          ],
          candidates: candidates([
            ["Julia Andersson", 94, ["Figma", "Dashboard UX", "User research"], [], 6],
            ["Samuel Okoro", 87, ["Figma", "Prototyping"], ["Less research experience"], 4],
            ["Nina Kovac", 83, ["Sketch", "Figma"], ["Primarily marketing sites"], 5],
            ["Ahmed Farouk", 79, ["Figma", "Design systems"], ["No data product experience"], 3],
            ["Lucy Bennett", 75, ["UX research"], ["Limited visual design"], 3],
          ]),
        },
      ],
    },
  ],
};
