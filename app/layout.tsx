import type { Metadata } from 'next';
import './globals.css';
import './gz-premium.css';
import './gz-ai.css';
import GzVoice from './components/GzVoice';
import GzAI from './components/GzAI';

export const metadata: Metadata = {
  title: 'GZ Intelligence',
  description: 'AI spécialisée dans les maisons horlogères, artistes et culture urbaine.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/gz-icon.svg', apple: '/gz-icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <GzVoice />
        <GzAI />
        <style dangerouslySetInnerHTML={{ __html: `*,*::before,*::after{animation:none!important;transition:none!important}html{scroll-behavior:auto!important}` }} />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',async()=>{try{const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()));if('caches' in window){const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('gz-intelligence-')).map(k=>caches.delete(k)));}}catch{}});}` }} />
      </body>
    </html>
  );
}
