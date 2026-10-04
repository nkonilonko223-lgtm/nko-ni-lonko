# État technique — N'Ko ni Lonko (4 octobre 2026)

> Note d'une page pour la **session de rédaction**. Ce que le site sait faire, comment s'en servir, ce qu'il faut surveiller pour le **N°003** (publication le **30 octobre**).

## 1. Sécurité et fiabilité (fait cette semaine)
- Site à jour : **Next.js 16.3.8** (30 failles corrigées, dont une critique).
- **Abonnés protégés** : leurs fiches ne sont plus lisibles par le public. **Désinscription** en un clic (lien dans chaque e-mail, N'Ko + français).
- Aucun secret exposé ; clés aux droits minimaux ; nettoyage automatique vérifié.
- L'inscription continue même si le service anti-robots Upstash tombe.

## 2. Ce que la rédaction peut faire dans le Studio (www.nkonilonko.com/studio)
| Outil | Usage |
|---|---|
| **Presentation** (onglet en haut) | Voir un **brouillon sur le vrai site** avant de publier (bouton « Quitter » pour revenir à la vue publique) |
| **Lexique** (ߞߎߡߊߘߋ߲߫ ߛߙߍߘߍ) | Créer un terme **une fois** (N'Ko + français + définitions + domaine), puis le relier dans le texte avec le bouton **📖** (menu « ⋯ » si l'éditeur est étroit) |
| **Encadrés** | Définition · Le saviez-vous ? · Question · Information · Attention |
| **Contrôles automatiques** | En **rouge** (bloque la publication) : titre, résumé, date, lien manquants. En **orange** (avertit) : texte N'Ko non NFC, terme relié dans une seule langue ou plusieurs fois, terme en double |

## 3. Le lecteur voit
- Les **termes soulignés en pointillé bleu** : un toucher ouvre la définition (fiche en bas de l'écran sur téléphone, bulle sur ordinateur), dans la langue du paragraphe.
- Un **lexique en fin d'article** et un **dictionnaire public** (`/lexique`) : recherche (sans tons ni accents), ordre alphabétique N'Ko, « Citer ce terme ». La liste des articles qui utilisent un terme reste **privée** (Studio seulement).
- L'**accueil se met à jour en quelques secondes** après chaque publication.

## 4. Règles à respecter pour le N°003
1. **Texte N'Ko en NFC.** Constat du 4 octobre : **87 groupes de lettres dans 10 articles** ont la marque de **ton tapée avant** la nasalisation ߲ (invisible à l'écran mais gênant pour la recherche et Google) et **6 doubles** ߲. Vérifier la méthode de saisie (clavier) ; le Studio signale ces cas en orange.
2. **Un paragraphe = une seule langue** (N'Ko **ou** français).
3. Chaque terme du lexique est relié **en N'Ko ET en français**, seulement à sa **1re apparition**.
4. **Publier les termes du lexique avant les articles** qui les utilisent.
5. Saisie par une IA : **brouillons uniquement**, puis relecture dans **Presentation**, puis publication par le propriétaire (voir `docs/GUIDE-IMPORT-IA.md`).

## 5. Calendrier
- **Jusqu'au 17 octobre** : derniers réglages techniques.
- **18 – 30 octobre** : **gel** (corrections seulement, aucune nouveauté).
- **25 – 28 octobre** : import du N°003 (brouillons) et relecture.
- **30 octobre** : publication.
- **Après** : type « Numéro », images de partage en N'Ko, lettre d'information, PDF du numéro, prononciation audio des termes.
