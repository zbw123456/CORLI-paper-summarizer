const localized = {
  en: {
    general: 'Write for a non-specialist audience. Keep it concrete and practical.',
    methodology: 'Focus on research design, model/algorithm choices, baselines, and evaluation strategy.',
    dataset: 'Extract dataset details: language(s), source, size, modality, labels, metadata, and splits.'
  },
  fr: {
    general: 'Rédige pour un public non spécialiste, de manière claire et concrète.',
    methodology: 'Mets l’accent sur le protocole, les modèles, les baselines et l’évaluation.',
    dataset: 'Décris les jeux de données: langues, source, taille, modalités, labels, métadonnées, splits.'
  }
}

export const summaryTypes = ['general', 'methodology', 'dataset']

export function buildPrompt({ type, paper, language = 'en' }) {
  const lang = localized[language] ? language : 'en'
  const instruction = localized[lang][type] || localized.en.general

  return `
You are a research assistant.
Output language: ${lang === 'fr' ? 'French' : 'English'}.

Task type: ${type}
Instructions: ${instruction}

Output plain text only.
Do not use Markdown (no headings, no bullet lists, no bold, no code blocks).
Use short paragraphs separated by empty lines.
If the abstract is missing details, explicitly state assumptions.

Paper metadata:
- Title: ${paper.title || 'N/A'}
- Abstract: ${paper.abstract || 'N/A'}
- DOI: ${paper.doi || 'N/A'}
- Tags: ${(paper.tags || []).join(', ') || 'N/A'}
- Authors: ${(paper.authors || []).join(', ') || 'N/A'}
`
}