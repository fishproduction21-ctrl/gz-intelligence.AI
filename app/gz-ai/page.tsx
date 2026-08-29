'use client'

import { useState } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

export default function GZAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Je suis GZ AI. Pose-moi une question sur un artiste, une maison, un brief ou ta stratégie.' },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setBusy(true)
    try {
      const res = await fetch('/api/gz-chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      if (!res.ok || !res.body) throw new Error('chat')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let answer = ''
      setMessages((m) => [...m, { role: 'assistant', content: '' }])
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        answer += chunk
        setMessages((m) => [...m.slice(0, -1), { role: 'assistant', content: answer }])
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Je rencontre un problème de connexion. Réessaie dans un instant.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#08070b', color: '#fff', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: '#9b6cff', letterSpacing: '.18em', fontSize: 12, fontWeight: 700 }}>GZ INTELLIGENCE · AI</div>
          <h1 style={{ fontSize: 42, margin: '8px 0' }}>GZ AI</h1>
          <p style={{ color: '#aaa' }}>Ton assistant stratégique en temps réel.</p>
        </div>
        <section style={{ background: '#111016', border: '1px solid #27232f', borderRadius: 24, padding: 18, minHeight: 520, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', padding: 8 }}>
            {messages.map((m, i) => <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%', background: m.role === 'user' ? '#6d42d9' : '#1b1921', borderRadius: 18, padding: '12px 15px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.content || 'GZ réfléchit…'}</div>)}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }} placeholder="Demande quelque chose à GZ…" disabled={busy} style={{ flex: 1, borderRadius: 14, border: '1px solid #332d3e', background: '#0c0b10', color: '#fff', padding: '14px 16px', outline: 'none' }} />
            <button onClick={send} disabled={busy || !input.trim()} style={{ border: 0, borderRadius: 14, padding: '0 22px', background: '#7c4dff', color: '#fff', fontWeight: 700 }}>{busy ? '…' : 'Envoyer'}</button>
          </div>
        </section>
      </div>
    </main>
  )
}
