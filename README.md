# Paper Summarizer (Pure JavaScript)
*(See French version below / Voir la version française ci-dessous)*
**Author:** Bowen Zhang  
**This work was developed with support from the CORLI Project at CNRS, Paris.**

**Acknowledgements:**  
The author sincerely thanks the three supervisors: Thomas Gaillat, Maria ZIMINA-POIROT, and Sarra El Ayari for their guidance and support throughout this project.

## Project Overview

**Paper Summarizer** is a pure JavaScript frontend tool for fetching academic paper metadata from Zotero and generating paper in multilingual analysis summaries and analysis.

**Core Features:**
- Zotero data synchronization: supports user/group libraries, retrieving title, abstract, authors, year, DOI, etc.
- Paper summary generation: generates three-part summaries (general overview, methodology, dataset description) for each paper
- Tag management and filtering: displays tags by frequency level with multi-select filtering support
- Keyword network graph: force-directed algorithm visualizing keywords and their co-occurrence relationships
- Local caching: papers and summaries stored in browser LocalStorage

**Technology Stack:**
- Frontend: HTML + Bootstrap 5 + vanilla JavaScript (framework-free)
- Data sources: Zotero Group ID, Zotero API, Mistral API
- Deployment: static server only

**Use Cases:**
Research group literature management, classroom teaching, rapid literature review browsing.

For first-time setup on a new machine:

- Chinese guide: [INSTALL_FROM_ZERO.md](INSTALL_FROM_ZERO.md)
- English guide: [INSTALL_FROM_ZERO_EN.md](INSTALL_FROM_ZERO_EN.md)
- Guide français: [INSTALL_FROM_ZERO_FR.md](INSTALL_FROM_ZERO_FR.md)

## Current architecture

- Frontend: single-page [index.html](index.html)
- UI: HTML + Bootstrap
- Runtime: vanilla JavaScript in browser
- Data: JSON files in [data](data) and [summaries](summaries)
- Optional local config: [config.local.js](config.local.js) (not committed)

No Node.js backend is required.

## Quick start

```bash
cd /Users/bzhang/Downloads/paper-summarizer
./start-server.sh
```

Open:

`http://localhost:8000`

****************************************************************************

# Résumé de Papier (Pur JavaScript)
**Auteur:** Bowen Zhang  
**Ce travail a été développé avec le soutien du Projet CORLI au CNRS, Paris.**

**Remerciements:**  
L'auteur remercie sincèrement les trois superviseurs : Thomas Gaillat, Maria ZIMINA-POIROT, et Sarra El Ayari pour leur guidance et soutien tout au long de ce projet.

## Aperçu du projet

**Paper Summarizer** est un outil frontend en JavaScript pur pour récupérer les métadonnées des articles académiques depuis Zotero et générer des résumés et analyses multilingues.

**Fonctionnalités principales:**
- Synchronisation des données Zotero : supporte les bibliothèques utilisateur/groupe, récupère le titre, résumé, auteurs, année, DOI, etc.
- Génération de résumés : génère des résumés en trois parties (aperçu général, méthodologie, description de l'ensemble de données) pour chaque article
- Gestion des étiquettes et filtrage : affiche les étiquettes par niveau de fréquence avec support de filtrage multi-sélection
- Graphe de réseau de mots-clés : algorithme force-directed visualisant les mots-clés et leurs relations de co-occurrence
- Mise en cache locale : articles et résumés stockés dans LocalStorage du navigateur

**Pile technologique:**
- Frontend : HTML + Bootstrap 5 + JavaScript vanilla (sans framework)
- Sources de données : Zotero Group, ID API Zotero, API Mistral
- Déploiement : serveur statique uniquement

**Cas d'utilisation:**
Gestion des références de groupe de recherche, enseignement en classe, navigation rapide des revues de littérature.

## Configuration initiale

Pour la première configuration sur une nouvelle machine :

- Guide chinois : [INSTALL_FROM_ZERO.md](INSTALL_FROM_ZERO.md)
- Guide anglais : [INSTALL_FROM_ZERO_EN.md](INSTALL_FROM_ZERO_EN.md)
- Guide français : [INSTALL_FROM_ZERO_FR.md](INSTALL_FROM_ZERO_FR.md)

## Architecture actuelle

- Frontend : page unique [index.html](index.html)
- UI : HTML + Bootstrap
- Runtime : JavaScript vanilla dans le navigateur
- Données : fichiers JSON dans [data](data) et [summaries](summaries)
- Configuration locale optionnelle : [config.local.js](config.local.js) (non commité)

Aucun backend Node.js n'est requis.

## Démarrage rapide

```bash
cd /Users/bzhang/Downloads/paper-summarizer
./start-server.sh
```

Ouvert dans votre navigateur:

`http://localhost:8000`

