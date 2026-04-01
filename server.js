import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

import { readPapers } from './src/storage.js'
import { summarizeBatch, summarizePaperType } from './src/summarizer.js'
import { summaryTypes } from './src/prompts.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, 'public')
const indexFile = path.join(publicDir, 'index.html')
const papersPath = process.env.PAPERS_FILE || 'data/papers.json'
const TAG_HIGH_MIN = Number(process.env.TAG_HIGH_MIN || 5)
const TAG_MEDIUM_MIN = Number(process.env.TAG_MEDIUM_MIN || 2)

const batchState = {
  running: false,
  startedAt: null,
  finishedAt: null,
  language: 'en',
  force: false,
  delayMs: 1200,
  types: [...summaryTypes],
  stats: {
    papers: 0,
    total: 0,
    processed: 0,
    generated: 0,
    cached: 0,
    failed: 0
  },
  error: null
}

function getTagCounts(papers) {
  const counts = {}
  for (const paper of papers) {
    for (const tag of paper.tags || []) {
      counts[tag] = (counts[tag] || 0) + 1
    }
  }
  return counts
}

function buildTagGroups(counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const grouped = {
    high: [],
    medium: [],
    low: []
  }

  for (const [tag, count] of entries) {
    if (count >= TAG_HIGH_MIN) grouped.high.push({ tag, count })
    else if (count >= TAG_MEDIUM_MIN) grouped.medium.push({ tag, count })
    else grouped.low.push({ tag, count })
  }

  return grouped
}

function findPaperOrNull(papers, id) {
  return papers.find(p => p.id === id) || null
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, date: new Date().toISOString() })
})

app.get('/api/papers', (req, res) => {
  const papers = readPapers(papersPath)
  const tag = req.query.tag
  const filtered = tag ? papers.filter(p => (p.tags || []).includes(tag)) : papers

  const tagCounts = getTagCounts(papers)
  const tagGroups = buildTagGroups(tagCounts)

  res.json({
    total: papers.length,
    returned: filtered.length,
    papers: filtered,
    tags: tagGroups,
    tagThresholds: {
      highMin: TAG_HIGH_MIN,
      mediumMin: TAG_MEDIUM_MIN
    }
  })
})

app.get('/api/batch/status', (_req, res) => {
  res.json(batchState)
})

app.post('/api/batch/start', async (req, res) => {
  if (batchState.running) {
    return res.status(409).json({ error: 'Batch already running', state: batchState })
  }

  const {
    language = 'en',
    force = false,
    delayMs = 1200,
    types = summaryTypes,
    ids = null
  } = req.body || {}

  const validTypes = (Array.isArray(types) ? types : summaryTypes).filter(t => summaryTypes.includes(t))
  if (validTypes.length === 0) {
    return res.status(400).json({ error: 'No valid summary types provided' })
  }

  const allPapers = readPapers(papersPath)
  const papers = Array.isArray(ids) && ids.length
    ? allPapers.filter(p => ids.includes(p.id))
    : allPapers

  batchState.running = true
  batchState.startedAt = new Date().toISOString()
  batchState.finishedAt = null
  batchState.language = language
  batchState.force = !!force
  batchState.delayMs = Number(delayMs)
  batchState.types = validTypes
  batchState.error = null
  batchState.stats = {
    papers: papers.length,
    total: papers.length * validTypes.length,
    processed: 0,
    generated: 0,
    cached: 0,
    failed: 0
  }

  summarizeBatch(papers, {
    language,
    force: !!force,
    delayMs: Number(delayMs),
    types: validTypes,
    onProgress: stats => {
      batchState.stats = {
        papers: stats.papers,
        total: stats.total,
        processed: stats.processed,
        generated: stats.generated,
        cached: stats.cached,
        failed: stats.failed
      }
    }
  })
    .then(stats => {
      batchState.stats = stats
      batchState.running = false
      batchState.finishedAt = new Date().toISOString()
    })
    .catch(err => {
      batchState.running = false
      batchState.error = err.message || 'Batch failed'
      batchState.finishedAt = new Date().toISOString()
    })

  return res.status(202).json({ message: 'Batch started', state: batchState })
})

app.get('/api/summaries/:id', async (req, res) => {
  try {
    const id = req.params.id
    const type = req.query.type || 'general'
    const language = req.query.lang || 'en'

    if (!summaryTypes.includes(type)) {
      return res.status(400).json({ error: `Unsupported type: ${type}` })
    }

    const papers = readPapers(papersPath)
    const paper = findPaperOrNull(papers, id)
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' })
    }

    const result = await summarizePaperType(paper, { type, language, force: false })
    return res.json({
      id,
      type,
      language,
      summary: result.summary,
      cached: result.cached
    })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Summary generation failed' })
  }
})

app.post('/api/summaries/generate', async (req, res) => {
  try {
    const { id, type = 'general', language = 'en', force = false } = req.body || {}

    if (!id) return res.status(400).json({ error: 'Missing id' })
    if (!summaryTypes.includes(type)) {
      return res.status(400).json({ error: `Unsupported type: ${type}` })
    }

    const papers = readPapers(papersPath)
    const paper = findPaperOrNull(papers, id)
    if (!paper) return res.status(404).json({ error: 'Paper not found' })

    const result = await summarizePaperType(paper, { type, language, force })
    res.json({ id, type, language, ...result })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Summary generation failed' })
  }
})

app.use(express.static(publicDir))

app.get('/', (_req, res) => {
  res.sendFile(indexFile)
})

app.get('/index.html', (_req, res) => {
  res.sendFile(indexFile)
})

const PORT = Number(process.env.PORT || 3000)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})