import { streamText } from 'ai'

export const runtime = 'edge'

const system = `Tu es GZ Intelligence, l'assistant stratégique de GZ Agency.
Tu aides sur le rap français, les talents, les maisons horlogères, le matching, les briefs, les campagnes, l'actualité et la stratégie.
Réponds en français, rapidement, clairement et de façon opérationnelle. Ne prétends jamais être une personne réelle.
Quand une donnée n'est pas disponible dans le contexte fourni, dis-le au lieu de l'inventer.
Donne des recommandations concrètes et explique brièvement ton raisonnement.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = Array.isArray(body?.messages) ? body.messages : []
    const context = typeof body?.context === 'string' ? body.context.slice(0, 12000) : ''

    const result = streamText({
      model: 'openai/gpt-5.4',
      system: `${system}\n\nContexte GZ disponible:\n${context || 'Aucun contexte supplémentaire fourni.'}`,
      messages,
      temperature: 0.4,
    })

    return result.toUIMessageStreamResponse()
  } catch {
    return Response.json({ error: 'Impossible de démarrer GZ AI.' }, { status: 400 })
  }
}
