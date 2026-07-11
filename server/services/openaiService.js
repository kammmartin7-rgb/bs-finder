// Backend-only OpenAI Responses API integration. Never import this file from frontend code.
import OpenAI from 'openai'

const DEFAULT_MODEL = 'gpt-5-mini'

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim())
}

function getClient() {
  if (!isOpenAIConfigured()) return null
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() })
}

export async function testOpenAIConnection() {
  const client = getClient()
  if (!client) return { connected: false, model: getOpenAIModel(), message: 'OpenAI API is not configured.' }

  await client.responses.create({
    model: getOpenAIModel(),
    instructions: 'Return only the word OK.',
    input: 'Connection test',
    max_output_tokens: 16,
  })

  return { connected: true, model: getOpenAIModel(), message: 'OpenAI API connection is working.' }
}

export async function createAIResponse(message, context = {}) {
  const client = getClient()
  if (!client) {
    const error = new Error('OpenAI API is not configured.')
    error.code = 'OPENAI_NOT_CONFIGURED'
    throw error
  }

  const response = await client.responses.create({
    model: getOpenAIModel(),
    instructions: 'You are the secure Business OS assistant. Be concise, practical, and do not claim actions were completed unless the supplied context confirms them.',
    input: `Context:\n${JSON.stringify(context)}\n\nUser request:\n${message}`,
    max_output_tokens: 1200,
  })

  return { text: response.output_text || 'The AI response did not contain text.', model: getOpenAIModel() }
}

export function getSafeOpenAIError(error) {
  if (error?.code === 'OPENAI_NOT_CONFIGURED') return { status: 503, message: 'OpenAI API is not configured.' }
  if (error?.status === 401) return { status: 503, message: 'OpenAI authentication failed. Check the backend API key.' }
  if (error?.status === 429) return { status: 429, message: 'OpenAI is temporarily unavailable because of rate limits or billing.' }
  return { status: 502, message: 'The AI request could not be completed. Please try again.' }
}
