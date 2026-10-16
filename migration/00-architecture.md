# Architecture cible

## Vue d'ensemble
```
cron (VPS) ──► graph "slate"      (D−1 08:00)  scout → envoi Telegram → interrupt(choix) → topics
cron       ──► graph "draft-day"  (D−1 19:00)  pour chaque créneau : sous-graphe "post"
webhook Telegram ──► reprend les graphes en attente (Command({resume}))
cron       ──► graph "publish"    (07:00, 08:00, 13:00, 18:00)  rappels + publication des posts dus
cron       ──► graph "reply-kit"  (09:30)      actus → handles officiels → idées de réponse → Telegram
cron       ──► graph "analyst"    (lundi 06:00) métriques → insights.md → playlist → Telegram
```

## Le sous-graphe « post » (cœur du système)
```
research ──► copywrite ──► format_check ──► design ──► render ──► qa ─┬─► send_draft ──► interrupt(approval)
   ▲                         │ (échec)                               │ (échec 1)              │
   └──── (sujet invérifiable → failed)                      retour au nœud fautif     approve / edit / reject
                                                             (échec 2 → failed)            │
                                                                                  edit → copywrite(texte imposé)
                                                                                  approve → scheduled
```
- **research** (Opus 5.5, effort high, web search + web fetch) → `sources`, `link`, `original`.
- **copywrite** (Sonnet 5.5) → `posts[]`, `alt`, `hashtags`, `original`. Sortie structurée (schéma strict).
- **format_check** (code, pas de LLM) → `post-format.js` : longueurs, fil ≤ 4, hashtags, liens.
- **design** (Sonnet 5.5, avec vision pour relire ses rendus) → `visual` (+ `tiktok` en français, `carousel`).
- **render** (code) → `render.js` : card/clip, vertical FR, vertical EN, carrousel.
- **qa** (Opus 5.5, effort high, web fetch, vision) → `qa.pass`, `qa.reasons`, `qa.blame` (nœud à reprendre).
- **send_draft** (code) → `telegram.js send`.
- **interrupt(approval)** : le graphe s'arrête ; l'état est sauvegardé dans Postgres ; le webhook Telegram le
  reprend avec la décision.

## Le graphe « publish »
```
load_due_posts ──► guard_approved ──► guard_x_budget ──► publish_x ──► publish_meta ──► publish_tiktok
                                                                          │ (handoff si chanson Meta)
                    ──► publish_optional (YouTube, Threads, Bluesky, comptes validés seulement)
                    ──► record_status ──► notify
```
Les nœuds `guard_*` sont du code pur. `publish_*` appellent Upload-Post par son **API REST** (pas par MCP), avec
des clés d'idempotence pour ne jamais publier deux fois.

## L'état (TypeScript, extrait)
```ts
type PostState = {
  id: string; slot: 1 | 2 | 3; role: string; genre: Genre; pillar: string;
  subject: string; topicSource: string;
  sources: Source[];            // url + date de consultation + fait couvert
  posts: string[];              // ≤ 4, chacun ≤ 280
  hashtags: Record<Platform, string[]>;
  original?: {title: string; artist: string};
  link?: string; alt?: string; credit?: string;
  visual: Visual;               // card | clip, tiktok (FR), carousel, platform_audio
  media: {card?: string; clip?: string; vertical?: string; verticalEn?: string; carousel?: string[]};
  qa: {attempt: 0 | 1 | 2; pass?: boolean; reasons?: string[]; blame?: NodeName};
  approval?: {action: 'approve' | 'edit' | 'reject'; text?: string; at: string};
  publish: Partial<Record<Platform, {url?: string; error?: string; requestId?: string}>>;
  status: 'drafting' | 'awaiting_approval' | 'scheduled' | 'published' | 'rejected' | 'expired' | 'failed';
};
```

## Organisation du code
```
studio/                       nouveau dossier (le reste du dépôt ne bouge pas)
  src/graphs/{slate,post,draftDay,publish,replyKit,analyst}.ts
  src/nodes/…                 un fichier par nœud
  src/tools/…                 enveloppes des scripts existants (render, post-format, telegram, upload-post, set-status)
  src/guards/…                règles dures (approbation, budget X, comptes validés, licence audio, fil ≤ 4)
  src/prompts/…               prompts système, repris de .claude/agents/*.md et docs/
  src/server.ts               webhook Telegram + endpoint de santé
  src/cron.ts                 déclencheurs
  test/…                      tests des gardes et des nœuds (LLM simulés)
  Dockerfile, docker-compose.yml (app + Chrome headless), .env.example
```

## Ce qui reste identique
`render/`, `scripts/`, `audio/`, `queue/`, `log/`, `docs/`, les règles éditoriales. Les prompts des agents sont
repris presque mot pour mot ; seules les parties « orchestration » (qui appelle qui, quand) passent dans le code.
