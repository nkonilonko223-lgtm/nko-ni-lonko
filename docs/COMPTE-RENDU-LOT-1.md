# Compte rendu du Lot 1 — N'Ko ni Lonko (3 – 5 octobre 2026)

> **En bref.** En trois jours, 77 changements ont été mis en ligne sur https://www.nkonilonko.com : le site est **sécurisé** (abonnés privés, Next.js à jour, 8 clés « Secret »), la rédaction a un **aperçu des brouillons** et des **contrôles automatiques** dans le Studio, les lecteurs ont un **lexique** et un **dictionnaire N'Ko – français**, tout le texte N'Ko est **normalisé (NFC)**, une IA peut **saisir un numéro** sans risque (guide + script de vérification), et les **images de partage** affichent un N'Ko correctement lié (validé sur WhatsApp et Facebook).
> Rien n'a été envoyé sur `main` sans l'accord écrit du propriétaire ; chaque écriture dans Sanity a été précédée d'un export complet.

---

## 0. À lire en premier par la prochaine IA (Claude Cowork, Claude Code ou autre)

1. **`CLAUDE.md`** (racine du projet) : règles absolues, langue (français uniquement), pile technique, commandes, pièges de cette machine.
2. **`docs/GUIDE-IMPORT-IA.md`** : comment saisir un article ou un terme dans Sanity (brouillons seulement).
3. **`docs/AVANT-PUBLICATION-N003.md`** : ce qui reste à faire avant et le jour du 30 octobre.
4. **`docs/PLAN-LOT-2.md`** : la suite (après le 30 octobre), dont la méthode pour le modèle de traduction ByT5.
5. **`docs/ETAT-TECHNIQUE.md`** : une page pour la rédaction.

**Rôles :** la rédaction **écrit et traduit** (le N'Ko est toujours humain) → l'IA **saisit** en brouillon et vérifie → le propriétaire **relit, corrige et publie**.

---

## 1. Objectifs du Lot 1 et résultat

| # | Objectif (fixé par le propriétaire) | Résultat |
|---|---|---|
| 1 | Carte du dépôt (ce qui existe, où) | ✅ fait (voir `CLAUDE.md` § 4) |
| 2 | Next.js 16.3.8 | ✅ Next.js 16.1.6 → **16.3.8**, React 19.2.8 (30 failles corrigées, dont une critique) |
| 3 | Vie privée des abonnés + routes | ✅ fiches privées, désinscription en un clic, journaux sans jeton |
| 4 | Audit des secrets | ✅ aucun secret exposé ; 8 clés en type **Secret** sur Vercel ; droits minimaux |
| 5 | Schéma Sanity (validation, déploiement, affichage, aperçu des brouillons) | ✅ + lexique et dictionnaire |
| 6 | `CLAUDE.md` + note « État technique » | ✅ + guide d'import, compte rendu, plan du Lot 2 |
| + | Hors liste, demandé en cours de route | ✅ NFC des contenus, doubles marques, images de partage, compte X, textes N'Ko de l'interface |

---

## 2. Ce qui a été fait, par thème

### 2.1 Sécurité et vie privée
- **Abonnés privés** : identifiant `subscriber.<uuid>` (le point rend la fiche invisible dans le dataset public). Ancien format migré le 3/10 (export avant).
- **Désinscription** : page `/desabonnement` (bouton POST, textes N'Ko de la rédaction) + route `/api/unsubscribe`. Lien bilingue « Se désabonner » dans chaque e-mail, `translate="no"` pour bloquer la traduction automatique des messageries.
- **E-mail de confirmation** : N'Ko puis français, bouton bilingue.
- **Jetons retirés des journaux** ; recherche par paramètre GROQ (pas de texte collé dans la requête).
- **Nettoyage de nuit** (`/api/cron/cleanup`) : refuse tout appel sans `CRON_SECRET` ; passé en runtime Node.js.
- **Upstash** (limite anti-abus) : si le service tombe, l'inscription et le contact continuent (Turnstile protège toujours).
- **Studio** : impossible de créer ou dupliquer un abonné à la main.
- **Clés** : les 8 clés serveur sont en type **Secret** sur Vercel (testées le 5/10 : inscription + e-mail reçu, nettoyage 200).

### 2.2 Mises à jour
- Next.js **16.3.8**, React **19.2.8**, eslint-config-next 16.3.8. `.gitignore` couvre aussi `env.local`.

### 2.3 Studio Sanity (rédaction)
- **Contrôles** : titre, résumé, date, lien obligatoires (rouge) ; titre SEO trop long, texte non NFC, terme du lexique mal relié ou en double (orange).
- **Encadrés** : Définition (`success`), Le saviez-vous ? (`amazing`), Question (`question`), Information, Attention. 11 encadrés de « le-geant » reclassés et 2 encadrés vides supprimés (4/10, export avant).
- **Aperçu des brouillons** : onglet **Presentation** (brouillon affiché sur le vrai site), bandeau « Mode aperçu » avec bouton Quitter.
- **Schéma déployé** (`sanity schema deploy`) après chaque changement de schéma.

### 2.4 Affichage des articles
- `lang="nqo"` (code ISO officiel) / `lang="fr"` à côté de chaque `dir`.
- Intertitres h5/h6 et titres de rubrique avec détection N'Ko / français.
- **Règle de détection de la langue d'un paragraphe** conservée : un paragraphe qui contient du N'Ko s'affiche en N'Ko. Mesurée le 5/10 comme la plus juste (0 erreur sur 756 paragraphes ; la règle « 1re lettre » en aurait fait 7).

### 2.5 Mise à jour automatique (« sonnette »)
- Route `/api/revalidate` (webhook Sanity signé, secret `SANITY_REVALIDATE_SECRET`) : accueil, plan du site, articles, lexique à jour quelques secondes après une publication. Webhook Sanity « Mise à jour du site », filtre `_type in ["article","terme"]`.

### 2.6 Lexique et dictionnaire
- Type **Terme du lexique** (N'Ko, français, définitions, domaine, lien) ; annotation dans le texte (bouton 📖).
- Lecteur : terme souligné → fiche en bas d'écran (téléphone) ou bulle (ordinateur), lexique en fin d'article, **dictionnaire** `/lexique` (ordre alphabétique N'Ko, recherche sans tons ni accents, index des lettres), page de chaque terme (recherche en haut, « Termes du même domaine », « Citer ce terme »), données structurées Google (DefinedTerm).
- La liste des articles qui utilisent un terme est **réservée à la rédaction** (encadré dans le Studio), jamais publique.
- Textes N'Ko de l'interface (1 à 11) fournis par la rédaction, copiés sans modification. Le texte 7 (aide de la recherche) est « isolé » (U+2067…U+2069) pour que ses « ... » restent à la fin de la lecture N'Ko (mesuré dans le navigateur).
- **Aucun terme n'est encore publié** : les textes 7 à 11 n'ont pas encore été vus en situation (à vérifier au 1er vrai terme du N°003).

### 2.7 Contenus (données Sanity)
- **NFC** : 87 groupes de lettres (ton tapé avant la nasalisation U+07F2) remis dans l'ordre NFC dans 10 documents, en une transaction, avec contrôle « mêmes caractères » (5/10, accord « appliquer les 87 »).
- **Doubles marques** : 7 nasalisations U+07F2 et 1 ton U+07EC tapés deux fois, corrigés (5/10, accord « corriger les 8 »).
- **Essais nettoyés** par le propriétaire : termes « irruption solaire » et « content » supprimés, brouillons d'essai de « Tempête solaire historique » et de « grand-retour-vers-la-lune » annulés.

### 2.8 Saisie par une IA (import)
- **`scripts/verifier-import.mts`** : test à blanc d'un fichier d'import (n'écrit rien dans Sanity). Normalise le NFC **automatiquement** dans une copie `<fichier>.nfc.json` (décision du propriétaire : la normalisation NFC n'est pas une modification), signale les marques tapées deux fois, vérifie champs, lien, catégorie, encadrés, rubriques, images, paires N'Ko / français du lexique. Testé sur de vrais textes.
- **`docs/GUIDE-IMPORT-IA.md`** : les étapes, les formats, les règles N'Ko, lexique et images.

### 2.9 Partage sur les réseaux (WhatsApp, Facebook, X, LinkedIn)
- `next/og` ne lie pas les lettres N'Ko : remplacé par **`scripts/images-partage/generer.mjs`** (rendu par Google Chrome, N'Ko lu dans les fichiers du site, jamais retapé).
- 3 images 1200×630, < 300 Ko : **accueil** (ciel James Webb), **dictionnaire** (bleu, motif africain), **À propos** (peinture du baobab), avec le **vrai logo** (monogramme `icon-512x512.png`).
- Réglages communs dans **`app/lib/partage.ts`** : images (`IMAGE_PARTAGE_*`) et compte X (`COMPTE_X = "@MckV2016"`, compte du propriétaire en attendant `@nkonilonko`).
- Les articles gardent leur **photo de couverture** comme image de partage.
- Validé : vrai partage WhatsApp ✅, outil officiel Facebook ✅, opengraph.xyz 0 erreur ✅.

### 2.10 Documentation
- `CLAUDE.md` réécrit et tenu à jour ; `docs/ETAT-TECHNIQUE.md` ; `docs/GUIDE-IMPORT-IA.md` ; ce compte rendu ; `docs/AVANT-PUBLICATION-N003.md` ; `docs/PLAN-LOT-2.md`.

---

## 3. Journal des décisions du propriétaire

| Date | Décision |
|---|---|
| 3/10 | Méthode en 5 étapes, accord écrit à chaque étape ; rien sur `main` sans accord ; export avant toute écriture Sanity |
| 4/10 | Anciens encadrés « Définition » conservés (pas de conversion automatique avant le 30/10) |
| 4/10 | Flux N°003 : rédaction → IA (brouillons) → vérification → aperçu → publication par le propriétaire |
| 4/10 | La liste des articles qui utilisent un terme reste privée |
| 5/10 | **La normalisation NFC n'est pas une modification du texte** (automatique à l'import, avec rapport) |
| 5/10 | Doubles marques : supprimer la marque en trop (7 nasalisations + 1 ton) |
| 5/10 | Règle de détection de la langue d'un paragraphe conservée ; choix manuel → Lot 2 |
| 5/10 | Images de partage : 3 images (accueil, dictionnaire, À propos), vrai logo |
| 5/10 | Compte X **@MckV2016** en attendant `@nkonilonko` ; YouTube, TikTok, Instagram, Facebook confirmés comme comptes du propriétaire |
| 5/10 | Modèle de traduction N'Ko ↔ français (ByT5) : entraînement sur Google Colab, **jeu de données privé** ; clause « IA » dans le pacte des auteurs : plus tard |
| 5/10 | Répétition générale de la saisie par une IA avec le 1er article terminé du N°003 |

---

## 4. Écritures dans Sanity (toutes précédées d'un export complet)

| Date | Opération | Accord | Sauvegarde (`C:\Dev\archives\exports\`) | Script (`C:\Dev\archives\scripts\`) |
|---|---|---|---|---|
| 3/10 | Migration des abonnés vers `subscriber.<uuid>` | oui | `production-2026-10-03.tar.gz` | `migration-abonnes-2026-10-03.mjs` |
| 4/10 | 11 encadrés reclassés, 2 vides supprimés (le-geant) | « oui pour le reclassement » | `production-2026-10-04-avant-reclassement.tar.gz` | `reclassement-encadres-2026-10-04.mjs` |
| 5/10 | NFC : 87 groupes, 10 documents | « appliquer les 87 » | `production-2026-10-05-avant-nfc.tar.gz` | `normalisation-nfc-2026-10-05.mjs` |
| 5/10 | Doubles marques : 8 endroits | « corriger les 8 » | `production-2026-10-05-avant-doubles.tar.gz` | `doubles-marques-2026-10-05.mjs` |
| 4–5/10 | Termes et brouillons d'essai supprimés / annulés | fait par le propriétaire dans le Studio | — | — |

Rapports : `C:\Dev\archives\rapports\` (NFC essai et écriture, validation du 5/10).

---

## 5. Réglages hors code

| Service | Réglage |
|---|---|
| **Vercel** | 8 clés serveur en type **Secret** (dont `SANITY_API_READ_TOKEN` pour Production **et** Preview) ; nettoyage de nuit (Cron) actif |
| **Sanity** | Webhook « Mise à jour du site » (filtre `_type in ["article","terme"]`) ; origines autorisées (CORS) : `localhost:3333`, `localhost:3000`, `www.nkonilonko.com` (l'origine temporaire de l'aperçu a été retirée) ; schéma déployé |
| **Upstash** | Base recréée le 3/10 (l'ancienne avait été supprimée par le service) |
| **Tester le Studio sur un aperçu de branche** | Ajouter temporairement l'adresse stable de la branche dans les origines CORS de Sanity (accord du propriétaire), tester dans Presentation, puis la retirer |

---

## 6. État des contenus (validation officielle du 5 octobre 2026)

**Plus aucun avertissement NFC.** Restent des points **éditoriaux** (aucun ne bloque le site) :

| Article | Résumé | Titre SEO > 60 caractères | Images sans texte alternatif |
|---|---|---|---|
| l-humanite-retourne-vers-la-lune | ❌ **manquant** (bloque la republication) | 74 | 2 |
| le-geant-a-crete-du-niger | ✅ | 83 | 7 |
| origines-et-adn-l-afrique-avance | ✅ | 83 | 1 |
| james-webb-devoile-les-secrets-des-trous-noirs | ✅ | 81 | 2 |
| grand-retour-vers-la-lune | ✅ | 65 | 9 |
| un-evenement-sans-precedent-sur-l-iss | ✅ | **1 seul caractère** (à remplir ou vider) | 1 |
| oceans-en-surchauffe-le-record-alarmant-de-2025 | ✅ | — | 1 |
| tempete-solaire-historique | ✅ | — | 1 |
| bienvenue-sur-n-ko-ni-lonko | ✅ | — | 0 |

Brouillon `fdc1effe…` : article **non terminé** de la rédaction (titre, résumé, lien, image et auteur manquants) — normal, à garder.

---

## 7. Vérifications faites à chaque livraison

N'Ko inchangé (comptage des caractères N'Ko avant / après) et en NFC · ESLint · TypeScript · construction complète du site · aperçu Vercel · fusion en avance rapide après « fusionner » · contrôle du site en ligne après chaque mise en ligne.

---

## 8. Ce qui reste

- **Avant et le jour du 30 octobre** → `docs/AVANT-PUBLICATION-N003.md`.
- **Après le 30 octobre** → `docs/PLAN-LOT-2.md`.

---

## Annexe — les 77 changements du Lot 1 (dans l'ordre)

Liste produite par `git log` (identifiant, date, description) :

- `e10899d` · 03/10 · fix(newsletter): fiches abonnés privées (id subscriber.<jeton>), e-mail en paramètre GROQ, jeton retiré des journaux
- `1982d27` · 03/10 · fix(verify): recherche de la fiche privée subscriber.<jeton> via paramètre GROQ, jeton retiré des journaux
- `39b8660` · 03/10 · fix(cron): refuser toute requête si CRON_SECRET est absent
- `502f916` · 03/10 · feat(desabonnement): page /desabonnement (bouton POST) et route /api/unsubscribe qui supprime la fiche; lien réel dans l'e-mail
- `293ec33` · 03/10 · fix(studio): interdire la création et la duplication manuelles d'abonnés (identifiant public)
- `7fa1829` · 03/10 · feat(desabonnement): textes N'Ko fournis par la rédaction (copiés sans modification, NFC vérifié)
- `56be5d2` · 03/10 · fix(newsletter): l'inscription continue si Upstash est injoignable (Turnstile protège toujours)
- `5a0b4e2` · 03/10 · fix(contact): le formulaire continue si Upstash est injoignable (Turnstile protège toujours)
- `26e0965` · 03/10 · fix(desabonnement): titre N'Ko corrigé par la rédaction (ߡߊߝߘߎ ߓߐ߫)
- `2c13242` · 03/10 · fix(email): lien de désinscription bilingue (ߡߊߝߘߎ ߓߐ߫ / Se désabonner), discret mais lisible
- `09bdc96` · 03/10 · feat(email): traduction française sous le message N'Ko et sous le bouton; textes N'Ko mis à jour par la rédaction
- `feb831e` · 03/10 · fix(email): translate="no" sur chaque bloc pour bloquer la traduction automatique des messageries
- `3f8db83` · 03/10 · fix(email): correction de frappe N'Ko fournie par la rédaction (2e ligne du message)
- `70d195a` · 04/10 · chore(deps): Next.js 16.1.6 → 16.3.8, React 19.2.3 → 19.2.8, eslint-config-next 16.3.8
- `087a113` · 04/10 · chore(gitignore): ignorer aussi env.local (sans point)
- `8197809` · 04/10 · fix(cron): runtime nodejs au lieu d'edge (déconseillé depuis Next.js 16.3)
- `776e6c8` · 04/10 · fix(schema): title et excerpt en liste de règles (obligatoire = erreur, longueur = avertissement)
- `dba4c71` · 04/10 · fix(schema): date de publication obligatoire
- `b717a9b` · 04/10 · fix(schema): message propre pour le format du lien (slug), séparé de « obligatoire »
- `1a655c2` · 04/10 · feat(schema): garde-fou NFC (règle 6) — avertissement qui désigne le champ non normalisé
- `b5f35d5` · 04/10 · chore(sanity): ajouter sanity.cli.ts (nécessaire pour sanity schema deploy)
- `21a3549` · 04/10 · fix(articles): lang="nqo" / lang="fr" à côté de chaque dir (règle 6, accessibilité)
- `8041332` · 04/10 · feat(sitemap): étiquette « article » pour la mise à jour à la demande
- `7b14f12` · 04/10 · feat(revalidate): route /api/revalidate (webhook Sanity signé) — accueil, plan du site et article à jour dès la publication
- `684143c` · 04/10 · chore: relancer l'aperçu Vercel (aucun fichier modifié)
- `6ea70f1` · 04/10 · fix(articles): intertitres h5/h6 avec détection N'Ko / français (le français s'affichait de droite à gauche)
- `26d75a4` · 04/10 · fix(articles): titres de rubrique — détection N'Ko / français dans la case N'Ko
- `fc0e432` · 04/10 · fix(langue): marqueur de page lang="nqo" (code ISO officiel) au lieu de « nko »
- `9954f38` · 04/10 · fix(encadrés): « success » affiché comme Définition ; option renommée dans le Studio
- `d2c0ee3` · 04/10 · fix(types): ajouter « success » aux types d'encadrés reconnus
- `5b86031` · 04/10 · fix(encadrés): étiquettes N'Ko « Le saviez-vous ? » et « Grande Question » corrigées par la rédaction
- `29201d8` · 04/10 · fix(encadrés): une seule étiquette, dans la langue de l'encadré (N'Ko ou français)
- `e3534f5` · 04/10 · feat(encadrés): définitions compactes (filet latéral, terme en gras, texte inchangé)
- `be1c890` · 04/10 · feat(schema): types d'encadré « Le saviez-vous ? » et « Question » dans le Studio
- `315c182` · 04/10 · fix(encadrés): définitions N'Ko un peu plus petites (15 px)
- `4a7c3af` · 04/10 · feat(apercu): assistant getSanityClient (brouillons avec la clé Viewer en mode aperçu)
- `7104e4e` · 04/10 · feat(apercu): routes /api/draft-mode/enable (vérifiée par Sanity) et /disable
- `c035699` · 04/10 · feat(apercu): la page article lit le brouillon en mode aperçu
- `d8d3678` · 04/10 · feat(apercu): l'accueil inclut les brouillons en mode aperçu
- `8d46933` · 04/10 · feat(apercu): bandeau « Mode aperçu — brouillons visibles » avec bouton Quitter
- `dab34c2` · 04/10 · feat(apercu): onglet « Presentation » du Studio (articles → /article/<lien>)
- `48a4c25` · 04/10 · fix(apercu): connecteur VisualEditing en mode aperçu (connexion avec l'onglet Presentation)
- `300294a` · 04/10 · feat(lexique): type « Terme du lexique » (N'Ko + français, définitions, domaine, lien, garde-fou NFC)
- `a73097e` · 04/10 · feat(lexique): annotation « Terme du lexique » (référence) à la place de l'ancienne bulle « définition » inutilisée
- `1b32626` · 04/10 · feat(lexique): textes de l'interface (N'Ko fourni par la rédaction)
- `5d9100a` · 04/10 · feat(lexique): composant TermeLexique (fiche en bas d'écran sur téléphone, bulle sur ordinateur, accessible)
- `e96aacb` · 04/10 · feat(lexique): termes reliés affichés dans le texte + chargement des termes de l'article
- `23d1396` · 04/10 · feat(lexique): section « Lexique » en fin d'article (termes utilisés, N'Ko puis français)
- `f5a3d6b` · 04/10 · feat(lexique): pages Dictionnaire /lexique et /lexique/<terme> (données structurées DefinedTermSet / DefinedTerm)
- `b60a6f2` · 04/10 · feat(lexique): plan du site (dictionnaire + termes) et sonnette pour les termes
- `d5ff885` · 04/10 · fix(lexique): champs français du Studio de gauche à droite (N'Ko à droite, français à gauche)
- `a3cca02` · 04/10 · fix(lexique): la liste des articles qui utilisent un terme n'est plus publique (ni affichée ni chargée)
- `45c84b7` · 04/10 · feat(lexique): encadré « Utilisé dans ces articles » dans le Studio (rédaction seulement, lecture seule)
- `0da15d4` · 04/10 · feat(lexique): avertissement Studio si un terme n'est pas relié en N'Ko ET en français, ou relié plusieurs fois
- `5143a28` · 04/10 · feat(lexique): avertissement Studio si un terme existe déjà (N'Ko ou français, sans tenir compte des majuscules)
- `a8495ac` · 04/10 · feat(lexique): emplacements des textes 7 à 11 (recherche, même domaine, citer) — N'Ko à fournir
- `0eaf67a` · 04/10 · feat(lexique): dictionnaire en ordre alphabétique N'Ko, recherche instantanée (sans tons ni accents, ?q=, touche /) et index des lettres
- `1471081` · 04/10 · feat(lexique): « Termes du même domaine » sur la page d'un terme (12 maximum, ordre N'Ko)
- `518011f` · 04/10 · feat(lexique): « Citer ce terme » avec référence prête à copier (date de consultation calculée chez le lecteur)
- `9e30f5c` · 04/10 · feat(lexique): barre de recherche en haut de la page d'un terme (renvoie vers /lexique?q=…, fonctionne sans JavaScript)
- `9ba8e00` · 04/10 · docs: CLAUDE.md réécrit (règles absolues, pile réelle, commandes, architecture, données Sanity, conventions N'Ko, méthode)
- `48659c8` · 04/10 · feat(import): script de vérification d'un fichier d'import AVANT écriture (test à blanc, n'écrit rien)
- `944488e` · 04/10 · docs: guide d'import par une IA (7 étapes, formats article/terme, règles N'Ko et lexique, vérifications)
- `e09a27b` · 04/10 · docs: note « État technique » d'une page pour la session de rédaction
- `2e69302` · 05/10 · feat(import): normalisation NFC automatique (copie .nfc.json contrôlée) et signalement des marques tapées deux fois
- `5f00024` · 05/10 · docs: règle « NFC automatique à l'import » (guide d'import, CLAUDE.md, note État technique)
- `587ef64` · 05/10 · feat(lexique): textes N'Ko 7 à 11 de la rédaction (recherche, aucun résultat, même domaine, citer, copié)
- `1206ea0` · 05/10 · fix(lexique): les « ... » du texte d'aide de recherche restent à la fin de la lecture N'Ko (N'Ko isolé U+2067…U+2069)
- `2dc9aae` · 05/10 · docs: Lot 2 — choix manuel de la « langue du paragraphe » dans le Studio (règle actuelle mesurée : 0 erreur sur 756 paragraphes)
- `665363c` · 05/10 · feat(partage): générateur d'images de partage (rendu Chrome, lettres N'Ko liées) et images v1 accueil + dictionnaire
- `6242e5c` · 05/10 · feat(partage): accueil, pages générales et articles sans photo utilisent accueil-v1.jpg ; suppression du générateur next/og qui cassait le N'Ko
- `9051aad` · 05/10 · feat(partage): le dictionnaire et les pages des termes utilisent lexique-v1.jpg (Open Graph + X)
- `63a6c85` · 05/10 · docs: images de partage (où elles sont, comment les refaire, ne pas utiliser next/og pour le N'Ko)
- `b9be560` · 05/10 · fix(partage): vrai logo du site (monogramme icon-512x512.png) au lieu de l'ancienne icône « atome »
- `815a9ab` · 05/10 · fix(partage): compte X @MckV2016 (le compte @nkonilonko n'existe pas encore), réglé à un seul endroit
- `095e5b7` · 05/10 · feat(partage): image dédiée à la page À propos (peinture du baobab, mot N'Ko lu dans la page)
- `2d2bc32` · 05/10 · fix(partage): cartes X de l'accueil, du dictionnaire et des termes déclarent aussi le compte du site (twitter:site)
