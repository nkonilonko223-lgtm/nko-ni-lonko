# Le logo de N'Ko ni Lonko — sources et versions (24 octobre 2026)

> Pour le propriétaire et toute autre IA. Harmonisation des logos décidée par le propriétaire le
> 24 octobre 2026 : **le même logo partout**, refait en haute définition, avec les mêmes retouches fines.

## D'où vient le logo

Le logo original est dans le **Canva du propriétaire** (document « Votre texte de paragraphe »,
page 1, 2000 × 2000 px). Il est fait de deux éléments :

- une **image de décor** : vague, orbite, étoile, petites étoiles, sur fond noir ;
- la **lettre N'Ko U+07D2**, en texte, avec des effets Canva (dégradé violet → or, ombre décalée).
  **Canva n'exporte pas ces effets** : l'export ne contient que le décor.

La lettre a donc été refaite à l'identique : c'est U+07D2 dans la police **Ebrima** (police N'Ko de
Windows ; recouvrement 98,6 % avec la lettre du logo), avec le dégradé et l'ombre **mesurés** sur
l'ancien logo. Contrôle : le logo refait, réduit à 512 px, diffère de l'ancien de 0,79 sur 255 en
moyenne (le même logo, 4 fois plus net). La lettre est copiée par programme (première lettre du
nom N'Ko de la revue), jamais tapée.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `scripts/logo/sources/decor-2000.png` | Le décor exporté de Canva (2000 px) |
| `scripts/logo/sources/lettre-2000.png` · `ombre-2000.png` | La lettre (dégradé) et son ombre, en couches transparentes |
| `scripts/logo/construire-sources.mjs` | Refait ces sources (depuis un export Canva et la police Ebrima) |
| `scripts/logo/logo.mjs` | **Compositeur unique** : toutes les versions ci-dessous, avec les retouches (lettre +12 % de couleur et +5 % d'éclat, lumières +12 %) |

| Version | Où | Fabriquée par |
|---|---|---|
| Logo **sans fond** (`public/icon-512x512.png`, `icon-192x192.png`), cadrage d'origine | Filigrane du pied de page, images de citation, données Google, flux RSS, images de partage | `scripts/icones/favicon.mjs` |
| Logo sans fond **recadré serré** (`public/logo/logo-sceau.png`) | Sceaux : menu, fenêtre de choix de langue, fin d'article (il remplit sa case) | `scripts/icones/favicon.mjs` |
| **Version simplifiée** : la lettre sur fond bleu nuit (`app/favicon.ico`, `public/application/onglet-192.png`) | Onglet, favoris, résultats Google, petites cases du site (en-tête 34 px, pied de page 30 et 44 px) : un logo détaillé ne se lit pas sous 48 px | `scripts/icones/favicon.mjs` |
| **Impression** (`public/logo/logo-impression.png`) | En-tête des articles imprimés : lettre noire, ombre et lumières grises (un filtre gris sur le logo en couleurs effaçait l'or) | `scripts/icones/favicon.mjs` |
| **Icône de l'application** (`public/application/icone-*.png`, `public/apple-touch-icon.png`) | Écran d'accueil (iPhone, Android, ordinateur) : logo agrandi sur fond bleu nuit, léger halo, ombre bleutée | `scripts/application/generer.mjs` |
| Écrans de démarrage (`public/application/demarrage/`) | Ouverture de l'application sur iPhone et iPad | `scripts/application/generer.mjs` |
| Images de partage (`public/og/*-v2.jpg`, `public/og/articles/`) | WhatsApp, Facebook, X… | `scripts/images-partage/*.mjs` |

## Refaire les logos (logo changé dans Canva)

```bash
node scripts/logo/construire-sources.mjs "<export PNG 2000 px de la page 1 du Canva>"
node scripts/icones/favicon.mjs
node scripts/application/generer.mjs
node scripts/images-partage/generer.mjs
node scripts/images-partage/articles.mjs
```

Pour les images de partage : augmenter d'abord `VERSION` dans `scripts/images-partage/generer.mjs`
**et** les adresses `-vN` dans `app/lib/partage.ts` (les réseaux sociaux gardent l'ancienne image
tant que l'adresse ne change pas). Les anciennes images `-v1` sont gardées pour les liens déjà
partagés : on pourra les supprimer fin novembre 2026.
