'use client';

import './access.css';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lzuyaaxmjnklhjutxbio.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable__WZhhkjiKnCqmqspjL5tbQ_9o1fHoC8',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

const INVITED = ['so.lene1517@gmail.com', 'geogermain@hotmail.fr'];

export default function AssociateAccess() {
  const [email, setEmail] = useState(''); const [first, setFirst] = useState(''); const [last, setLast] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { const value = new URLSearchParams(window.location.search).get('email'); if (value) setEmail(value.toLowerCase()); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setMessage(''); const normalized = email.trim().toLowerCase();
    if (!INVITED.includes(normalized)) { setError('Cette adresse ne possède pas d’invitation GZ.'); return; }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    setBusy(true);
    const { data, error: authError } = await supabase.auth.signUp({ email: normalized, password, options: { data: { first_name: first.trim(), last_name: last.trim(), role: 'associate', workspace: 'GZ Intelligence' } } });
    if (authError) setError(authError.message); else if (data.session) window.location.href = '/'; else setMessage('Votre accès est créé. Vérifiez votre e-mail pour confirmer votre adresse, puis connectez-vous à GZ Intelligence.');
    setBusy(false);
  }
  return <main className="gz-access"><div className="gz-access-orb one"/><div className="gz-access-orb two"/><section className="gz-access-card">
    <div className="gz-access-brand"><div className="gz-access-mark">GZ</div><div><strong>GZ</strong><span>INTELLIGENCE</span></div></div>
    <p className="gz-access-kicker">PRIVATE ACCESS · GZ AGENCY</p><h1>Bienvenue dans<br/><em>l’espace Associé.</em></h1><p className="gz-access-sub">Un accès privé à l’intelligence GZ — horlogerie, talents et matching.</p>
    <form onSubmit={submit}><label>Prénom<input required value={first} onChange={e=>setFirst(e.target.value)} placeholder="Votre prénom"/></label><label>Nom<input required value={last} onChange={e=>setLast(e.target.value)} placeholder="Votre nom"/></label><label>Adresse e-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="prenom@domaine.com"/></label><label>Créer votre mot de passe<input required type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="8 caractères minimum"/></label><button disabled={busy}>{busy ? 'Création de votre accès…' : 'Activer mon accès GZ  →'}</button></form>
    {error && <p className="gz-access-error">{error}</p>}{message && <p className="gz-access-success">{message}</p>}<div className="gz-access-foot"><span>GZ AGENCY</span><span>CONFIDENTIAL · ASSOCIÉ</span></div>
  </section></main>;
}
