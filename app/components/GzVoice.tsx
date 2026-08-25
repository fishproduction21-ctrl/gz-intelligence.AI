'use client';
import {useEffect,useRef,useState} from 'react';
import {createClient} from '@supabase/supabase-js';

type SRWindow=Window & {webkitSpeechRecognition?:new()=>any;SpeechRecognition?:new()=>any};
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://lzuyaaxmjnklhjutxbio.supabase.co',process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable__WZhhkjiKnCqmqspjL5tbQ_9o1fHoC8',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

export default function GzVoice(){
 const[active,setActive]=useState(false),[listening,setListening]=useState(false),[supported,setSupported]=useState(false),[status,setStatus]=useState('GZ vocal'),[name,setName]=useState('');
 const rec=useRef<any>(null),activeRef=useRef(false),restart=useRef<any>(null),starting=useRef(false);
 const speak=(text:string)=>{try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='fr-FR';u.rate=.96;u.pitch=.95;window.speechSynthesis.speak(u)}catch{}};
 const hello=()=>name?speak(`Je suis là, ${name}. Que souhaitez-vous faire ?`):speak('Je suis là. Que souhaitez-vous faire ?');
 const runCommand=(raw:string)=>{const text=raw.toLowerCase().trim();const wake=/\b(gz|geeze|g z)\b/.test(text);const command=text.replace(/^.*?\b(gz|geeze|g z)\b[\s,:-]*/,'').trim();if(!wake&&!activeRef.current)return;
   if(/active.?toi|réveille.?toi|reveil|démarre|demarre|lance/.test(command)||(!command&&wake)){setActive(true);activeRef.current=true;setStatus('GZ écoute');hello();return}
   if(/arrête|arrete|stop|désactive|desactive|au revoir|tais-toi/.test(command)){stop(true);return}
   const input=document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement|null;
   if(input&&command){const q=command.replace(/^cherche(?:[- ]moi)?[ -]*/,'').replace(/^trouve(?:[- ]moi)?[ -]*/,'').replace(/^recherche[ -]*/,'').replace(/^montre(?:[- ]moi)?[ -]*/,'').trim();if(q){const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;setter?.call(input,q);input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();setStatus(`Recherche : ${q}`);speak(name?`Je recherche ${q}, ${name}.`:`Je recherche ${q}.`);return}}
   if(command)speak(`J'ai compris : ${command}. Dites par exemple « GZ, cherche Timar » ou « GZ, cherche Rolex ».`);
 };
 const start=()=>{if(starting.current)return;const W=window as SRWindow;const C=W.SpeechRecognition||W.webkitSpeechRecognition;if(!C){setStatus('Navigateur incompatible');speak('La reconnaissance vocale n’est pas disponible dans ce navigateur.');return}starting.current=true;const r=new C();rec.current=r;r.lang='fr-FR';r.continuous=true;r.interimResults=false;r.maxAlternatives=1;r.onstart=()=>{starting.current=false;setListening(true);setSupported(true);setStatus('GZ écoute')};r.onresult=(e:any)=>{for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)runCommand(e.results[i][0].transcript)}};r.onerror=(e:any)=>{starting.current=false;setListening(false);if(e?.error==='not-allowed'||e?.error==='service-not-allowed'){activeRef.current=false;setActive(false);setStatus('Autorisation micro requise');return}if(activeRef.current)scheduleRestart()};r.onend=()=>{starting.current=false;setListening(false);if(activeRef.current)scheduleRestart()};try{r.start();setActive(true);activeRef.current=true;setStatus('GZ écoute');speak(name?`Je suis là, ${name}. Dites GZ suivi de votre demande.`:'Je suis là. Dites GZ suivi de votre demande.')}catch{starting.current=false;setStatus('Autorisation micro requise')}};
 const scheduleRestart=()=>{clearTimeout(restart.current);restart.current=setTimeout(()=>{if(!activeRef.current||starting.current||rec.current?.readyState==='starting')return;try{rec.current?.start();starting.current=true}catch{}},700)};
 const stop=(voice=false)=>{activeRef.current=false;setActive(false);setListening(false);clearTimeout(restart.current);starting.current=false;try{rec.current?.stop()}catch{}rec.current=null;setStatus('GZ vocal');if(voice)speak(name?`Très bien, ${name}. Je reste disponible.`:'Très bien. Je reste disponible.')};
 useEffect(()=>{const W=window as SRWindow;setSupported(!!(W.SpeechRecognition||W.webkitSpeechRecognition));supabase.auth.getSession().then(({data})=>setName((data.session?.user.user_metadata?.first_name||'').trim()));const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setName((s?.user.user_metadata?.first_name||'').trim()));return()=>{subscription.unsubscribe();stop(false)}},[]);
 return <div className={`gz-voice ${active?'is-active':''}`}><button className="gz-voice-button" onClick={active?()=>stop(true):start} aria-label="Activer l'assistance vocale GZ"><span className="gz-voice-orb">{listening?'◉':'GZ'}</span><span><b>{active?'GZ actif':'GZ vocal'}</b><small>{supported?status:'Autoriser le micro'}</small></span></button></div>
}
