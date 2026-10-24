# Guide d'import par une IA — N'Ko ni Lonko

> Pour toute IA (Claude ou autre) chargée de **saisir un numéro** dans Sanity.
> Circuit : **la rédaction écrit et traduit → l'IA saisit (brouillons) → le propriétaire relit dans l'aperçu → le propriétaire publie.**
> Lire aussi `CLAUDE.md` (règles absolues).

---

## 1. Les 7 étapes, dans l'ordre

| N° | Étape | Qui | Commande / outil |
|---|---|---|---|
| 0 | **Recevoir les textes** : paragraphe par paragraphe (N'Ko puis français), titre, résumé, catégorie, auteurs, date, encadrés repérés, termes du lexique avec leurs **définitions N'Ko et français**, légendes N'Ko des images, images éventuelles | rédaction | fichier Word, Google Docs, PDF ou texte collé |
| 1 | **Export complet** du dataset (sauvegarde) | IA, avec accord écrit | `node node_modules/sanity/bin/sanity dataset export production "C:/Dev/archives/exports/avant-import-<numero>.tar.gz"` |
| 2 | Préparer le **fichier d'import** (JSON, tableau de documents) | IA | voir § 3 et § 4 |
| 3 | **Vérification à blanc** du fichier (n'écrit rien dans Sanity) | IA | `node scripts/verifier-import.mts <fichier.json> --export <sauvegarde de l'étape 1>` → **0 erreur** obligatoire. Si le script crée `<fichier>.nfc.json`, c'est **cette copie** qu'on importe |
| 4 | Créer les documents **en brouillon uniquement** (`_id` = `drafts.…`) | IA, avec accord écrit | outil MCP Sanity `create_documents`, ou `sanity documents create` |
| 5 | **Validation officielle** de tous les documents | IA | `node node_modules/sanity/bin/sanity documents validate --yes --level warning` |
| 6 | **Relecture dans l'aperçu** (Studio → Presentation) | propriétaire | sur le vrai site, en N'Ko et en français, ordinateur et téléphone |
| 7 | **Publication**, dans cet ordre : **rubriques**, **termes** du lexique, **articles**, puis **le numéro en dernier** | **propriétaire seulement** | Studio → Publier |

**L'IA ne publie jamais, ne supprime jamais, ne modifie jamais un document déjà publié.**
**Les articles d'un numéro restent en brouillon jusqu'au jour de sa publication** (30 octobre 2026 pour le N°003) : rien n'est dévoilé avant.

## 2. Règles sur le N'Ko (règle 6 — non négociable)

- Le N'Ko est **copié tel quel** depuis la rédaction. L'IA **n'écrit, ne traduit, ne corrige** aucun texte N'Ko.
- Tout texte doit être en **Unicode NFC**. **Décision du propriétaire (5 octobre 2026) : la normalisation NFC n'est pas une modification du texte.** Cas fréquent : marque de **ton** tapée **avant** la marque de **nasalisation** ߲. Le script remet les marques dans l'ordre NFC **automatiquement** (copie `<fichier>.nfc.json`), après avoir contrôlé qu'**aucun caractère n'est ajouté ni retiré**, et liste chaque mot concerné. Ne jamais normaliser « à la main » ni par un autre moyen.
- Signaler aussi les **doubles marques** (ex. ߲ tapé deux fois).
- Le script **signale** les doubles marques mais **ne les corrige jamais** : seule la rédaction (ou le propriétaire, par écrit) décide de la correction.

## 3. Format d'un **terme du lexique** (`terme`)

```json
{
  "_id": "drafts.terme-trou-noir",
  "_type": "terme",
  "termeNko": "<N'Ko de la rédaction>",
  "termeFr": "Trou noir",
  "definitionNko": "<N'Ko de la rédaction>",
  "definitionFr": "Objet céleste si dense que rien, pas même la lumière, ne peut s'en échapper.",
  "domaine": "<valeur N'Ko de la liste des catégories du schéma>",
  "slug": { "_type": "slug", "current": "trou-noir" }
}
```

- **Avant de créer un terme**, chercher s'il **existe déjà** (même `termeFr` ou `termeNko`, sans tenir compte des majuscules). S'il existe : **le réutiliser** (son `_id` publié, sans `drafts.`).
- `slug` : minuscules, chiffres, tirets (`a-z0-9-`), créé à partir du terme français.
- Les 4 champs `termeNko`, `termeFr`, `definitionNko`, `definitionFr` sont obligatoires.

## 4. Format d'un **article** (`article`)

Champs obligatoires : `title`, `excerpt` (≤ 200 caractères conseillés), `publishedAt` (date ISO), `slug.current` (`a-z0-9-`), `category` (valeur de la liste du schéma), `authors` (références vers des auteurs **existants**), `mainImage` (image téléversée + `alt`), `body`.

Champ facultatif `excerptFr` (onglet SEO, ajouté le 22 octobre 2026) : **résumé français** d'une ou deux phrases, **160 caractères au plus**, **sans N'Ko**. Il suit le titre français sur les cartes de partage (WhatsApp, Telegram, X) : « titre français — résumé français ». Vide : la partie française de `excerpt` (entre parenthèses), sinon le titre français seul. Le texte vient de la rédaction (version validée), jamais rédigé par l'IA. `scripts/verifier-import.mts` avertit au-delà de 160 caractères ou si le champ contient du N'Ko.

### Le corps (`body`) — types de blocs autorisés

| Bloc | Utilisation | Champs |
|---|---|---|
| `block` (paragraphe) | texte ; un paragraphe = **une seule langue** (N'Ko **ou** français) | `style` : `normal`, `h1`…`h6`, `blockquote` |
| `callout` (encadré) | `intent` : `success` = **Définition** · `amazing` = **Le saviez-vous ?** · `question` = **Question** · `info` = Information · `warning` = Attention | `text` |
| `sectionHeader` (titre de rubrique) | début de rubrique | `titleNko` (obligatoire), `titleFr` |
| `image` | illustration | `alt` (conseillé), `altNko`, `captionNko`, `caption`, `source` |

Chaque bloc a un `_key` unique.

### Relier un terme du lexique dans le texte

Annotation `termeLexique` sur le mot, dans `markDefs` du paragraphe :

```json
{
  "_type": "block", "_key": "p12", "style": "normal",
  "markDefs": [{ "_key": "m1", "_type": "termeLexique", "terme": { "_type": "reference", "_ref": "terme-trou-noir" } }],
  "children": [
    { "_type": "span", "_key": "s1", "text": "Un ", "marks": [] },
    { "_type": "span", "_key": "s2", "text": "trou noir", "marks": ["m1"] },
    { "_type": "span", "_key": "s3", "text": " se forme quand…", "marks": [] }
  ]
}
```

**Règles du lexique (vérifiées par le script ET par le Studio) :**
1. Chaque terme relié l'est **en N'Ko ET en français** (une fois dans un paragraphe N'Ko, une fois dans un paragraphe français) : les deux langues forment une **paire**.
2. Ne relier que la **1re apparition** du terme **par langue** dans l'article.
3. La référence pointe vers l'`_id` **publié** du terme (sans `drafts.`). Sanity refusera de publier l'article tant que le terme n'est pas publié : **publier les termes d'abord**. Si le terme n'existe encore **qu'en brouillon**, la référence doit être **faible** : `"_weak": true` et `"_strengthenOnPublish": { "type": "terme" }` (règle générale, voir § 4 bis).
4. Les anciens encadrés « Définition » (`callout` `success`) restent possibles, mais pour un **nouveau** numéro, préférer le **lexique**.
5. Un terme manque dans le lexique ? Le **signaler** au propriétaire (liste) : la rédaction écrit sa définition N'Ko. L'IA ne crée un terme qu'avec le N'Ko fourni par la rédaction.

### Images (fournies par la rédaction ou cherchées par l'IA)

**Règle : uniquement des images dont la licence permet la publication, avec leur crédit.** Une image prise au hasard sur Internet expose la revue à une plainte pour droits d'auteur.

| Point | Règle |
|---|---|
| Sources à privilégier | **NASA** (domaine public), **ESA** et **ESO** (licences libres avec crédit), **Wikimedia Commons** (licence vérifiée image par image), banques libres (ex. Unsplash) |
| Interdit | Images de presse, de réseaux sociaux ou de sites sans licence claire ; images générées par une IA présentées comme des photos réelles |
| Stockage | L'image est **téléversée dans Sanity** (outil MCP `dataset_assets_upload_from_url` ou CLI), jamais liée au site d'origine |
| Champ `source` | Crédit **et** licence, ex. « NASA/JPL-Caltech — domaine public » ou « ESO/M. Kornmesser — CC BY 4.0 ». Existe aussi sur les **couvertures** (`mainImage.source` de l'article, `couverture.source` du numéro, depuis le 17 octobre 2026) : il s'affiche en petit sous l'image, tel quel dans les deux langues |
| Champ `alt` | Description en français, rédigée par l'IA (ce que montre l'image, en une phrase) |
| Champ `altNko` | Description en N'Ko (depuis le 24 octobre 2026 ; images du texte, couverture de l'article `mainImage.altNko`, couverture du numéro `couverture.altNko`) : lue sur la version N'Ko du site. Fournie par la rédaction (traduction LONKO) ; sinon **laisser vide** (la version N'Ko reprend alors `alt`, simple avertissement dans le Studio) |
| Champ `captionNko` | Fourni par la rédaction ; sinon **laisser vide** |
| Champ `caption` | Légende française (rédaction, ou proposée par l'IA à partir de la source) |
| Taille | Assez grande pour l'écran (≥ 1 200 px de large pour la couverture) |

## 4 bis. Rubriques et numéros (`rubrique`, `numero`)

**Règle des références (décision du propriétaire, 15 octobre 2026) :** une référence vers un document qui n'existe **qu'en brouillon** (article, rubrique, terme) doit être **faible** : `"_weak": true` et `"_strengthenOnPublish": { "type": "<type de la cible>" }`. Sinon, Sanity refuse la création. Le script le vérifie avec `--export`.

### Rubrique

```json
{
  "_id": "drafts.rubrique-grand-sujet",
  "_type": "rubrique",
  "titleNko": "<N'Ko de la rédaction>",
  "titleFr": "Grand sujet",
  "slug": { "_type": "slug", "current": "grand-sujet" },
  "ordre": 2,
  "descriptionFr": "Facultatif."
}
```

- `titleNko` et `titleFr` obligatoires (le N'Ko vient **toujours** de la rédaction) ; `slug` en `a-z0-9-` ; `ordre` entier ≥ 1.
- Identifiants trouvés dans les fichiers du N°003 : `edito`, `grand-sujet`, `afrique-qui-cherche`, `grande-question`, `ciel-du-mois`, `chiffre-du-mois`, `en-bref`, `mots-du-mois`.
- Un article indique sa rubrique avec le champ `rubrique` : `{ "_type": "reference", "_ref": "rubrique-grand-sujet" }` (faible si la rubrique n'est pas publiée).

### Numéro

```json
{
  "_id": "drafts.numero-003",
  "_type": "numero",
  "numero": 3,
  "slug": { "_type": "slug", "current": "003" },
  "saison": 1,
  "publishedAt": "2026-10-30T06:00:00.000Z",
  "titleNko": "<N'Ko de la rédaction, facultatif>",
  "titleFr": "Facultatif",
  "sommaire": [
    { "_type": "reference", "_key": "s1", "_ref": "article-nkl-003-edito", "_weak": true, "_strengthenOnPublish": { "type": "article" } }
  ],
  "edito": { "_type": "reference", "_ref": "article-nkl-003-edito", "_weak": true, "_strengthenOnPublish": { "type": "article" } },
  "aLaUne": { "_type": "reference", "_ref": "article-nkl-003-gs", "_weak": true, "_strengthenOnPublish": { "type": "article" } },
  "couverture": { "_type": "image", "asset": { "_type": "reference", "_ref": "image-…" }, "alt": "…", "altNko": "<rédaction, ou vide>", "captionNko": "<rédaction>", "caption": "…", "source": "NASA/SDO — domaine public" },
  "seoTitle": "Facultatif (≤ 60 caractères)",
  "excerpt": "Facultatif (≤ 200 caractères) ; s'il est vide, la page utilise le résumé de l'édito",
  "excerptFr": "Facultatif : résumé français des cartes de partage (≤ 160 caractères, sans N'Ko) ; vide : celui de l'édito"
}
```

- `numero` entier ≥ 1, **unique** ; `slug` = le numéro sur **3 chiffres** (3 → « 003 »), contrôlé.
- `publishedAt` obligatoire. `couverture` facultative mais conseillée (avertissement) ; si elle est là, `alt` obligatoire.
- `sommaire` : au moins un article, **dans l'ordre de la revue**, **sans doublon** ; chaque élément a un `_key`.
- `edito` et `aLaUne` (facultatifs) doivent **figurer dans le sommaire**.
- Le numéro pointe vers ses articles : **ne rien ajouter** dans les articles pour dire à quel numéro ils appartiennent.

## 5. Ce que vérifie `scripts/verifier-import.mts`

- `_id` en `drafts.` · NFC (normalisation **automatique contrôlée**, copie `.nfc.json`, mots listés avec leurs codes Unicode) · marques tapées deux fois (**signalées**, jamais corrigées) · champs obligatoires · `slug` · catégorie autorisée · types de blocs et d'encadrés autorisés (lus dans le schéma) · `titleNko` des rubriques · `alt` des images · paires N'Ko/français du lexique · termes reliés plusieurs fois · termes en double dans le fichier.
- **Rubriques** : titres obligatoires, N'Ko présent, `slug`, `ordre`, doublons dans le fichier. **Numéros** : numéro unique, lien « 003 » calculé, date, sommaire (non vide, sans doublon), édito et à la une dans le sommaire, couverture et son `alt`, longueurs SEO.
- **Avec `--export <sauvegarde.tar.gz>`** (la sauvegarde de l'étape 1, lue sans connexion) : chaque référence (auteur, terme, rubrique, article, image) **existe** et a le **bon type** ; une référence vers un document **seulement en brouillon** doit être **faible** (sinon erreur) ; un document qui **existe déjà** est signalé (l'import sera alors une **mise à jour** : remplacement ou modification, pas une création) ; un `slug` ou un numéro déjà pris par un autre document est une erreur.
- Sans `--export`, les références absentes du fichier sont seulement signalées (avertissement).
- **Code 0** = import possible. **Code 1** = corriger d'abord. S'il existe une copie `.nfc.json`, c'est **elle** qu'on importe.

## 6. Après l'import : rapport au propriétaire

Donner, **en français** : le nombre de brouillons créés (articles, termes), les avertissements restants (avec l'article et le champ concernés), les mots normalisés automatiquement (NFC), les doubles marques **à faire vérifier par la rédaction**, les **termes manquants** du lexique, la **liste des images avec leur source et leur licence** (à valider par le propriétaire), et le lien vers l'onglet **Presentation** pour la relecture.

## 7. Après la publication : images de partage des articles

Une image par article pour WhatsApp, Facebook et X : la couverture (sinon un fond au motif du site), le numéro, la catégorie, le titre N'Ko et le titre français, rendus par Chrome (lettres N'Ko liées). **Rien n'est écrit dans Sanity.**

1. Une fois les articles **et** le numéro publiés : `node scripts/images-partage/articles.mjs` (lit les articles publiés ; option `--slug <slug>` pour un seul article). Pour préparer les images **avant** la publication : `--export <sauvegarde.tar.gz>` (brouillons compris).
2. Regarder les images (`public/og/articles/`) : titre lisible, pas de texte coupé.
3. Les envoyer sur une **branche** (images + `app/lib/images-partage-articles.json`) → aperçu Vercel → **« fusionner »** du propriétaire.
4. Tant que ce n'est pas fait, le partage montre la couverture (solution de secours). Un titre, une catégorie, un numéro ou une couverture modifiés plus tard : relancer la commande (la nouvelle image a une nouvelle adresse).
