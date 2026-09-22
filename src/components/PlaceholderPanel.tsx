interface PlaceholderPanelProps {
  title: string;
  description: string;
}

export default function PlaceholderPanel({ title, description }: PlaceholderPanelProps) {
  return (
    <div className="panel">
      <h2 className="panel-title">{title}</h2>
      <p className="panel-sub">{description}</p>
      <div className="panel-empty panel-coming-soon">Coming soon</div>
    </div>
  );
}
