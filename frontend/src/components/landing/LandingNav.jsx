import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const closeMenu = () => setMobileOpen(false)

  return (
    <>
      <nav
        id="top-nav"
        className={`fixed top-0 left-0 right-0 z-[100] h-16 transition-shadow duration-200
          backdrop-blur-[12px] border-b
          ${scrolled ? 'shadow-[0_1px_8px_rgba(20,20,19,0.08)]' : ''}`}
        style={{
          fontFamily: "'Inter', -apple-system, sans-serif",
          background: 'color-mix(in srgb, var(--canvas) 92%, transparent)',
          borderBottomColor: 'var(--hairline)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center gap-6">
          {/* Brand */}
          <a href="#hero" className="flex items-center gap-3 no-underline" id="nav-brand">
            <div
              className="w-8 h-8 rounded-[6px] bg-[var(--ink)] flex items-center justify-center flex-shrink-0"
              style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '11px', fontWeight: 500, color: 'var(--canvas)', letterSpacing: '0.5px' }}
            >
              FX
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '15px', fontWeight: 500, color: 'var(--ink)', letterSpacing: '1px' }}>
              FLUX
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex list-none gap-6 ml-4">
            {['features', 'how-it-works', 'tech-stack', 'about'].map((id, i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="text-sm font-medium no-underline transition-colors duration-150"
                  style={{ color: 'var(--body)' }}
                  onMouseEnter={e => e.target.style.color = 'var(--ink)'}
                  onMouseLeave={e => e.target.style.color = 'var(--body)'}
                >
                  {['Features', 'How It Works', 'Tech Stack', 'About'][i]}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <Link
              to="/login"
              className="text-sm font-medium no-underline transition-colors duration-150"
              style={{ color: 'var(--ink)' }}
              id="nav-signin"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-5 h-10 rounded-[8px] no-underline transition-all duration-150"
              style={{ background: 'var(--primary)', color: '#fff' }}
              id="nav-cta"
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-active)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
            >
              Enter FLUX
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="flex md:hidden flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1 ml-auto"
            id="hamburger"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
          >
            {[0, 1, 2].map(i => (
              <span key={i} className="block w-[22px] h-[1.5px] rounded-sm transition-all duration-200" style={{ background: 'var(--ink)' }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[99] flex flex-col pt-16" id="mobile-menu" style={{ background: 'var(--canvas)' }}>
          <div className="p-8 flex flex-col gap-8">
            <ul className="list-none flex flex-col gap-6">
              {[['features', 'Features'], ['how-it-works', 'How It Works'], ['tech-stack', 'Tech Stack'], ['about', 'About']].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-xl font-medium no-underline" style={{ color: 'var(--ink)' }} onClick={closeMenu}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-4">
              <Link to="/login" className="text-sm font-medium no-underline" style={{ color: 'var(--ink)' }} onClick={closeMenu}>Sign in</Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center text-sm font-medium px-5 h-10 rounded-[8px] no-underline"
                style={{ background: 'var(--primary)', color: '#fff' }}
                onClick={closeMenu}
              >
                Enter FLUX
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LandingNav
