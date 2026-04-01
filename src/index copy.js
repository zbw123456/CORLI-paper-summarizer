import fs from 'fs'
import { summarizePaper } from './summarizer.js'
import { saveSummaries } from './storage.js'
import { sleep } from './utils.js'

const papers = JSON.parse(fs.readFileSync('data/papers.json'))

async function run() {
  for (const paper of papers) {
    console.log(`\nProcessing: ${paper.title}`)
    const summaries = await summarizePaper(paper)
    saveSummaries(paper.id, summaries)
    await sleep(1000) // 防止请求过快
  }

  console.log('\nAll papers processed.')
}

run()