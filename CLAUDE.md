# N'Ko ni Lonko — Mémoire du projet (CLAUDE.md)

> Revue scientifique bilingue **N'Ko / français** — https://www.nkonilonko.com
> Ce fichier est lu au début de chaque session. Mis à jour le 24 octobre 2026.

---

## 0. Langue et pédagogie (à respecter dans CHAQUE message)

- **Répondre UNIQUEMENT en français**, du premier au dernier mot (tableaux, explications et résumés compris). Le propriétaire lit le français et le N'Ko, **pas l'anglais**.
- Le propriétaire **débute** en développement : phrases courtes, expliquer chaque commande **avant** de la lancer, dire comment **vérifier soi-même**.

## 1. Règles absolues

1. **Méthode en 5 étapes** : Synthèse → Audit → Stratégie → Génération → Validation. S'arrêter à la fin de chaque étape et attendre le feu vert **écrit**.
2. **Zéro confiance** : aucun secret côté navigateur, jamais de jeton dans une variable `NEXT_PUBLIC_`. **Ne jamais ouvrir les fichiers `.env*`** : ne demander que le **nom** des variables.
3. **Jamais rien sur `main` sans accord.** Une branche dédiée, **un commit par changement**, message clair. Le propriétaire vérifie l'**aperçu Vercel** avant toute fusion.
4. **Avant toute écriture dans Sanity** : **export complet** du dataset, puis accord écrit. Ne **publier** ni **supprimer** aucun document sans accord.
5. **Une seule chose à la fois**, la plus petite modification possible. Pas de refonte. Pas de nouvelle dépendance sans expliquer pourquoi.
6. **Ne jamais modifier ni écrire un texte en N'Ko.** Le N'Ko vient **toujours** de la rédaction et est copié **sans modification**. Il doit rester en **Unicode NFC** et s'afficher avec `dir="rtl"` et `lang="nqo"` (le français : `dir="ltr"`, `lang="fr"`). **La normalisation NFC n'est pas une modification** (décision du propriétaire, 5 octobre 2026) : elle est faite par `scripts/verifier-import.mts`, avec le contrôle « mêmes caractères ». Toute autre correction (ex. marque tapée deux fois) demande l'accord écrit du propriétaire.

## 1 bis. Les 9 dogmes (rédaction, 15 octobre 2026)

Les commentaires « DOGME 1, 2, 3 » du code suivent la même numérotation.

1. **N'Ko Is King** : bilinguisme obligatoire ; le N'Ko d'abord, de droite à gauche.
2. **Extreme Engineering** : zéro `any`, posture Zero-Trust générale, performance (LCP, CLS, GPU).
3. **Cinematic Adaptation** : mobile d'abord, PWA (dans le code, la performance **mobile** est aussi rangée ici).
4. **Élégance** : zéro dette technique.
5. **Protocole en 5 étapes** : Synthèse → Audit → Stratégie → Génération → Validation, feu vert explicite entre chaque étape. Pour une tâche simple, le propriétaire peut accepter des étapes regroupées.
6. **Cartographie complète des fichiers** avant toute modification.
7. **Écosystème Zero-Trust** : aucune clé secrète côté client (règle absolue 2).
8. **Server-First** (App Router) : composants serveur par défaut.
9. **Modifications chirurgicales** : remplacement de blocs avant/après, jamais de régénération de fichier complet. Toujours choisir la solution **la plus simple**.

**Écriture :** toujours « **N'Ko** » (K majuscule), jamais « N'ko ».

## 2. Pile technique

| Élément | Version / détail |
|---|---|
| Next.js | **16.3.8** (App Router, Turbopack) |
| React | **19.2.8** |
| Sanity | **5.x** (Studio intégré sur `/studio`), next-sanity **12.1** |
| Sanity projet / dataset | `yfsyhc2p` / `production` (**public**, forfait gratuit) |
| Hébergement | Vercel (projet `nko-ni-lonko`) — mise en ligne automatique à chaque envoi sur `main` |
| Dépôt | GitHub `nkonilonko223-lgtm/nko-ni-lonko` (**public**) |
| Copie de travail | `C:\Dev\nko-souverain` (archives : `C:\Dev\archives\`) |

## 3. Commandes (Windows, Git Bash)

```bash
# Construction : la variable TLS est OBLIGATOIRE en local (certificats de la machine)
export NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1
timeout 300 node node_modules/next/dist/bin/next build
# Serveur d'essai local avec les images : node --use-system-ca node_modules/next/dist/bin/next start -p 3100

# Vérifications (lancer les outils DIRECTEMENT, pas avec npx : npx se fige parfois ici)
timeout 150 node node_modules/eslint/bin/eslint.js <fichiers>
timeout 200 node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
timeout 200 node node_modules/sanity/bin/sanity schema validate
timeout 400 node node_modules/sanity/bin/sanity documents validate --yes --level warning
node scripts/verifier-nko-code.mts --depuis main     # garde du N'Ko : NFC partout + N'Ko changé depuis main (à vérifier)
node scripts/tester-correcteur.mts [--export <sauvegarde.tar.gz>]   # correcteur N'Ko du Studio
node scripts/tester-impression.mjs [adresse] [--article <slug>] [--pdf <dossier>]   # impression des articles : images, fond blanc, légendes, coupures, lettrine (lecture seule)
node scripts/tester-hors-ligne.mjs [adresse] [--article <slug>]   # lecture hors ligne, réseau vraiment coupé (défaut : serveur local « next start » sur le port 3100)
node scripts/tester-application.mjs [adresse] [--telechargement <page d'un numéro>] [--captures <dossier>]   # application : manifestes, proposition, guide iPhone, numéro téléchargé (docs/APPLICATION.md)

# Fichiers de l'application (manifestes, icônes, écrans de démarrage ; --captures : captures du site en ligne)
node scripts/application/generer.mjs [--captures]

# Logos du site (sans fond, simplifié, impression) depuis le logo HD ; sources HD : docs/LOGO.md
node scripts/icones/favicon.mjs
node scripts/logo/construire-sources.mjs "<export PNG 2000 px de la page 1 du Canva du logo>"   # seulement si le logo change dans Canva
# Les mêmes contrôles tournent sur GitHub à chaque envoi (.github/workflows/verifications.yml, onglet « Actions »)

# Sanity (connexion faite avec le compte GitHub du propriétaire : npx sanity login --provider github)
# Après une fusion qui change le schéma : met à jour LES DEUX schémas déployés (l'ancien « _.schemas.default »
# ET celui lié au Studio, que lisent les outils MCP / Cowork). Ré-enregistre le même Studio (appId de
# sanity.cli.ts), ne touche à aucun document. Supprimer ensuite le dossier dist/ qu'elle crée.
node node_modules/sanity/bin/sanity deploy --external --schema-required
node node_modules/sanity/bin/sanity dataset export production "C:/Dev/archives/exports/<nom>.tar.gz"

# Vérification à blanc d'un fichier d'import (article, terme, rubrique, numero), avec contrôle des références dans la sauvegarde
node scripts/verifier-import.mts <fichier.json> --export "C:/Dev/archives/exports/<nom>.tar.gz"

# Images de partage (rendu par Chrome : N'Ko lié). Changer VERSION dans le script ET dans app/lib/partage.ts
node scripts/images-partage/generer.mjs

# Lettre d'information d'un numéro publié : aperçu (aucun envoi), essai à une adresse, puis envoi
# aux abonnés confirmés SEULEMENT avec --confirmer <n> (accord écrit du propriétaire avant tout envoi)
node scripts/lettre/envoyer.mts --numero <n> --apercu <fichier.html>
node scripts/lettre/envoyer.mts --numero <n> --essai <adresse>
node scripts/lettre/envoyer.mts --numero <n> --tous [--confirmer <n>]

# PDF d'un numéro publié (rendu Chrome de /numeros/<slug>/imprimer ; rien n'est écrit dans Sanity)
node scripts/pdf-numero/generer.mjs --numero <n>

# Corpus N'Ko ↔ français (privé, jamais dans le projet) : voir docs/DONNEES-CORPUS.md
node scripts/exporter-corpus.mts --sortie "C:/Dev/archives/corpus"

# Images de partage des ARTICLES (titre N'Ko, numéro, catégorie), après chaque publication
# (rien n'est écrit dans Sanity ; --export <sauvegarde.tar.gz> pour préparer avec les brouillons)
node scripts/images-partage/articles.mjs
# Image de partage d'un NUMÉRO (couverture sans texte + bandeau fin : nom N'Ko, « N°… »), après sa publication
node scripts/images-partage/numeros.mjs

# Icônes Phosphor auto-hébergées : à relancer après l'ajout d'une icône « ph-… » dans le code
# (Python avec fontTools et brotli : pip install fonttools brotli)
PYTHON=<chemin de python> node scripts/icones/generer-icones.mjs
```

**Pièges connus :**
- Toujours mettre une **limite de temps** (`timeout`) et lancer les étapes **une par une** : les longues chaînes de commandes se figent parfois sur cette machine.
- Les fichiers sont en fins de ligne **Windows (CRLF)** : préférer l'outil d'édition aux remplacements par script.
- Dans le code, écrire les plages Unicode par **numéro** (`code >= 0x07c0`) plutôt qu'avec des barres obliques (`\u07C0`), qui peuvent être déformées par les outils.
- Le `.env.local` local n'a peut-être pas `SANITY_API_READ_TOKEN` (la route d'aperçu répond 500 en local, sans risque).

## 4. Architecture (fichiers importants)

| Chemin | Rôle |
|---|---|
| **Langue dans l'adresse (B6)** : `app/[lang]/` · `app/lib/langue.ts` · `proxy.ts` | Toutes les pages sont dans `app/[lang]/` (« nqo » = N'Ko, « fr » = français), préparées à l'avance dans les deux langues. **N'Ko : adresses sans préfixe** (`/article/<slug>`, inchangées) ; **français : `/fr/…`**. `proxy.ts` sert la version N'Ko (dossier interne `/nqo`) aux adresses sans `/fr` et renvoie `/nqo/…` vers l'adresse publique. Langue, sens et traduction fixés par le serveur (`app/[lang]/layout.tsx`). **Liens internes** : `lien("/chemin")` de `useLanguage()` (composants client) ou `<LienLangue>` (`app/components/LienLangue.tsx`, composants serveur) — jamais un chemin en dur. Métadonnées de chaque version : `versionLangue()` (`app/lib/carte-partage.ts`). Test : `node scripts/tester-langues.mjs <adresse>` |
| `app/[lang]/article/[slug]/page.tsx` | Page article (serveur) : requête GROQ, métadonnées, JSON-LD, lexique de l'article |
| `app/components/ArticleClient.tsx` | Affichage d'un article (client) + lexique de fin. Emplacements `bandeau`, `surtitre`, `navigation` et `texte` remplis par la page (composants serveur) |
| `app/[lang]/numeros/` · `app/lib/numeros.ts` | Archive `/numeros` et page d'un numéro `/numeros/[slug]` (404 si absent ou non publié) ; requêtes des numéros (une par page). Version imprimable `/numeros/[slug]/imprimer` (`VueImpression.tsx`, non indexée) → PDF par `scripts/pdf-numero/generer.mjs`, rangé dans `public/pdf/` (liste `app/lib/pdf-numeros.json`, lien « Télécharger le PDF » sur la page du numéro) |
| `app/components/numero/` | `textes.ts` (N'Ko de l'interface, fourni par la rédaction, et chiffres N'Ko), `titre.ts` (titre N'Ko / français, testé par `scripts/tester-titres.mts`), `VueNumero.tsx` (page d'un numéro), `ArticleNumero.tsx` (« Paru dans le N° », rubrique, précédent / suivant sur la page article) |
| `app/components/CustomPortableText.tsx` | **Moteur de rendu du texte**, composant **serveur** : détection N'Ko/français par bloc, h1–h6, citations, images + légendes, encadrés, titres de rubrique, termes du lexique, formules (KaTeX). Îlots client dans `app/components/texte/` (visionneuse, vidéo YouTube) ; outils partagés dans `texte/outils.ts`. **Ne pas l'importer depuis un fichier « use client »** (il repartirait dans le navigateur) |
| `app/components/lexique/` | Lexique : `textes.ts` (N'Ko de l'interface, fourni par la rédaction), `TermeLexique.tsx` (fiche/bulle), `LexiqueArticle.tsx`, `DictionnaireInteractif.tsx`, `CiterTerme.tsx`, `normaliser.ts` |
| `app/[lang]/lexique/` | Dictionnaire public `/lexique` et `/lexique/[slug]` |
| `app/lib/categories.ts` · `app/[lang]/categories/[slug]/` | **13 disciplines** (23 octobre 2026 ; nouvelles : Environnement et Climat, Agronomie, Langues et Écritures, Paléontologie et Archéologie) et leurs **icônes** (UNE seule liste, `iconeDeCle`, pour cartes, filtre et pages ; nouvelle icône → relancer `scripts/icones/generer-icones.mjs`, Python avec fontTools et brotli installés pour l'utilisateur) : table UNIQUE valeur Sanity (nom N'Ko) → clé (`astronomy`…), disciplines qui ont une page (`/categories/astronomie`, seulement avec des articles publiés), où mène l'étiquette (« Revue Mensuelle » → `/numeros`). Noms affichés : `app/messages/*.json` → `home.categories`. Fil d'Ariane de l'article, étiquette du bas, filtre de l'accueil (sans catégorie vide) |
| `app/lib/rubriques.ts` · `app/[lang]/rubriques/[slug]/` · `app/components/numero/VueRubrique.tsx` | **Rubriques** : une page par rubrique publiée qui a des articles (la rubrique numéro après numéro) ; le nom de la rubrique au-dessus du titre de l'article y mène |
| `app/lib/cartes-articles.ts` | Cartes d'articles (accueil, disciplines, rubriques) : requête, `CHAMPS_CARTE`, `getValeursCategories` |
| Fil d'Ariane | **Jamais de balise `<nav>`** hors menu du site : la règle générale `nav` de `globals.css` la rendrait collante (utiliser `role="navigation"`) |
| `app/[lang]/desabonnement/page.tsx` | Page de désinscription (bouton POST) |
| `app/studio/layout.tsx` | Gabarit propre au Studio (depuis B6, le gabarit du site est dans `app/[lang]/`) |
| `app/api/newsletter` · `verify` · `unsubscribe` | Inscription, confirmation, désinscription (fiches **privées** `subscriber.<uuid>`) ; désinscription « en un clic » des messageries (RFC 8058) pour la lettre (`scripts/lettre/envoyer.mts`) |
| `app/api/contact` | Formulaire de contact (e-mail Resend, rien n'est stocké) |
| `app/api/cron/cleanup` | Nettoyage nocturne (Vercel Cron, protégé par `CRON_SECRET`) |
| `app/api/revalidate` | « Sonnette » Sanity : met à jour accueil, plan du site, articles, lexique, numéros, auteurs dès une publication (filtre du webhook, dans sanity.io/manage → API → Webhooks : `_type in ["article","terme","numero","rubrique","author"]`). Le site lit Sanity **sans CDN** (`sanity/client.ts`, 23 octobre 2026) : sinon la page reconstruite juste après la sonnette pouvait garder l'ancienne version une heure |
| `app/api/draft-mode/enable` · `disable` | Aperçu des brouillons (onglet **Presentation** du Studio) |
| `sanity/fetch.ts` | `getSanityClient()` : brouillons en mode aperçu (clé Viewer), sinon contenu publié |
| `sanity/schemas/` | `article.ts`, `terme.ts`, `author.ts`, `subscriber.ts`, `rubrique.ts`, `numero.ts` (`index.ts` est un reste inutilisé) |
| `sanity.config.ts` | Studio : outils, onglet Presentation, interdiction de créer/dupliquer un abonné |
| `sanity.cli.ts` | Projet et dataset ; `deployment.appId` = le Studio officiel **https://www.nkonilonko.com/studio** (`sofo4rzn3y9lp9608748cxio`). **Ne pas ouvrir le Studio sur une adresse d'aperçu Vercel** : il s'y enregistre tout seul (c'est ce qui a créé le doublon `xsdgnlztnsa462mh2v6t5iyk` le 4 octobre, supprimé le 16 octobre) |
| `app/[lang]/terms/TermsClient.tsx` · `app/robots.ts` · `public/.well-known/tdmrep.json` | Conditions d'utilisation, dont la **partie 10 « Intelligence artificielle »** (politique de la revue sur l'IA, validée le 19 octobre 2026 ; une phrase et un lien dans la Confidentialité). Réserve des droits contre l'entraînement d'IA : robots d'entraînement refusés (`robots.ts`), `tdmrep.json` et en-tête `tdm-reservation: 1` (`proxy.ts`) |
| `proxy.ts` · `app/api/csp-rapport` | Langue dans l'adresse (voir plus haut) + filtre anti-robots + CSP (en mode « rapport seulement », sans « nonce » : les pages sont préparées à l'avance). Les violations arrivent dans les journaux Vercel (« [CSP] ») ; passage en mode appliqué : `docs/PLAN-LOT-2.md` |
| `app/icones-phosphor.css` · `public/icones/` | Icônes Phosphor **auto-hébergées** (seulement celles du site, 4 épaisseurs) : fichiers **générés** par `scripts/icones/generer-icones.mjs`, ne pas les modifier à la main |
| `app/fonts/` · `public/arriere-plan.avif` | Police Kigelia en **WOFF2** (les OTF de `public/fonts` servent aux e-mails et aux images de partage) ; motif de fond en AVIF, WebP en repli (`image-set` dans `globals.css`) |
| **Design « Nuit du Mandé »** : haut de `app/globals.css` · `tailwind.config.ts` · `app/lib/ambiance.ts` · `app/fonts/lecture.ts` | Couleurs en **variables** (seul endroit où les changer). **`white` = couleur du TEXTE** (ivoire, ou encre sur le papier) ; vrai blanc : **`blanc`** ; fond `void`, panneau `surface`, or `or` (bouton doré plein : `bg-[#fbbf24]`). Ambiances de lecture des articles **Nuit / Papier / Jour** (`html[data-ambiance]`, îlot toujours sombre : `ambiance-nuit`). Texte français des articles en **Literata**. Tout dans **`docs/DESIGN.md`** |
| `app/bibliotheque/` · `app/lib/bibliotheque.ts` | « Ma bibliothèque » : articles sauvegardés avec le signet (dans le navigateur du lecteur, clé `nko_bookmarks`), lisibles sans connexion |
| `public/sw.js` · `app/components/LectureHorsLigne.tsx` | **Lecture hors ligne** (service worker écrit à la main ; Serwist retiré). Réseau d'abord pour les pages ; jamais `/studio`, `/api`. Bibliothèque et numéros téléchargés gardés avec leurs images. Arrêt d'urgence : `docs/HORS-LIGNE.md` |
| `app/components/application/` · `app/lib/installation.ts` · `public/manifest*.json` · `public/application/` | **Application du site** (étapes 1 et 2) : un manifeste par langue, icônes masquables, raccourcis, captures, écrans de démarrage iPhone (fabriqués par `scripts/application/generer.mjs`) ; proposition d'installer (2ᵉ article), guide iPhone, « Télécharger le numéro », page « pas de connexion » qui liste ce qui est gardé. Textes : `application/textes.ts`. Détails : `docs/APPLICATION.md` |
| `app/auteurs/[slug]/` · `app/lib/auteurs.ts` | Pages auteurs (biographie N'Ko puis française, articles). **WhatsApp jamais publié** (numéro de téléphone) |
| `app/components/PiluleRetour.tsx` | Bouton « Retour » des pages sans navigation (numéros, auteurs, bibliothèque) : venu d'un autre site → accueil |
| `sanity/correcteur-nko.ts` | Correcteur N'Ko du Studio (avertissements, ne corrige jamais) : marques doublées, mots « écrits autrement » que dans les articles publiés |
| `app/lib/citations.ts` | « Citer » : citation N'Ko d'abord, puis APA, MLA, BibTeX, RIS (la revue auteur = organisation) |
| `app/components/BandeauApercuDiffere.tsx` | Bandeau du mode aperçu chargé **à la demande**. Ne jamais importer directement dans `layout.tsx` un composant qui utilise `next-sanity/hooks` : ses outils (≈ 240 Ko) partiraient chez tous les visiteurs |
| `SiteFooter` · `ArticleFooter` · `ContactClient` | Formulaires : Turnstile (Cloudflare) n'est créé qu'au premier contact avec le formulaire (focus, clic, toucher) |
| `scripts/logo/` · `public/icon-512x512.png` · `public/logo/` | **Logo** (harmonisé le 24 octobre 2026) : sources HD tirées du Canva du propriétaire (la lettre U+07D2 en police Ebrima, effets Canva refaits à l'identique), un compositeur unique pour toutes les versions : sans fond (site), simplifiée (onglet, petites cases), impression, icône de l'application. `public/icon-*.png` ne sont plus des sources : ils sont FABRIQUÉS. Voir `docs/LOGO.md` |
| `app/lib/partage.ts` · `public/og/` | Images de partage (accueil et pages générales ; dictionnaire et termes). **Ne pas utiliser `next/og` pour du N'Ko** (lettres non liées) : fabriquer l'image avec `scripts/images-partage/generer.mjs`. Articles : `public/og/articles/` + liste `app/lib/images-partage-articles.json`, fabriquées par `scripts/images-partage/articles.mjs` (sinon, la couverture sert de secours) |

## 5. Données Sanity (à connaître avant toute écriture)

- **Abonnés** : identifiant **avec un point** `subscriber.<uuid>` → **invisibles** pour le public (dataset public). Ne jamais créer d'abonné sans point.
- **Article** : `title` et `excerpt` obligatoires (erreur), `publishedAt` obligatoire, `slug` en `a-z0-9-` seulement. Garde-fous (avertissements) : texte non NFC ; terme du lexique non relié en N'Ko **et** en français, ou relié plusieurs fois.
- **Encadrés (`callout.intent`)** : `success` = **Définition** (bleu, compact) · `amazing` = Le saviez-vous ? · `question` = Question · `info` · `warning`.
- **Terme du lexique (`terme`)** : `termeNko`, `termeFr`, `definitionNko`, `definitionFr`, `domaine`, `slug`. Un terme est défini **une fois** et relié depuis le texte (annotation `termeLexique`). Avertissement si un terme existe déjà.
- La liste des articles qui utilisent un terme est **réservée à la rédaction** (encadré dans le Studio) : **ne jamais l'afficher sur le site**.
- **Rubrique (`rubrique`)** : `titleNko`, `titleFr` (obligatoires, N'Ko de la rédaction), `slug`, `ordre`, `descriptionFr`. Un article a un champ facultatif `rubrique` (référence).
- **Numéro (`numero`)** : `numero` (unique), `slug` = numéro sur 3 chiffres (« 003 », calculé et contrôlé), `saison`, `publishedAt` (obligatoire), `couverture` (conseillée), `sommaire` (articles ordonnés, sans doublon), `edito` et `aLaUne` (dans le sommaire), `seoTitle`, `excerpt` (facultatif : sinon le résumé de l'édito). **Le numéro pointe vers ses articles** ; l'article ne stocke pas son numéro (le site le retrouve avec `references()`).
- **Références vers un brouillon** : toujours **faibles** (`_weak: true` + `_strengthenOnPublish`), sinon Sanity refuse la création (règle du propriétaire, 15 octobre 2026). Ordre de publication : rubriques → termes → articles → numéro.
- Import par une IA : suivre **`docs/GUIDE-IMPORT-IA.md`** (brouillons seulement, vérification, aperçu, publication par le propriétaire). Images : **uniquement libres de droits**, téléversées dans Sanity, crédit et licence dans le champ `source`.
- Compte X des partages : `COMPTE_X` dans `app/lib/partage.ts` (aujourd'hui `@MckV2016`, compte du propriétaire ; passer à `@nkonilonko` quand il existera). YouTube, TikTok, Instagram et Facebook « nkonilonko » sont bien au propriétaire.

## 6. Variables d'environnement (NOMS seulement)

Publiques (normal) : `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
Secrets (serveur uniquement) : `SANITY_API_WRITE_TOKEN` (rôle **Editor**), `SANITY_API_READ_TOKEN` (rôle **Viewer**), `SANITY_REVALIDATE_SECRET`, `RESEND_API_KEY` (envoi seulement), `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`.

## 7. Conventions N'Ko

- **Jamais** de N'Ko écrit par l'IA. Les textes d'interface en N'Ko sont fournis par la rédaction (voir `app/components/lexique/textes.ts`, `app/[lang]/desabonnement/page.tsx`). Si un texte manque : laisser l'emplacement **vide** (seul le français s'affiche) et le demander.
- Vérifier après chaque modification que les passages N'Ko d'un fichier sont **identiques** avant/après et en **NFC**.
- Données Sanity : **tout le texte est en NFC** depuis le 5 octobre 2026 (87 groupes remis dans l'ordre ; sauvegarde et script dans `C:\Dev\archives\`). Dans le code, désigner une marque N'Ko par son **code** (`U+07F2`), pas par le caractère.
- Chaque bloc a `dir` **et** `lang` (`nqo` / `fr`). Sur la version N'Ko, le `<html>` est `lang="nqo"` : le français doit donc être marqué `lang="fr"` (et inversement sur la version française `/fr`, `lang="fr"` : le N'Ko garde `lang="nqo"`).
- Propriétés Tailwind **logiques** de préférence (`ms-`, `ps-`, `border-s-`, `text-start`…).
- Chiffres N'Ko : ߀ ߁ ߂ ߃ ߄ ߅ ߆ ߇ ߈ ߉ (U+07C0 à U+07C9).
- **Numéro de la revue en N'Ko** (règle validée le 18 octobre 2026) : abréviation, « ° » **collé** aux chiffres N'Ko, puis **toujours** la nasalisation `U+07F2` après le dernier chiffre (il se lit « troisième numéro ») ; la marque n'est **jamais doublée** (ex. dans « Paru dans le … »). Le code applique la règle dans `app/components/numero/textes.ts` (`numeroNko`, `paruDansNko`) : ne jamais écrire un numéro N'Ko à la main ailleurs. Archive : `C:\Dev\archives\traductions\decisions-redaction-2026-10-16.txt`.
- Un texte français placé **dans** une ligne N'Ko (date, numéro, nom) doit avoir `dir="ltr"`, sinon ses chiffres changent de place (ex. « octobre 2026 30 »).

## 8. Méthode de livraison

1. Branche dédiée depuis `main` → un commit par changement (co-signature Claude).
2. Vérifier : N'Ko inchangé, ESLint, TypeScript, construction, test local réel.
3. Envoyer la branche → attendre l'aperçu Vercel (statut sur GitHub) → le propriétaire vérifie.
4. Fusion **en avance rapide** (`git merge --ff-only`) seulement après « fusionner » écrit.
5. Si le schéma change : `sanity deploy --external --schema-required` après la fusion (`schema deploy` seul ne met pas à jour le schéma lié au Studio, lu par Cowork), puis supprimer `dist/`.

## 9. Calendrier et reste à faire

- **Lot 1 : terminé et en ligne** (3 – 5 octobre 2026, 77 changements). Tout est décrit dans **`docs/COMPTE-RENDU-LOT-1.md`** (à lire en premier par toute nouvelle session ou autre IA, ex. Claude Cowork).
- **N°003** : **déjà entièrement dans Sanity** (brouillons ; plus d'import à faire, constaté le 23 octobre 2026), publication le **30 octobre** — liste de contrôle et jour J : **`docs/AVANT-PUBLICATION-N003.md`**. **Gel** du site du 18 au 30 octobre (corrections seulement ; la saisie des contenus reste possible). Les articles restent en **brouillon** jusqu'au 30 octobre.
- **Exception décidée par le propriétaire le 15 octobre 2026 : la notion de « Numéro » est livrée AVANT le gel du 18 octobre**, en deux parties : **A** (schéma `rubrique` / `numero`, champ `rubrique` de l'article, script de vérification) puis **B** (pages `/numeros` et `/numeros/[slug]`, « Paru dans le N° » et navigation sur la page article, SEO, plan du site, mise à jour automatique, lien « Numéros » du menu). Les libellés N'Ko des rubriques et de l'interface viennent de la rédaction.
- **Chantiers A et B (18 octobre 2026, vitesse, qualité, sécurité)** : le détail de chaque point est dans son message de commit (« A1 » à « A10 », « B1 » à « B11 ») ; les suites (langue dans l'adresse « B6 », CSP appliquée, petits constats) sont dans **`docs/PLAN-LOT-2.md`**.
- **Lot 2 : ne pas commencer avant le 30 octobre.** Ordre et méthode (dont le modèle de traduction ByT5, jeu de données **privé**, Google Colab) : **`docs/PLAN-LOT-2.md`**.
- **Lot 2 préparé en avance (19 – 20 octobre 2026, accord du propriétaire)** : 20 branches empilées `lot2/…`, **rien de fusionné** ; liste, ordre et gestes après fusion dans **`docs/PLAN-LOT-2.md`** (« État au 20 octobre »). Textes N'Ko à demander et constats pour la rédaction : **`docs/TEXTES-NKO-A-DEMANDER.md`**. Branche à part `correctif/navigation-scholar` (depuis `main`, corrections de choses en ligne) : fusionnable avant le 30.
- **22 octobre 2026 : B6 et pile reposée** : 6 branches empilées (`lot2/b6-langue-adresse` → `lot2/securite-entetes` → `lot2/flux-rss` → `lot2/donnees-google` → `lot2/accessibilite-suite` → `lot2/pile-sur-b6`), **fusionnées et en ligne le 22 octobre 2026** (`main` = `9608f15`, Production vérifiée, deux schémas Sanity mis à jour). Les anciennes branches `lot2/…` du 20 octobre sont **remplacées** (ne plus les fusionner). Ordre, tests, conseils de date et gestes après fusion : **`docs/RAPPORT-22-OCTOBRE.md`**.
- **24 octobre 2026 : application du site + nouveau design « Nuit du Mandé » mis en ligne** (décision du propriétaire, exception au gel : « fusionne tout ») : branches `lot2/application` puis `lot2/design-nuit-du-mande` (palette, ambiances de lecture Nuit / Papier / Jour, Literata, images de partage au bleu nuit), avec tous les textes N'Ko L21 à L37 et la forme courte de « sauvegarder » (L6 p, L14 a, L15 b, L15 c). Détail : **`docs/DESIGN.md`**, **`docs/APPLICATION.md`**. Après la publication du N°003 : images de partage des articles et du numéro (`scripts/images-partage/articles.mjs`, `numeros.mjs`), déjà au bleu nuit.
- **Liste du Lot 2** : corpus N'Ko – français pour le modèle ByT5 (export daté, privé), politique d'usage de l'IA et clause « IA » du pacte des auteurs, images de partage des articles avec leur titre N'Ko (même méthode que `scripts/images-partage/generer.mjs`, `next/og` ne lie pas les lettres N'Ko), lettre d'information, PDF du numéro, édition visuelle cliquable (stega), audio des termes, « voir aussi », conversion des anciens encadrés de définition, application hors ligne (Serwist incompatible avec Turbopack), image de partage des articles (erreur `fit-content`), faille `basic-ftp` (outil d'import Sanity), option `isHighlighted` obsolète, choix manuel de la « langue du paragraphe » dans le Studio (aujourd'hui : un paragraphe qui contient du N'Ko s'affiche en N'Ko — règle mesurée le 5 octobre 2026 comme la plus juste : 0 erreur sur 756 paragraphes ; seule limite, un paragraphe français citant un mot N'Ko).
