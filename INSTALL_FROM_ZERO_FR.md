# Installation et exécution depuis zéro (Français)

## 1) Prérequis

Vous avez besoin de l’un des outils suivants :

- `python3` (recommandé)
- ou `npx`

Vérification :

```bash
python3 --version
# ou
npx --version
```

## 2) Aller dans le dossier du projet

```bash
cd /Users/bzhang/Downloads/paper-summarizer
```

## 3) Configurer les clés API (recommandé)

Copiez le modèle :

```bash
cp config.local.example.js config.local.js
```

Modifiez `config.local.js` et renseignez :

- `libraryType` (`group` ou `user`)
- `zoteroGroupId` ou `zoteroUserId`
- `zoteroApiKey`
- `mistralApiKey`

> `config.local.js` est ignoré par git et doit rester local.

## 4) Démarrer le serveur local

```bash
./start-server.sh
```

Ouvrez :

`http://localhost:8000`

## 5) Premier lancement

- Si `config.local.js` est prêt : cliquez sur `Fetch Papers`, puis `Generate Summaries`
- Sinon : saisissez les informations dans le panneau de configuration à gauche

## 6) Dépannage

### La page s’ouvre mais aucun résumé n’apparaît

Les résumés ne sont pas encore générés ou chargés.

- Cliquez sur `Generate Summaries`
- Ou vérifiez que `summaries/*.json` existe
- Rafraîchissez en force (`Cmd + Shift + R`)

### "No papers found"

- Cliquez sur `Fetch Papers`
- Ou vérifiez que `data/papers.json` existe et contient un JSON valide

### Port déjà utilisé

```bash
./start-server.sh 5050
```

Puis ouvrez `http://localhost:5050`.
