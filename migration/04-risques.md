# Limites, risques et parades

| Risque | Gravité | Parade |
|---|---|---|
| Publication sans approbation (bug de reprise, double webhook) | Critique | Garde `requireApproval` en code + test ; idempotence par `id:platform` ; mode simulation en phase 5 |
| Coût qui dérape (boucle de reprise, prompt non mis en cache) | Haute | Plafond de dépense Anthropic ; limite de 2 tentatives QA ; suivi du coût par post dans LangSmith |
| Qualité éditoriale en baisse (autre harnais, autres outils de recherche) | Haute | Phase 3 en parallèle avec comparaison quotidienne ; on ne bascule qu'au même niveau |
| API LangChain / LangGraph qui change | Moyenne | Versions figées ; dépendance limitée à LangGraph + l'intégration Anthropic ; pas de chaînes LangChain inutiles |
| Hébergement à ta charge (panne VPS, Chrome qui plante, disque plein) | Moyenne | Docker + redémarrage auto ; alerte Telegram si un cron ne tourne pas ; sauvegarde Postgres quotidienne |
| Secrets (Anthropic, Telegram, Upload-Post) sur un serveur | Moyenne | `.env` hors git, utilisateur non root, accès SSH par clé, webhook Telegram avec jeton secret |
| Upload-Post reste le goulot (quota Basic, plafond X, légendes TikTok perdues en brouillon) | Moyenne | Inchangé par la migration ; garde budget X ; décision forfait à part |
| Webhook Telegram : un seul consommateur possible | Basse | Le service devient le seul lecteur ; le polling `getUpdates` des routines actuelles s'arrête à la bascule |
| Recherche web différente (résultats, pages bloquées) | Basse | Outil web search de Claude d'abord ; Tavily en secours ; le QA vérifie toujours les sources |
| Perte de la souplesse des prompts markdown modifiables par l'agent | Basse | Prompts gardés en fichiers `.md` chargés au démarrage, modifiables et versionnés |
| Double fonctionnement (phases 3–4) : deux systèmes, deux factures | Basse | Bot Telegram de test, aucune publication côté nouveau système avant la phase 5 |

## Ce que la migration n'améliore pas
- La portée sur X : elle dépend de ton activité de réponse, pas du pipeline.
- Les droits musicaux : mêmes règles, mêmes bibliothèques.
- Les limites des plateformes (pas de catalogue musical Meta par API, recherche TikTok limitée aux tendances).

## Ce qu'elle améliore
- Les règles critiques deviennent du code testé.
- Tu peux reprendre un brouillon à n'importe quelle étape.
- Tu vois le coût et la trace de chaque post.
- Tu ne dépends plus des routines Claude Code ; le modèle peut changer nœud par nœud.
