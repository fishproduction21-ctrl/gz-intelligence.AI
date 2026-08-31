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
  const [email, setEmail] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('email');
    if (value) setEmail(value.toLowerCase());
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    const normalized = email.trim().toLowerCase();
    if (!INVITED.includes(normalized)) {
      setError('Cette adresse ne possède pas d’invitation GZ.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setBusy(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: normalized,
      password,
      options: { data: { first_name: first.trim(), last_name: last.trim(), role: 'associate', workspace: 'GZ Intelligence' } },
    });
    if (authError) setError(authError.message);
    else if (data.session) window.location.href = '/';
    else setMessage('Votre accès est créé. Vérifiez votre e-mail pour confirmer votre adresse, puis connectez-vous à GZ Intelligence.');
    setBusy(false);
  }

  return (
    <main className="gz-access">
      <div className="gz-access-orb one" /><div className="gz-access-orb two" /><div className="gz-access-grid" />
      <section className="gz-access-shell">
        <aside className="gz-access-identity">
          <div className="gz-access-brand"><div className="gz-access-mark">GZ</div><div><strong>GZ</strong><span>AGENCY</span></div></div>
          <div className="gz-access-identity-main">
            <p className="gz-access-kicker">PRIVATE ACCESS</p>
            <h1>L’univers<br /><em>GZ.</em></h1>
            <p>Une invitation personnelle à rejoindre GZ Intelligence — horlogerie, talents, influence et matching.</p>
          </div>
          <div className="gz-access-seal"><div className="gz-access-lock">⌁</div><div><strong>ACCÈS RÉSERVÉ</strong><span>Invitation associée · GZ Agency</span></div></div>
          <div className="gz-access-trust"><span>◈<small>SÉCURISÉ</small></span><span>◇<small>CONFIDENTIEL</small></span><span>♔<small>PRESTIGE</small></span></div>
        </aside>
        <section className="gz-access-panel">
          <div className="gz-access-panel-top"><span>INVITATION ASSOCIÉ GZ</span><span className="gz-access-dot">●</span></div>
          <div className="gz-access-icon">⌁</div>
          <p className="gz-access-panel-kicker">BIENVENUE DANS</p>
          <h2>L’espace <em>Associé.</em></h2>
          <p className="gz-access-sub">Votre invitation est personnelle. Définissez vos identifiants pour activer votre accès privé.</p>
          <form onSubmit={submit}>
            <div className="gz-access-row">
              <label>Prénom<input required value={first} onChange={e => setFirst(e.target.value)} placeholder="Votre prénom" autoComplete="given-name" /></label>
              <label>Nom<input required value={last} onChange={e => setLast(e.target.value)} placeholder="Votre nom" autoComplete="family-name" /></label>
            </div>
            <label>Adresse e-mail<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="prenom@domaine.com" autoComplete="email" /></label>
            <label>Créer votre mot de passe<input required type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="8 caractères minimum" autoComplete="new-password" /></label>
            <label>Confirmer votre mot de passe<input required type="password" minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirmez votre mot de passe" autoComplete="new-password" /></label>
            <div className="gz-access-rules"><span>✓ 8 caractères minimum</span><span>✓ Accès personnel et confidentiel</span></div>
            <button disabled={busy}>{busy ? 'Activation de votre accès…' : 'ACTIVER MON ACCÈS  →'}</button>
          </form>
          {error && <p className="gz-access-error">{error}</p>}{message && <p className="gz-access-success">{message}</p>}
          <div className="gz-access-secure">⌁ &nbsp; ACCÈS 100% SÉCURISÉ</div>
        </section>
      </section>
      <footer className="gz-access-footer"><strong>GZ</strong><span>INTELLIGENCE · INFLUENCE · EXCELLENCE</span><i>PARIS</i></footer>
    </main>
  );
}
