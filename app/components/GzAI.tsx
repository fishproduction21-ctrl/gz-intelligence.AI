'use client';
import { useEffect, useState } from 'react';
import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';

type Msg = { role: 'user' | 'assistant'; content: string };

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}

export default function GzAI() {
  const [open, setOpen] = useState(false), [input, setInput] = useState(''), [busy, setBusy] = useState(false), [messages, setMessages] = useState<Msg[]>([]), [name, setName] = useState(''), [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setName(String(data.session?.user?.user_metadata?.first_name || '').trim());
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setName(String(next?.user?.user_metadata?.first_name || '').trim());
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function send() {
    const text = input.trim(); if (!text || busy) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }]; setMessages(next); setInput(''); setBusy(true);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('CONFIG');
      let current = session;
      if (!current) {
        const refreshed = await supabase.auth.refreshSession();
        current = refreshed.data.session;
        if (!current) {
          const latest = await supabase.auth.getSession();
          current = latest.data.session;
        }
        setSession(current);
      }
      if (!current?.access_token) {
        setMessages([...next, { role: 'assistant', content: 'Ta session GZ a expiré. Reconnecte-toi puis réessaie.' }]);
        return;
      }
      let r = await fetch('/api/gz-ai', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${current.access_token}` }, body: JSON.stringify({ messages: next }) });
      if (r.status === 401) {
        const refreshed = await supabase.auth.refreshSession();
        const retry = refreshed.data.session;
        if (retry?.access_token) {
          setSession(retry);
          r = await fetch('/api/gz-ai', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${retry.access_token}` }, body: JSON.stringify({ messages: next }) });
        }
      }
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json?.error || `HTTP ${r.status}`);
      setMessages([...next, { role: 'assistant', content: json.text || 'Je n’ai pas pu générer de réponse.' }]);
    } catch (error) {
      console.error('GZ AI client error', error);
      setMessages([...next, { role: 'assistant', content: 'GZ AI est momentanément indisponible. Vérifie ta connexion puis réessaie.' }]);
    } finally { setBusy(false); }
  }

  function key(e: React.KeyboardEvent<HTMLInputElement>) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }

  return <>
    <button className="gz-ai-fab" onClick={() => setOpen(true)} aria-label="Ouvrir GZ AI"><span>GZ</span><i>AI</i></button>
    {open && <section className="gz-ai-panel gz-ai-fullscreen" aria-label="GZ AI">
      <header><div><small>GZ INTELLIGENCE</small><h2>Assistant stratégique</h2><p>{name ? `Ravi de vous retrouver, ${name}.` : 'Votre espace de réflexion GZ.'}</p></div><button onClick={() => setOpen(false)} aria-label="Fermer GZ AI">×</button></header>
      <div className="gz-ai-messages">{!messages.length && <div className="gz-ai-welcome"><strong>Que veux-tu travailler ?</strong><p>Matching, maison horlogère, artiste, brief, stratégie, actualité ou négociation.</p><div className="gz-ai-suggestions"><button onClick={() => setInput('Quelle maison horlogère correspond le mieux à un artiste que je te donne ?')}>Matching</button><button onClick={() => setInput('Analyse-moi ce brief et propose une stratégie GZ.')}>Brief</button><button onClick={() => setInput('Donne-moi les maisons les plus pertinentes pour la culture urbaine.')}>Maisons</button></div></div>}{messages.map((m,i)=><div className={`gz-ai-msg ${m.role}`} key={i}><span>{m.role === 'assistant' ? 'GZ' : 'MOI'}</span><p>{m.content}</p></div>)}{busy && <div className="gz-ai-msg assistant"><span>GZ</span><p className="typing">GZ réfléchit<span>.</span><span>.</span><span>.</span></p></div>}</div>
      <div className="gz-ai-input"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={key} placeholder={session ? 'Parle à GZ…' : 'Connexion GZ requise…'} disabled={busy || !session}/><button onClick={send} disabled={busy || !input.trim() || !session}>↑</button></div>
    </section>}
  </>;
}
