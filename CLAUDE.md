# N'Ko ni Lonko — Mémoire du projet (CLAUDE.md)

> Revue scientifique bilingue **N'Ko / français** — https://www.nkonilonko.com
> Ce fichier est lu au début de chaque session. Mis à jour le 5 octobre 2026.

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
export NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 SERWIST_SUPPRESS_TURBOPACK_WARNING=1
timeout 300 node node_modules/next/dist/bin/next build

# Vérifications (lancer les outils DIRECTEMENT, pas avec npx : npx se fige parfois ici)
timeout 150 node node_modules/eslint/bin/eslint.js <fichiers>
timeout 200 node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
timeout 200 node node_modules/sanity/bin/sanity schema validate
timeout 400 node node_modules/sanity/bin/sanity documents validate --yes --level warning

# Sanity (connexion faite avec le compte GitHub du propriétaire : npx sanity login --provider github)
node node_modules/sanity/bin/sanity schema deploy        # après une fusion qui change le schéma
node node_modules/sanity/bin/sanity dataset export production "C:/Dev/archives/exports/<nom>.tar.gz"

# Images de partage (rendu par Chrome : N'Ko lié). Changer VERSION dans le script ET dans app/lib/partage.ts
node scripts/images-partage/generer.mjs
```

**Pièges connus :**
- Toujours mettre une **limite de temps** (`timeout`) et lancer les étapes **une par une** : les longues chaînes de commandes se figent parfois sur cette machine.
- Les fichiers sont en fins de ligne **Windows (CRLF)** : préférer l'outil d'édition aux remplacements par script.
- Dans le code, écrire les plages Unicode par **numéro** (`code >= 0x07c0`) plutôt qu'avec des barres obliques (`\u07C0`), qui peuvent être déformées par les outils.
- Le `.env.local` local n'a peut-être pas `SANITY_API_READ_TOKEN` (la route d'aperçu répond 500 en local, sans risque).

## 4. Architecture (fichiers importants)

| Chemin | Rôle |
|---|---|
| `app/article/[slug]/page.tsx` | Page article (serveur) : requête GROQ, métadonnées, JSON-LD, lexique de l'article |
| `app/components/ArticleClient.tsx` | Affichage d'un article (client) + lexique de fin |
| `app/components/CustomPortableText.tsx` | **Moteur de rendu du texte** : détection N'Ko/français par bloc, h1–h6, citations, images + légendes, encadrés, titres de rubrique, termes du lexique |
| `app/components/lexique/` | Lexique : `textes.ts` (N'Ko de l'interface, fourni par la rédaction), `TermeLexique.tsx` (fiche/bulle), `LexiqueArticle.tsx`, `DictionnaireInteractif.tsx`, `CiterTerme.tsx`, `normaliser.ts` |
| `app/lexique/` | Dictionnaire public `/lexique` et `/lexique/[slug]` |
| `app/desabonnement/page.tsx` | Page de désinscription (bouton POST) |
| `app/api/newsletter` · `verify` · `unsubscribe` | Inscription, confirmation, désinscription (fiches **privées** `subscriber.<uuid>`) |
| `app/api/contact` | Formulaire de contact (e-mail Resend, rien n'est stocké) |
| `app/api/cron/cleanup` | Nettoyage nocturne (Vercel Cron, protégé par `CRON_SECRET`) |
| `app/api/revalidate` | « Sonnette » Sanity : met à jour accueil, plan du site, articles, lexique dès une publication |
| `app/api/draft-mode/enable` · `disable` | Aperçu des brouillons (onglet **Presentation** du Studio) |
| `sanity/fetch.ts` | `getSanityClient()` : brouillons en mode aperçu (clé Viewer), sinon contenu publié |
| `sanity/schemas/` | `article.ts`, `terme.ts`, `author.ts`, `subscriber.ts` |
| `sanity.config.ts` | Studio : outils, onglet Presentation, interdiction de créer/dupliquer un abonné |
| `proxy.ts` | Filtre anti-robots + CSP (en mode « rapport seulement ») |
| `app/lib/partage.ts` · `public/og/` | Images de partage (accueil et pages générales ; dictionnaire et termes). **Ne pas utiliser `next/og` pour du N'Ko** (lettres non liées) : fabriquer l'image avec `scripts/images-partage/generer.mjs`. Les articles utilisent leur photo de couverture |

## 5. Données Sanity (à connaître avant toute écriture)

- **Abonnés** : identifiant **avec un point** `subscriber.<uuid>` → **invisibles** pour le public (dataset public). Ne jamais créer d'abonné sans point.
- **Article** : `title` et `excerpt` obligatoires (erreur), `publishedAt` obligatoire, `slug` en `a-z0-9-` seulement. Garde-fous (avertissements) : texte non NFC ; terme du lexique non relié en N'Ko **et** en français, ou relié plusieurs fois.
- **Encadrés (`callout.intent`)** : `success` = **Définition** (bleu, compact) · `amazing` = Le saviez-vous ? · `question` = Question · `info` · `warning`.
- **Terme du lexique (`terme`)** : `termeNko`, `termeFr`, `definitionNko`, `definitionFr`, `domaine`, `slug`. Un terme est défini **une fois** et relié depuis le texte (annotation `termeLexique`). Avertissement si un terme existe déjà.
- La liste des articles qui utilisent un terme est **réservée à la rédaction** (encadré dans le Studio) : **ne jamais l'afficher sur le site**.
- Import par une IA : suivre **`docs/GUIDE-IMPORT-IA.md`** (brouillons seulement, vérification, aperçu, publication par le propriétaire). Images : **uniquement libres de droits**, téléversées dans Sanity, crédit et licence dans le champ `source`.
- Compte X des partages : `COMPTE_X` dans `app/lib/partage.ts` (aujourd'hui `@MckV2016`, compte du propriétaire ; passer à `@nkonilonko` quand il existera). YouTube, TikTok, Instagram et Facebook « nkonilonko » sont bien au propriétaire.

## 6. Variables d'environnement (NOMS seulement)

Publiques (normal) : `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
Secrets (serveur uniquement) : `SANITY_API_WRITE_TOKEN` (rôle **Editor**), `SANITY_API_READ_TOKEN` (rôle **Viewer**), `SANITY_REVALIDATE_SECRET`, `RESEND_API_KEY` (envoi seulement), `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`.

## 7. Conventions N'Ko

- **Jamais** de N'Ko écrit par l'IA. Les textes d'interface en N'Ko sont fournis par la rédaction (voir `app/components/lexique/textes.ts`, `app/desabonnement/page.tsx`). Si un texte manque : laisser l'emplacement **vide** (seul le français s'affiche) et le demander.
- Vérifier après chaque modification que les passages N'Ko d'un fichier sont **identiques** avant/après et en **NFC**.
- Données Sanity : **tout le texte est en NFC** depuis le 5 octobre 2026 (87 groupes remis dans l'ordre ; sauvegarde et script dans `C:\Dev\archives\`). Dans le code, désigner une marque N'Ko par son **code** (`U+07F2`), pas par le caractère.
- Chaque bloc a `dir` **et** `lang` (`nqo` / `fr`). Le `<html>` est `lang="nqo"` : le français doit donc être marqué `lang="fr"`.
- Propriétés Tailwind **logiques** de préférence (`ms-`, `ps-`, `border-s-`, `text-start`…).
- Chiffres N'Ko : ߀ ߁ ߂ ߃ ߄ ߅ ߆ ߇ ߈ ߉ (U+07C0 à U+07C9).

## 8. Méthode de livraison

1. Branche dédiée depuis `main` → un commit par changement (co-signature Claude).
2. Vérifier : N'Ko inchangé, ESLint, TypeScript, construction, test local réel.
3. Envoyer la branche → attendre l'aperçu Vercel (statut sur GitHub) → le propriétaire vérifie.
4. Fusion **en avance rapide** (`git merge --ff-only`) seulement après « fusionner » écrit.
5. Si le schéma change : `sanity schema deploy` après la fusion.

## 9. Calendrier et reste à faire

- **Lot 1 : terminé et en ligne** (3 – 5 octobre 2026, 77 changements). Tout est décrit dans **`docs/COMPTE-RENDU-LOT-1.md`** (à lire en premier par toute nouvelle session ou autre IA, ex. Claude Cowork).
- **N°003** : répétition générale avec le 1er article terminé (brouillon), import du 25 au 28 octobre 2026, publication le **30 octobre** — liste de contrôle et jour J : **`docs/AVANT-PUBLICATION-N003.md`**. **Gel** du site du 18 au 30 octobre (corrections seulement ; la saisie des contenus reste possible). Les articles restent en **brouillon** jusqu'au 30 octobre.
- **Lot 2 : ne pas commencer avant le 30 octobre.** Ordre et méthode (dont le modèle de traduction ByT5, jeu de données **privé**, Google Colab) : **`docs/PLAN-LOT-2.md`**.
- **Liste du Lot 2** : type « Numéro », corpus N'Ko – français pour le modèle ByT5 (export daté, privé), politique d'usage de l'IA et clause « IA » du pacte des auteurs, images de partage des articles avec leur titre N'Ko (même méthode que `scripts/images-partage/generer.mjs`, `next/og` ne lie pas les lettres N'Ko), lettre d'information, PDF du numéro, édition visuelle cliquable (stega), audio des termes, « voir aussi », conversion des anciens encadrés de définition, application hors ligne (Serwist incompatible avec Turbopack), image de partage des articles (erreur `fit-content`), faille `basic-ftp` (outil d'import Sanity), option `isHighlighted` obsolète, choix manuel de la « langue du paragraphe » dans le Studio (aujourd'hui : un paragraphe qui contient du N'Ko s'affiche en N'Ko — règle mesurée le 5 octobre 2026 comme la plus juste : 0 erreur sur 756 paragraphes ; seule limite, un paragraphe français citant un mot N'Ko).
