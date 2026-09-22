import type { Theme } from "../utils/heat";

interface SettingsPanelProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export default function SettingsPanel({ theme, onToggleTheme }: SettingsPanelProps) {
  return (
    <div className="panel">
      <h2 className="panel-title">Settings</h2>
      <p className="panel-sub">Preferences for this workspace.</p>

      <div className="settings-row">
        <div>
          <div className="settings-row-label">Appearance</div>
          <div className="settings-row-hint">Switch between light and dark mode.</div>
        </div>
        <button type="button" className="settings-theme-toggle" onClick={onToggleTheme}>
          <span className={theme === "light" ? "active" : ""}>Light</span>
          <span className={theme === "dark" ? "active" : ""}>Dark</span>
        </button>
      </div>

      <div className="settings-row settings-row-disabled">
        <div>
          <div className="settings-row-label">Match score threshold</div>
          <div className="settings-row-hint">Coming soon</div>
        </div>
      </div>

      <div className="settings-row settings-row-disabled">
        <div>
          <div className="settings-row-label">CV database source</div>
          <div className="settings-row-hint">Coming soon</div>
        </div>
      </div>
    </div>
  );
}
