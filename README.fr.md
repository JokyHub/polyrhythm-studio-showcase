# Polyrhythm Studio — un média musical produit par des agents IA, validé par un humain

> Dépôt vitrine. Il présente la conception d'un pipeline multi-agents en production depuis octobre 2026, et le
> plan pour le reconstruire sur LangGraph avec une couche conversationnelle (Hermes Agent). Le dépôt de
> production est privé. [English version](README.md)

Polyrhythm est un média musical en anglais : **jazz, funk & soul, Afrobeat et musiques d'Afrique de l'Ouest,
musiques latines et caribéennes**. Chaque jour, une équipe d'agents spécialisés propose des sujets, vérifie et
source chaque fait, rédige, crée des visuels et des vidéos originaux, contrôle le tout, puis envoie les brouillons
au propriétaire sur Telegram. **Rien n'est publié sans validation humaine explicite.** Les posts validés partent
sur X, Instagram, Facebook, TikTok, YouTube Shorts, Threads et Bluesky.

## En bref
- **3 posts par jour** à heures fixes, **7 plateformes**, **6 agents** spécialisés et **5 routines** planifiées.
- **Validation humaine obligatoire** : APPROVE, EDIT ou REJECT sur Telegram ; sans réponse, le brouillon expire.
- **Chaque fait est sourcé** (URL + date) ; un QA indépendant re-vérifie ; deux échecs = post abandonné.
- **Tout ce qui peut être du code l'est** : rendu vidéo (Puppeteer + ffmpeg), contrôles de format, statuts.
- **Boucle d'apprentissage** : l'analyste lit les vraies métriques chaque lundi ; les autres agents appliquent.

## Ce que le projet montre
- **Orchestration** d'agents spécialisés avec contrats de sortie et routines planifiées.
- **Humain dans la boucle** et **garde-fous** nés d'incidents réels (plafond X, mauvais compte, brouillons expirés).
- **Données → décisions** : la rétention TikTok s'effondrait en 1 s ; la cause (un écran vide à l'image 0) a été
  trouvée dans le moteur de rendu et corrigée.
- **Droits musicaux** : vrais morceaux uniquement via les catalogues des plateformes, sinon bibliothèque sous
  licence avec preuves datées.
- **Arbitrages** : choix de framework, coûts (~115 $/mois estimés), plan de migration progressif.

## Suite
1. **LangGraph** ([migration/](migration/)) : les règles critiques passent du prompt au code testé.
2. **Hermes Agent** ([docs/roadmap-hermes.md](docs/roadmap-hermes.md)) : parler au média en langage naturel.

Le détail (architecture, exemples, carte du dépôt, limites) est dans le [README anglais](README.md).
