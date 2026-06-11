import React, { useEffect, useRef } from 'react'

const features = [
  {
    id: 'feature-realtime',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="3" fill="#cc785c"/><circle cx="11" cy="11" r="7" stroke="#cc785c" strokeWidth="1.5" opacity="0.4"/><circle cx="11" cy="11" r="10.5" stroke="#cc785c" strokeWidth="1" opacity="0.15"/></svg>,
    title: 'Real-time Project Rooms',
    body: "Every project is a live room. Collaborators join, chat, and co-edit in real time via Socket.IO. See who's online, what files are open, and what messages just came in — without refreshing.",
  },
  {
    id: 'feature-ai',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="12" rx="2" stroke="#cc785c" strokeWidth="1.5"/><path d="M7 9h8M7 13h5" stroke="#cc785c" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    title: '@AI In-Chat Assistance',
    body: 'Type @ai anywhere in the project chat to invoke Gemini. The AI reads the conversation context, generates code, explains errors, and replies directly in the room — visible to everyone.',
  },
  {
    id: 'feature-editor',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M4 10h14M4 14h9" stroke="#cc785c" strokeWidth="1.5" strokeLinecap="round"/><rect x="14" y="12" width="5" height="6" rx="1" stroke="#cc785c" strokeWidth="1.5"/></svg>,
    title: 'Shared File Editor',
    body: 'A browser-based file tree and tabbed editor let every collaborator navigate and edit project files together. Syntax highlighting via Highlight.js keeps code readable at a glance.',
  },
  {
    id: 'feature-webcontainer',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="3" width="18" height="13" rx="2" stroke="#cc785c" strokeWidth="1.5"/><path d="M7 19h8M11 16v3" stroke="#cc785c" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 9l3 2-3 2" stroke="#cc785c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Browser Code Execution',
    body: 'WebContainer technology brings a full Node.js runtime into the browser. Run, preview, and test code without leaving FLUX — no local setup, no environment drift.',
  },
  {
    id: 'feature-auth',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3L4 6v6c0 3.5 2.8 6.8 7 8 4.2-1.2 7-4.5 7-8V6l-7-3z" stroke="#cc785c" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 11l2 2 4-4" stroke="#cc785c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Secure Auth & Sessions',
    body: 'JWT-based authentication with Redis token blacklisting protects every route. Register, log in, and log out safely — revoked tokens are immediately invalidated across the entire API.',
  },
  {
    id: 'feature-collab',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="8" cy="8" r="3" stroke="#cc785c" strokeWidth="1.5"/><circle cx="15" cy="8" r="3" stroke="#cc785c" strokeWidth="1.5"/><path d="M2 19c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6" stroke="#cc785c" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    title: 'Team & Collaborator Management',
    body: "Create projects, invite teammates by username, and manage collaborators from a clean side panel. Every member gets full access to the room's chat, files, and AI context instantly.",
  },
]

const LandingFeatures = () => {
  const cardsRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const parent = entry.target.parentElement
        const siblings = parent.querySelectorAll('.reveal-card')
        siblings.forEach((el, idx) => {
          setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none' }, idx * 100)
        })
        siblings.forEach(el => observer.unobserve(el))
      })
    }, { threshold: 0.1 })
    cardsRef.current.forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="py-24" style={{ background: 'var(--canvas)' }}>
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-12">
          <span className="block text-xs font-medium tracking-[1.5px] uppercase mb-4" style={{ color: 'var(--muted)' }}>Core capabilities</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond','Times New Roman',serif", fontSize: 'clamp(32px,4.5vw,48px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-1px', color: 'var(--ink)' }}>
            Every tool your team<br />needs to ship together.
          </h2>
          <p className="text-[17px] mt-4 max-w-[560px] mx-auto leading-[1.6]" style={{ color: 'var(--muted)' }}>
            FLUX brings together the tools developers actually use — live chat, AI coding help, a shared file editor, and a browser runtime — into a single persistent project room.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={f.id} id={f.id}
              ref={el => cardsRef.current[i] = el}
              className="reveal-card rounded-[12px] p-8"
              style={{ background: 'var(--surface-card)', opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.55s ease, transform 0.55s ease, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(20,20,19,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div className="mb-6">{f.icon}</div>
              <h3 className="text-[18px] font-medium mb-3" style={{ color: 'var(--ink)', fontFamily: "'Inter',-apple-system,sans-serif" }}>{f.title}</h3>
              <p className="text-[16px] leading-[1.55]" style={{ color: 'var(--body)', fontFamily: "'Inter',-apple-system,sans-serif" }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LandingFeatures
