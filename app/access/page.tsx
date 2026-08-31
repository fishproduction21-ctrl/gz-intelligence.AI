'use client';

import { useEffect } from 'react';

export default function PrivateAccess() {
  useEffect(() => {
    // PRIVATE ACCESS is the client entrance: use the exact GZ client welcome/login interface.
    window.location.replace('/');
  }, []);

  return <div style={{ minHeight: '100vh', background: '#050509' }} />;
}
