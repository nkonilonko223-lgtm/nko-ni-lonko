# Fiche 2 — Donner un DOI à chaque article (Crossref)

> Préparée le 19 octobre 2026, **à garder pour plus tard** (décision du propriétaire). Rien n'est engagé.

## Qu'est-ce que c'est ?

Le **DOI** est un identifiant permanent d'article (ex. `10.12345/nkl.003.01`). Il donne une adresse qui ne change jamais, rend les citations **traçables** dans le monde entier et inscrit la revue dans le circuit des publications scientifiques. **Crossref** est l'organisme qui attribue les DOI aux revues.

## Bonne nouvelle : gratuit pour le Mali

Crossref a un programme **GEM (Global Equitable Membership)** : pour les éditeurs des pays de la liste, **l'adhésion annuelle et les frais par DOI sont supprimés**, quelle que soit la taille de l'éditeur. **Le Mali est sur la liste 2026.** Conditions : adresse postale **et** adresse de facturation dans un pays de la liste. Les services en option (ex. Similarity Check, détection de plagiat) restent payants.
Source : [crossref.org/gem](https://www.crossref.org/gem) — **la liste est revue chaque année : la vérifier le jour de la demande.**

(Hors GEM, le tarif normal est d'environ 275 dollars par an plus environ 1 dollar par DOI : à vérifier sur crossref.org.)

## Ce qu'il faut savoir avant

- Crossref accueille les organisations qui publient des contenus **scientifiques ou professionnels** : décrire clairement la revue (vulgarisation scientifique avec comité de rédaction, sources, relecture).
- Obligations d'un membre : garder les **métadonnées à jour**, afficher le DOI de chaque article sous forme de **lien**, mettre à jour l'adresse si une page change, et relier les références qui ont un DOI.
- Avoir d'abord l'**ISSN** (fiche 1) est fortement conseillé.

## Démarche

1. Demander l'adhésion sur crossref.org (formulaire « Join »), en signalant l'éligibilité GEM (Mali).
2. Recevoir un **préfixe** (ex. `10.12345`).
3. Choisir une forme stable pour les DOI, par exemple `10.xxxxx/nkl.003.01` (numéro, ordre dans le sommaire).

## Ensuite, sur le site (travail technique)

1. Un outil `scripts/doi/deposer.mts` qui envoie à Crossref les métadonnées de chaque article publié (titre N'Ko et français, auteurs et ORCID, date, numéro, résumé, références) — même méthode que la lettre : aperçu, essai, puis envoi avec confirmation.
2. Afficher le DOI sur la page article, dans « Citer » (formats APA, MLA, BibTeX), dans le PDF, dans `citation_doi` (Google Scholar) et dans les données structurées.
3. Le DOI pointe vers l'adresse **N'Ko** de l'article (« N'Ko is King » ; l'adresse principale ne change jamais, même après l'arrivée de `/fr`).

## Délai

Quelques semaines pour l'adhésion ; ensuite, un DOI est créé en quelques minutes à chaque publication.
