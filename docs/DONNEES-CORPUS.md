# Fiche du jeu de données — corpus N'Ko ↔ français (N'Ko ni Lonko)

> Jeu de données **privé**, pour le modèle de traduction (Lot 2). Méthode complète : `docs/PLAN-LOT-2.md` (« Modèle de traduction »).
> **Ne jamais** mettre le corpus sur GitHub (dépôt public), ni dans un carnet Colab partagé, ni sur un service tiers.

## 1. Origine

| Point | Détail |
|---|---|
| Source | Contenu **publié** de la revue (Sanity, projet `yfsyhc2p`) : articles, lexique, rubriques. Jamais les brouillons, jamais les abonnés |
| Auteurs | Textes humains de la rédaction, relus ; N'Ko en Unicode NFC |
| Outil | `node scripts/exporter-corpus.mts --sortie <dossier hors du projet>` (lecture seule ; refuse d'écrire dans le projet) |
| Rangement | `C:\Dev\archives\corpus\corpus-AAAA-MM-JJ\` puis une copie sur **Google Drive privé** pour Colab |
| Figé | Un export daté ne se modifie jamais : on en fait un nouveau |

## 2. Contenu d'un export

| Fichier | Contenu |
|---|---|
| `paires.jsonl` | Une paire par ligne : `nqo`, `fr`, `nature`, `source` (article ou terme), `partie`, `controle`, `raisons` |
| `lexique.jsonl` | Termes : N'Ko, français, définitions, domaine, `partie` |
| `fiche.json` | Date, source, nombres (paires par nature, par partie, contrôles), sections alignées ou entières, doublons retirés |

**Natures de paires** : `titre`, `paragraphe`, `section`, `encadre`, `titre-encadre`, `legende`, `description-image` (texte alternatif N'Ko / français des images, 24 octobre 2026), `intertitre`, `terme`, `definition`, `rubrique`.

## 3. Comment les paires sont faites

- Les articles sont écrits **par sections** : plusieurs paragraphes N'Ko, puis les mêmes en français.
- Si une section a **le même nombre** de paragraphes (et d'encadrés) dans les deux langues : paragraphe *n* ↔ paragraphe *n*.
- Sinon (cas le plus fréquent : la rédaction ne découpe pas les paragraphes de la même façon) : **la section entière** forme une paire (`nature = section`).
- Titres, légendes, intertitres, termes et définitions : appariés directement (champs N'Ko et français).

## 4. Contrôles

| Contrôle | Effet |
|---|---|
| NFC | Une paire non NFC est **écartée** (corriger dans Sanity, jamais dans le corpus) |
| Doublons | Retirés (deux articles publiés sont presque identiques) |
| Longueurs | Rapport français / N'Ko hors de 0,5 – 2,5 → `a-verifier` |
| Nombres | Nombres différents des deux côtés (chiffres N'Ko convertis) → `a-verifier` : signe probable d'un décalage |
| Langue | Côté N'Ko sans lettre N'Ko, ou côté français avec du N'Ko → `a-verifier` |

Une paire `a-verifier` est **gardée** (marquée), jamais supprimée : la rédaction peut la relire.

## 5. Découpage

Par **article** (pas par paire), avec une empreinte du slug : 80 % entraînement, 10 % validation, 10 % test. Le découpage est **stable** d'un export à l'autre : le test reste figé et ne sert jamais à l'entraînement.

## 6. Premier essai (19 octobre 2026, 9 articles publiés, avant le N°003)

171 paires (titres 7, légendes 26, paragraphes 80, encadrés 21, sections 37) ; 119 `ok`, 52 `a-verifier` ; 31 doublons retirés ; 0 texte non NFC ; 60 paires de plus de 1 024 octets côté N'Ko.

## 7. Limites connues et suites

- **Peu de données** (quelques centaines de paires) : assez pour spécialiser et mesurer un modèle, pas pour lui apprendre seul à traduire.
- **Sections longues** : ByT5 compte en octets (une lettre N'Ko = 2 octets). Prochaine étape : **alignement phrase à phrase** dans Colab (par exemple avec les représentations SONAR de Meta, qui connaissent `nqo_Nkoo`), résultat relu par la rédaction.
- Le lexique (termes et définitions) arrive avec le **N°003** (publication le 30 octobre 2026) : faire le premier vrai export **après** cette date.
- Données **synthétiques** (rétro-traduction) : toujours marquées comme telles ; jamais de N'Ko produit par une IA présenté comme référence.

## 8. Licence

**Privée**. Propriété de N'Ko ni Lonko et de ses auteurs. Aucune diffusion. Usage pour l'entraînement : prévu par la **politique d'usage de l'IA** et la **clause « IA » du pacte des auteurs** (Lot 2), à valider **avant** tout élargissement.
