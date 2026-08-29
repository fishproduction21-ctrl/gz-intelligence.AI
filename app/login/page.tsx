'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');

    if (!supabaseUrl || !supabaseKey) {
      setError('La configuration de connexion est indisponible.');
      setBusy(false);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Email ou mot de passe incorrect.');
    else router.replace('/');
    setBusy(false);
  }

  return (
    <main className="auth-shell spotify-auth">
      <div className="auth-glow" />
      <section className="auth-card">
        <div className="gz-mark">GZ</div>
        <div className="logo auth-logo">GZ<span>INTELLIGENCE</span></div>
        <p className="eyebrow">PRIVATE WORKSPACE · GZ AGENCY</p>
        <h1>Bienvenue.</h1>
        <p className="sub">Connecte-toi pour accéder à la base talents, aux maisons horlogères et au matching GZ.</p>
        <form onSubmit={submit} className="auth-form">
          <label>Email professionnel<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@agence.com" /></label>
          <label>Mot de passe<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
          <button className="primary auth-submit" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
        </form>
        {error && <p className="error auth-error">{error}</p>}
        <div className="divider"><span>ACCÈS PRIVÉ</span></div>
        <p className="access-note">Les comptes sont créés par GZ. Il n’y a pas d’inscription publique.</p>
      </section>
    </main>
  );
}
