import type { ChatMessage } from './types'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: (fullText: string) => void
  onError: (error: Error) => void
}

export async function streamChatCompletion(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 256,
  }

  let response: Response
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    })
  } catch (err) {
    callbacks.onError(
      err instanceof Error ? err : new Error('Erreur réseau'),
    )
    return
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    callbacks.onError(
      new Error(
        response.status === 401
          ? 'Clé API invalide. Vérifiez vos paramètres.'
          : response.status === 429
            ? 'Limite de requêtes atteinte. Réessayez dans un instant.'
            : `Erreur API (${response.status}): ${text.slice(0, 100)}`,
      ),
    )
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    callbacks.onError(new Error('Streaming non supporté'))
    return
  }

  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const token = parsed.choices?.[0]?.delta?.content
          if (token) {
            fullText += token
            callbacks.onToken(token)
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } catch (err) {
    if (signal?.aborted) return
    callbacks.onError(
      err instanceof Error ? err : new Error('Erreur de streaming'),
    )
    return
  }

  callbacks.onDone(fullText)
}
