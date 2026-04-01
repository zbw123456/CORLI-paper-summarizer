import 'dotenv/config'
import { Mistral } from '@mistralai/mistralai'

function normalizeApiKey(value = '') {
  return String(value)
    .trim()
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
}

const apiKey = normalizeApiKey(process.env.MISTRAL_API_KEY || '')
if (!apiKey) {
  throw new Error('Missing MISTRAL_API_KEY in .env')
}

if (/[^\x20-\x7E]/.test(apiKey)) {
  throw new Error('MISTRAL_API_KEY contains non-ASCII characters. Remove smart quotes and paste the raw key.')
}

const client = new Mistral({
  apiKey
})

export async function askMistral(prompt, options = {}) {
  const model = options.model || process.env.MISTRAL_MODEL || 'mistral-small-latest'
  const res = await client.chat.complete({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  })

  return res?.choices?.[0]?.message?.content || ''
}