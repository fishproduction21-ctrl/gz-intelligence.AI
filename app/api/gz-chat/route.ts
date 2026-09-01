import { streamText } from 'ai'
import { createClient } from '@supabase/supabase-js'

const system = `Tu es GZ AI, le cerveau stratégique privé de GZ Agency. Tu es spécialisé à très haut niveau dans l'horlogerie, les montres, les maisons horlogères, les artistes français, le rap français, le hip-hop, la culture urbaine et le business des collaborations artistes-marques.

MISSION : aider GZ Agency à prendre de meilleures décisions et à préparer des dossiers, briefs, propositions, stratégies, matchings et négociations.

DOMAINES D'EXPERTISE :
- maisons horlogères, histoire, positionnement, collections, modèles et univers de marque
- artistes français et francophones, rap, hip-hop et culture urbaine
- audience, réseaux sociaux, actualité musicale, sorties et collaborations
- matching artiste ↔ maison et maison ↔ artiste
- stratégie de campagne, activation, casting et recommandation
- préparation de briefs, propositions commerciales et argumentaires
- négociation : objectifs, leviers, contreparties, risques et stratégie de discussion
- analyse comparative de maisons, artistes, campagnes et opportunités

COMPORTEMENT :
- Réponds en français, avec un ton professionnel, direct, intelligent et naturel.
- Pour une question simple, réponds simplement. Pour une question complexe, fais une vraie analyse structurée.
- Présente les réponses comme un assistant premium : titres courts, paragraphes lisibles, listes, tableaux lorsque cela apporte une vraie valeur, puis une recommandation GZ claire.
- Pour un matching, donne le score uniquement s'il existe réellement dans les données GZ. Explique pourquoi le match fonctionne, les points forts, les risques et la manière de l'activer.
- Pour une négociation, donne une stratégie concrète : position de départ, arguments, concessions possibles, éléments non négociables et prochaine action.
- Utilise en priorité les données GZ fournies dans le contexte live.
- N'invente jamais une statistique, un chiffre, une audience, une actualité, une collaboration, un compte social, un prix ou un score de matching.
- Si une information manque, dis clairement qu'elle manque et indique ce qu'il faudrait vérifier.
- Pour les informations d'actualité, distingue toujours les données GZ disponibles des informations qui nécessitent une vérification web en temps réel. Ne présente jamais une information non vérifiée comme un fait.
- Ne prétends jamais être une personne réelle.
- Ton objectif est d'être utile à GZ Agency, pas de produire des réponses génériques.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = Array.isArray(body?.messages) ? body.messages : []
    const selectedTalentId = typeof body?.talentId === 'string' ? body.talentId.slice(0, 100) : ''
    let context = ''

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (supabaseUrl && supabaseKey) {
      const db = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
      const [{ data: talents }, { data: maisons }] = await Promise.all([
        db.from('talents').select('id,talent_id,nom,pays,age,univers,audience,reseaux,profil_complet').order('nom').limit(80),
        db.from('maisons').select('id,maison_id,nom,univers,positionnement,gamme_prix,culture_urbaine,site_officiel').order('nom').limit(40),
      ])
      let selected: any = null
      let news: any[] = []
      let socials: any[] = []
      let music: any = null
      let matches: any[] = []
      if (selectedTalentId) {
        selected = (talents || []).find((t: any) => t.id === selectedTalentId || t.talent_id === selectedTalentId) || null
        if (selected) {
          const [n, s, m, ma] = await Promise.all([
            db.from('talent_news').select('title,summary,url,source,published_at,impact').eq('talent_id', selected.id).order('published_at', { ascending: false }).limit(10),
            db.from('talent_socials').select('platform,handle,followers,profile_url,verified,last_checked').eq('talent_id', selected.id).order('followers', { ascending: false }),
            db.from('talent_music').select('latest_release_title,latest_release_date,latest_track_title,latest_track_date,genres,top_tracks').eq('talent_id', selected.id).maybeSingle(),
            db.from('matching_gz').select('maison_id,score,raisons,points_forts,risques,recommandation').eq('talent_id', selected.id).order('score', { ascending: false }).limit(8),
          ])
          news = n.data || []
          socials = s.data || []
          music = m.data || null
          matches = ma.data || []
        }
      }
      context = JSON.stringify({ talents, maisons, selectedTalent: selected, news, socials, music, matches }).slice(0, 14000)
    }

    const result = streamText({
      model: 'openai/gpt-5.4',
      system: `${system}\n\nCONTEXTE LIVE GZ:\n${context || 'Aucun contexte live disponible.'}`,
      messages,
      temperature: 0.4,
    })
    return result.toTextStreamResponse()
  } catch (error) {
    console.error('GZ AI error', error)
    return new Response('GZ rencontre un problème temporaire.', { status: 500 })
  }
}
