import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GZ Intelligence',
  description: 'AI spécialisée dans les maisons horlogères, artistes et culture urbaine.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
