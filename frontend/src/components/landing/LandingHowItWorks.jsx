import React from 'react'

const steps = [
  { id: 'step-1', num: '01', title: 'Create a Project Room', body: 'Sign up, create a project, and get a dedicated room instantly. Your workspace is live the moment you hit create — no config files, no CLI setup.' },
  { id: 'step-2', num: '02', title: 'Invite Your Team', body: 'Add collaborators by username. They join the room in real time over Socket.IO — every message, file change, and AI reply is broadcast to everyone immediately.' },
  { id: 'step-3', num: '03', title: 'Code, Chat & Ask AI', body: 'Edit files in the shared editor, discuss in the live chat, and ask Gemini anything with @ai. AI responses land right in the chat thread for everyone to see and build on.' },
  { id: 'step-4', num: '04', title: 'Run It in the Browser', body: 'WebContainer spins up a full Node.js runtime inside the browser tab. Preview your app, run scripts, and see output — without touching your local machine.' },
]

const LandingHowItWorks = () => (
  <section id="how-it-works" className="py-24" style={{ background: 'var(--surface-dark)' }}>
    <div className="max-w-[1200px] mx-auto px-8">
      <div className="text-center mb-12">
        <span className="block text-xs font-medium tracking-[1.5px] uppercase mb-4" style={{ color: 'var(--on-dark-soft)' }}>How FLUX works</span>
        <h2 style={{ fontFamily: "'Cormorant Garamond','Times New Roman',serif", fontSize: 'clamp(32px,4.5vw,48px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-1px', color: 'var(--on-dark)' }}>
          From room to running code<br />in minutes.
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map(s => (
          <div
            key={s.id} id={s.id}
            className="p-8 rounded-[12px] transition-all duration-200"
            style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          >
            <div className="mb-6" style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: '36px', fontWeight: 500, color: 'var(--primary)', lineHeight: 1, opacity: 0.7 }}>{s.num}</div>
            <h3 className="text-[18px] font-medium mb-3" style={{ color: 'var(--on-dark)', fontFamily: "'Inter',-apple-system,sans-serif" }}>{s.title}</h3>
            <p className="text-[16px] leading-[1.55]" style={{ color: 'var(--on-dark-soft)', fontFamily: "'Inter',-apple-system,sans-serif" }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default LandingHowItWorks
