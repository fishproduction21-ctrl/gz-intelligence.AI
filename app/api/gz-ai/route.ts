import { gateway, generateText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lzuyaaxmjnklhjutxbio.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    const token = auth.slice(7);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages.slice(-16) : [];
    const prompt = messages.map((m: { role?: string; content?: string }) => `${m.role === 'user' ? 'UTILISATEUR' : 'GZ'}: ${String(m.content || '').slice(0, 6000)}`).join('\n');

    const result = await generateText({
      model: gateway('openai/gpt-5-mini'),
      system: `Tu es GZ Intelligence, l'assistant stratégique privé de GZ Agency. Tu aides sur l'horlogerie, les maisons, les artistes, la culture urbaine, les briefs, les collaborations, le positionnement, les négociations et le matching artiste-maison. Réponds en français, rapidement, intelligemment et naturellement, comme un conseiller humain expert. Ne prétends jamais disposer d'une information privée ou temps réel si elle n'est pas fournie. Quand une donnée manque, dis-le clairement et propose une méthode. Fais des réponses structurées mais courtes par défaut. Si l'utilisateur demande un avis stratégique, donne une recommandation nette avec les raisons et, si utile, 2-3 alternatives.`,
      prompt,
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error('GZ AI error', error);
    return NextResponse.json({ error: 'GZ AI est temporairement indisponible. Vérifie la configuration du fournisseur IA.' }, { status: 500 });
  }
}
