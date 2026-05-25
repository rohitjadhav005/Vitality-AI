import React, { useState } from 'react';
import { Settings as SettingsIcon, Brain, Database, ChevronRight, Save, RotateCcw, Moon, Sun, Monitor, Check, Palette } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';

const ToggleSwitch = ({ checked, onChange }) => (
  <label className="toggle-switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="toggle-slider" />
  </label>
);

const Section = ({ icon: Icon, title, children }) => (
  <div className="settings-section glass-card">
    <div className="settings-section-header">
      <div className="settings-section-icon"><Icon size={20} color="var(--primary-color)" /></div>
      <h3>{title}</h3>
    </div>
    <div className="settings-section-body">{children}</div>
  </div>
);

const SettingRow = ({ label, desc, children }) => (
  <div className="setting-row">
    <div className="setting-row-text">
      <span className="setting-label">{label}</span>
      {desc && <span className="setting-desc">{desc}</span>}
    </div>
    <div className="setting-control">{children}</div>
  </div>
);

const navItems = [
  { id: 'appearance',    icon: Palette,   label: 'Appearance' },
  { id: 'ai',            icon: Brain,     label: 'AI & Prediction' },
  { id: 'data',          icon: Database,  label: 'Data Management' },
];

const Settings = () => {
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('appearance');
  const [ai, setAi] = useState({ autoInsights: true, sensitivity: 'medium' });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(`settings-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="settings-page fade-in">
      <div className="settings-mobile-tabs">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`settings-mobile-tab ${activeSection === id ? 'active' : ''}`}
            onClick={() => scrollToSection(id)}
          >
            <Icon size={16} />
            <span>{label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="settings-layout">
        <div className="settings-nav glass-card">
          <p className="settings-nav-title">Settings</p>
          {navItems.map(({ id, icon: Icon, label }) => (
            <a
              key={id}
              href={`#settings-${id}`}
              className={`settings-nav-item ${activeSection === id ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToSection(id); }}
            >
              <Icon size={16} />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-chevron" />
            </a>
          ))}
        </div>

        <div className="settings-content">
          <div id="settings-appearance">
            <Section icon={Palette} title="Appearance">
              <SettingRow label="Theme" desc="Choose your preferred color scheme">
                <div className="theme-selector">
                  {[
                    { id: 'dark', icon: Moon, label: 'Dark' },
                    { id: 'light', icon: Sun, label: 'Light' },
                    { id: 'system', icon: Monitor, label: 'System' },
                  ].map(t => (
                    <button key={t.id} className={`theme-btn ${theme === t.id ? 'active' : ''}`} onClick={() => setTheme(t.id)}>
                      <t.icon size={16} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </SettingRow>
            </Section>
          </div>

          <div id="settings-ai">
            <Section icon={Brain} title="AI & Prediction">
              <SettingRow label="Auto-generate Insights" desc="Let AI automatically generate insights after each prediction">
                <ToggleSwitch checked={ai.autoInsights} onChange={e => setAi({...ai, autoInsights: e.target.checked})} />
              </SettingRow>
              <SettingRow label="AI Sensitivity" desc="Controls how aggressively the model flags anomalies">
                <select className="settings-select" value={ai.sensitivity} onChange={e => setAi({...ai, sensitivity: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </SettingRow>
            </Section>
          </div>

          <div id="settings-data">
            <Section icon={Database} title="Data Management">
              <SettingRow label="Export Data" desc="Download all your prediction records as CSV">
                <button className="settings-link-btn">Export CSV →</button>
              </SettingRow>
              <SettingRow label="Clear History" desc="Permanently remove all prediction data">
                <button className="settings-link-btn danger">Delete →</button>
              </SettingRow>
            </Section>
          </div>

          <div className="settings-save-bar">
            <button className="settings-reset-btn" onClick={() => {}}><RotateCcw size={16} /> Reset Defaults</button>
            <button className={`settings-save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
              {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
