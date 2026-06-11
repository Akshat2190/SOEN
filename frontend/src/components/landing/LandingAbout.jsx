import React from 'react'

const blocks = [
  {
    title: 'The Problem',
    body: 'Modern software teams are fragmented across tools — one app for chat, another for code review, a third for running and testing. Context switches between these tools slow teams down, fragment decisions, and make it hard to keep everyone on the same page. The moment a developer asks a question in Slack and the answer lives in a GitHub comment three PRs deep, productivity stalls.',
  },
  {
    title: 'The Solution',
    body: 'FLUX collapses the entire build loop into a single project room. Chat, code editing, AI assistance, and live code execution all happen in the same context, tied to the same project, visible to the whole team simultaneously. No tabs. No context switching. One room, one truth, one flow state for everyone working on a feature together.',
  },
  {
    title: 'Real-time by Design',
    body: 'FLUX is not a static editor with a chat tacked on. The entire architecture is event-driven from the ground up. Socket.IO powers every interaction — messages, file updates, collaborator presence, and AI replies all propagate instantly across every connected client without any polling or page refresh required.',
  },
  {
    title: 'AI as a Teammate',
    body: 'Invoking @ai in the project chat is not a side feature — it is a first-class primitive. Gemini reads the conversation context, generates syntactically correct code responses with Markdown and syntax highlighting, and posts the reply directly into the shared thread. Every teammate sees the answer. No copy-pasting from a private ChatGPT tab.',
  },
  {
    title: 'Browser-native Execution',
    body: 'WebContainer API brings a complete Node.js runtime into the browser without any server-side sandboxing infrastructure. FLUX uses this to let teams run, preview, and iterate on code entirely inside the browser tab — eliminating the "it works on my machine" problem at the collaboration layer before code even reaches a deployment pipeline.',
  },
  {
    title: 'Security First',
    body: 'Every API route is protected by JWT-based authentication middleware. Logged-out tokens are immediately blacklisted in Redis so they cannot be replayed — even if intercepted. Socket connections are validated against the same JWT on upgrade, meaning unauthenticated clients cannot join project rooms or receive any broadcast events.',
  },
]

const LandingAbout = () => (
  <section id="about" className="py-24" style={{ background: 'var(--canvas)' }}>
    <div className="max-w-[1200px] mx-auto px-8">
      <div className="text-center mb-12">
        <span className="block text-xs font-medium tracking-[1.5px] uppercase mb-4" style={{ color: 'var(--muted)' }}>About the project</span>
        <h2 style={{ fontFamily: "'Cormorant Garamond','Times New Roman',serif", fontSize: 'clamp(32px,4.5vw,48px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-1px', color: 'var(--ink)' }}>
          What is FLUX,<br />and why does it exist?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {blocks.map(b => (
          <div
            key={b.title}
            className="rounded-[12px] p-8 transition-all duration-200"
            style={{ background: 'var(--surface-card)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(20,20,19,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <h3 className="text-[18px] font-medium mb-3" style={{ color: 'var(--ink)', fontFamily: "'Inter',-apple-system,sans-serif" }}>{b.title}</h3>
            <p className="text-[16px] leading-[1.55]" style={{ color: 'var(--body)', fontFamily: "'Inter',-apple-system,sans-serif" }}>{b.body}</p>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div className="rounded-[12px] px-16 py-12 text-center" style={{ border: '1px solid var(--hairline)', background: 'var(--surface-soft)' }}>
        <blockquote>
          <p style={{ fontFamily: "'Cormorant Garamond','Times New Roman',serif", fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 400, lineHeight: 1.4, letterSpacing: '-0.3px', color: 'var(--ink)', marginBottom: '16px' }}>
            "The best tools don't just help you build things — they help you build things <em>together.</em>"
          </p>
          <cite style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: '12px', fontStyle: 'normal', color: 'var(--muted)', letterSpacing: '0.5px' }}>
            — The philosophy behind FLUX
          </cite>
        </blockquote>
      </div>
    </div>
  </section>
)

export default LandingAbout
