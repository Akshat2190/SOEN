import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const LandingHero = () => {
  const linesRef = useRef([])
  const readyRef = useRef(null)

  useEffect(() => {
    const lines = linesRef.current
    if (!lines.length) return

    lines.forEach(l => { if (l) l.style.opacity = '0' })
    if (readyRef.current) readyRef.current.style.opacity = '0'

    lines.forEach((line, i) => {
      if (!line) return
      setTimeout(() => {
        line.style.transition = 'opacity 0.35s ease'
        line.style.opacity = '1'
      }, 400 + i * 250)
    })

    if (readyRef.current) {
      const rdy = readyRef.current
      setTimeout(() => {
        rdy.style.transition = 'opacity 0.4s ease'
        rdy.style.opacity = '1'
      }, 400 + lines.length * 250 + 200)
    }
  }, [])

  return (
    <section
      id="hero"
      className="pt-[calc(64px+96px)] pb-24"
      style={{ background: 'var(--canvas)' }}
    >
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="flex flex-col">
            <span
              className="inline-block text-[11px] font-medium tracking-[1px] uppercase rounded-full px-3 py-1 mb-6 w-fit"
              style={{ background: 'var(--primary)', color: '#fff', letterSpacing: '1px' }}
            >
              Public Preview · Live Now
            </span>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                fontSize: 'clamp(40px,6vw,64px)',
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: '-1.5px',
                color: 'var(--ink)',
              }}
            >
              AI coding<br /><em>workspaces</em><br />in motion.
            </h1>
            <p className="text-[17px] leading-[1.6] my-8 max-w-[500px]" style={{ color: 'var(--body)' }}>
              FLUX turns a project room into the whole build loop — team chat, AI-powered replies, shared file editing, syntax-highlighted code views, and a live browser runtime. All in one place.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                to="/register"
                id="hero-cta-primary"
                className="inline-flex items-center justify-center gap-1.5 text-[15px] font-medium px-7 h-12 rounded-[12px] no-underline transition-all duration-150 active:scale-[0.98]"
                style={{ background: 'var(--primary)', color: '#fff' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-active)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
              >
                ⚡ Enter FLUX
              </Link>
              <a
                href="#features"
                id="hero-cta-secondary"
                className="inline-flex items-center justify-center text-[15px] font-medium px-7 h-12 rounded-[12px] no-underline transition-all duration-150 border"
                style={{ background: 'var(--canvas)', color: 'var(--ink)', borderColor: 'var(--hairline)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--muted-soft)'; e.currentTarget.style.background = 'var(--surface-soft)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.background = 'var(--canvas)' }}
              >
                See how it works
              </a>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-6 mt-12 pt-8"
              style={{ borderTop: '1px solid var(--hairline)' }}
            >
              {[
                { value: 'Real-time', label: 'Collaboration' },
                null,
                { value: '@AI', label: 'In-chat AI replies' },
                null,
                { value: 'Browser', label: 'Code execution' },
              ].map((item, i) =>
                item === null ? (
                  <div key={i} className="w-px h-8" style={{ background: 'var(--hairline)' }} />
                ) : (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '15px', fontWeight: 500, color: 'var(--ink)' }}>
                      {item.value}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--muted)' }}>
                      {item.label}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Illustration */}
          <div className="md:order-last order-first">
            <div
              id="hero-code-window"
              className="rounded-[16px] overflow-hidden"
              style={{ background: 'var(--surface-dark)', boxShadow: '0 8px 40px rgba(20,20,19,0.18)' }}
              onMouseEnter={e => {
                const dot = e.currentTarget.querySelector('.status-dot')
                if (dot) dot.style.animationDuration = '0.6s'
              }}
              onMouseLeave={e => {
                const dot = e.currentTarget.querySelector('.status-dot')
                if (dot) dot.style.animationDuration = '2s'
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="ml-auto" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '12px', color: 'var(--on-dark-soft)' }}>
                  FLUX://WORKSPACE
                </span>
              </div>

              {/* Body */}
              <div className="grid grid-cols-2 gap-px" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {/* Left panel */}
                <div className="p-6" style={{ background: 'var(--surface-dark)' }}>
                  <div className="mb-4" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '10px', fontWeight: 500, color: 'var(--on-dark-soft)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    PROJECT SIGNAL
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { arrow: '>', text: 'auth: jwt session verified', active: false },
                      { arrow: '>', text: 'socket: joined project room', active: false },
                      { arrow: '>', text: 'users: collaborators synced', active: false },
                      { arrow: '>', text: 'ai: listening for @ai', active: true },
                      { arrow: '>', text: 'files: tree mounted', active: false },
                      { arrow: '>', text: 'preview: webcontainer standby', active: false },
                    ].map((line, i) => (
                      <div
                        key={i}
                        ref={el => linesRef.current[i] = el}
                        className="flex items-center gap-2"
                        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '12px', color: 'var(--on-dark-soft)' }}
                      >
                        <span style={{ color: line.active ? 'var(--accent-teal)' : 'var(--muted)' }}>{line.arrow}</span>
                        {line.text}
                      </div>
                    ))}
                    <div
                      ref={readyRef}
                      className="mt-4"
                      style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '11px', color: 'var(--accent-teal)', letterSpacing: '0.5px' }}
                    >
                      FLUX_READY=true
                    </div>
                  </div>
                </div>

                {/* Right panel */}
                <div className="p-6" style={{ background: 'var(--surface-dark-el)' }}>
                  <div className="mb-4" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '10px', fontWeight: 500, color: 'var(--on-dark-soft)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    LIVE STACK
                  </div>
                  <div className="flex flex-col gap-2">
                    {['React + Vite', 'Node + Express', 'MongoDB', 'Socket.IO', 'Gemini AI', 'WebContainer'].map(tech => (
                      <div
                        key={tech}
                        className="flex items-center justify-between text-[13px] px-2.5 py-1.5 rounded-[6px]"
                        style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--on-dark)', fontFamily: "'Inter', -apple-system, sans-serif" }}
                      >
                        <span>{tech}</span>
                        <span className="text-[12px] font-bold" style={{ color: 'var(--accent-teal)' }}>✓</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 px-6 py-3" style={{ background: 'var(--surface-dark-el)' }}>
                <span
                  className="status-dot w-[7px] h-[7px] rounded-full"
                  style={{ background: 'var(--accent-teal)', animation: 'pulse 2s infinite' }}
                />
                <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '11px', color: 'var(--on-dark-soft)' }}>
                  All systems connected · 3 collaborators online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingHero
