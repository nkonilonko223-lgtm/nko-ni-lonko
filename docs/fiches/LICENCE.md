# Fiche 3 — Choisir la licence des articles

> Préparée le 19 octobre 2026, **à garder pour plus tard** (décision du propriétaire). Rien n'est engagé.

## La situation aujourd'hui

Les Conditions d'utilisation disent « reproduction interdite sans autorisation écrite » : c'est « **tous droits réservés** ». La partie 10 (Intelligence artificielle) **réserve** aussi les droits contre l'entraînement des IA, avec `robots.txt` et `tdmrep.json`.

## Pourquoi en parler ?

- Les annuaires de revues en libre accès (**DOAJ**) exigent une **licence ouverte** clairement affichée : « tous droits réservés » n'est **jamais** accepté.
- Une licence claire dit aux lecteurs ce qu'ils ont le droit de faire (partager le PDF sur WhatsApp, citer, traduire…).

## ⚠️ Le point clé : licence ouverte et IA

Selon Creative Commons, une licence CC donne déjà la permission nécessaire pour entraîner une IA (en respectant ses conditions, comme citer l'auteur). Une licence très ouverte (**CC BY**) **contredirait** donc la réserve contre l'entraînement des IA que vous avez validée. Le choix de la licence et la politique sur l'IA doivent aller **ensemble**.
Sources : [Creative Commons — « Should CC-licensed content be used to train AI? It depends »](https://creativecommons.org/2021/03/04/should-cc-licensed-content-be-used-to-train-ai-it-depends/) ; analyse : [Technollama — Creative Commons and AI training](https://www.technollama.co.uk/creative-commons-and-ai-training).

## Les trois choix possibles

| Choix | Ce que les lecteurs peuvent faire | DOAJ | IA | Pour N'Ko ni Lonko |
|---|---|---|---|---|
| **A. Tous droits réservés** (aujourd'hui) | Lire ; partager le lien | ❌ refusé | ✅ réserve cohérente | Contrôle maximal, diffusion limitée |
| **B. CC BY-NC-ND 4.0** | Lire, partager, imprimer, diffuser **sans modifier** et **sans usage commercial**, en citant la revue | ✅ accepté | ⚠️ usage **commercial** exclu ; usage non commercial (recherche) possible | **Recommandé** : le PDF circule librement (WhatsApp, écoles), personne ne peut vendre ni modifier le N'Ko, la politique IA reste cohérente pour les usages commerciaux |
| **C. CC BY 4.0** | Tout, même modifier et vendre, en citant la revue | ✅ accepté (préféré par certains financeurs) | ❌ entraînement autorisé : la réserve IA serait à retirer | Diffusion maximale, aucun contrôle sur les traductions ou l'usage par des IA |

**Mon conseil : B (CC BY-NC-ND 4.0)**, qui garde l'esprit « N'Ko is King » (pas de version modifiée du N'Ko en circulation) tout en ouvrant la lecture à tous.

## Ce qui ne change pas

- Les **images** gardent leur propre licence (crédit et licence dans le champ `source`) : la licence de la revue s'applique aux **textes**.
- Les **auteurs** restent propriétaires de leurs textes (Conditions, partie 8) ; le pacte des auteurs doit mentionner la licence choisie.

## Ensuite, sur le site (travail technique, une fois le choix fait)

1. Mettre à jour les Conditions (partie 3 « Propriété intellectuelle » et partie 10), en N'Ko et en français.
2. Afficher la licence sur chaque article (pied de l'article, avec le lien officiel), dans le PDF, dans les données structurées (`license`) et, plus tard, dans les métadonnées Crossref (DOI).
3. Ajouter la licence au pacte des auteurs (`docs/PACTE-AUTEURS-CLAUSE-IA.md`).

## Avant de décider

Faire relire le choix par un juriste, surtout pour l'articulation entre la licence et la réserve contre l'entraînement des IA.
