import React, { memo } from 'react';
import { useWhiteboardStore } from '../../store/whiteboardStore';
import styles from './Toolbar.module.css';

const TOOLS = [
  {
    id: 'select',
    label: 'Select',
    shortcut: 'V',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        <path d="M13 13l6 6" />
      </svg>
    )
  },
  {
    id: 'hand',
    label: 'Hand',
    shortcut: 'H',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3" />
        <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
        <path d="M10 10.5V3a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7" />
        <path d="M6 13V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v9a7 7 0 0 0 14 0v-4" />
      </svg>
    )
  },
  null, // Separator
  {
    id: 'rectangle',
    label: 'Rectangle',
    shortcut: 'R',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    )
  },
  {
    id: 'ellipse',
    label: 'Ellipse',
    shortcut: 'O',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
      </svg>
    )
  },
  {
    id: 'diamond',
    label: 'Diamond',
    shortcut: 'D',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 12l10 10 10-10z" />
      </svg>
    )
  },
  {
    id: 'arrow',
    label: 'Arrow',
    shortcut: 'A',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="19" x2="19" y2="5" />
        <polyline points="12 5 19 5 19 12" />
      </svg>
    )
  },
  {
    id: 'line',
    label: 'Line',
    shortcut: 'L',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="19" x2="19" y2="5" />
      </svg>
    )
  },
  {
    id: 'freedraw',
    label: 'Pencil',
    shortcut: 'P',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    )
  },
  {
    id: 'text',
    label: 'Text',
    shortcut: 'T',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    )
  },
  null, // Separator
  {
    id: 'eraser',
    label: 'Eraser',
    shortcut: 'E',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 20H7L3 16C1.8 14.8 1.8 13 3 11.8L12.5 2.2C13.7 1 15.5 1 16.7 2.2L21 6.5C22.2 7.7 22.2 9.5 21 10.7L13 18.7" />
        <line x1="12" y1="12" x2="20" y2="20" />
      </svg>
    )
  },
  {
    id: 'image',
    label: 'Image',
    shortcut: 'I',
    disabled: true,
    tooltip: 'Coming soon',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    )
  }
];

function ToolButton({ tool, isActive, onClick }) {
  if (!tool) return <div className={styles.separator} />;

  return (
    <button
      onClick={!tool.disabled ? onClick : undefined}
      className={`${styles.toolButton} ${isActive ? styles.activeTool : ''} ${tool.disabled ? styles.disabled : ''}`}
      title={tool.tooltip || `${tool.label} (${tool.shortcut})`}
      disabled={tool.disabled}
    >
      {tool.icon}
      <span className={styles.shortcut}>{tool.shortcut}</span>
    </button>
  );
}

const Toolbar = memo(function Toolbar() {
  const { tool, setTool } = useWhiteboardStore();

  return (
    <div className={styles.toolbar}>
      {TOOLS.map((t, i) => (
        <ToolButton
          key={t ? t.id : `sep-${i}`}
          tool={t}
          isActive={t && tool === t.id}
          onClick={() => t && setTool(t.id)}
        />
      ))}
    </div>
  );
});

export default Toolbar;
