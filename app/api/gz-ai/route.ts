import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key);
}

const SYSTEM_PROMPT = `Tu es GZ AI, l'expert stratégique privé de GZ Agency.

DOMAINES D'EXPERTISE PRIORITAIRES
1. HORLOGERIE : maisons et marques, histoire, collections, références et modèles, mouvements, complications, matériaux, prix et positionnement, marché, distribution, ambassadeurs, collaborations, campagnes, image, codes de marque et compatibilité avec la culture urbaine.
2. HIP-HOP / RAP FRANÇAIS : artistes, groupes, carrières, discographies, sorties, scènes et sous-scènes, rap français et francophone, culture urbaine, influence, collaborations, image, audience et stratégie artistique.
3. GZ AGENCY : matching artiste ↔ maison, briefs, stratégie de campagne, direction artistique, casting, négociation, positionnement et recommandations.

COMPORTEMENT
- Réponds en français, naturellement et avec assurance.
- Tu peux répondre à des questions générales ou très pointues. Ne te limite pas aux données présentes dans la base GZ.
- Pour une question d'actualité ou une donnée qui peut changer (auditeurs, followers, ventes, streams, prix actuels, dernières sorties, actualité d'une maison ou d'un artiste), ne présente jamais une estimation comme un chiffre certain. Si aucune source temps réel n'est disponible dans l'application, indique clairement que le chiffre doit être vérifié.
- N'invente jamais de statistiques, collaborations, ventes, streams ou faits.
- Quand une question concerne un artiste, pense à couvrir si pertinent : identité artistique, univers, audience, plateformes, réseaux, chiffres disponibles, carrière, sorties, collaborations, influence, marques compatibles et opportunités horlogères.
- Quand une question concerne une maison, pense à couvrir : ADN, histoire, collections, modèles emblématiques, positionnement, prix, clientèle, ambassadeurs, image, territoire culturel et artistes compatibles.
- Pour un matching, donne un score indicatif, puis explique précisément les raisons, les forces, les risques et le type de collaboration recommandé. Le score est une analyse GZ, pas une donnée officielle.
- Si l'utilisateur demande simplement une information, réponds directement sans forcer un matching.
- Structure les réponses avec des titres courts, des listes et des chiffres lisibles. Évite les gros blocs de texte.
- Si plusieurs interprétations sont possibles, choisis la plus probable et précise brièvement ton hypothèse.
- Ne dis jamais que tu es limité à la base GZ. Tu utilises la base comme contexte lorsqu'elle est fournie, mais ton rôle est celui d'un véritable expert conseil.`;

async function callOpenAI(prompt: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GZ_AI_MODEL || 'gpt-5.6-luna',
      instructions: SYSTEM_PROMPT,
      input: prompt,
      max_output_tokens: 5000,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OPENAI_${response.status}:${detail.slice(0, 300)}`);
  }
  const data = await response.json();
  return data.output_text || data.output?.flatMap((x: any) => x.content || []).map((x: any) => x.text || '').join('') || '';
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseClient();
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

    const token = auth.slice(7);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages.slice(-16) : [];
    const talentId = typeof body?.talentId === 'string' ? body.talentId : '';
    const prompt = messages.map((m: { role?: string; content?: string }) => `${m.role === 'user' ? 'UTILISATEUR' : 'GZ AI'}: ${String(m.content || '').slice(0, 6000)}`).join('\n');
    const context = talentId ? `\nContexte: l'utilisateur consulte actuellement le talent GZ ${talentId}. Utilise ce contexte seulement s'il est pertinent.` : '';

    const text = await callOpenAI(prompt + context);
    if (text === null) {
      return NextResponse.json({ error: 'GZ AI n’est pas configuré : OPENAI_API_KEY manque dans les variables d’environnement Vercel.' }, { status: 503 });
    }
    if (!text.trim()) throw new Error('EMPTY_AI_RESPONSE');
    return NextResponse.json({ text });
  } catch (error) {
    console.error('GZ AI error', error);
    return NextResponse.json({ error: 'GZ AI est temporairement indisponible.' }, { status: 500 });
  }
}
