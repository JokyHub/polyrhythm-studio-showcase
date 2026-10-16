# Coûts mensuels estimés

Estimation du 2026-10-16, **à remplacer par des mesures réelles en phase 0 et en phase 3**. Marge d'erreur : ±50 %.

## Tarifs utilisés (API Anthropic, $ par million de tokens)
| Modèle | Entrée | Sortie | Lecture cache |
|---|---|---|---|
| Opus 5.5 | 4,00 | 20,00 | 0,20 |
| Sonnet 5.5 | 2,00 | 10,00 | 0,20 |
| Haiku 5.5 | 0,10 | 0,50 | — |
Recherche web (outil serveur Claude) : environ 10 $ pour 1 000 recherches (à vérifier sur la page de tarifs).

## Volume estimé
| Travail | Fréquence | Tokens entrée | Tokens sortie | Recherches |
|---|---|---|---|---|
| research | 3 / jour | ~120 k | ~8 k | ~10 |
| copywrite | 3 / jour | ~25 k | ~3 k | — |
| design (avec vision) | 3 / jour | ~40 k | ~5 k | — |
| qa (avec vision) | 3 / jour | ~70 k | ~3 k | ~3 |
| scout (slate) | 1 / jour | ~150 k | ~8 k | ~20 |
| reply kit | 1 / jour | ~120 k | ~6 k | ~15 |
| analyst | 1 / semaine | ~150 k | ~10 k | — |
Les reprises après un QA raté (~1 post sur 4) ajoutent environ 15 %.

**Total mensuel ≈ 34 M tokens en entrée, 2,2 M en sortie, ~2 300 recherches.** Les prompts système et les
consignes éditoriales (~15 k tokens par appel) sont mis en cache : on compte ~50 % de l'entrée en lecture cache.

## Trois scénarios (API seule)
| Scénario | Répartition | Coût API / mois |
|---|---|---|
| Tout Opus 5.5 | tous les nœuds | ~120–140 $ |
| **Mixte (recommandé)** | Opus pour research, qa, scout ; Sonnet pour le reste | **~75–95 $** |
| Économe | Sonnet partout, Opus pour qa seulement | ~50–60 $ |
Batch API (−50 %) : possible pour l'analyste et le reply kit (pas pressés), gain ~5 $/mois.

## Autres postes
| Poste | Coût / mois |
|---|---|
| Recherche web (~2 300) | ~20–25 $ |
| VPS (2 vCPU, 4 Go, Chrome + ffmpeg) | ~5–10 $ |
| Postgres (Neon / Supabase, offre gratuite) | 0 $ |
| LangSmith Developer (5 000 traces/mois, 1 siège) | 0 $ (Plus : ~39 $/siège si dépassement) |
| LangGraph Platform (hébergement managé) | non retenu : auto-hébergement |
| Upload-Post | inchangé (abonnement actuel) |

## Total
| | Bas | Recommandé | Haut |
|---|---|---|---|
| API Claude | 50 $ | 85 $ | 140 $ |
| Recherche web | 15 $ | 22 $ | 30 $ |
| Hébergement + bases | 5 $ | 8 $ | 15 $ |
| Observabilité | 0 $ | 0 $ | 39 $ |
| **Total / mois** | **~70 $** | **~115 $** | **~225 $** |

Plus les ~2–4 semaines de construction (phases 1 à 5), faites par l'agent dans l'abonnement actuel, et une
semaine de double fonctionnement (phase 3–4) où les deux systèmes consomment en parallèle.

## Leviers d'économie (à mesurer avant d'appliquer)
1. Cache des prompts systématique (consignes, sources déjà lues).
2. Effort `medium` sur copywrite et design si la qualité tient.
3. Haiku 5.5 pour les tâches mécaniques (hashtags, note musique, traduction FR du texte TikTok à partir d'un texte validé).
4. Moins de recherches : le researcher réutilise les sources déjà consultées pour un même artiste.
5. Plafond de dépense mensuel dans la console Anthropic : le service s'arrête proprement au lieu de déborder.
