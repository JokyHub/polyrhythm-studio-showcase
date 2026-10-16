# Plan exécutable

Chaque phase se termine par un commit, des tests verts (`npm test` et `npm test --prefix studio`) et un point
avec le propriétaire. Une phase ne démarre que sur son feu vert.

## Phase 0 — Préparation (propriétaire, ~1 h ; agent, ~½ jour)
Propriétaire :
- [ ] Créer une clé API Anthropic (console.anthropic.com) avec une **limite de dépense mensuelle** (ex. 150 $).
- [ ] Créer un VPS (Hetzner CX22 ou équivalent, Ubuntu) et me donner un accès SSH, ou choisir un PaaS (Railway, Fly.io).
- [ ] Créer une base Postgres gratuite (Neon ou Supabase).
- [ ] Créer un compte LangSmith (offre Developer gratuite).
- [ ] Récupérer la clé API REST Upload-Post (tableau de bord).
- [ ] Choisir une API de recherche web : l'outil web search de Claude (recommandé, rien à créer) ou Tavily.
Agent :
- [ ] Mesurer une semaine de consommation réelle des routines actuelles (tokens par routine) pour affiner `03-couts.md`.
- [ ] Figer les versions : `@langchain/langgraph`, `@langchain/anthropic`, `@langchain/langgraph-checkpoint-postgres`.
**Critère** : secrets dans un `.env` hors git ; `studio/.env.example` commité sans valeur.

## Phase 1 — Outils et gardes (~1 semaine)
- [ ] `studio/` : projet TypeScript, tests (`node --test` ou vitest), lint.
- [ ] Envelopper chaque script existant en outil typé (voir `02-inventaire.md`), sans changer leur comportement.
- [ ] Client REST Upload-Post minimal (list_users, upload_text/photos/video, staging média, get_status, analytics,
      history) avec idempotence et journalisation.
- [ ] Gardes en code, chacune testée : approbation obligatoire, budget X 10/24 h, fil ≤ 4, comptes validés
      (CLAUDE.md), audio présent dans `library.json` avec licence, jamais le profil `jeaneudes`.
**Critère** : 100 % des gardes couvertes par des tests, y compris les cas de refus.

## Phase 2 — Squelette du graphe (~3–4 jours)
- [ ] Graphe « post » avec nœuds LLM **simulés** (réponses enregistrées) : on teste le flux, pas les modèles.
- [ ] Checkpointer Postgres, `interrupt()` d'approbation, reprise via un faux webhook.
- [ ] Serveur webhook Telegram (vérification de l'ID du propriétaire, secret de webhook).
- [ ] Traces LangSmith.
**Critère** : un brouillon simulé traverse tout le graphe, s'arrête à l'approbation, reprend sur `approve` et
sur `edit`, échoue proprement après deux QA ratés.

## Phase 3 — Pilote : créneau 2, brouillons seulement (~1 semaine + 7 jours d'observation)
- [ ] Brancher les vrais modèles sur research, copywrite, design, qa ; prompts repris de `.claude/agents/`.
- [ ] Faire tourner en parallèle de l'existant, sur un **bot Telegram de test** : aucune publication.
- [ ] Comparer chaque jour avec le brouillon du pipeline actuel : exactitude (QA indépendant), ton, rendu, coût.
- [ ] Ajuster le choix de modèle et l'effort par nœud selon les mesures.
**Critère** : 7 brouillons sur 7 au niveau de l'actuel (avis du propriétaire), coût réel par post mesuré.

## Phase 4 — Tous les créneaux et routines annexes (~1 semaine)
- [ ] Graphes « slate » (scout) et « draft-day » (3 posts en parallèle).
- [ ] « reply-kit » et « analyst » (lecture seule sur Upload-Post).
- [ ] Toujours en parallèle, toujours sans publication, bot de test.
**Critère** : une semaine complète de slates et brouillons conformes, rapports lundi identiques en contenu.

## Phase 5 — Publication et bascule (~1 semaine)
- [ ] Graphe « publish » d'abord en **mode simulation** : il écrit ce qu'il publierait, sans appeler Upload-Post.
- [ ] Puis publication réelle sur **un seul** créneau pendant 3 jours, les routines actuelles désactivées pour ce
      créneau uniquement.
- [ ] Bascule complète : désactiver les routines Claude Code (propose, draft, publish, reply kit, analyst), garder
      leurs prompts dans git.
- [ ] Deux semaines sans incident → la migration est close ; on supprime le code mort.
**Critère** : aucun post publié sans approbation, aucun doublon, aucun dépassement du budget X.

## Retour arrière (à tout moment)
Réactiver les cinq routines Claude Code (RemoteTrigger) et arrêter le service. Les fichiers `queue/` et `log/`
restent la source de vérité commune, donc rien n'est perdu.
