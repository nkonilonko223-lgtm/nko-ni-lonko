# Avant la publication du N°003 — liste de contrôle (30 octobre 2026)

> Le site est prêt techniquement (Lot 1 terminé et en ligne). Ce qui suit, ce sont les **dernières vérifications** et le **déroulé du jour J**.
> Rôles : la rédaction écrit et traduit · l'IA saisit en **brouillon** · le **propriétaire** relit, corrige et publie.

## Calendrier

| Période | Ce qu'on fait |
|---|---|
| **jusqu'au 17 octobre** | Dernières améliorations possibles du site + répétition générale |
| **18 – 30 octobre** | **Gel du site** : seulement des corrections, aucune nouveauté (la saisie des contenus reste possible) |
| **25 – 28 octobre** | Saisie du N°003 en brouillons, relecture dans Presentation |
| **30 octobre** | Publication |

---

## A. Avant le 18 octobre

| # | Quoi | Qui | Statut |
|---|---|---|---|
| 1 | **Répétition générale** : l'IA saisit le **1er article terminé** du N°003 en brouillon (guide `docs/GUIDE-IMPORT-IA.md`), le propriétaire relit dans **Presentation**. L'article **reste en brouillon** jusqu'au 30 octobre | IA + propriétaire | ⏳ en attente de l'article |
| 2 | **Au 1er vrai terme du lexique** : vérifier dans Presentation les textes N'Ko 7 à 11 du dictionnaire (recherche, aucun résultat, même domaine, citer, copié) | propriétaire | ⏳ |
| 3 | **Résumé manquant** de « l-humanite-retourne-vers-la-lune » (sans lui, l'article ne peut plus être republié) | rédaction | ⏳ |
| 4 | Titre SEO d'**un seul caractère** de « un-evenement-sans-precedent-sur-l-iss » : le remplir ou le vider | rédaction | ⏳ |
| 5 | Facultatif : titres SEO > 60 caractères (5 articles) et textes alternatifs d'images manquants (24 images) — liste dans `docs/COMPTE-RENDU-LOT-1.md` § 6 | rédaction | facultatif |
| 6 | Facultatif mais recommandé : mesurer la vitesse sur téléphone avec **PageSpeed Insights** (https://pagespeed.web.dev) sur l'accueil et un article ; noter les scores | propriétaire | facultatif |
| 7 | Recommandé : vérifier que le site est déclaré dans **Google Search Console** et que le plan du site `https://www.nkonilonko.com/sitemap.xml` y est envoyé | propriétaire | à vérifier |
| 8 | Brouillon `fdc1effe…` (article non terminé) : le terminer pour le N°003 ou le laisser en brouillon | rédaction | à décider |

---

## B. Saisie du N°003 (25 – 28 octobre)

**Ce que la rédaction fournit, par article :**
- les textes **paragraphe par paragraphe**, N'Ko puis français (un paragraphe = une seule langue) ;
- titre et résumé (N'Ko et français), catégorie, auteurs, date ;
- les **encadrés** (Définition, Le saviez-vous ?, Question…) repérés dans le texte ;
- les **termes du lexique** à créer : terme et **définition en N'Ko et en français** ;
- les légendes N'Ko des images (sinon la case reste vide) ;
- les images si elle en a ; sinon l'IA cherche des **images libres de droits** (voir le guide).

**Ce que fait l'IA** (détail dans `docs/GUIDE-IMPORT-IA.md`) : fichier d'import → vérification à blanc (`scripts/verifier-import.mts`, 0 erreur) → **export complet** → **accord écrit** du propriétaire → création en **brouillons** (termes d'abord, puis articles) → validation officielle → **rapport** au propriétaire (avec la liste des images, leur source et leur licence).

**Ce que fait le propriétaire :** relecture de chaque article dans **Presentation**, sur téléphone **et** ordinateur, en N'Ko **et** en français ; corrections dans le Studio.

---

## C. Le jour J — 30 octobre

1. **Sauvegarde** : export complet du dataset le matin (`sanity dataset export`, voir `CLAUDE.md` § 3).
2. **Publier les termes du lexique d'abord**, puis les articles (Studio → Publier).
3. **Vérifier en ligne** (quelques secondes après chaque publication, grâce à la « sonnette ») :
   - l'accueil affiche les nouveaux articles ;
   - chaque article s'ouvre, sur téléphone et ordinateur ; les termes soulignés ouvrent leur définition ;
   - le dictionnaire `/lexique` montre les nouveaux termes ; la recherche fonctionne ;
   - le plan du site `/sitemap.xml` contient les nouvelles adresses.
4. **Partage** : s'envoyer le lien d'un article sur **WhatsApp** (ajouter `?v=1` à la fin si le lien a déjà été partagé) et le tester dans l'outil **Facebook** (https://developers.facebook.com/tools/debug/ → coller seulement l'adresse de l'article → « Re-collecter »).
5. **Annonce** aux abonnés et sur les réseaux (YouTube, TikTok, Instagram, Facebook, X @MckV2016).
6. **Surveiller** dans la journée les journaux Vercel (Logs) : aucune erreur 500 ; une inscription test à la lettre si besoin.

---

## D. Après le 30 octobre

→ `docs/PLAN-LOT-2.md` (type « Numéro », corpus pour le modèle de traduction, images de partage des articles avec titre N'Ko, lettre d'information, PDF…).
