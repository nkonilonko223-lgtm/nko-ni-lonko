# Rapport du 22 octobre 2026 — Langue dans l'adresse (B6) et suite du Lot 2

> À lire **avant** toute fusion. **Rien n'est fusionné**, rien n'est en ligne, rien n'a été écrit dans Sanity.
> Le site en ligne est exactement celui de ce matin (`main` = `a8cc4e7`).

---

## 1. En bref

- **B6 est fini et testé** : chaque page existe en deux versions.
  - **N'Ko** : l'adresse ne change pas (`/article/le-geant-a-crete-du-niger`).
  - **Français** : la même adresse avec `/fr` devant (`/fr/article/le-geant-a-crete-du-niger`).
- **Le problème de départ est réglé** : la carte WhatsApp de la version N'Ko est en N'Ko, celle de la version française est en français. Plus de mélange des deux sens d'écriture.
- **Le nom du site reste dans les deux langues** sur toutes les cartes (votre demande).
- **Les liens déjà partagés restent valables** : ils ouvrent la version N'Ko, comme avant.
- J'ai ajouté **4 petites améliorations** (sécurité, flux RSS, fiche de la revue pour Google, accessibilité).
- J'ai **reposé toute la pile du Lot 2** (les 20 branches du 20 octobre) sur B6, et je l'ai adaptée aux deux adresses.
- **Tout passe** : construction, TypeScript, ESLint, tous les tests, et la garde du N'Ko (aucun N'Ko inconnu, tout en NFC).

---

## 2. Les 6 branches, dans l'ordre de fusion

Chaque branche **contient les précédentes**. On peut donc fusionner jusqu'à n'importe laquelle, en avance rapide (`git merge --ff-only`).

| Ordre | Branche | Dernier commit | Contenu | Commits en plus |
|---|---|---|---|---|
| 1 | `lot2/b6-langue-adresse` | `a4f309e` | **B6** : une adresse par langue | 3 |
| 2 | `lot2/securite-entetes` | `9e1e940` | `security.txt`, deux en-têtes de sécurité | 1 |
| 3 | `lot2/flux-rss` | `4828cf5` | Flux RSS, un par langue | 1 |
| 4 | `lot2/donnees-google` | `db71ada` | La revue déclarée à Google (fiche « Periodical ») | 1 |
| 5 | `lot2/accessibilite-suite` | `b3a6bb0` | Menu des catégories au clavier, bulle de confirmation, logo, contraste | 1 |
| 6 | `lot2/pile-sur-b6` | (ce rapport) | Toute la pile du Lot 2, adaptée à B6, et ce rapport | 53 |

Les anciennes branches `lot2/…` du 20 octobre (`lot2/petites-taches`, `lot2/lecture`, `lot2/hors-ligne`…) sont **remplacées** par `lot2/pile-sur-b6`. Ne pas les fusionner : elles ne connaissent pas les adresses `/fr`.

---

## 3. B6 en détail : ce qui change pour chacun

### Pour le lecteur

| Situation | Ce qui se passe |
|---|---|
| Première visite de l'**accueil** | Le choix de langue s'affiche (comme aujourd'hui). |
| Il choisit « Français » | Il va sur `/fr`. Son choix est gardé sur son appareil. |
| Il revient plus tard sur l'**accueil** | Il arrive directement sur `/fr` (seulement l'accueil). |
| Il ouvre un **lien partagé** (article, terme, numéro) | Il voit **la langue du lien**. Jamais de renvoi automatique. |
| Il touche le bouton de langue | Il passe à la même page dans l'autre langue (`/article/x` ↔ `/fr/article/x`). |
| Il navigue en français | Tous les liens du site restent en `/fr`. |

### Pour Google et les réseaux sociaux

- Chaque version a **son titre, son résumé et sa carte** dans une seule langue.
- Chaque page dit à Google où est **l'autre version** (balises `hreflang` : `nqo`, `fr` et la version par défaut, le N'Ko).
- Le **plan du site** (`/sitemap.xml`) donne les deux versions de chaque page.
- La version N'Ko demande au navigateur de **ne pas proposer de traduction**.
- Google Scholar ne lit que la version N'Ko (une seule fiche par article, pas de doublon).
- Les anciennes adresses ne changent pas : **aucune perte** dans Google.

### Le Studio

- Le Studio (`/studio`) n'est **pas touché** par les adresses de langue.

### Les cartes de partage (le problème du titre « Le géant à crête du Niger »)

| Version | Titre de la carte | Résumé de la carte |
|---|---|---|
| N'Ko (`/article/…`) | Titre N'Ko seul | Résumé N'Ko seul |
| Français (`/fr/article/…`) | Titre français seul | « Résumé français » (champ `excerptFr`) s'il est rempli ; sinon la partie française du résumé ; sinon une phrase par défaut |
| Toutes | Nom du site **dans les deux langues** | — |

**À savoir** : aujourd'hui, **aucun** article n'a de « Résumé français » rempli. Voir la partie 10.

### Ce qui n'a pas changé

- Le N'Ko du site : **identique** à celui de `main`, au caractère près (16 112 caractères N'Ko, vérifiés par programme).
- Les pages restent **préparées à l'avance** (rapides), dans les deux langues.
- La « sonnette » Sanity met à jour **les deux versions** à chaque publication.

---

## 4. Les 4 petites branches (2 à 5)

1. **Sécurité** (`lot2/securite-entetes`)
   - Fichier `/.well-known/security.txt` : il dit aux chercheurs en sécurité comment vous prévenir (contact@nkonilonko.com). Valable jusqu'au 22 octobre 2027.
   - En-tête `X-XSS-Protection: 0` (la valeur conseillée aujourd'hui ; l'ancienne pouvait créer des failles).
   - En-tête `Cross-Origin-Opener-Policy` : une autre page ne peut pas piloter un onglet du site. Le Studio n'est pas concerné.
2. **Flux RSS** (`lot2/flux-rss`)
   - `/rss.xml` (N'Ko) et `/rss-fr.xml` (français) : les 50 derniers articles publiés.
   - Utile pour les lecteurs de flux, les bibliothèques et les annuaires de revues. Chaque page du site les signale.
3. **Fiche de la revue pour Google** (`lot2/donnees-google`)
   - La revue est déclarée comme **« Periodical »** (périodique), avec son nom dans les deux langues.
   - Chaque article dit qu'il en fait partie. L'archive `/numeros` est déclarée comme une collection.
4. **Accessibilité** (`lot2/accessibilite-suite`)
   - Le **menu des catégories** de l'accueil marche enfin **au clavier** (en ligne aujourd'hui, la touche Tab saute les choix).
   - La bulle de confirmation est annoncée par les lecteurs d'écran.
   - Le logo décoratif n'est plus lu deux fois. Un texte gris trop pâle (Confidentialité) est plus lisible.
   - Résultat : **0 problème** (outil axe) sur l'accueil et la Confidentialité.

---

## 5. La pile du Lot 2, reposée sur B6 (branche 6)

- Les **51 commits** des 19 au 21 octobre ont été rejoués sur B6 : **50** sont repris ; le 51ᵉ (nom de la revue en double dans le titre des articles) était **déjà dans `main`** (fusionné avec `correctif/navigation-scholar`). **18 conflits** ont été résolus à la main, un par un.
- Puis **2 commits d'adaptation** :
  - les pages de la pile (`/auteurs/<nom>`, `/bibliotheque`, `/numeros/<n>/imprimer`) existent aussi en `/fr` ;
  - « Ma bibliothèque » garde les articles **sans la langue** : un article sauvegardé en N'Ko apparaît aussi en français ;
  - la lecture hors ligne garde la page **de la langue lue** ;
  - le texte alternatif des images ne peut plus être fait seulement d'espaces.
- Rappel du contenu de la pile : images de partage des articles, PDF du numéro, lettre d'information, désinscription en un clic, « À lire aussi », « Terme du jour », partie 10 « IA » des Conditions, réserve des droits (TDM), « Citer » (APA, MLA, BibTeX, RIS, N'Ko d'abord), liens vers les chapitres, « Reprendre la lecture », « Signaler une erreur », langue de lecture, « Partager en image », « Ma bibliothèque », correcteur N'Ko du Studio, garde du N'Ko, contrôles automatiques GitHub, Google Scholar (auteurs), pages auteurs, recherche sans accents ni marques de ton, lecture hors ligne, plan « Application ».

**Important pour le 30 octobre** : la liste du jour J (`docs/AVANT-PUBLICATION-N003.md`) utilise le **PDF du numéro** et la **lettre aux abonnés**. Ces deux outils n'existent **que dans la pile**. Si la pile n'est pas fusionnée avant le 30, ces deux étapes ne sont pas possibles.

---

## 6. Les tests faits

| Test | Résultat |
|---|---|
| Construction complète (`next build`) | ✅ toutes les pages, dans les deux langues |
| TypeScript et ESLint | ✅ 0 erreur |
| `scripts/tester-langues.mjs` (nouveau) : pages, cartes, `hreflang`, renvois, 404, fichiers, Studio, plan du site, liens | ✅ tout passe |
| Navigateur : choix de langue, renvoi de l'accueil, aller-retour N'Ko ↔ français, navigation en français, lien partagé | ✅ 0 erreur dans la console |
| Accessibilité (axe) : pages françaises = pages N'Ko | ✅ ; accueil et Confidentialité : 0 problème |
| Menu des catégories au clavier | ✅ |
| « Ma bibliothèque » et signets, dans chaque langue | ✅ |
| `scripts/tester-cartes.mts` (cartes de tous les articles publiés) | ✅ |
| `scripts/tester-titres.mts` | ✅ |
| Correcteur N'Ko (`tester-correcteur`) | ✅ 13 sur 13 |
| Garde du N'Ko (`verifier-nko-code`) | ✅ 662 passages, tous en NFC — le même nombre sur `main`, sur B6 et sur la pile |
| Origine du N'Ko (chaque passage vient de `main` ou de la rédaction) | ✅ 759 passages dans 47 fichiers, **0 inconnu**, 0 non NFC, aucun passage de `main` perdu |
| Aperçus Vercel | voir la partie 11 |

**Limite connue** : la page « introuvable » (404) d'une adresse qui n'existe pas s'affiche sans la balise de langue (déjà vrai avant B6). Sans risque. À améliorer plus tard.

**Pas testé de bout en bout** : le PDF d'un numéro, car **aucun numéro n'est encore publié**. Il sera testé le 30 octobre avec le N°003 (étape déjà dans la liste du jour J).

---

## 7. Mes erreurs (et leur correction)

Je vous les dis toutes, même petites.

1. **J'ai tapé du N'Ko dans un script** (le titre par défaut du site, dans `app/[lang]/layout.tsx`). C'est contraire à la règle. Je l'ai remplacé tout de suite : le code **lit** maintenant ce titre dans le texte existant de la rédaction. J'ai vérifié par programme qu'il est **identique** à l'original.
2. **Deux caractères N'Ko sont entrés par erreur dans un test** (`scripts/tester-langues.mjs`) : j'avais écrit la plage de lettres avec des barres obliques, et l'outil d'écriture les a changées en vrais caractères. La garde du N'Ko l'a trouvé. Corrigé (commit `a4f309e`) : la plage est écrite par ses numéros. Ce fichier n'est jamais vu par les visiteurs.
3. **Un remplacement par commande a changé les fins de ligne** d'un fichier (Windows → Unix). Remis comme avant. Je n'utilise plus cette commande.
4. **L'accueil avait perdu son titre** (onglet du navigateur) pendant le travail. Trouvé par les tests, corrigé avant l'envoi.
5. **Une phrase fausse dans un message de commit** : corrigée avant l'envoi.

---

## 8. Quand et comment fusionner (mon conseil)

- **Le bon moment** : **le 23 ou le 24 octobre**, après votre vérification de l'aperçu.
  - Ainsi, le site a **5 jours** pour être observé avant le 30.
  - Le 30, le N°003 est partagé avec des cartes propres dans chaque langue, et le PDF et la lettre sont prêts.
- **Ne pas fusionner du 25 au 28 octobre** : Cowork importe le N°003 ; le schéma ne doit pas changer pendant l'import.
- **Si vous préférez la prudence** : fusionner les branches 1 à 5 le 23 ou le 24, et la pile après le 30. Mais alors pas de PDF ni de lettre le 30.
- **Comment** : écrivez « fusionner » (tout), ou « fusionner jusqu'à `<branche>` ». Je fais l'avance rapide, puis je vérifie la mise en ligne (Production).

---

## 9. Après la fusion (je fais / vous faites)

**Je fais :**

1. Vérifier la mise en ligne (déploiement « Production » du bon commit).
2. Lancer `node scripts/tester-langues.mjs https://www.nkonilonko.com` sur le vrai site.
3. Si la pile est fusionnée : mettre à jour **les deux schémas** Sanity (`sanity deploy --external --schema-required`), puis supprimer `dist/`. La pile change `article.ts`, `terme.ts` et ajoute le correcteur N'Ko. Aucun document n'est touché.

**Vous faites :**

1. **WhatsApp** : envoyer un lien N'Ko et le même lien avec `/fr`. Chaque carte doit être dans sa langue (ajouter `?v=3` si le lien a déjà été partagé).
2. **Search Console** de Google : renvoyer le plan du site (`https://www.nkonilonko.com/sitemap.xml`) pour que Google découvre les pages `/fr`.
3. **Formulaire de contact** : envoyer un message d'essai (Turnstile).
4. **Webhook Sanity** (« sonnette ») : ajouter `"author"` au filtre, pour les pages auteurs : `_type in ["article","terme","numero","rubrique","author"]` (sanity.io/manage → API → Webhooks).
5. **GitHub, onglet « Actions »** : regarder que les contrôles automatiques passent au vert.
6. **Lecture hors ligne** : faire la vérification de `docs/HORS-LIGNE.md` (partie « Vérifier soi-même »). Il y a un **arrêt d'urgence** dans le même fichier.

---

## 10. Pour la rédaction (contenus, rien de technique)

1. **Textes N'Ko à fournir** : liste complète dans `docs/TEXTES-NKO-A-DEMANDER.md` (L1 à L16 : « À lire aussi », « Terme du jour », « Ma bibliothèque », partie 10 « IA », etc.). Tant qu'un texte manque, seul le français s'affiche. **B6 n'ajoute aucun nouveau texte à demander.**
2. **« Résumé français »** (nouveau champ `excerptFr` dans le Studio) : à remplir pour les cartes françaises. Priorité aux 5 articles qui ont aujourd'hui la phrase par défaut :
   - `bienvenue-sur-n-ko-ni-lonko`
   - `l-humanite-retourne-vers-la-lune`
   - `grand-retour-vers-la-lune`
   - `james-webb-devoile-les-secrets-des-trous-noirs`
   - `tempete-solaire-historique`
3. **Résumé N'Ko** : 3 articles n'ont pas de résumé N'Ko différent du titre. Leur carte N'Ko n'a donc que le titre :
   - `l-humanite-retourne-vers-la-lune`
   - `un-evenement-sans-precedent-sur-l-iss`
   - `tempete-solaire-historique`
4. Pour le N°003 : remplir le « Résumé français » dès l'import (Cowork), c'est prévu dans `docs/GUIDE-IMPORT-IA.md`.

---

## 11. Vérifier vous-même sur l'aperçu Vercel

Adresse de l'aperçu de la pile (tout compris) : voir la fin de ce document (« Aperçus »).

1. Ouvrir l'aperçu dans une **fenêtre privée** → le choix de langue s'affiche. Choisir « Français » → l'adresse finit par `/fr`.
2. Recharger l'accueil → on reste en français.
3. Ouvrir un article **sans** `/fr` dans l'adresse → il s'affiche en N'Ko (lien partagé : jamais de renvoi).
4. Toucher le bouton de langue → même article, adresse avec `/fr`. Toucher encore → retour au N'Ko.
5. En français, cliquer sur « Numéros », « Lexique », un terme : l'adresse garde `/fr`.
6. Ouvrir `/rss.xml`, `/rss-fr.xml` et `/.well-known/security.txt`.
7. Sur ordinateur, sur l'accueil : touche **Tab** jusqu'au menu des catégories, **Entrée**, puis Tab dans les choix.
8. Signet sur un article, puis `/bibliotheque` et `/fr/bibliotheque` : l'article est dans les deux.

**Les cartes WhatsApp ne peuvent pas se tester sur l'aperçu** s'il est protégé par Vercel (WhatsApp ne peut pas le lire). C'est normal : test réel après la fusion (partie 9).

---

## 12. Ce qui reste (décisions ou gros chantiers, après le 30 octobre)

| Sujet | Ce qu'il faut |
|---|---|
| Police Kigelia allégée (seulement les lettres utiles) | Votre accord pour installer un outil Python (`pip install fonttools brotli`) |
| Accueil en composant serveur (plus rapide sur téléphone) | Gros changement : après le 30 |
| CSP « appliquée » (sécurité forte) | Après le 30, quand les journaux Vercel sont propres (`docs/PLAN-LOT-2.md`) |
| Police du français en mode N'Ko | Votre décision (constat du 20 octobre, `docs/PLAN-LOT-2.md`) |
| Recherche N'Ko ↔ lettres latines | Tableau de correspondance à valider par la rédaction |
| Mise à jour des outils (`npm audit`) | Après le 30 |
| Application (installable iPhone, téléchargement du numéro, Google Play) | Après la mise en ligne de la lecture hors ligne (plan du 21 octobre) |
| Page 404 avec sa langue | Petit, après le 30 |

---

## Aperçus

Les **6 aperçus Vercel ont réussi** (statut « success » sur GitHub, 22 octobre).

| Branche | Commit | Aperçu |
|---|---|---|
| `lot2/b6-langue-adresse` | `a4f309e` | https://nko-ni-lonko-hfq5c4221-nkonilonko223-lgtms-projects.vercel.app |
| `lot2/pile-sur-b6` (tout le site) | `72a6307` | https://nko-ni-lonko-2wpumi9pv-nkonilonko223-lgtms-projects.vercel.app |
| `lot2/securite-entetes`, `lot2/flux-rss`, `lot2/donnees-google`, `lot2/accessibilite-suite` | `9e1e940`, `4828cf5`, `db71ada`, `b3a6bb0` | réussis (adresses dans l'onglet « Deployments » de Vercel) |

- Ces aperçus sont **protégés par Vercel** : ouvrez-les connecté à votre compte Vercel.
- Mon outil Vercel n'a **pas** eu le droit de les ouvrir. Mes tests ont donc été faits sur une **vraie construction de production lancée sur cet ordinateur** (`next build` puis `next start`), pas sur l'aperçu.
- Le commit de ce rapport crée un nouvel aperçu de la pile : c'est le même site (seul ce document est ajouté).
