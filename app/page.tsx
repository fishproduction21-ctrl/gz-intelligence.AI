'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lzuyaaxmjnklhjutxbio.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable__WZhhkjiKnCqmqspjL5tbQ_9o1fHoC8';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

type Talent = { id:string; talent_id:string; nom:string; univers:string|null; image:string|null; pays:string|null; adn:Record<string,unknown>|null };
type Maison = { id:string; maison_id:string; nom:string; univers:string|null; positionnement:string|null; gamme_prix:string|null };
type Match = { talent_id:string; maison_id:string; score:number; recommandation:string|null };
type WikiResult = { pageid:number; title:string; description?:string; thumbnail?:{source:string} };

const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const tokens=(s:string)=>new Set(normalize(s).split(/\s+/).filter(x=>x.length>2));
function automaticScore(t:Talent,m:Maison){
  const talentText=[t.nom,t.univers||'',t.pays||'',JSON.stringify(t.adn||{})].join(' ');
  const houseText=[m.nom,m.univers||'',m.positionnement||'',m.gamme_prix||''].join(' ');
  const tt=tokens(talentText), ht=tokens(houseText);
  let overlap=0; tt.forEach(x=>{if(ht.has(x))overlap++});
  const base=Math.min(58,overlap*12);
  const universe=t.univers&&m.univers&&normalize(t.univers).split(' ').some(x=>normalize(m.univers||'').includes(x))?18:0;
  const positioning=t.univers&&m.positionnement&&normalize(m.positionnement).split(' ').some(x=>normalize(t.univers||'').includes(x))?14:0;
  const country=t.pays&&normalize(m.positionnement||'').includes(normalize(t.pays))?5:0;
  return Math.min(98,Math.max(35,35+base+universe+positioning+country));
}

function WikiImage({name,src}:{name:string;src?:string|null}) {
  const [image,setImage]=useState(src||null);
  useEffect(()=>{if(src)return; let dead=false; fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`).then(r=>r.ok?r.json():null).then(x=>{if(!dead)setImage(x?.thumbnail?.source??null)}).catch(()=>{}); return()=>{dead=true}},[name,src]);
  return image ? <img className="talent-photo" src={image} alt={name}/> : <div className="avatar">{name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div>;
}
function HouseLogo({name}:{name:string}) {
  const [src,setSrc]=useState<string|null>(null);
  useEffect(()=>{let dead=false; fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`).then(r=>r.ok?r.json():null).then(x=>{if(!dead)setSrc(x?.thumbnail?.source??null)}).catch(()=>{}); return()=>{dead=true}},[name]);
  return src?<img className="house-logo" src={src} alt={`${name} logo`}/>:<div className="watch">{name.slice(0,2).toUpperCase()}</div>;
}

function Login({onLogged}:{onLogged:(s:Session)=>void}) {
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[mode,setMode]=useState<'login'|'signup'>('login'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');setMessage('');
    if(mode==='signup'){
      const {data,error}=await supabase.auth.signUp({email,password});
      if(error)setError(error.message); else if(data.session)onLogged(data.session); else setMessage('Invitation envoyée. Vérifie ton email professionnel pour activer ton accès associé.');
    } else {
      const {data,error}=await supabase.auth.signInWithPassword({email,password});
      if(error)setError('Identifiants incorrects ou accès non autorisé.'); else if(data.session)onLogged(data.session);
    }
    setBusy(false);
  };
  const oauth=async(provider:'google'|'apple')=>{setError('');const {error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:window.location.origin}});if(error)setError(error.message)};
  return <main className="auth-shell"><section className="auth-card"><div className="logo auth-logo">GZ<span>INTELLIGENCE</span></div><p className="eyebrow">GZ AGENCY · PRIVATE INTELLIGENCE</p><h1>{mode==='login'?'Le cerveau du deal.':'Créer un accès associé.'}</h1><p className="sub">Base talents, maisons horlogères et matching stratégique — accès privé GZ.</p>
    <div className="oauth-grid"><button className="oauth" onClick={()=>oauth('google')}>G&nbsp; Continuer avec Google</button><button className="oauth" onClick={()=>oauth('apple')}> Continuer avec Apple</button></div>
    <div className="divider"><span>ou email professionnel</span></div>
    <form onSubmit={submit} className="auth-form"><input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email professionnel"/><input type="password" required minLength={8} autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe (8 caractères minimum)"/><button className="primary" disabled={busy}>{busy?'Patiente…':mode==='login'?'Se connecter':'Créer mon accès'}</button></form>
    {error&&<p className="error" role="alert">{error}</p>}{message&&<p className="success">{message}</p>}
    <button className="switch" onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('')}}>{mode==='login'?"Je suis un associé et je demande un accès →":"J'ai déjà un accès → Se connecter"}</button>
  </section></main>;
}

export default function Home(){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[talents,setTalents]=useState<Talent[]>([]),[maisons,setMaisons]=useState<Maison[]>([]),[matches,setMatches]=useState<Match[]>([]),[query,setQuery]=useState(''),[tab,setTab]=useState('Dashboard'),[selectedTalent,setSelectedTalent]=useState<Talent|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[wiki,setWiki]=useState<WikiResult[]>([]);
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setReady(true)});const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>subscription.unsubscribe()},[]);
 useEffect(()=>{if(!session)return;setLoading(true);Promise.all([supabase.from('talents').select('id,talent_id,nom,univers,image,pays,adn').order('nom'),supabase.from('maisons').select('id,maison_id,nom,univers,positionnement,gamme_prix').order('nom'),supabase.from('matching_gz').select('talent_id,maison_id,score,recommandation').order('score',{ascending:false})]).then(([a,b,c])=>{const err=a.error||b.error||c.error;if(err)setError(`Base GZ : ${err.message}`);setTalents(a.data??[]);setMaisons(b.data??[]);setMatches((c.data??[]).map(x=>({...x,score:Number(x.score)})))}).finally(()=>setLoading(false))},[session]);
 useEffect(()=>{if(!query.trim()){setWiki([]);return} const timer=setTimeout(()=>{fetch(`https://fr.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=0&gsrlimit=8&prop=pageimages|description&piprop=thumbnail&pithumbsize=240&format=json&origin=*`).then(r=>r.ok?r.json():null).then(x=>setWiki(Object.values(x?.query?.pages??{}) as WikiResult[])).catch(()=>setWiki([]))},250);return()=>clearTimeout(timer)},[query]);
 const q=normalize(query);const filteredTalents=useMemo(()=>q?talents.filter(t=>normalize(`${t.nom} ${t.univers??''} ${t.pays??''}`).includes(q)):talents,[talents,q]);const filteredMaisons=useMemo(()=>q?maisons.filter(m=>normalize(`${m.nom} ${m.univers??''} ${m.positionnement??''}`).includes(q)):maisons,[maisons,q]);const getMaison=(id:string)=>maisons.find(m=>m.id===id||m.maison_id===id);
 const selectedMatches=useMemo(()=>{if(!selectedTalent)return [];const db=matches.filter(m=>m.talent_id===selectedTalent.id||m.talent_id===selectedTalent.talent_id);const dbByHouse=new Map(db.map(m=>[m.maison_id,m]));return maisons.map(m=>{const stored=dbByHouse.get(m.id)||dbByHouse.get(m.maison_id);const score=stored?Math.max(Number(stored.score)||0,automaticScore(selectedTalent,m)):automaticScore(selectedTalent,m);return {talent_id:selectedTalent.id,maison_id:m.id,score,recommandation:stored?.recommandation||'Compatibilité calculée automatiquement par GZ Intelligence.'};}).sort((a,b)=>b.score-a.score).slice(0,10)},[selectedTalent,maisons,matches]);
 if(!ready)return <div className="loading">Initialisation sécurisée…</div>; if(!session)return <Login onLogged={setSession}/>;
 const signOut=()=>supabase.auth.signOut();
 return <main className="shell"><aside className="sidebar"><div className="logo">GZ<span>INTELLIGENCE</span></div><nav>{['Dashboard','Talents','Maisons','Matching','Briefs','Base GZ'].map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x}</button>)}</nav><div className="status"><i/> Accès authentifié<br/><span>{session.user.email}</span></div><button className="mini" onClick={signOut}>Se déconnecter</button></aside><section className="content"><header><div><p className="eyebrow">GZ AGENCY · PRIVATE INTELLIGENCE</p><h1>Le cerveau du deal.</h1><p className="sub">Intelligence horlogère × culture urbaine × matching stratégique.</p></div><button className="primary head-btn" onClick={()=>setTab('Briefs')}>+ Nouveau brief</button></header>
 <div className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Chercher n'importe quel artiste, personnalité ou maison…"/></div>
 {query&&<div className="search-results"><div className="search-title"><b>Recherche GZ</b><span>{filteredTalents.length} talent(s) · {filteredMaisons.length} maison(s) · {wiki.length} résultats publics</span></div>{filteredTalents.length>0&&<div className="quick-grid">{filteredTalents.slice(0,6).map(t=><button className="quick-card" key={t.id} onClick={()=>{setSelectedTalent(t);setTab('Matching')}}><WikiImage name={t.nom} src={t.image}/><span><b>{t.nom}</b><small>{t.univers}</small></span><em>Voir →</em></button>)}</div>}{wiki.filter(w=>!talents.some(t=>normalize(t.nom)===normalize(w.title))).slice(0,4).map(w=><div className="result" key={w.pageid}><WikiImage name={w.title} src={w.thumbnail?.source}/><div><b>{w.title}</b><p>{w.description||'Personnalité publique — source Wikipédia'}</p></div><em>Profil public</em></div>)}{filteredTalents.length===0&&wiki.length===0&&<p className="sub">Aucun résultat. Essaie le nom complet.</p>}</div>}
 {error&&<div className="panel error-panel">{error}</div>}
 {loading?<div className="loading">Connexion sécurisée à la base GZ…</div>:<>{tab==='Dashboard'&&<><section className="grid stats"><article><small>TALENTS</small><strong>{talents.length}</strong><p>Profils GZ indexés</p></article><article><small>MAISONS</small><strong>{maisons.length}</strong><p>Maisons documentées</p></article><article><small>MATCHINGS</small><strong>{matches.length}</strong><p>Connexions calculées</p></article><article><small>ACCÈS</small><strong>PRIVÉ</strong><p>Associés GZ</p></article></section><section className="grid main-grid"><article className="panel"><div className="panel-head"><div><small>GZ TALENT DATABASE</small><h2>Talents suivis</h2></div><button className="link-btn" onClick={()=>setTab('Talents')}>Voir tous →</button></div><div className="talent-list">{talents.slice(0,12).map(t=><button className="talent-card" key={t.id} onClick={()=>{setSelectedTalent(t);setTab('Matching')}}><WikiImage name={t.nom} src={t.image}/><span><b>{t.nom}</b><small>{t.univers}</small></span><em>→</em></button>)}</div></article><article className="panel"><div className="panel-head"><div><small>WATCH HOUSE DATABASE</small><h2>Maisons</h2></div><button className="link-btn" onClick={()=>setTab('Maisons')}>Voir toutes →</button></div>{maisons.slice(0,10).map(m=><div className="row" key={m.id}><HouseLogo name={m.nom}/><div><b>{m.nom}</b><p>{m.positionnement||m.univers||'Profil stratégique GZ'}</p></div></div>)}</article></section></>}
 {tab==='Talents'&&<section className="panel full"><div className="panel-head"><div><small>GZ TALENT DATABASE</small><h2>Tous les talents</h2></div><span>{filteredTalents.length} résultats</span></div><div className="cards">{filteredTalents.map(t=><button className="profile" key={t.id} onClick={()=>{setSelectedTalent(t);setTab('Matching')}}><WikiImage name={t.nom} src={t.image}/><b>{t.nom}</b><p>{t.univers||'—'}</p><small>{t.pays||'France'}</small></button>)}</div></section>}
 {tab==='Maisons'&&<section className="panel full"><div className="panel-head"><div><small>WATCH HOUSE DATABASE</small><h2>Maisons horlogères</h2></div><span>{filteredMaisons.length} résultats</span></div><div className="cards">{filteredMaisons.map(m=><div className="profile" key={m.id}><HouseLogo name={m.nom}/><b>{m.nom}</b><p>{m.positionnement||m.univers||'—'}</p><small>{m.gamme_prix||'—'}</small></div>)}</div></section>}
 {tab==='Matching'&&<section className="panel full"><div className="panel-head"><div><small>GZ MATCHING ENGINE · AUTOMATIQUE</small><h2>{selectedTalent?`Maisons compatibles · ${selectedTalent.nom}`:'Choisis un talent'}</h2></div>{selectedTalent&&<span>TOP 10 CALCULÉ EN DIRECT</span>}</div>{selectedTalent?<div className="match-list">{selectedMatches.map(m=>{const h=getMaison(m.maison_id);return h&&<div className="match" key={`${m.talent_id}-${m.maison_id}`}><HouseLogo name={h.nom}/><div><b>{h.nom}</b><p>{m.recommandation||'Compatibilité stratégique GZ'}</p></div><strong>{Math.round(m.score)}%</strong></div>})}{selectedMatches.length===0&&<p className="sub">Aucune maison disponible pour calculer le matching.</p>}</div>:<div className="cards">{talents.slice(0,30).map(t=><button className="profile" key={t.id} onClick={()=>setSelectedTalent(t)}><WikiImage name={t.nom} src={t.image}/><b>{t.nom}</b><p>Voir les compatibilités →</p></button>)}</div>}</section>}
 {tab==='Briefs'&&<section className="panel full"><div className="panel-head"><div><small>DEAL PIPELINE</small><h2>Briefs GZ</h2></div><span>PRIVÉ</span></div><div className="brief"><b>Campagne horlogère · Culture urbaine</b><p>Identifier 5 profils pertinents selon maison, image, audience et univers.</p><span>ACTIF · GZ INTELLIGENCE</span></div><div className="brief"><b>Maison ↔ talent</b><p>Analyse stratégique, shortlist et préparation de négociation.</p><span>ACTIF · GZ AGENCY</span></div></section>}
 {tab==='Base GZ'&&<section className="panel full"><div className="panel-head"><div><small>MASTER DATABASE</small><h2>Base GZ</h2></div></div><p className="sub">Données métier accessibles uniquement après authentification.</p><div className="data-summary"><b>{talents.length}</b><span>Talents</span><b>{maisons.length}</b><span>Maisons</span><b>{matches.length}</b><span>Matchings</span></div></section>}</>}</section></main>;
}
