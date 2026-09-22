import React, { useRef } from 'react';

export const TOOL_NAMES = [
  'crop',
  'resize',
  'filter',
  'draw',
  'text',
  'shapes',
  'stickers',
  'frame',
];

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
];

export default function EditorSidebar(props) {
  const fileInputRef = useRef(null);

  return (
    <aside className="editor-sidebar">
      <section className="sidebar-section">
        <h2 className="section-label">Actions</h2>
        <button className="sidebar-btn" onClick={props.onResetImage}>Reset Image</button>
        <button className="sidebar-btn" onClick={() => fileInputRef.current?.click()}>
          Upload image…
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) props.onUploadImage(file);
          }}
        />
      </section>

      <section className="sidebar-section">
        <h2 className="section-label">Options (Live)</h2>
        <label className="sidebar-field">
          <span>Theme</span>
          <select
            value={props.theme}
            onChange={(event) => props.onThemeChange(event.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="sidebar-field">
          <span>Locale</span>
          <select
            value={props.locale}
            onChange={(event) => props.onLocaleChange(event.target.value)}
          >
            {LOCALES.map((locale) => (
              <option key={locale.value} value={locale.value}>
                {locale.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="sidebar-section">
        <h2 className="section-label">Dock (Remounts)</h2>
        <label className="sidebar-field">
          <span>Toolbar</span>
          <select
            value={props.dock}
            onChange={(event) => props.onDockChange(event.target.value)}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>
      </section>

      <section className="sidebar-section">
        <h2 className="section-label">Tools</h2>
        <div className="tool-grid">
          {TOOL_NAMES.map((tool) => (
            <label key={tool} className="tool-toggle">
              <input
                type="checkbox"
                checked={props.tools[tool]}
                onChange={() => props.onToolToggle(tool)}
              />
              <span className="checkbox-custom"></span>
              {tool.charAt(0).toUpperCase() + tool.slice(1)}
            </label>
          ))}
        </div>
      </section>
    </aside>
  );
}
