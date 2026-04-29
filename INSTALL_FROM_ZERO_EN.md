# Install and Run from Scratch (English)

## 1) Prerequisites

You only need one of the following:

- `python3` (recommended)
- or `npx`

Check:

```bash
python3 --version
# or
npx --version
```

## 2) Go to the project folder

```bash
cd /Users/bzhang/Downloads/paper-summarizer
```

## 3) Configure API keys (recommended)

Copy the template:

```bash
cp config.local.example.js config.local.js
```

Edit `config.local.js` and fill:

- `libraryType` (`group` or `user`)
- `zoteroGroupId` or `zoteroUserId`
- `zoteroApiKey`
- `mistralApiKey`

> `config.local.js` is ignored by git and should stay local.

## 4) Start the local server

```bash
./start-server.sh
```

Open:

`http://localhost:8000`

## 5) First run

- If `config.local.js` is ready: click `Fetch Papers`, then `Generate Summaries`
- If not: enter credentials in the left configuration panel first

## 6) Troubleshooting

### Page loads but no summary appears

This means summaries are not generated yet or not loaded yet.

- Click `Generate Summaries`
- Or make sure `summaries/*.json` exists
- Hard refresh (`Cmd + Shift + R`)

### "No papers found"

- Click `Fetch Papers`
- Or verify `data/papers.json` exists and is valid JSON

### Port already in use

```bash
./start-server.sh 5050
```

Then open `http://localhost:5050`.
