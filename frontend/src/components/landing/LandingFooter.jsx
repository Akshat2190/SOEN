import React from 'react'

const LandingFooter = () => (
  <footer id="footer" className="pt-16 pb-8" style={{ background: 'var(--surface-dark)' }}>
    <div className="max-w-[1200px] mx-auto px-8">
      {/* Top */}
      <div className="flex items-center gap-6 mb-12">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-[4px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--on-dark)', fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: '9px', fontWeight: 500, color: 'var(--surface-dark)' }}
          >
            FX
          </div>
          <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: '13px', fontWeight: 500, color: 'var(--on-dark)', letterSpacing: '1px' }}>FLUX</span>
        </div>
        <p className="ml-auto text-[13px]" style={{ color: 'var(--on-dark-soft)' }}>AI Coding Workspaces in Motion.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {[
          {
            title: 'Product',
            links: [['#features', 'Features'], ['#how-it-works', 'How It Works'], ['#tech-stack', 'Tech Stack'], ['#', 'Live Demo']],
          },
          {
            title: 'Stack',
            links: [['#', 'React + Vite'], ['#', 'Node + Express'], ['#', 'MongoDB'], ['#', 'Socket.IO']],
          },
          {
            title: 'AI',
            links: [['#', '@ai in Chat'], ['#', 'Gemini Integration'], ['#', 'WebContainer Runtime'], ['#', 'Code Generation']],
          },
          {
            title: 'Project',
            links: [['#about', 'About FLUX'], ['#tech-stack', 'Tech Stack'], ['#', 'GitHub'], ['#', 'Documentation']],
          },
        ].map(col => (
          <div key={col.title}>
            <h4 className="text-xs font-medium uppercase tracking-[0.5px] mb-4" style={{ color: 'var(--on-dark)', fontFamily: "'Inter',-apple-system,sans-serif" }}>{col.title}</h4>
            <ul className="list-none flex flex-col gap-3">
              {col.links.map(([href, label]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm no-underline transition-colors duration-150"
                    style={{ color: 'var(--on-dark-soft)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--on-dark)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--on-dark-soft)'}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div
        className="flex justify-between items-center pt-8 gap-4 flex-wrap"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: 'var(--on-dark-soft)' }}
      >
        <span>© 2025 FLUX · Software Engineering Project</span>
        <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: '11px', opacity: 0.6 }}>Software Engineering Project · 2025</span>
      </div>
    </div>
  </footer>
)

export default LandingFooter
