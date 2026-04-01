import 'dotenv/config'
import { readPapers } from './src/storage.js'
import { summarizeBatch } from './src/summarizer.js'
import { summaryTypes } from './src/prompts.js'

async function run() {
  const language = process.env.SUMMARY_LANGUAGE || 'en'
  const delayMs = Number(process.env.SUMMARY_DELAY_MS || 1200)
  const force = process.env.SUMMARY_FORCE === '1'
  const typeList = (process.env.SUMMARY_TYPES || summaryTypes.join(','))
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  const papers = readPapers(process.env.PAPERS_FILE || 'data/papers.json')
  const stats = await summarizeBatch(papers, {
    language,
    delayMs,
    force,
    types: typeList
  })

  console.log('✅ Batch complete:', stats)
}

run().catch(err => {
  console.error('❌ Batch failed:', err.message)
  process.exit(1)
})
