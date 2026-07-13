import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchApifyLeads } from './services/apify.js'
import { createAIResponse, getOpenAIModel, getSafeOpenAIError, testOpenAIConnection } from './services/openaiService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const port = process.env.PORT || 3001

app.use(cors({
  origin(origin, callback) {
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Not allowed by CORS'))
  },
}))
app.use(express.json({ limit: '20kb' }))

app.get('/api/ai/status', (_req, res) => {
  return res.json({ configured: Boolean(process.env.OPENAI_API_KEY?.trim()), model: getOpenAIModel() })
})

app.post('/api/ai/test', async (_req, res) => {
  try {
    const result = await testOpenAIConnection()
    return res.status(result.connected ? 200 : 503).json(result)
  } catch (error) {
    const safeError = getSafeOpenAIError(error)
    return res.status(safeError.status).json({ connected: false, model: getOpenAIModel(), message: safeError.message })
  }
})

app.post('/api/ai/chat', async (req, res) => {
  const { message, language, context = {} } = req.body || {}

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message must be a non-empty string.' })
  }
  if (message.trim().length > 4000) {
    return res.status(413).json({ error: 'Message is too long. Use 4,000 characters or fewer.' })
  }
  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    return res.status(400).json({ error: 'Context must be an object.' })
  }
  if (language !== undefined && (typeof language !== 'string' || !['en', 'he', 'ar', 'ru'].includes(language))) {
    return res.status(400).json({ error: 'Language must be en, he, ar, or ru.' })
  }
  if (JSON.stringify(context).length > 12000) {
    return res.status(413).json({ error: 'Context is too large.' })
  }

  try {
    const result = await createAIResponse(message.trim(), { ...context, language: language || 'en' })
    return res.json(result)
  } catch (error) {
    const safeError = getSafeOpenAIError(error)
    return res.status(safeError.status).json({ error: safeError.message, model: getOpenAIModel() })
  }
})

app.post('/api/leads/search', async (req, res) => {
  const { businessType, city, country } = req.body || {}

  if (![businessType, city, country].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({
      error: 'Please enter Business Type, City, and Country.',
    })
  }

  if (!process.env.APIFY_TOKEN?.trim()) {
    return res.status(503).json({
      error: 'Apify token is missing. Add APIFY_TOKEN to .env and restart the server.',
    })
  }

  try {
    const leads = await fetchApifyLeads(businessType, city, country)
    return res.json({ leads })
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'Something went wrong while searching Google Maps.',
    })
  }
})

app.listen(port, () => {
  console.log(`BS Hunter API running on http://localhost:${port}`)
})
