// NOTE: This example config documents runtime settings and AI usage.
// Files in this project that contain AI-generated outputs:
// - summaries/*.json : produced by Mistral (model: mistral-small-latest), each JSON includes `source` and `model` fields.
// Runtime scripts that call the AI model: `index.html` (client-side), and other helpers if present.
// Copy this file to config.local.js and fill your own values. Do NOT commit config.local.js if it contains private API keys.
// NOTE: Some comments/documentation in this file were generated with GPT-5 mini.
// NOTE: Some helper code snippets in this repository were generated with Claude Code Haiku 4.5.
// Do not commit config.local.js if it contains private API keys.
window.APP_CONFIG = {
  libraryType: 'group', // 'group' or 'user'
  zoteroGroupId: '',
  zoteroUserId: '',
  zoteroApiKey: '',
  mistralApiKey: ''
};
