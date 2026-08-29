'use client';
import { useEffect, useState } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type Msg = { role: 'user' | 'assistant'; content: string };

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function GzAI() {
  const [open, setOpen] = useState(false), [input, setInput] = useState(''), [busy, setBusy] = useState(false), [messages, setMessages] = useState<Msg[]>([]), [name, setName] = useState('');
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setName(String(data.user?.user_metadata?.first_name || '').trim()));
  }, []);
  async function send() {
    const text = input.trim(); if (!text || busy) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }]; setMessages(next); setInput(''); setBusy(true);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase configuration missing');
      const { data } = await supabase.auth.getSession();
      const r = await fetch('/api/gz-ai', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token || ''}` }, body: JSON.stringify({ messages: next }) });
      const json = await r.json(); setMessages([...next, { role: 'assistant', content: json.text || json.error || 'Je rencontre un problème temporaire.' }]);
    } catch { setMessages([...next, { role: 'assistant', content: 'Je rencontre un problème de connexion. Réessaie dans un instant.' }]); }
    finally { setBusy(false); }
  }
  function key(e: React.KeyboardEvent<HTMLInputElement>) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }
  return <>
    <button className="gz-ai-fab" onClick={() => setOpen(v => !v)} aria-label="Ouvrir GZ AI"><span>GZ</span><i>AI</i></button>
    {open && <section className="gz-ai-panel" aria-label="GZ AI">
      <header><div><small>GZ INTELLIGENCE</small><h2>Assistant stratégique</h2><p>{name ? `Ravi de vous retrouver, ${name}.` : 'Votre espace de réflexion GZ.'}</p></div><button onClick={() => setOpen(false)}>×</button></header>
      <div className="gz-ai-messages">{!messages.length && <div className="gz-ai-welcome"><strong>Que veux-tu travailler ?</strong><p>Matching, maison horlogère, artiste, brief, stratégie, actualité ou négociation.</p><div className="gz-ai-suggestions"><button onClick={() => setInput('Quelle maison horlogère correspond le mieux à un artiste que je te donne ?')}>Matching</button><button onClick={() => setInput('Analyse-moi ce brief et propose une stratégie GZ.')}>Brief</button><button onClick={() => setInput('Donne-moi les maisons les plus pertinentes pour la culture urbaine.')}>Maisons</button></div></div>}{messages.map((m,i)=><div className={`gz-ai-msg ${m.role}`} key={i}><span>{m.role === 'assistant' ? 'GZ' : 'MOI'}</span><p>{m.content}</p></div>)}{busy && <div className="gz-ai-msg assistant"><span>GZ</span><p className="typing">GZ réfléchit<span>.</span><span>.</span><span>.</span></p></div>}</div>
      <div className="gz-ai-input"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={key} placeholder="Parle à GZ…" disabled={busy}/><button onClick={send} disabled={busy || !input.trim()}>↑</button></div>
    </section>}
  </>;
}
