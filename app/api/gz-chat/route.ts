import { streamText } from 'ai'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lzuyaaxmjnklhjutxbio.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const system = `Tu es GZ Intelligence, l'assistant stratégique privé de GZ Agency.
Tu aides sur le rap français, les talents, les maisons horlogères, le matching, les briefs, les campagnes, l'actualité et la stratégie.
Réponds en français, rapidement, clairement et de façon opérationnelle.
Utilise en priorité les données GZ fournies dans le contexte. N'invente jamais une statistique, une actualité, un compte social ou un match absent des données.
Si une donnée manque, dis-le clairement. Pour un matching, donne le pourcentage uniquement lorsqu'il existe dans les données et donne une justification courte.
Pour les actualités, utilise uniquement les actualités présentes dans la base. Ne prétends jamais être une personne réelle.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = Array.isArray(body?.messages) ? body.messages : []
    const selectedTalentId = typeof body?.talentId === 'string' ? body.talentId.slice(0, 100) : ''
    const client = supabaseKey ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } }) : null

    let context = typeof body?.context === 'string' ? body.context.slice(0, 9000) : ''

    if (client) {
      const [{ data: talents }, { data: maisons }] = await Promise.all([
        client.from('talents').select('id,talent_id,nom,pays,age,univers,audience,reseaux,profil_complet').order('nom').limit(80),
        client.from('maisons').select('id,maison_id,nom,univers,positionnement,gamme_prix,culture_urbaine,site_officiel').order('nom').limit(40),
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
            client.from('talent_news').select('title,summary,url,source,published_at,impact').eq('talent_id', selected.id).order('published_at', { ascending: false }).limit(10),
            client.from('talent_socials').select('platform,handle,followers,profile_url,verified,last_checked').eq('talent_id', selected.id).order('followers', { ascending: false }),
            client.from('talent_music').select('latest_release_title,latest_release_date,latest_track_title,latest_track_date,genres,top_tracks').eq('talent_id', selected.id).maybeSingle(),
            client.from('matching_gz').select('maison_id,score,raisons,points_forts,risques,recommandation').eq('talent_id', selected.id).order('score', { ascending: false }).limit(8),
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

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('GZ AI error', error)
    return Response.json({ error: 'Impossible de démarrer GZ AI.' }, { status: 500 })
  }
}
