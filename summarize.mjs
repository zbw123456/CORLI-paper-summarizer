import 'dotenv/config'
import { readPapers } from './src/storage.js'
import { summarizePaperType } from './src/summarizer.js'
import { summaryTypes } from './src/prompts.js'

async function run() {
  const id = process.env.PAPER_ID
  const type = process.env.SUMMARY_TYPE || 'general'
  const language = process.env.SUMMARY_LANGUAGE || 'en'
  const force = process.env.SUMMARY_FORCE === '1'

  if (!id) throw new Error('Set PAPER_ID in env to run summarize:one')
  if (!summaryTypes.includes(type)) throw new Error(`SUMMARY_TYPE must be one of: ${summaryTypes.join(', ')}`)

  const papers = readPapers(process.env.PAPERS_FILE || 'data/papers.json')
  const paper = papers.find(p => p.id === id)
  if (!paper) throw new Error(`Paper not found: ${id}`)

  const result = await summarizePaperType(paper, { type, language, force })
  console.log({ id, type, language, cached: result.cached })
  console.log(result.summary)
}

run().catch(err => {
  console.error('❌ summarize:one failed:', err.message)
  process.exit(1)
})
