import fs from 'fs'
import path from 'path'
import 'dotenv/config'

function envValue(...keys) {
  for (const key of keys) {
    const raw = process.env[key]
    if (raw === undefined || raw === null) continue
    const normalized = String(raw).trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    if (normalized) return normalized
  }
  return ''
}

const LIBRARY_TYPE = (envValue('ZOTERO_LIBRARY_TYPE') || 'group').toLowerCase()
const USER_ID = envValue('ZOTERO_USER_ID', 'USER_ID')
const GROUP_ID = envValue('ZOTERO_GROUP_ID', 'GROUP_ID')
const COLLECTION_KEY = envValue('ZOTERO_COLLECTION_KEY', 'COLLECTION_KEY')
const API_KEY = envValue('ZOTERO_API_KEY', 'API_KEY')
const PAGE_SIZE = Number(envValue('ZOTERO_PAGE_SIZE') || 100)
const MAX_ITEMS = Number(envValue('ZOTERO_MAX_ITEMS') || 1000)
const OUTPUT_FILE = envValue('ZOTERO_OUTPUT_FILE') || 'data/papers.json'

const CROSSREF_MAILTO = process.env.CROSSREF_MAILTO || 'research-tool@example.com'
const CROSSREF_BASE = 'https://api.crossref.org/works/'

const ZOTERO_BASE =
  LIBRARY_TYPE === 'user'
    ? `https://api.zotero.org/users/${USER_ID}`
    : `https://api.zotero.org/groups/${GROUP_ID}`

if ((LIBRARY_TYPE === 'user' && !USER_ID) || (LIBRARY_TYPE === 'group' && !GROUP_ID)) {
  throw new Error('Missing Zotero library id. Set ZOTERO_USER_ID or ZOTERO_GROUP_ID.')
}

const crossrefCache = new Map()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function normalizeText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim()
}

function normalizeDoi(doi) {
  if (!doi) return ''
  return String(doi)
    .trim()
    .replace(/^https?:\/\/doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .trim()
}

function parseYear(dateStr) {
  if (!dateStr) return null
  const m = String(dateStr).match(/(19|20)\d{2}/)
  return m ? Number(m[0]) : null
}

function stripJatsTags(text = '') {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function mapCrossrefType(crossrefType = '') {
  const typeMap = {
    'journal-article': 'journalArticle',
    proceedings_article: 'conferencePaper',
    'proceedings-article': 'conferencePaper',
    'book-chapter': 'bookSection',
    book: 'book',
    preprint: 'preprint',
    dissertation: 'thesis',
    report: 'report'
  }
  return typeMap[crossrefType] || ''
}

function normalizeTags(tags = []) {
  return tags
    .map(tag => normalizeText(tag?.tag || tag || ''))
    .filter(Boolean)
}

function normalizeAuthors(creators = []) {
  return creators
    .filter(c => ['author', 'editor', 'contributor'].includes(c?.creatorType))
    .map(c => {
      const first = normalizeText(c.firstName || '')
      const last = normalizeText(c.lastName || '')
      const single = normalizeText(c.name || '')
      return normalizeText(`${first} ${last}`) || single
    })
    .filter(Boolean)
}

async function fetchCrossrefByDoi(doi) {
  const normalized = normalizeDoi(doi)
  if (!normalized) return null
  if (crossrefCache.has(normalized)) return crossrefCache.get(normalized)

  try {
    const res = await fetch(`${CROSSREF_BASE}${encodeURIComponent(normalized)}`, {
      headers: {
        'User-Agent': `paper-summarizer (mailto:${CROSSREF_MAILTO})`
      }
    })

    if (!res.ok) {
      crossrefCache.set(normalized, null)
      return null
    }

    const payload = await res.json()
    const message = payload?.message || null
    crossrefCache.set(normalized, message)
    return message
  } catch {
    crossrefCache.set(normalized, null)
    return null
  }
}

async function fetchZoteroItems() {
  const all = []
  let start = 0

  while (all.length < MAX_ITEMS) {
    const params = new URLSearchParams({
      format: 'json',
      limit: String(Math.min(PAGE_SIZE, MAX_ITEMS - all.length)),
      start: String(start)
    })

    if (COLLECTION_KEY) params.set('collection', COLLECTION_KEY)

    const url = `${ZOTERO_BASE}/items?${params.toString()}`
    const res = await fetch(url, {
      headers: API_KEY ? { 'Zotero-API-Key': API_KEY } : {}
    })

    if (!res.ok) {
      throw new Error(`Zotero API error ${res.status}: ${await res.text()}`)
    }

    const page = await res.json()
    if (!Array.isArray(page) || page.length === 0) break

    all.push(...page)
    start += page.length

    if (page.length < PAGE_SIZE) break
    await sleep(200)
  }

  return all
}

async function cleanAndEnrichItems(items) {
  const cleaned = []

  for (const item of items) {
    const data = item?.data || {}
    if (!data.title) continue
    if (['attachment', 'annotation', 'note'].includes(data.itemType)) continue

    const doi = normalizeDoi(data.DOI)
    const crossref = doi ? await fetchCrossrefByDoi(doi) : null

    const authors = normalizeAuthors(data.creators)
    const crossrefAuthors = (crossref?.author || [])
      .map(a => normalizeText(`${a?.given || ''} ${a?.family || ''}`))
      .filter(Boolean)

    const finalAuthors = authors.length ? authors : crossrefAuthors
    const title = normalizeText(data.title)
    const abstract = normalizeText(data.abstractNote) || stripJatsTags(crossref?.abstract || '')

    const correctedItemType = mapCrossrefType(crossref?.type)

    cleaned.push({
      id: data.key ? `paper_${data.key}` : `paper_${String(cleaned.length + 1).padStart(4, '0')}`,
      zoteroKey: data.key || null,
      libraryType: LIBRARY_TYPE,
      itemType: data.itemType || '',
      correctedItemType: correctedItemType || data.itemType || '',
      title,
      abstract,
      doi,
      tags: normalizeTags(data.tags),
      authors: finalAuthors,
      year: parseYear(data.date),
      publication: normalizeText(data.publicationTitle || data.bookTitle || ''),
      url: normalizeText(data.url || '')
    })

    await sleep(120)
  }

  return cleaned
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
}

async function run() {
  console.log(`Fetching Zotero ${LIBRARY_TYPE} library...`)
  const rawItems = await fetchZoteroItems()
  const papers = await cleanAndEnrichItems(rawItems)

  ensureDir(OUTPUT_FILE)
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(papers, null, 2), 'utf-8')

  if (OUTPUT_FILE !== 'papers.json') {
    fs.writeFileSync('papers.json', JSON.stringify(papers, null, 2), 'utf-8')
  }

  const missingAuthors = papers.filter(p => p.authors.length === 0).length
  const missingAbstracts = papers.filter(p => !p.abstract).length

  console.log(`✅ Exported ${papers.length} cleaned papers -> ${OUTPUT_FILE}`)
  console.log(`ℹ️ Missing authors: ${missingAuthors}, missing abstracts: ${missingAbstracts}`)
}

run().catch(err => {
  console.error('❌ Fetch failed:', err.message)
  process.exit(1)
})