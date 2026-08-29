'use client'

import { useState } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

export default function GZAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour. Je suis GZ Intelligence. Pose-moi une question sur un artiste, une maison, un matching ou un brief.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/gz-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      if (!res.ok || !res.body) throw new Error('GZ indisponible')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let answer = ''
      setMessages([...next, { role: 'assistant', content: '' }])
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        answer += decoder.decode(value, { stream: true })
        setMessages([...next, { role: 'assistant', content: answer }])
      }
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Je rencontre un problème temporaire. Réessaie dans un instant.' }])
    } finally { setLoading(false) }
  }

  return <main style={{ minHeight: '100vh', background: '#08080b', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', padding: 24 }}>
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 48px)' }}>
      <header style={{ padding: '18px 0 28px', borderBottom: '1px solid #24242b' }}>
        <div style={{ fontSize: 13, letterSpacing: 3, opacity: .6 }}>GZ AGENCY · INTELLIGENCE</div>
        <h1 style={{ fontSize: 38, margin: '8px 0 4px' }}>GZ AI</h1>
        <p style={{ margin: 0, opacity: .65 }}>Assistant stratégique en temps réel</p>
      </header>
      <section style={{ flex: 1, padding: '28px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m, i) => <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%', padding: '14px 17px', borderRadius: 18, background: m.role === 'user' ? '#7c3aed' : '#17171d', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{m.content || 'GZ réfléchit…'}</div>)}
      </section>
      <form onSubmit={e => { e.preventDefault(); send() }} style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #24242b' }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Demande quelque chose à GZ…" disabled={loading} style={{ flex: 1, border: '1px solid #303039', background: '#121218', color: '#fff', borderRadius: 14, padding: '15px 17px', outline: 'none' }} />
        <button type="submit" disabled={loading || !input.trim()} style={{ border: 0, borderRadius: 14, padding: '0 22px', background: '#7c3aed', color: '#fff', fontWeight: 700 }}>{loading ? '…' : 'Envoyer'}</button>
      </form>
    </div>
  </main>
}
