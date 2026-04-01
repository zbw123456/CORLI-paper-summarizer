## Paper Summarizer Pipeline

Integrated research workflow:

1. Fetch + clean + enrich Zotero metadata (user/group library).
2. Generate multilingual AI summaries with Mistral (cached locally).
3. Serve papers + summaries via Express API.
4. Browse papers in a web UI with frequency-based tag filtering.

---

## 1) Environment variables

Create `.env`:

- `MISTRAL_API_KEY=...`
- `MISTRAL_MODEL=mistral-small-latest` (optional)
- `PORT=3000` (optional)
- `TAG_HIGH_MIN=5` (optional)
- `TAG_MEDIUM_MIN=2` (optional)

Zotero:

- `ZOTERO_LIBRARY_TYPE=group` or `user`
- `ZOTERO_GROUP_ID=...` (for group mode)
- `ZOTERO_USER_ID=...` (for user mode)
- `ZOTERO_API_KEY=...` (optional for public libraries, recommended otherwise)
- `ZOTERO_COLLECTION_KEY=...` (optional)
- `ZOTERO_OUTPUT_FILE=data/papers.json` (optional)

Optional Crossref settings:

- `CROSSREF_MAILTO=your-email@example.com`

---

## 2) Fetch and clean Zotero data

- `npm run fetch:zotero`

Output: `data/papers.json` (and `papers.json` compatibility copy)

Cleaning/enrichment includes:

- DOI normalization
- author fallback from Crossref when missing
- abstract fallback from Crossref (if available)
- corrected item type from DOI metadata
- normalized tags

---

## 3) Batch summaries (cached)

- `npm run summarize:batch`

Optional env controls:

- `SUMMARY_LANGUAGE=en` or `fr`
- `SUMMARY_TYPES=general,methodology,dataset`
- `SUMMARY_DELAY_MS=1200`
- `SUMMARY_FORCE=1` (regenerate even when cached)

Cache files:

- `summaries/<paperId>.json`
- `summaries/<paperId>.<lang>.<type>.txt`

---

## 4) Run server + interface

- `npm run dev`

Open:

- `http://localhost:3000`

Main endpoints:

- `GET /api/papers` (+ optional `?tag=...`)
- `GET /api/summaries/:id?type=general&lang=en`
- `POST /api/summaries/generate`
- `POST /api/batch/start` (start async batch generation)
- `GET /api/batch/status` (poll progress)

---

## Notes

- Summary types: `general`, `methodology`, `dataset`
- Prompting is in English internally, with output language support (`en`, `fr`)
- Caching avoids repeated API calls and reduces cost
