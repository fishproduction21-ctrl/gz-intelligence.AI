'use client'

import { useEffect, useRef, useState } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

export default function TeresaPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour, je suis TERESA, votre assistante GZ Intelligence. Je peux vous aider à trouver un talent, identifier une maison horlogère, analyser un profil, construire un matching ou préparer un brief. Que souhaitez-vous faire aujourd’hui ?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voice, setVoice] = useState(false)
  const recognition = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const r = new SpeechRecognition()
      r.lang = 'fr-FR'
      r.interimResults = false
      r.onresult = (e: any) => { setInput(e.results?.[0]?.[0]?.transcript || ''); setVoice(false) }
      r.onerror = () => setVoice(false)
      r.onend = () => setVoice(false)
      recognition.current = r
    }
    return () => { try { recognition.current?.stop() } catch {} }
  }, [])

  function toggleVoice() {
    if (!recognition.current) { alert('La reconnaissance vocale n’est pas disponible sur ce navigateur.'); return }
    if (voice) { recognition.current.stop(); setVoice(false) }
    else { setVoice(true); recognition.current.start() }
  }

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim()
    if (!text || loading) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next); setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/gz-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) })
      if (!res.ok || !res.body) throw new Error('TERESA indisponible')
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let answer = ''
      setMessages([...next, { role: 'assistant', content: '' }])
      while (true) { const { value, done } = await reader.read(); if (done) break; answer += decoder.decode(value, { stream: true }); setMessages([...next, { role: 'assistant', content: answer }]) }
    } catch { setMessages([...next, { role: 'assistant', content: 'Je rencontre un problème de connexion temporaire. Vérifie ta connexion puis réessaie.' }]) }
    finally { setLoading(false) }
  }

  return <main style={{ minHeight: '100dvh', background: 'radial-gradient(circle at 50% 0%, #211044 0%, #08080b 42%)', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
    <header style={{ padding: '22px clamp(18px,4vw,48px)', borderBottom: '1px solid #29252f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div><div style={{ fontSize: 12, letterSpacing: 4, opacity: .55 }}>GZ INTELLIGENCE</div><h1 style={{ margin: '5px 0 0', fontSize: 30 }}>TERESA</h1></div>
      <div style={{ fontSize: 13, opacity: .6 }}>Votre assistante intelligente</div>
    </header>

    {voice ? <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: 30 }}>
      <div style={{ width: 190, height: 190, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 0 25px rgba(124,58,237,.12), 0 0 90px rgba(124,58,237,.5)', display: 'grid', placeItems: 'center', fontSize: 46, fontWeight: 800 }}>T</div>
      <div style={{ textAlign: 'center' }}><h2 style={{ fontSize: 32, margin: 0 }}>{voice ? 'TERESA vous écoute' : 'TERESA'}</h2><p style={{ opacity: .6 }}>Parlez naturellement. Je vous écoute.</p></div>
      <button onClick={toggleVoice} style={{ border: '1px solid #4a4056', background: '#17131d', color: '#fff', borderRadius: 999, padding: '15px 28px', fontWeight: 700 }}>Arrêter le mode vocal</button>
    </section> : <>
      <section style={{ flex: 1, width: 'min(980px, 100%)', margin: '0 auto', padding: '28px clamp(18px,4vw,40px)', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
        {messages.map((m, i) => <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: 'min(760px, 88%)', padding: '16px 18px', borderRadius: 20, background: m.role === 'user' ? '#7c3aed' : '#17171d', border: m.role === 'assistant' ? '1px solid #29252f' : 'none', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{m.content || 'TERESA réfléchit…'}</div>)}
      </section>
      <form onSubmit={e => { e.preventDefault(); send() }} style={{ width: 'min(980px, 100%)', margin: '0 auto', padding: '16px clamp(18px,4vw,40px) 28px', display: 'flex', gap: 10 }}>
        <button type="button" onClick={toggleVoice} aria-label="Parler à TERESA" style={{ width: 54, height: 54, borderRadius: 16, border: '1px solid #38313f', background: voice ? '#7c3aed' : '#121218', color: '#fff', fontSize: 22 }}>🎙️</button>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Parlez à TERESA…" disabled={loading} style={{ flex: 1, border: '1px solid #38313f', background: '#121218', color: '#fff', borderRadius: 16, padding: '15px 17px', outline: 'none' }} />
        <button type="submit" disabled={loading || !input.trim()} style={{ border: 0, borderRadius: 16, padding: '0 22px', background: '#7c3aed', color: '#fff', fontWeight: 800 }}>{loading ? '…' : 'Envoyer'}</button>
      </form>
    </>}
  </main>
}
