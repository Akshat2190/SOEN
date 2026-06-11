import React from 'react'

const ThemeToggle = ({ theme, setTheme }) => (
  <div
    id="theme-toggle-corner"
    className="fixed bottom-6 right-6 z-[200] flex gap-1.5 rounded-full p-1.5"
    style={{ background: 'var(--surface-dark)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
  >
    {[
      { key: 'light', label: '☀', title: 'Light mode' },
      { key: 'dark', label: '◑', title: 'Dark mode' },
    ].map(btn => (
      <button
        key={btn.key}
        id={`theme-${btn.key}`}
        title={btn.title}
        onClick={() => setTheme(btn.key)}
        className="w-9 h-9 rounded-full border-none flex items-center justify-center text-base cursor-pointer transition-all duration-150"
        style={{
          background: theme === btn.key ? 'var(--primary)' : 'transparent',
          color: theme === btn.key ? '#fff' : 'var(--on-dark-soft)',
          lineHeight: 1,
        }}
        onMouseEnter={e => { if (theme !== btn.key) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--on-dark)' } }}
        onMouseLeave={e => { if (theme !== btn.key) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--on-dark-soft)' } }}
      >
        {btn.label}
      </button>
    ))}
  </div>
)

export default ThemeToggle
