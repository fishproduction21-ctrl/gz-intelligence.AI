import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GZ Intelligence',
    short_name: 'GZ',
    description: 'GZ Intelligence — talents, maisons horlogères et matching stratégique.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#070707',
    lang: 'fr-FR',
    icons: [
      { src: '/gz-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
    ],
  };
}
