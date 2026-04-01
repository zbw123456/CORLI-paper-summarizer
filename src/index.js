import { readPapers } from './storage.js'
import { summarizeBatch } from './summarizer.js'

async function run() {
  const papers = readPapers(process.env.PAPERS_FILE || 'data/papers.json')
  const stats = await summarizeBatch(papers, {
    language: process.env.SUMMARY_LANGUAGE || 'en',
    delayMs: Number(process.env.SUMMARY_DELAY_MS || 1200),
    force: process.env.SUMMARY_FORCE === '1'
  })
  console.log('Batch stats:', stats)
}

run().catch(err => {
  console.error(err.message)
  process.exit(1)
})