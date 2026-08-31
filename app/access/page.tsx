'use client';

import './access.css';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lzuyaaxmjnklhjutxbio.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable__WZhhkjiKnCqmqspjL5tbQ_9o1fHo8C8',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

export default function PrivateAccess() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/';
    });
    const value = new URLSearchParams(window.location.search).get('email');
    if (value) setEmail(value.toLowerCase());
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (authError) setError('Email ou mot de passe incorrect.');
    else if (data.session) window.location.href = '/';
    setBusy(false);
  }

  return (
    <main className="gz-access">
      <div className="gz-access-orb one" />
      <div className="gz-access-orb two" />
      <div className="gz-access-grid" />
      <section className="gz-access-shell">
        <aside className="gz-access-identity">
          <div className="gz-access-brand">
            <div className="gz-access-mark">GZ</div>
            <div><strong>GZ</strong><span>INTELLIGENCE</span></div>
          </div>
          <div className="gz-access-identity-main">
            <p className="gz-access-kicker">PRIVATE ACCESS · GZ AGENCY</p>
            <h1>L’espace<br /><em>Private.</em></h1>
            <p>Bienvenue dans l’accueil client GZ Intelligence — horlogerie, talents, influence et matching réunis dans un espace confidentiel.</p>
          </div>
          <div className="gz-access-seal">
            <div className="gz-access-lock">⌁</div>
            <div><strong>ACCÈS RÉSERVÉ</strong><span>Espace client · GZ Agency</span></div>
          </div>
          <div className="gz-access-trust">
            <span>◈<small>SÉCURISÉ</small></span>
            <span>◇<small>CONFIDENTIEL</small></span>
            <span>♔<small>GZ PRIVATE</small></span>
          </div>
        </aside>
        <section className="gz-access-panel">
          <div className="gz-access-panel-top"><span>GZ CLIENT · PRIVATE WORKSPACE</span><span className="gz-access-dot">●</span></div>
          <div className="gz-access-icon">⌁</div>
          <p className="gz-access-panel-kicker">BIENVENUE DANS</p>
          <h2>Votre espace <em>GZ.</em></h2>
          <p className="gz-access-sub">Connectez-vous pour accéder à votre environnement privé GZ Intelligence.</p>
          <form onSubmit={submit}>
            <label>Adresse e-mail<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="prenom@domaine.com" autoComplete="email" /></label>
            <label>Mot de passe<input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" /></label>
            <button disabled={busy}>{busy ? 'CONNEXION…' : 'ACCÉDER À GZ  →'}</button>
          </form>
          {error && <p className="gz-access-error">{error}</p>}
          <div className="gz-access-secure">⌁ &nbsp; ACCÈS CLIENT 100% SÉCURISÉ</div>
        </section>
      </section>
      <footer className="gz-access-footer"><strong>GZ</strong><span>INTELLIGENCE · INFLUENCE · EXCELLENCE</span><i>PARIS</i></footer>
    </main>
  );
}
