import React from 'react'
import { Link } from 'react-router-dom'

const LandingCTA = () => (
  <section id="cta-band" className="py-24" style={{ background: 'var(--canvas)' }}>
    <div className="max-w-[1200px] mx-auto px-8">
      <div
        id="coral-cta"
        className="rounded-[12px] px-16 py-16 text-center"
        style={{ background: 'var(--primary)' }}
      >
        <div className="max-w-[600px] mx-auto flex flex-col items-center gap-6">
          <span className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Free to explore
          </span>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond','Times New Roman',serif",
              fontSize: 'clamp(24px,3vw,36px)',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
              color: '#fff',
            }}
          >
            Your team's build loop<br />starts here.
          </h2>
          <p className="text-[16px] leading-[1.55]" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: "'Inter',-apple-system,sans-serif" }}>
            Create a project room in seconds. Invite your team, open the editor, type <strong>@ai</strong>, and ship — all from the browser.
          </p>
          <div className="flex gap-4 items-center flex-wrap justify-center mt-2">
            <Link
              to="/register"
              id="callout-cta-primary"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-6 h-11 rounded-[8px] no-underline transition-all duration-150"
              style={{ background: 'var(--canvas)', color: 'var(--ink)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0ebe2'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--canvas)'}
            >
              ⚡ Start for free
            </Link>
            <a
              href="#features"
              id="callout-cta-secondary"
              className="text-sm font-medium no-underline transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.9)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textDecoration = 'underline' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; e.currentTarget.style.textDecoration = 'none' }}
            >
              See all features →
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default LandingCTA
