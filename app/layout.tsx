import type { Metadata } from 'next';
import './globals.css';
import './gz-premium.css';
import GzVoice from './components/GzVoice';

export const metadata: Metadata = {
  title: 'GZ Intelligence',
  description: 'AI spécialisée dans les maisons horlogères, artistes et culture urbaine.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/gz-icon.svg', apple: '/gz-icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}<GzVoice/><script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}`}} /></body></html>;
}
