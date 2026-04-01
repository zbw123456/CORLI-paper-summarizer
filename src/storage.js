import fs from 'fs'
import path from 'path'

const SUMMARY_DIR = process.env.SUMMARY_DIR || 'summaries'

export function getSummaryPath(paperId) {
  return path.join(SUMMARY_DIR, `${paperId}.json`)
}

export function getSummaryTextPath(paperId, type, language) {
  return path.join(SUMMARY_DIR, `${paperId}.${language}.${type}.txt`)
}

export function loadPaperSummaryCache(paperId) {
  const file = getSummaryPath(paperId)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

export function savePaperSummaryCache(paperId, cache) {
  fs.mkdirSync(SUMMARY_DIR, { recursive: true })
  fs.writeFileSync(getSummaryPath(paperId), JSON.stringify(cache, null, 2), 'utf-8')
}

export function saveSummaryText(paperId, type, language, content) {
  fs.mkdirSync(SUMMARY_DIR, { recursive: true })
  fs.writeFileSync(getSummaryTextPath(paperId, type, language), content || '', 'utf-8')
}

export function saveSummaries(paperId, summaries) {
  const cache = {
    paperId,
    updatedAt: new Date().toISOString(),
    summaries: {
      en: summaries
    }
  }
  savePaperSummaryCache(paperId, cache)
}

export function readPapers(filePath = 'data/papers.json') {
  const candidates = [filePath, 'papers.json']

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue
    const raw = fs.readFileSync(file, 'utf-8')
    if (!raw.trim()) continue

    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  }

  return []
}