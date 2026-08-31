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
    setBusy(true); setError('');
    if (!supabaseUrl || !supabaseKey) { setError('La configuration de connexion est indisponible.'); setBusy(false); return; }
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Email ou mot de passe incorrect.'); else router.replace('/');
    setBusy(false);
  }

  return (
    <main className="gz-login">
      <div className="gz-login-ambient gz-login-ambient-a" /><div className="gz-login-ambient gz-login-ambient-b" />
      <header className="gz-login-top"><div className="gz-login-brand"><b>GZ</b><span>INTELLIGENCE</span></div><button className="gz-lang">FR <span>⌄</span></button></header>
      <section className="gz-login-hero"><h2>L’INTELLIGENCE AU SERVICE DE L’EXCELLENCE.</h2><p>Accède à ton univers GZ Intelligence</p></section>
      <section className="gz-login-panel">
        <div className="gz-login-benefits">
          <Benefit icon="◆" title="EXCLUSIF" text="Un accès réservé aux professionnels de confiance." />
          <Benefit icon="♙" title="SÉCURISÉ" text="Vos données sont protégées avec les standards les plus élevés." />
          <Benefit icon="♙" title="PROFESSIONNEL" text="Rejoins un réseau d’experts et d’associés sélectionnés." />
          <Benefit icon="▥" title="STRATÉGIQUE" text="Accède à des analyses avancées et des insights uniques." />
        </div>
        <div className="gz-login-divider" />
        <div className="gz-login-form-wrap">
          <div className="gz-login-round">GZ</div>
          <div className="gz-login-wordmark">GZ <span>INTELLIGENCE</span></div>
          <h1>Connexion</h1><p className="gz-login-sub">Accède à ton univers GZ Intelligence</p>
          <form onSubmit={submit}>
            <label>Email ou nom d’utilisateur<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="exemple@domaine.com" /></label>
            <label>Mot de passe<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" /></label>
            <div className="gz-login-options"><label className="remember"><input type="checkbox" defaultChecked /> <span>Se souvenir de moi</span></label><button type="button" onClick={() => setError('Utilise ton adresse e-mail professionnelle pour demander la réinitialisation du mot de passe.')} className="forgot">Mot de passe oublié ?</button></div>
            <button className="gz-login-submit" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'} <span>→</span></button>
          </form>
          {error && <p className="gz-login-error">{error}</p>}
          <div className="gz-or"><i /> OU <i /></div>
          <button type="button" className="gz-apple" onClick={() => setError('La connexion Apple sera activée dès que le fournisseur Apple sera configuré dans Supabase.')}>● <span>Continuer avec Apple</span></button>
          <p className="gz-request">Pas encore de compte ? <button type="button" onClick={() => router.push('/access')}>Demande d’accès</button></p>
        </div>
      </section>
      <section className="gz-login-steps"><h3>ACCÈS RÉSERVÉ AUX PROFESSIONNELS</h3><div className="gz-step-grid"><Step n="1" icon="♙+" title="DEMANDE D’ACCÈS" text="Inscris-toi en quelques secondes." /><Step n="2" icon="◇" title="VALIDATION" text="Notre équipe vérifie ton profil." /><Step n="3" icon="✉" title="CONFIRMATION" text="Reçois la confirmation par email." /><Step n="4" icon="♙" title="ACCÈS APPROUVÉ" text="Accède à tout l’univers GZ Intelligence." /></div></section>
      <footer className="gz-login-footer">♙ &nbsp; CONFIDENTIALITÉ TOTALE &nbsp;&nbsp; • &nbsp;&nbsp; Aucune donnée n’est partagée &nbsp;&nbsp; • &nbsp;&nbsp; Conforme RGPD</footer>
      <style jsx global>{`body{margin:0}.gz-login{min-height:100dvh;box-sizing:border-box;overflow-x:hidden;background:#05030b;color:#fff;font-family:Inter,ui-sans-serif,system-ui,sans-serif;padding:34px clamp(18px,5vw,72px) 26px;position:relative}.gz-login-ambient{position:absolute;border-radius:50%;filter:blur(1px);pointer-events:none}.gz-login-ambient-a{width:520px;height:520px;left:-260px;top:-260px;border:1px solid rgba(168,85,247,.45);box-shadow:0 0 90px rgba(124,58,237,.15)}.gz-login-ambient-b{width:600px;height:600px;right:-340px;top:-270px;border:1px solid rgba(168,85,247,.3)}.gz-login-top{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;max-width:1280px;margin:auto}.gz-login-brand{display:flex;align-items:baseline;gap:13px}.gz-login-brand b{font-size:34px;letter-spacing:-2px;background:linear-gradient(135deg,#fff,#a855f7);-webkit-background-clip:text;color:transparent}.gz-login-brand span{font-size:15px;letter-spacing:6px;color:#e8e2ef}.gz-lang{background:rgba(18,11,32,.6);border:1px solid rgba(168,85,247,.4);color:#fff;border-radius:12px;padding:11px 14px;font-weight:700}.gz-lang span{color:#c084fc;margin-left:5px}.gz-login-hero{position:relative;text-align:center;margin:34px auto 30px;max-width:850px}.gz-login-hero h2{font-size:clamp(19px,2.4vw,29px);font-weight:500;letter-spacing:.5px;margin:0}.gz-login-hero p{margin:10px 0 0;color:#c084fc;font-size:17px}.gz-login-panel{position:relative;max-width:1160px;margin:auto;display:grid;grid-template-columns:.78fr 1.22fr;gap:34px;padding:40px;border:1px solid rgba(192,132,252,.55);border-radius:28px;background:linear-gradient(120deg,rgba(35,16,62,.62),rgba(9,7,17,.86));box-shadow:0 0 80px rgba(124,58,237,.16),inset 0 0 70px rgba(168,85,247,.035);backdrop-filter:blur(18px)}.gz-login-benefits{display:flex;flex-direction:column;gap:16px;justify-content:center}.gz-benefit{display:flex;gap:16px;align-items:flex-start;padding:20px;border:1px solid rgba(168,85,247,.27);border-radius:18px;background:rgba(15,10,25,.45)}.gz-benefit-icon{width:50px;height:50px;flex:none;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#6d28d9,#180b2b);border:1px solid rgba(192,132,252,.35);color:#d8b4fe;font-size:22px}.gz-benefit h4{margin:0 0 6px;color:#c084fc;font-size:14px;letter-spacing:.4px}.gz-benefit p{margin:0;color:#c9c3d0;line-height:1.5;font-size:13px}.gz-login-divider{width:1px;background:linear-gradient(transparent,rgba(192,132,252,.5),transparent)}.gz-login-form-wrap{max-width:590px;width:100%;justify-self:center}.gz-login-round{width:72px;height:72px;margin:0 auto 12px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 25%,#d8b4fe,#6d28d9 68%,#24093f);border:1px solid #c084fc;box-shadow:0 0 35px rgba(168,85,247,.4);font-size:27px;font-weight:900}.gz-login-wordmark{text-align:center;color:#c084fc;letter-spacing:4px;font-size:11px}.gz-login-wordmark span{color:#fff;margin-left:7px}.gz-login-form-wrap h1{text-align:center;font-size:34px;margin:16px 0 6px}.gz-login-sub{text-align:center;color:#b7afbf;margin:0 0 28px}.gz-login-form-wrap form{display:flex;flex-direction:column;gap:17px}.gz-login-form-wrap form>label{display:flex;flex-direction:column;gap:8px;font-size:14px;font-weight:600}.gz-login-form-wrap input[type=email],.gz-login-form-wrap input[type=password]{height:58px;box-sizing:border-box;border-radius:14px;border:1px solid rgba(156,123,183,.38);background:rgba(7,6,13,.68);color:#fff;padding:0 17px;font-size:15px;outline:none}.gz-login-form-wrap input[type=email]:focus,.gz-login-form-wrap input[type=password]:focus{border-color:#a855f7;box-shadow:0 0 0 3px rgba(168,85,247,.1)}.gz-login-options{display:flex;justify-content:space-between;align-items:center;font-size:12px}.remember{display:flex!important;flex-direction:row!important;align-items:center!important;gap:7px!important;font-weight:500!important}.remember input{accent-color:#8b5cf6}.forgot{border:0;background:none;color:#c084fc;cursor:pointer}.gz-login-submit{height:58px;border:0;border-radius:14px;background:linear-gradient(100deg,#9333ea,#6d28d9);color:#fff;font-weight:800;font-size:16px;box-shadow:0 10px 32px rgba(124,58,237,.3);cursor:pointer}.gz-login-submit span{float:right;margin-right:17px;font-size:23px}.gz-login-submit:disabled{opacity:.55}.gz-login-error{text-align:center;color:#fda4af;font-size:13px}.gz-or{display:flex;align-items:center;gap:14px;justify-content:center;color:#8f8998;font-size:12px;margin:20px 0}.gz-or i{height:1px;background:#30283a;flex:1}.gz-apple{height:54px;width:100%;border:1px solid #3c3345;border-radius:14px;background:#0d0b12;color:#fff;font-size:15px;cursor:pointer}.gz-request{text-align:center;color:#8f8998;font-size:13px;margin:22px 0 0}.gz-request button{border:0;background:none;color:#c084fc;font-weight:700;cursor:pointer}.gz-login-steps{position:relative;max-width:1160px;margin:22px auto 0;padding:25px 35px;border:1px solid rgba(168,85,247,.32);border-radius:24px;background:rgba(14,10,24,.7)}.gz-login-steps h3{text-align:center;color:#c084fc;font-size:15px;letter-spacing:1px;margin:0 0 24px}.gz-step-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}.gz-step{text-align:center;position:relative}.gz-step-icon{width:52px;height:52px;margin:auto;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(192,132,252,.45);background:#160b28;color:#d8b4fe;font-size:18px}.gz-step strong{display:block;font-size:11px;margin:10px 0 6px}.gz-step p{margin:0;color:#aaa1b1;font-size:11px;line-height:1.4}.gz-login-footer{text-align:center;color:#8d8695;font-size:11px;letter-spacing:.2px;margin:22px 0 0}@media(max-width:800px){.gz-login{padding:22px 14px}.gz-login-brand b{font-size:28px}.gz-login-brand span{font-size:10px;letter-spacing:4px}.gz-login-hero{margin:28px auto 22px}.gz-login-panel{grid-template-columns:1fr;padding:22px 16px;gap:20px;border-radius:22px}.gz-login-divider{display:none}.gz-login-benefits{display:none}.gz-login-form-wrap{max-width:none}.gz-login-round{width:64px;height:64px}.gz-login-form-wrap h1{font-size:29px}.gz-login-steps{padding:22px 14px}.gz-step-grid{grid-template-columns:repeat(2,1fr);gap:22px 10px}.gz-login-footer{line-height:1.7}.gz-lang{padding:9px 11px}}@media(max-width:420px){.gz-login-options{align-items:flex-start;gap:8px}.gz-forgot{max-width:150px;text-align:right}.gz-login-hero h2{font-size:18px}.gz-login-hero p{font-size:14px}}`}</style>
    </main>
  );
}

function Benefit({icon,title,text}:{icon:string,title:string,text:string}){return <div className="gz-benefit"><div className="gz-benefit-icon">{icon}</div><div><h4>{title}</h4><p>{text}</p></div></div>}
function Step({n,icon,title,text}:{n:string,icon:string,title:string,text:string}){return <div className="gz-step"><div className="gz-step-icon">{icon}</div><strong>{n}. {title}</strong><p>{text}</p></div>}
