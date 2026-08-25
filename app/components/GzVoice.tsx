'use client';
import {useEffect,useRef,useState} from 'react';

type SR=typeof window & {webkitSpeechRecognition?:new()=>any;SpeechRecognition?:new()=>any};
export default function GzVoice(){
 const [active,setActive]=useState(false),[listening,setListening]=useState(false),[supported,setSupported]=useState(false),[status,setStatus]=useState('GZ vocal');
 const rec=useRef<any>(null); const activeRef=useRef(false); const restart=useRef<any>(null);
 const speak=(text:string)=>{try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='fr-FR';u.rate=.96;u.pitch=.95;window.speechSynthesis.speak(u)}catch{}}
 const runCommand=(raw:string)=>{const text=raw.toLowerCase().trim();const wake=/\b(gz|geeze)\b/.test(text);const command=text.replace(/^.*?\b(gz|geeze)\b[\s,:-]*/,'').trim();
   if(!wake&&!activeRef.current)return;
   if(/active.?toi|réveille.?toi|reveil|démarre|demarre/.test(command)||(!command&&wake)){setActive(true);activeRef.current=true;setStatus('GZ écoute');speak('Je suis là. Que souhaitez-vous faire ?');return}
   if(/arrête|arrete|stop|désactive|desactive|au revoir/.test(command)){setActive(false);activeRef.current=false;setListening(false);setStatus('GZ vocal');try{rec.current?.stop()}catch{}speak('Très bien. Je reste disponible.');return}
   const input=document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement|null;
   if(input&&command){const q=command.replace(/^cherche(?:[- ]moi)?[ -]*/,'').replace(/^trouve(?:[- ]moi)?[ -]*/,'').replace(/^recherche[ -]*/,'').trim();if(q){const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;setter?.call(input,q);input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();setStatus(`Recherche : ${q}`);speak(`Je recherche ${q}.`);return}}
   if(command)speak(`J'ai compris : ${command}. Je peux lancer une recherche GZ avec le nom d'un talent ou d'une maison.`);
 };
 const start=()=>{const W=window as SR;const C=W.SpeechRecognition||W.webkitSpeechRecognition;if(!C){setStatus('Micro non disponible');speak('La reconnaissance vocale n’est pas disponible dans ce navigateur.');return}if(rec.current)return;const r=new C();rec.current=r;r.lang='fr-FR';r.continuous=true;r.interimResults=false;r.onstart=()=>setListening(true);r.onresult=(e:any)=>{for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)runCommand(e.results[i][0].transcript)}};r.onerror=()=>{setListening(false);if(activeRef.current){clearTimeout(restart.current);restart.current=setTimeout(()=>{try{r.start()}catch{}},900)}};r.onend=()=>{setListening(false);if(activeRef.current){clearTimeout(restart.current);restart.current=setTimeout(()=>{try{r.start()}catch{}},900)}};try{r.start();setSupported(true);setActive(true);activeRef.current=true;setStatus('GZ écoute');speak('Je suis là. Dites GZ suivi de votre demande.')}catch{setStatus('Autorisation micro requise')}};
 const stop=()=>{activeRef.current=false;setActive(false);setListening(false);clearTimeout(restart.current);try{rec.current?.stop()}catch{}rec.current=null;setStatus('GZ vocal')};
 useEffect(()=>{const W=window as SR;setSupported(!!(W.SpeechRecognition||W.webkitSpeechRecognition));return()=>{activeRef.current=false;clearTimeout(restart.current);try{rec.current?.stop()}catch{}}},[]);
 return <div className={`gz-voice ${active?'is-active':''}`}><button className="gz-voice-button" onClick={active?stop:start} aria-label="Activer l'assistance vocale GZ"><span className="gz-voice-orb">{listening?'◉':'GZ'}</span><span><b>{active?'GZ actif':'GZ vocal'}</b><small>{supported?status:'Autoriser le micro'}</small></span></button></div>
}
