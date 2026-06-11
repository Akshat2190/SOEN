import React from 'react'

const frontendTech = [
  { name: 'React + Vite', desc: 'Fast, component-driven UI with HMR' },
  { name: 'React Router', desc: 'Client-side routing & auth guards' },
  { name: 'Socket.IO Client', desc: 'Real-time event subscription' },
  { name: 'WebContainer API', desc: 'In-browser Node.js runtime' },
  { name: 'Highlight.js', desc: 'Syntax highlighting for AI code responses' },
  { name: 'Tailwind CSS', desc: 'Utility-first UI styling' },
]

const backendTech = [
  { name: 'Node.js + Express', desc: 'REST API & HTTP server' },
  { name: 'MongoDB + Mongoose', desc: 'Flexible document-oriented database' },
  { name: 'JWT Auth', desc: 'Stateless session signing & verification' },
  { name: 'Redis', desc: 'Token blacklist for instant logout' },
  { name: 'Socket.IO', desc: 'WebSocket event bus for all rooms' },
  { name: 'Google Gemini AI', desc: '@ai chat assistant powering in-room replies' },
]

const codeLines = [
  { type: 'comment', text: '// When a message includes @ai, FLUX routes it to Gemini' },
  { type: 'normal', parts: [{ t: 'plain', v: 'socket.' }, { t: 'fn', v: 'on' }, { t: 'plain', v: '(' }, { t: 'string', v: '"project-message"' }, { t: 'plain', v: ', ' }, { t: 'keyword', v: 'async' }, { t: 'plain', v: ' (data) => {' }] },
  { type: 'normal', parts: [{ t: 'plain', v: '  io.to(data.projectId).' }, { t: 'fn', v: 'emit' }, { t: 'plain', v: '(' }, { t: 'string', v: '"project-message"' }, { t: 'plain', v: ', {' }] },
  { type: 'normal', parts: [{ t: 'plain', v: '    message: data.message,' }] },
  { type: 'normal', parts: [{ t: 'plain', v: '    sender: data.sender,' }] },
  { type: 'normal', parts: [{ t: 'plain', v: '  });' }] },
  { type: 'blank' },
  { type: 'normal', parts: [{ t: 'plain', v: '  ' }, { t: 'keyword', v: 'if' }, { t: 'plain', v: ' (data.message.' }, { t: 'fn', v: 'includes' }, { t: 'plain', v: '(' }, { t: 'string', v: '"@ai"' }, { t: 'plain', v: ')) {' }] },
  { type: 'normal', parts: [{ t: 'plain', v: '    ' }, { t: 'keyword', v: 'const' }, { t: 'plain', v: ' prompt = data.message.' }, { t: 'fn', v: 'replace' }, { t: 'plain', v: '(' }, { t: 'string', v: '"@ai"' }, { t: 'plain', v: ', ' }, { t: 'string', v: '""' }, { t: 'plain', v: ').' }, { t: 'fn', v: 'trim' }, { t: 'plain', v: '();' }] },
  { type: 'normal', parts: [{ t: 'plain', v: '    ' }, { t: 'keyword', v: 'const' }, { t: 'plain', v: ' aiReply = ' }, { t: 'keyword', v: 'await' }, { t: 'plain', v: ' aiService.' }, { t: 'fn', v: 'generateResult' }, { t: 'plain', v: '(prompt);' }] },
  { type: 'blank' },
  { type: 'normal', parts: [{ t: 'plain', v: '    io.to(data.projectId).' }, { t: 'fn', v: 'emit' }, { t: 'plain', v: '(' }, { t: 'string', v: '"project-message"' }, { t: 'plain', v: ', {' }] },
  { type: 'normal', parts: [{ t: 'plain', v: '      message: aiReply,' }] },
  { type: 'normal', parts: [{ t: 'plain', v: '      sender: { email: ' }, { t: 'string', v: '"FLUX · AI"' }, { t: 'plain', v: ' },' }] },
  { type: 'normal', parts: [{ t: 'plain', v: '    });' }] },
  { type: 'normal', parts: [{ t: 'plain', v: '  }' }] },
  { type: 'normal', parts: [{ t: 'plain', v: '});' }] },
]

const colorMap = { comment: '#6c7a89', keyword: '#c792ea', fn: '#82aaff', string: '#c3e88d', plain: 'var(--on-dark-soft)' }

const CodeLine = ({ line }) => {
  if (line.type === 'blank') return <br />
  if (line.type === 'comment') return <div style={{ color: colorMap.comment }}>{line.text}</div>
  return (
    <div>
      {line.parts.map((p, i) => (
        <span key={i} style={{ color: colorMap[p.t] || colorMap.plain }}>{p.v}</span>
      ))}
    </div>
  )
}

const LandingTechStack = () => (
  <section id="tech-stack" className="py-24" style={{ background: 'var(--canvas)' }}>
    <div className="max-w-[1200px] mx-auto px-8">
      <div className="text-center mb-12">
        <span className="block text-xs font-medium tracking-[1.5px] uppercase mb-4" style={{ color: 'var(--muted)' }}>Tech stack</span>
        <h2 style={{ fontFamily: "'Cormorant Garamond','Times New Roman',serif", fontSize: 'clamp(32px,4.5vw,48px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-1px', color: 'var(--ink)' }}>
          Built on a modern,<br />battle-tested foundation.
        </h2>
        <p className="text-[17px] mt-4 max-w-[560px] mx-auto leading-[1.6]" style={{ color: 'var(--muted)' }}>
          FLUX runs a MERN-style stack with WebContainers, real-time sockets, and Gemini AI — every layer chosen for developer speed and collaborative scale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {[{ label: 'Frontend', items: frontendTech }, { label: 'Backend', items: backendTech }].map(col => (
          <div key={col.label} className="rounded-[12px] overflow-hidden" style={{ background: 'var(--surface-card)' }}>
            <div className="px-8 py-5" style={{ borderBottom: '1px solid var(--hairline)' }}>
              <span className="text-xs font-medium tracking-[1.5px] uppercase" style={{ color: 'var(--primary)' }}>{col.label}</span>
            </div>
            <div className="px-8 pb-8 pt-4 flex flex-col gap-2">
              {col.items.map(item => (
                <div key={item.name} className="flex items-baseline justify-between px-4 py-3 rounded-[6px] border gap-4" style={{ background: 'var(--canvas)', borderColor: 'var(--hairline)' }}>
                  <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: '13px', fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{item.name}</span>
                  <span className="text-xs text-right" style={{ color: 'var(--muted)' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Code demo */}
      <div className="max-w-[800px] mx-auto">
        <div id="ai-demo-window" className="rounded-[16px] overflow-hidden" style={{ background: 'var(--surface-dark)', boxShadow: '0 8px 40px rgba(20,20,19,0.18)' }}>
          <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="ml-auto" style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: '12px', color: 'var(--on-dark-soft)' }}>server.js · @ai socket handler</span>
          </div>
          <div className="px-8 py-6 overflow-x-auto">
            <pre style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre' }}>
              {codeLines.map((line, i) => <CodeLine key={i} line={line} />)}
            </pre>
          </div>
          <div className="flex items-center gap-2 px-6 py-3" style={{ background: 'var(--surface-dark-el)' }}>
            <span className="w-[7px] h-[7px] rounded-full status-dot" style={{ background: 'var(--accent-teal)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: '11px', color: 'var(--on-dark-soft)' }}>Gemini AI · Connected · Ready</span>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default LandingTechStack
