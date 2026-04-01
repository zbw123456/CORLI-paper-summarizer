import { askMistral } from './mistralClient.js'
import { buildPrompt, summaryTypes } from './prompts.js'
import {
  loadPaperSummaryCache,
  savePaperSummaryCache,
  saveSummaryText
} from './storage.js'
import { sleep } from './utils.js'

function createBaseCache(paper) {
  return {
    paperId: paper.id,
    title: paper.title,
    updatedAt: new Date().toISOString(),
    summaries: {}
  }
}

function readCached(cache, type, language) {
  return cache?.summaries?.[language]?.[type] || ''
}

function writeCached(cache, type, language, summary) {
  cache.summaries[language] ||= {}
  cache.summaries[language][type] = summary
  cache.updatedAt = new Date().toISOString()
}

export async function summarizePaperType(paper, { type, language = 'en', force = false } = {}) {
  if (!summaryTypes.includes(type)) {
    throw new Error(`Unsupported summary type: ${type}`)
  }

  const cache = loadPaperSummaryCache(paper.id) || createBaseCache(paper)
  cache.summaries[language] ||= {}
  const cached = readCached(cache, type, language)

  if (cached && !force) {
    return { summary: cached, cached: true }
  }

  const prompt = buildPrompt({ type, paper, language })
  const summary = await askMistral(prompt)

  writeCached(cache, type, language, summary)
  savePaperSummaryCache(paper.id, cache)
  saveSummaryText(paper.id, type, language, summary)

  return { summary, cached: false }
}

export async function summarizePaperAllTypes(paper, { language = 'en', force = false } = {}) {
  const out = {}
  for (const type of summaryTypes) {
    const { summary } = await summarizePaperType(paper, { type, language, force })
    out[type] = summary
  }
  return out
}

export async function summarizePaper(paper, options = {}) {
  return summarizePaperAllTypes(paper, options)
}

export async function summarizeBatch(
  papers,
  {
    language = 'en',
    force = false,
    delayMs = 1200,
    types = summaryTypes,
    onProgress = null
  } = {}
) {
  const total = papers.length * types.length
  let processed = 0

  const stats = {
    papers: papers.length,
    total,
    processed,
    generated: 0,
    cached: 0,
    failed: 0
  }

  for (const paper of papers) {
    for (const type of types) {
      try {
        const result = await summarizePaperType(paper, { type, language, force })
        if (result.cached) stats.cached += 1
        else stats.generated += 1
      } catch {
        stats.failed += 1
      }
      processed += 1
      stats.processed = processed
      if (typeof onProgress === 'function') {
        onProgress({ ...stats, paperId: paper.id, type })
      }
      await sleep(delayMs)
    }
  }

  return stats
}