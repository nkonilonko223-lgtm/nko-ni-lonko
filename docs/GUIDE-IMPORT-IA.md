# Guide d'import par une IA — N'Ko ni Lonko

> Pour toute IA (Claude ou autre) chargée de **saisir un numéro** dans Sanity.
> Circuit : **la rédaction écrit et traduit → l'IA saisit (brouillons) → le propriétaire relit dans l'aperçu → le propriétaire publie.**
> Lire aussi `CLAUDE.md` (règles absolues).

---

## 1. Les 7 étapes, dans l'ordre

| N° | Étape | Qui | Commande / outil |
|---|---|---|---|
| 1 | **Export complet** du dataset (sauvegarde) | IA, avec accord écrit | `node node_modules/sanity/bin/sanity dataset export production "C:/Dev/archives/exports/avant-import-<numero>.tar.gz"` |
| 2 | Préparer le **fichier d'import** (JSON, tableau de documents) | IA | voir § 3 et § 4 |
| 3 | **Vérification à blanc** du fichier (n'écrit rien) | IA | `node scripts/verifier-import.mts <fichier.json>` → **0 erreur** obligatoire |
| 4 | Créer les documents **en brouillon uniquement** (`_id` = `drafts.…`) | IA, avec accord écrit | outil MCP Sanity `create_documents`, ou `sanity documents create` |
| 5 | **Validation officielle** de tous les documents | IA | `node node_modules/sanity/bin/sanity documents validate --yes --level warning` |
| 6 | **Relecture dans l'aperçu** (Studio → Presentation) | propriétaire | sur le vrai site, en N'Ko et en français, ordinateur et téléphone |
| 7 | **Publication** (termes du lexique **d'abord**, puis articles) | **propriétaire seulement** | Studio → Publier |

**L'IA ne publie jamais, ne supprime jamais, ne modifie jamais un document déjà publié.**

## 2. Règles sur le N'Ko (règle 6 — non négociable)

- Le N'Ko est **copié tel quel** depuis la rédaction. L'IA **n'écrit, ne traduit, ne corrige** aucun texte N'Ko.
- Tout texte doit être en **Unicode NFC**. Si un texte N'Ko **n'est pas NFC** (cas fréquent : marque de **ton** tapée **avant** la marque de **nasalisation** ߲), le script le **signale** : **ne pas corriger soi-même**, renvoyer à la rédaction (ou demander l'accord écrit du propriétaire pour une normalisation).
- Signaler aussi les **doubles marques** (ex. ߲ tapé deux fois).

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

### Le corps (`body`) — types de blocs autorisés

| Bloc | Utilisation | Champs |
|---|---|---|
| `block` (paragraphe) | texte ; un paragraphe = **une seule langue** (N'Ko **ou** français) | `style` : `normal`, `h1`…`h6`, `blockquote` |
| `callout` (encadré) | `intent` : `success` = **Définition** · `amazing` = **Le saviez-vous ?** · `question` = **Question** · `info` = Information · `warning` = Attention | `text` |
| `sectionHeader` (titre de rubrique) | début de rubrique | `titleNko` (obligatoire), `titleFr` |
| `image` | illustration | `alt` (conseillé), `captionNko`, `caption`, `source` |

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
3. La référence pointe vers l'`_id` **publié** du terme (sans `drafts.`). Sanity refusera de publier l'article tant que le terme n'est pas publié : **publier les termes d'abord**.
4. Les anciens encadrés « Définition » (`callout` `success`) restent possibles, mais pour un **nouveau** numéro, préférer le **lexique**.

## 5. Ce que vérifie `scripts/verifier-import.mts`

- `_id` en `drafts.` · NFC (signalé avec les codes Unicode, **jamais corrigé**) · champs obligatoires · `slug` · catégorie autorisée · types de blocs et d'encadrés autorisés (lus dans le schéma) · `titleNko` des rubriques · `alt` des images · paires N'Ko/français du lexique · termes reliés plusieurs fois · termes en double dans le fichier.
- **Code 0** = import possible. **Code 1** = corriger d'abord.

## 6. Après l'import : rapport au propriétaire

Donner, **en français** : le nombre de brouillons créés (articles, termes), les avertissements restants (avec l'article et le champ concernés), les textes N'Ko signalés (non NFC, doubles marques) **à faire vérifier par la rédaction**, et le lien vers l'onglet **Presentation** pour la relecture.
