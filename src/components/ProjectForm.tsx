import { useState } from "react";

interface ProjectFormProps {
  onSubmit: (title: string, description: string) => void;
  loading: boolean;
}

export default function ProjectForm({ onSubmit, loading }: ProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <form
      className="project-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;
        onSubmit(title.trim(), description.trim());
      }}
    >
      <h2>New project</h2>
      <label>
        Project title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Customer Insights Platform"
        />
      </label>
      <label>
        Project description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Describe the project's goals, scope, and technical shape..."
        />
      </label>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Screening candidates..." : "Generate role map"}
      </button>
    </form>
  );
}
