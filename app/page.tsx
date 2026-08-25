const maisons = ['Rolex', 'Cartier', 'Audemars Piguet', 'Patek Philippe', 'Richard Mille', 'Hublot'];
const talents = ['Kaaris', 'La Fouine', 'Bello & Dallas', 'Anyme', 'Soprano', 'RK', 'Aya Nakamura'];

export default function Home() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="logo">GZ<span>INTELLIGENCE</span></div>
        <nav>
          <a className="active">Dashboard</a><a>Talents</a><a>Maisons</a><a>Matching</a><a>Briefs</a><a>Base GZ</a>
        </nav>
        <div className="status"><i /> Système opérationnel</div>
      </aside>
      <section className="content">
        <header><div><p className="eyebrow">GZ AGENCY · PRIVATE INTELLIGENCE</p><h1>Le cerveau du deal.</h1><p className="sub">Analyse, matching et intelligence horlogère pour la culture urbaine.</p></div><button>+ Nouveau brief</button></header>
        <div className="search"><span>⌕</span><input placeholder="Rechercher un artiste, une maison ou un brief…" /></div>
        <section className="grid stats"><article><small>TALENTS</small><strong>2,847</strong><p>Profils indexés</p></article><article><small>MAISONS</small><strong>186</strong><p>Maisons documentées</p></article><article><small>MATCHINGS</small><strong>94.2%</strong><p>Pertinence moyenne</p></article><article><small>BRIEFS ACTIFS</small><strong>18</strong><p>En cours</p></article></section>
        <section className="grid main-grid"><article className="panel"><div className="panel-head"><div><small>INTELLIGENCE</small><h2>Matching express</h2></div><span>GZ AI</span></div><p className="question">Quel talent correspond le mieux à une maison horlogère ?</p><div className="chips">{talents.slice(0,5).map(t=><button key={t}>{t}</button>)}</div><div className="result"><div className="avatar">GZ</div><div><b>Bello & Dallas × Audemars Piguet</b><p>Compatibilité estimée · <strong>94%</strong></p></div><em>→</em></div></article>
          <article className="panel"><div className="panel-head"><div><small>BASE MAISONS</small><h2>Maisons suivies</h2></div><span>Voir tout</span></div>{maisons.map((m,i)=><div className="row" key={m}><div className="watch">{['R','C','AP','P','RM','H'][i]}</div><div><b>{m}</b><p>Profil stratégique GZ</p></div><strong>{[98,96,95,94,92,90][i]}%</strong></div>)}</article>
        </section>
      </section>
    </main>
  );
}
