# Plan du Lot 2 — N'Ko ni Lonko (après le 30 octobre 2026)

> **Ne pas commencer avant la publication du N°003** (règle du propriétaire). Même méthode qu'au Lot 1 : Synthèse → Audit → Stratégie → Génération → Validation, une branche par sujet, un changement par commit, aperçu Vercel, fusion après « fusionner ».

## Ordre recommandé

| # | Chantier | Pourquoi dans cet ordre |
|---|---|---|
| 1 | **Type « Numéro »** dans Sanity (numéro, titre N'Ko / français, date, couverture, édito, liste ordonnée des articles) + page `/numero/<n>` + « Dernier numéro » sur l'accueil + données structurées Google (`PublicationIssue`) | Structure la revue ; base de la lettre d'information et du PDF |
| 2 | **Corpus N'Ko – français pour le modèle ByT5** (export privé, daté) — méthode ci-dessous | Le N°003 publié enrichit les données ; aucun risque pour le site (script hors ligne) |
| 3 | **Images de partage des articles avec le titre N'Ko** : même méthode que `scripts/images-partage/generer.mjs` (rendu Chrome), fabriquées **au moment de l'import** et rangées dans un champ « image de partage » de l'article ; la photo de couverture reste la solution de secours. Supprimer alors `app/article/[slug]/opengraph-image.tsx` (ancien générateur `next/og`, N'Ko non lié, erreur `fit-content`) | Le partage des articles du N°003 sur WhatsApp |
| 4 | **Lettre d'information** : envoi de chaque numéro aux abonnés (Resend), modèle N'Ko puis français ; double confirmation et désinscription déjà en place | Fidéliser les lecteurs |
| 5 | **PDF du numéro** : page d'impression + rendu par Chrome (N'Ko lié, comme les images de partage) | Archivage, diffusion hors ligne |
| 6 | **Politique d'usage de l'IA** (page publique) + **clause « IA » dans le pacte des auteurs** (droits d'entraînement du modèle) | À faire **avant** d'élargir l'usage du corpus |
| 7 | Le reste de la liste (`CLAUDE.md` § 9) : audio des termes, « voir aussi », terme du jour, conversion des anciens encadrés « Définition », édition visuelle cliquable (stega), application hors ligne (Serwist incompatible avec Turbopack), faille `basic-ftp` (outil d'import Sanity), option `isHighlighted` obsolète, choix manuel de la « langue du paragraphe » | Améliorations |
| 8 | Petites tâches : passer `COMPTE_X` à `@nkonilonko` dans `app/lib/partage.ts` le jour où le compte existe ; supprimer les fichiers inutilisés `public/og-accueil.jpg` et `public/icon.svg` | Ménage |

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
