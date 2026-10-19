# Plan du Lot 2 — N'Ko ni Lonko (après le 30 octobre 2026)

> **Ne pas commencer avant la publication du N°003** (règle du propriétaire). Même méthode qu'au Lot 1 : Synthèse → Audit → Stratégie → Génération → Validation, une branche par sujet, un changement par commit, aperçu Vercel, fusion après « fusionner ».

## État au 19 octobre 2026 (préparé en avance, sur des branches, RIEN de fusionné)

Décision du propriétaire (19 octobre) : préparer tout le Lot 2 pendant le gel, sans rien mettre en ligne avant le 30 octobre, sans écriture dans Sanity, sans e-mail. Branches **empilées** (chacune contient les précédentes) : fusionner la dernière revient à tout fusionner ; on peut aussi s'arrêter à une branche.

| Ordre | Branche | Contenu | Après fusion |
|---|---|---|---|
| 1 | `feat/images-partage-articles` | Images de partage des articles (titre N'Ko, numéro, catégorie), `scripts/images-partage/articles.mjs` | Lancer l'outil après chaque publication (`docs/GUIDE-IMPORT-IA.md` § 7) |
| 2 | `lot2/petites-taches` | Icône 404 « planète » ; 3 fichiers inutiles supprimés ; registre styled-components supprimé (−15 Ko sur chaque page) ; option obsolète `isHighlighted` retirée | **`sanity schema deploy`** ; vérifier le Studio (styles) |
| 3 | `lot2/corpus` | `scripts/exporter-corpus.mts` (export privé, refus dans le projet), `docs/DONNEES-CORPUS.md`, carnet Colab `notebooks/byt5-nqo-fr.ipynb` | Premier vrai export **après** la publication du N°003 |
| 4 | `lot2/lettre` | Lettre d'information `scripts/lettre/envoyer.mts` (aperçu, essai, envoi avec `--confirmer`) ; désinscription « en un clic » (RFC 8058) | Essai à l'adresse du propriétaire, puis envoi avec son **accord écrit** |
| 5 | `lot2/pdf` | Version imprimable `/numeros/[slug]/imprimer`, `scripts/pdf-numero/generer.mjs`, lien « Télécharger le PDF » | Fabriquer le PDF après la publication du numéro |
| 6 | `lot2/voir-aussi` | « À lire aussi » (fin d'article) ; « Terme du jour » (`/lexique`) | — |
| 7 | `lot2/page-ia` | Page `/ia` (**texte à valider**), lien du pied de page, robots d'IA à jour, projet de clause du pacte des auteurs ; corrections de direction (`/ia`, 404) | Valider le texte ; version N'Ko par la rédaction |
| 8 | `lot2/bilan` | Ce bilan ; `docs/TEXTES-NKO-A-DEMANDER.md` (9 textes N'Ko à demander) | — |
| 9 | `lot2/ia-conditions` | Décision du 19 octobre : **pas de page `/ia`** ; le texte validé devient la **partie 10 « Intelligence artificielle » des Conditions d'utilisation**, une phrase et un lien dans la Confidentialité ; réserve lisible par les machines (`/.well-known/tdmrep.json` + en-tête `tdm-reservation: 1`) ; page 404 : N'Ko d'abord, chaque langue avec `lang` et `dir` | — |
| à part | `fix/confidentialite-apostrophes` | Correction du texte français de la Confidentialité (« n&apos;utilisons »… affiché 8 fois en ligne) : **peut être fusionnée pendant le gel** | — |

**Pas encore fait** : langue dans l'adresse (B6, plan détaillé ci-dessous, 1 à 2 jours), application hors ligne et édition visuelle cliquable (longs, incertains), audio des termes (enregistrements), conversion des anciens encadrés (écriture Sanity), CSP appliquée (2 semaines de journaux), compte X, **mise à jour des dépendances** (ci-dessous).

**Mise à jour des dépendances (constat du 19 octobre)** : `npm audit` signale 59 failles, presque toutes dans les **outils** (CLI Sanity, outils de construction), pas dans ce que reçoivent les visiteurs ; dont `basic-ftp` (critique, outil d'import Sanity). La correction automatique toucherait environ 1 000 paquets, dont Sanity 5.11 → 5.31 et sa CLI 5 → 6 (version majeure) : à faire sur une branche dédiée, après le 30 octobre, avec un essai complet du Studio par le propriétaire.

## Idées d'IA retenues par le propriétaire (19 octobre 2026)

Règle : **l'IA propose, l'humain valide** ; jamais de N'Ko publié sans la rédaction. Les autres idées (textes alternatifs proposés par l'IA, traduction assistée) sont écartées pour l'instant.

| # | Idée | Méthode |
|---|---|---|
| 2 | **Recherche N'Ko ↔ écriture latine** (bambara, maninka) : un lecteur qui tape en lettres latines trouve les articles et les termes en N'Ko | Translittération par **règles** (pas d'IA), testée sur le lexique ; tableau de correspondance validé par la rédaction |
| 4 | **Correcteur N'Ko dans le Studio** : signale les marques de ton oubliées ou doublées, le texte non NFC, les mots inconnus du lexique, avant la publication | Contrôles par règles + liste de mots de la revue ; il **signale**, il ne corrige jamais seul (avertissement dans le Studio) |
| 5 | **Recherche par le sens** dans les articles et le lexique | Représentations multilingues (à choisir parmi celles qui connaissent le N'Ko, ex. SONAR de Meta), calculées à la publication ; sans données des lecteurs |

## Ordre recommandé

| # | Chantier | Pourquoi dans cet ordre |
|---|---|---|
| 1 | **Type « Numéro »** dans Sanity (numéro, titre N'Ko / français, date, couverture, édito, liste ordonnée des articles) + page `/numero/<n>` + « Dernier numéro » sur l'accueil + données structurées Google (`PublicationIssue`) | Structure la revue ; base de la lettre d'information et du PDF |
| 2 | **Corpus N'Ko – français pour le modèle ByT5** (export privé, daté) — méthode ci-dessous | Le N°003 publié enrichit les données ; aucun risque pour le site (script hors ligne) |
| 3 | **Images de partage des articles avec le titre N'Ko** — FAIT le 19 octobre (branche `feat/images-partage-articles`) : `scripts/images-partage/articles.mjs` (rendu Chrome : couverture, numéro, catégorie, titres), fichiers dans `public/og/articles/` (choix du propriétaire : rien dans Sanity), couverture en secours ; ancien `opengraph-image.tsx` supprimé. Plus tard, possible : lancer le même outil automatiquement sur GitHub après chaque publication | Le partage des articles du N°003 sur WhatsApp |
| 4 | **Lettre d'information** : envoi de chaque numéro aux abonnés (Resend), modèle N'Ko puis français ; double confirmation et désinscription déjà en place | Fidéliser les lecteurs |
| 5 | **PDF du numéro** : page d'impression + rendu par Chrome (N'Ko lié, comme les images de partage) | Archivage, diffusion hors ligne |
| 6 | **Politique d'usage de l'IA** (page publique) + **clause « IA » dans le pacte des auteurs** (droits d'entraînement du modèle) | À faire **avant** d'élargir l'usage du corpus |
| 7 | Le reste de la liste (`CLAUDE.md` § 9) : audio des termes, « voir aussi », terme du jour, conversion des anciens encadrés « Définition », édition visuelle cliquable (stega), application hors ligne (Serwist incompatible avec Turbopack), faille `basic-ftp` (outil d'import Sanity), option `isHighlighted` obsolète, choix manuel de la « langue du paragraphe » | Améliorations |
| 8 | Petites tâches : passer `COMPTE_X` à `@nkonilonko` dans `app/lib/partage.ts` le jour où le compte existe ; supprimer les fichiers inutilisés `public/og-accueil.jpg`, `public/icon.svg` et `public/arriere-plan.png` (2,1 Mo ; le site sert l'AVIF et le WebP) | Ménage |
| 9 | **Langue dans l'adresse** (`/fr/…`) avec `hreflang` : recommandation « B6 » ci-dessous | Le français devient visible par Google, sans perdre la rapidité |
| 10 | **CSP en mode appliqué** : quand les journaux Vercel « [CSP] » sont restés propres deux semaines, remplacer dans `proxy.ts` l'en-tête `Content-Security-Policy-Report-Only` par `Content-Security-Policy` et ajouter `upgrade-insecure-requests` | Protection réelle contre l'injection de scripts (aujourd'hui : rapport seulement) |
| 11 | Petits constats du chantier B (18 octobre) : l'icône `ph-telescope` de la page 404 n'existe pas dans Phosphor 2.1.2 (déjà vide avant le chantier B ; en choisir une autre, ex. `ph-planet`, puis relancer `scripts/icones/generer-icones.mjs`) ; `styled-components` (15 Ko compressés) est chargé sur toutes les pages par `app/registry.tsx` : vérifier si le Studio en a encore besoin | Ménage et vitesse |

---

## B6 — Langue dans l'adresse (recommandation du 18 octobre 2026)

**Aujourd'hui.** La langue choisie (N'Ko ou français) est gardée dans le navigateur du lecteur (`localStorage`, clé `preferred-lang`). Le serveur prépare toujours la page **en N'Ko** ; l'interface passe en français juste après, dans le navigateur. Conséquences :

- Google ne voit que la version N'Ko de l'interface (menus, titres, étiquettes) ; la version française n'existe pas pour lui, alors que les balises `hreflang` annoncent un `fr-FR`… à la **même** adresse.
- Un lecteur francophone voit l'interface changer de langue à l'arrivée.

**Option écartée : un cookie lu par le serveur.** Chaque page deviendrait « dynamique » (fabriquée à chaque visite) : fin du cache, et perte des gains de vitesse des chantiers A et B.

**Recommandation : une adresse par langue**, toutes deux préparées à l'avance :

1. `/article/<slug>` reste la version N'Ko (par défaut, « N'Ko Is King ») ; `/fr/article/<slug>` est la version française (même chose pour l'accueil, `/numeros`, `/lexique`, `/about`, `/contact`).
2. `hreflang` : `nqo` → adresse N'Ko, `fr` → adresse française, `x-default` → N'Ko ; une adresse canonique par langue ; les deux dans le plan du site.
3. Le bouton de langue devient un **lien** entre les deux adresses. Le choix gardé dans le navigateur ne sert plus qu'à proposer la bonne version à l'arrivée sur l'accueil.
4. À mesurer avant fusion : même vitesse (pages toujours « ● » à la construction), aucun lien interne cassé, plan du site complet.

**Quand.** Après le 30 octobre, sur une branche dédiée. Travail moyen, risque moyen (toutes les pages et les liens internes sont concernés) : **pas pendant le gel**.

**État (22 octobre 2026) : FAIT sur la branche `lot2/b6-langue-adresse`, NON fusionnée.** MckV a décidé d'avancer B6 (cartes de partage entièrement dans une langue, résumé compris ; nom du site toujours bilingue). Décisions : N'Ko sans préfixe, français en `/fr` ; fenêtre de choix seulement à la première visite de l'accueil ; un lecteur qui a choisi le français est envoyé vers `/fr` **sur l'accueil seulement** ; un lien partagé n'est jamais redirigé. Le moment de la fusion se décide après lecture du rapport (conseil : avant le 25 ou après le 30 octobre, jamais pendant l'import du N°003). Test : `node scripts/tester-langues.mjs <adresse>`.

_(Plan du 19 octobre ci-dessous, gardé pour l'historique : la réalisation du 22 octobre a choisi un dossier `app/[lang]/` et le filtre `proxy.ts` plutôt que deux groupes de routes.)_

**Plan technique (précisé le 19 octobre, estimation : 1 à 2 jours, dans une session dédiée)** :

1. **Deux gabarits racine** (groupes de routes Next.js) : `app/(nko)/layout.tsx` (`<html lang="nqo">`, `<body dir="rtl">`) et `app/(fr)/fr/layout.tsx` (`<html lang="fr">`, `<body dir="ltr">`) ; les pages actuelles passent dans `(nko)` ; les pages françaises **réexportent** les mêmes composants avec la langue en paramètre.
2. **`LanguageProvider`** reçoit la langue de la page (`langueInitiale`) : plus de bascule après coup, plus d'écran « choix de la langue » sur une adresse française ; le choix gardé dans le navigateur ne sert plus qu'à proposer la bonne version sur l'accueil.
3. **Liens internes** : une fonction `lien(chemin, langue)` pour tous les `Link` (menus, cartes, sommaire, « À lire aussi », lexique) ; le bouton de langue devient un lien vers l'adresse jumelle.
4. **Métadonnées par langue** : titres et descriptions (le français pour `/fr`), `canonical` propre à chaque langue, `hreflang` croisés (`nqo`, `fr`, `x-default` → N'Ko), `og:locale`, `inLanguage` des données structurées.
5. **Plan du site** : les deux adresses de chaque page.
6. **Vérifications avant fusion** : toutes les pages construites à l'avance (« ● » / « ○ »), aucun lien interne vers la mauvaise langue (robot de vérification), mêmes mesures de vitesse, articles au HTML identique côté N'Ko.

**Exigence du propriétaire (19 octobre) : « N'Ko is King » partout.** Garanties à respecter :
- le N'Ko garde l'adresse **principale, sans préfixe** ; seul le français prend `/fr/` ;
- `x-default` → N'Ko ; le plan du site cite le N'Ko en premier ;
- **aucune bascule automatique** vers le français selon le navigateur (on propose, on n'impose pas) ;
- sur les pages françaises, les titres gardent le **N'Ko en haut** (comme aujourd'hui) ; les articles restent bilingues, seule la langue de l'interface change ;
- l'écran de choix de la langue garde le N'Ko en premier.

---

## Modèle de traduction N'Ko ↔ français (ByT5) — la méthode

**Décisions du propriétaire (5 octobre 2026)** : traduction **N'Ko ↔ français**, entraînement sur **Google Colab**, jeu de données **privé**.

### 1. Ce que valent les données de la revue
- Le lexique et les articles bilingues forment un **corpus parallèle rare et de très bonne qualité** (texte humain, relu, en NFC).
- Mais ils ne font que **quelques centaines de paires** : assez pour **spécialiser** un modèle (vocabulaire scientifique) et pour le **mesurer**, **pas** pour lui apprendre seul à traduire.

### 2. Le jeu de données (export, jamais de branchement direct sur Sanity)
| Règle | Détail |
|---|---|
| Export **daté** et figé | Script `scripts/exporter-corpus.mts` (à écrire) → `corpus-AAAA-MM-JJ/` : `lexique.jsonl` (terme N'Ko, terme français, définitions, domaine), `paires.jsonl` (phrase ou paragraphe N'Ko ↔ français, article d'origine) |
| Seulement le **publié** | Jamais les brouillons, jamais les abonnés |
| Qualité | NFC (déjà garanti), doublons retirés, paires vérifiées (un paragraphe N'Ko ↔ sa traduction) |
| Découpage **par article** | 80 % entraînement / 10 % validation / 10 % test ; le **test est figé** et ne sert jamais à l'entraînement |
| Fiche du jeu de données | `docs/DONNEES-CORPUS.md` : origine, date, taille, licence (privée), limites |
| Données **synthétiques** marquées | Les paires fabriquées (rétro-traduction) sont étiquetées comme telles ; **jamais de N'Ko produit par une IA présenté comme référence** |

### 3. L'entraînement sur Google Colab
| Point | Recommandation |
|---|---|
| Carte | **Colab Pro** (L4 ou A100). La T4 gratuite ne permet que `google/byt5-small`, lentement |
| Précision | **bf16** (L4 / A100) ou fp32 — **pas fp16** (les modèles T5 / ByT5 produisent des erreurs NaN) |
| Données privées | Google Drive privé ; clés dans les « Secrets » de Colab ; aucune donnée affichée dans un carnet partagé |
| Sauvegardes | Enregistrer le modèle sur Drive toutes les N étapes et savoir **reprendre** (Colab coupe les sessions) |
| Deux sens, un modèle | Préfixes `nqo→fr : ` et `fr→nqo : ` (double les données) |
| Longueur | ByT5 compte en **octets** (une lettre N'Ko = 2 octets) : phrases courtes ou longueur max 512 à 1 024 |
| Réglages de départ | Adafactor (taux 1e-3) ou AdamW (3e-4) ; arrêt quand le score de validation ne progresse plus |
| Outils | Hugging Face `transformers` (`Seq2SeqTrainer`), `datasets`, `sacrebleu` |

### 4. La mesure (« world class »)
- **chrF / chrF++** (score par caractère, adapté aux langues peu dotées), sur le jeu de test figé.
- **Respect du lexique** : part des termes du dictionnaire correctement traduits.
- **Relecture humaine** de 50 phrases par la rédaction.
- **Comparaison publique** : le même test avec **NLLB-200** (Meta, qui connaît déjà le N'Ko) et sur **FLORES-200** (`nqo_Nkoo` ↔ `fra_Latn`). Si NLLB est meilleur, envisager de **spécialiser NLLB** plutôt que ByT5 — **attention : licence NLLB non commerciale (CC BY-NC)**, ByT5 est libre (Apache 2.0).

### 5. Aller plus loin
- **Contraintes terminologiques** : entraîner le modèle à respecter un glossaire donné dans la phrase d'entrée (méthode publiée, Dinu et al. 2019) → le dictionnaire de la revue devient la **référence** des traductions.
- **Rétro-traduction** de textes N'Ko seuls (par exemple Wikipédia N'Ko) pour fabriquer des paires supplémentaires (marquées comme synthétiques).

### 6. Livrables proposés (Lot 2, chantier 2)
1. `scripts/exporter-corpus.mts` (export daté, test à blanc d'abord).
2. `docs/DONNEES-CORPUS.md` (fiche du jeu de données).
3. Un carnet Colab modèle (`notebooks/byt5-nqo-fr.ipynb`) : chargement depuis Drive, entraînement, sauvegardes, mesure chrF, comparaison NLLB.
