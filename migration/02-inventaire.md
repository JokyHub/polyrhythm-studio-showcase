# Inventaire : existant → cible

## Outils (code existant, enveloppé tel quel)
| Existant | Outil cible | Notes |
|---|---|---|
| `render/render.js` (card, clip, `--vertical`, `--vertical --en`, `--carousel`, `--stills`) | `renderVisual(id, variant)` | Processus enfant ; Chrome headless dans le conteneur |
| `scripts/post-format.js` (`checkPosts`, `checkHashtags`, `withHashtags`, `musicNote`) | import direct | Déjà des fonctions pures |
| `scripts/telegram.js` (`send`, `propose`, `slate`, `approvals`, `handoff`, `notify`) | `telegram.*` | La lecture des décisions passe du polling `getUpdates` au webhook |
| `scripts/set-status.js` | `setStatus(id, status, url?)` | Écrit aussi l'état LangGraph |
| `scripts/plan-day.js` | nœud `planDay` | Rotation des genres, ids, créneaux |
| `render/text-check.js` | garde `noMojibake` | |
| Upload-Post (MCP) | client REST `uploadPost.*` | MCP non requis côté serveur |
| WebSearch / WebFetch | outils serveur Claude `web_search` / `web_fetch` | Ou Tavily en secours |

## Agents → nœuds
| Agent actuel | Nœud | Modèle proposé |
|---|---|---|
| scout | `scout` (graphe slate) | Opus 5.5, effort medium, web search |
| researcher | `research` | Opus 5.5, effort high, web search + fetch |
| copywriter | `copywrite` | Sonnet 5.5, sortie structurée |
| visual-designer / motion-designer | `design` | Sonnet 5.5, vision pour relire les rendus |
| qa-checker | `qa` | Opus 5.5, effort high, web fetch + vision |
| coordinator / publisher / proposer | code du graphe | aucun LLM pour l'orchestration |
| analyst | `analyst` | Sonnet 5.5 (rédaction du rapport sur chiffres réels) |
| reply kit | `replyKit` | Sonnet 5.5, web search |

## Règles → gardes en code
| Règle (CLAUDE.md / prompts) | Garde |
|---|---|
| Rien n'est publié sans APPROVE / EDIT / APPROVE ALL | `requireApproval(state)` avant tout nœud `publish_*` |
| Jamais le profil `jeaneudes` ; comptes optionnels validés seulement | `allowedAccount(platform, handle)` |
| X : 10 publications / 24 h ; pas de demi-fil | `xBudget(needed)` |
| Fil ≤ 4 posts, posts ≤ 280, pas de lien, hashtags selon quotas | `checkPosts` + `checkHashtags` |
| Audio uniquement depuis `library.json` avec preuve de licence | `licensedAudio(trackId)` |
| QA raté deux fois → `failed` | compteur `qa.attempt` dans l'état |
| Brouillon non approuvé à l'heure du créneau → `expired` | `expireIfDue(now)` |
| Jamais deux publications du même post | clé d'idempotence `id:platform` |

## Ce qui reste du ressort des prompts
Le ton, les piliers, les formats, la prudence culturelle, l'étiquetage des opinions, les accroches, la question
finale, le choix des hashtags : repris de `docs/editorial-guidelines.md`, `docs/polyrhythm-scope.md` et des
`.claude/agents/*.md`.
