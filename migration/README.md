# Migration Polyrhythm Studio → LangGraph

Plan de reconstruction du pipeline Polyrhythm (aujourd'hui : routines Claude Code + prompts markdown + sous-agents)
en un service **LangGraph.js** autonome, hébergé par le propriétaire. Décidé le 2026-10-16.

**Rien n'est construit tant qu'une phase n'est pas lancée explicitement par le propriétaire.** Le pipeline actuel
reste en production jusqu'à la fin de la phase 5.

| Fichier | Contenu |
|---|---|
| [00-architecture.md](00-architecture.md) | Graphes, état, nœuds, interruptions humaines, planification |
| [01-phases.md](01-phases.md) | Le plan exécutable : phases, tâches, critères d'acceptation |
| [02-inventaire.md](02-inventaire.md) | Correspondance existant → outils, règles → gardes en code |
| [03-couts.md](03-couts.md) | Estimation des coûts mensuels (API, recherche web, hébergement, observabilité) |
| [04-risques.md](04-risques.md) | Limites, risques et parades |

## Décisions
- **Framework** : LangGraph.js (`@langchain/langgraph`), TypeScript. Même langage que `render/` et `scripts/` :
  aucun outil n'est réécrit, seulement enveloppé.
- **Modèles** : Claude via `@langchain/anthropic`. Opus 5.5 pour la recherche et le QA (là où les erreurs coûtent
  cher), Sonnet 5.5 pour la rédaction et le design, Haiku 5.5 pour les tâches mécaniques. À valider en phase 3
  sur des brouillons réels.
- **État** : checkpointer Postgres (Supabase ou Neon, offre gratuite) ; les fichiers `queue/` et `log/` restent la
  trace lisible et versionnée dans git.
- **Validation humaine** : `interrupt()` de LangGraph + webhook Telegram. La publication est impossible sans
  décision `approve`/`edit` enregistrée dans l'état : garantie dans le code, plus seulement dans un prompt.
- **Hébergement** : un petit VPS (Hetzner ou équivalent) avec Docker, Chrome headless et ffmpeg ; cron système.
- **Observabilité** : LangSmith (offre Developer gratuite au départ).

## Statut
| Phase | Statut |
|---|---|
| 0. Préparation | à faire |
| 1. Outils et gardes | à faire |
| 2. Squelette du graphe | à faire |
| 3. Pilote créneau 2 (brouillons seulement) | à faire |
| 4. Tous les créneaux + routines annexes | à faire |
| 5. Publication + bascule | à faire |
