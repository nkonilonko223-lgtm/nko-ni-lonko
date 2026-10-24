# Textes N'Ko à demander à la rédaction — LISTE UNIQUE (mise à jour le 24 octobre 2026)

> **Ce fichier est la seule liste à jour** de tous les textes N'Ko qui manquent sur le site (19 – 23 octobre 2026). Adresse pour Cowork : `docs/TEXTES-NKO-A-DEMANDER.md` du dépôt GitHub `nkonilonko223-lgtm/nko-ni-lonko`, branche `main`.
>
> Règle : **aucun N'Ko n'est écrit par une IA**. Tant qu'un texte manque, son emplacement reste **vide** et seul le français s'affiche (ou rien : voir L11).
> Quand la rédaction fournit un texte : le copier **sans modification**, par programme, à l'endroit indiqué, puis vérifier le NFC.
>
> **Comment rendre les traductions** : un seul fichier texte (ex. `textes-nko-L1-L20.txt`), une ligne par texte, **commençant par son numéro** (`L1 : …`, `L15 c : …`). Pour une ligne qui contient plusieurs textes (L6, L7, L14, L15), une ligne par texte, dans l'ordre du tableau (`L15 a`, `L15 b`…). Le fichier est remis au propriétaire, qui le donne à Claude Code : chaque texte est copié par programme, tel quel.
>
> **État au 23 octobre 2026 (soir)** — fichier reçu : `NKO/Revue/Site/textes-nko-L1-L20.txt` (43 textes validés par MckV) :
> - **L1 à L8 et L10 à L16 : fournis et intégrés** (39 textes, branche `textes/nko-l1-l16`), copiés par programme, contrôlés identiques au fichier caractère par caractère et en NFC. L14 b, L15 a et L16 sont le même texte (« Ma bibliothèque »), utilisé à trois endroits.
> - **L17 à L20 : fournis et intégrés** (branche `feat/disciplines-13`, 23 octobre 2026, accord du propriétaire) : liste du Studio, dictionnaire du site, table des disciplines ; copiés par programme, contrôlés identiques et en NFC.
> - **L9 : à fournir** (son texte français n'est pas encore validé).
> - **État au 24 octobre 2026** — fichier reçu : `NKO/Revue/Site/textes-nko-L21-L37.txt` (19 textes validés par MckV) :
>   - **L21 à L34 : fournis et intégrés** (16 textes, dont L24 a, b, c) dans `app/components/application/textes.ts` : **application du site** (installation sur le téléphone, guide iPhone, « Télécharger le numéro », lecture sans connexion).
>   - **L35 à L37 : fournis et intégrés** dans `app/components/ArticleTools.tsx` (`AMBIANCE`) : bouton **« Ambiance »** des articles (design « Nuit du Mandé »).
>   - `textes-nko-L1-L20.txt` **mis à jour** (décision de MckV : « sauvegarder » prend sa forme courte) : **L6 p, L14 a, L15 b, L15 c** recopiés entiers (5 occurrences du mot, 4 lignes).
>   - Tous copiés par programme ; contrôle : les 62 textes des deux fichiers sont dans le code à l'identique, en NFC. Mis en ligne le 24 octobre 2026 (accord du propriétaire).

| # | Français | Où il s'affiche | Fichier et emplacement |
|---|---|---|---|
| L1 | À lire aussi | Fin de chaque article (articles proches) | `app/components/VoirAussi.tsx` → `A_LIRE_AUSSI.nko` |
| L2 | Terme du jour | Haut du dictionnaire `/lexique` | `app/components/lexique/TermeDuJour.tsx` → `TERME_DU_JOUR.nko` |
| L3 | Télécharger le PDF | Page d'un numéro (lien vers le PDF) | `app/components/numero/VueNumero.tsx` → `TELECHARGER_PDF.nko` |
| L4 | Lire le numéro en ligne | Lettre d'information (bouton principal) | `scripts/lettre/envoyer.mts` → `LIRE_NUMERO.nko` |
| L5 | Vous recevez cette lettre parce que vous êtes abonné(e) à N'Ko ni Lonko. | Lettre d'information (bas de page) | `scripts/lettre/envoyer.mts` → `POURQUOI.nko` |
| L6 | Intelligence artificielle (titre « 10. Intelligence artificielle », « En clair », 8 paragraphes) | Conditions d'utilisation, partie 10 | `app/[lang]/terms/TermsClient.tsx` → clause `intelligence-artificielle` (champs `titleNko`, `tldrNko`, `textNko`) |
| L7 | Intelligence artificielle · « Vos données ne servent jamais à entraîner une intelligence artificielle. » · « Notre usage de l'IA (Conditions d'utilisation, partie 10) » | Confidentialité (bas de page) | `app/[lang]/privacy/PrivacyClient.tsx` → bloc `intelligence-artificielle` |
| L8 | Dernière mise à jour : octobre 2026 | En-tête des Conditions (la date N'Ko actuelle dit « février 2026 » : à changer avec le français, en même temps) | `app/[lang]/terms/TermsClient.tsx` (en-tête) |
| L9 | Clause « Intelligence artificielle » du pacte des auteurs | Pacte des auteurs | `docs/PACTE-AUTEURS-CLAUSE-IA.md` (après validation du texte français) |
| L10 | Reprendre la lecture | Article : bouton proposé au retour du lecteur | `app/components/ArticleClient.tsx` → `REPRENDRE.nko` |
| L11 | Langue de lecture | Article : nom affiché au-dessus du choix « N'Ko + FR / N'Ko / FR » (depuis le 23 octobre) | `app/components/ArticleClient.tsx` → `LANGUE_LECTURE.nko` |
| L12 | Signaler une erreur | Article : bouton de la barre d'outils | `app/components/ArticleTools.tsx` → `SIGNALER.nko` |
| L13 | Partager en image | Article (barre de sélection) et fiche d'un terme du lexique | `app/components/texte/imageCitation.ts` → `PARTAGER_IMAGE.nko` (un seul endroit pour les deux) |
| L14 | Sauvegardé · Ma bibliothèque | Article : message après le signet | `app/components/ArticleTools.tsx` → `SAUVEGARDE.nko`, `MA_BIBLIOTHEQUE.nko` |
| L15 | Ma bibliothèque · « Les articles sauvegardés avec le signet restent sur cet appareil. Rien n'est envoyé. » · « Aucun article sauvegardé pour l'instant. Touchez le signet d'un article pour le retrouver ici. » · Retirer de ma bibliothèque · Lisible sans connexion | Page `/bibliotheque` | `app/components/bibliotheque/MaBibliotheque.tsx` → `TEXTES` (titre, explication, vide, retirer, horsLigne) |
| L16 | Ma bibliothèque | Menu du pied de page de l'accueil | `app/components/SiteFooter.tsx` (lien `/bibliotheque`, aujourd'hui en français, `lang="fr"`) |
| L17 | Environnement et Climat | Nouvelle discipline (décision du 23 octobre) : Studio, filtre de l'accueil, étiquette et page de la discipline | `sanity/schemas/article.ts` (liste `category`), `app/messages/nko.json` → `home.categories`, `app/lib` (table des catégories) — **après le 30 octobre** |
| L18 | Agronomie | Nouvelle discipline (même endroits que L17) | idem L17 |
| L19 | Langues et Écritures (le N'Ko et les langues mandingues) | Nouvelle discipline (même endroits que L17) | idem L17 |
| L20 | Paléontologie et Archéologie | Nouvelle discipline (même endroits que L17) | idem L17 |
| L21 | Lisez la revue en plein écran, même sans connexion. | Proposition d'installer l'application (bas de l'écran, à partir du 2ᵉ article lu ; jamais à la première visite) | `app/components/application/textes.ts` → `INSTALLER_POURQUOI` |
| L22 | Plus tard | Même endroit (bouton pour refuser ; la proposition revient au plus tôt 2 mois après) | `textes.ts` → `PLUS_TARD` |
| L23 | Ajouter N'Ko ni Lonko à l'écran d'accueil | Guide iPhone et iPad (titre). L'iPhone n'a pas de bouton « Installer » : le guide montre les gestes | `textes.ts` → `GUIDE_TITRE` |
| L24 | 1. Touchez « Partager » (si vous ne le voyez pas : d'abord « ⋯ ») · 2. Choisissez « Sur l'écran d'accueil » · 3. Touchez « Ajouter » | Guide iPhone et iPad (3 étapes). Les mots entre « » sont ceux de l'iPhone en français : à garder tels quels ou à expliquer | `textes.ts` → `GUIDE_ETAPES` (a, b, c) |
| L25 | Télécharger le numéro | Page d'un numéro (bouton) | `textes.ts` → `TELECHARGER_NUMERO` |
| L26 | Tous ses articles et leurs images, lisibles sans connexion. | Page d'un numéro (sous le bouton) | `textes.ts` → `TELECHARGER_POURQUOI` |
| L27 | Téléchargement… | Pendant le téléchargement (suivi du nombre d'articles, ex. « 3 / 8 ») | `textes.ts` → `TELECHARGEMENT` |
| L28 | Disponible sans connexion | Après le téléchargement | `textes.ts` → `DISPONIBLE` |
| L29 | Retirer de l'appareil | Après le téléchargement (bouton : libère la place sur le téléphone) | `textes.ts` → `RETIRER` |
| L30 | Reprendre le téléchargement | Si le téléchargement a été interrompu | `textes.ts` → `REPRENDRE` |
| L31 | Pas de connexion : réessayez plus tard. | Si le téléchargement échoue | `textes.ts` → `ERREUR_CONNEXION` |
| L32 | Disponible sur cet appareil | Page « pas de connexion » (titre de la liste de ce qu'on peut lire) | `textes.ts` → `DISPONIBLE_APPAREIL` |
| L33 | Numéros téléchargés | Page « pas de connexion » | `textes.ts` → `NUMEROS_TELECHARGES` |
| L34 | Pages lues récemment | Page « pas de connexion » | `textes.ts` → `PAGES_RECENTES` |
| L35 | Ambiance : Nuit | Article : bouton « ambiance de lecture » de la barre d'outils (couleurs de la page : nuit, papier crème, jour) — nouveau design, novembre 2026 | `app/components/ArticleTools.tsx` → `AMBIANCE.nuit.nko` |
| L36 | Ambiance : Papier | Même bouton (l'ambiance « papier » : fond crème, encre brune) | `ArticleTools.tsx` → `AMBIANCE.papier.nko` |
| L37 | Ambiance : Jour | Même bouton (l'ambiance « jour » : fond blanc cassé, pour le plein soleil) | `ArticleTools.tsx` → `AMBIANCE.jour.nko` |

**Pour L21 à L34** : déjà fournis et **réutilisés tels quels** (rien à traduire) : « Installer l'application », « Installer » (bouton de l'accueil), « Fermer », « Lexique », « Numéros », « Ma bibliothèque ». Les nombres (« 3 / 8 ») sont écrits en chiffres N'Ko par le code. Plus tard (étape 4 de l'application, notifications) : d'autres textes seront demandés à part.

**Important pour L17 à L20** : le nom N'Ko d'une discipline est **aussi la valeur enregistrée dans Sanity** pour chaque article. Il doit donc être **définitif** : le changer plus tard obligerait à modifier tous les articles de cette discipline.

Déjà fournis et réutilisés tels quels : « Sommaire », « Édito », « À la une », « Lire l'article », « Saison », le numéro (fabriqué par numeroNko, règle de la rédaction), « Voir dans le lexique », « Se désabonner », le nom du site, « Retour » (pages Conditions, Confidentialité…, repris pour le bouton Retour des pages numéros, auteurs, bibliothèque), « Accueil », « Articles », « Numéros » (dictionnaire du site), « Citer cet article », « en ligne » (ancienne citation N'Ko, reprise dans la citation N'Ko de « Citer »).

## À vérifier par la rédaction (constats du 20 octobre 2026, rien n'a été modifié)

1. **Marque doublée** dans le texte de l'article publié « Le géant à crête du Niger » (deux marques de ton sur une même lettre). Le correcteur N'Ko du Studio l'affiche en avertissement depuis la fusion du Lot 2 (22 octobre).
2. **Nom N'Ko du fondateur écrit de deux façons** : la fiche auteur de Sanity (affichée sur la page auteur et sous chaque article) et les données Google du site (`app/[lang]/layout.tsx`, `app/[lang]/article/[slug]/page.tsx` et `app/[lang]/about/page.tsx`, « founder ») n'ont pas la même orthographe du nom de famille (place de la lettre « m » et de la marque de ton). Laquelle est la bonne ? La bonne sera recopiée aux autres endroits.
3. **Structure des titres** dans les longs articles : sous le titre de l'article, les intertitres commencent au niveau 4 (le niveau 2 est sauté). Pour les lecteurs d'écran et Google, il vaut mieux commencer les intertitres au niveau 2 (« H2 ») dans le Studio.

## Autres contenus à fournir (dans le Studio, pas dans le code) — 23 octobre 2026

1. **Résumé N'Ko** (champ « Résumé ») différent du titre, pour 3 articles publiés : leur carte de partage N'Ko n'a que le titre. `l-humanite-retourne-vers-la-lune`, `un-evenement-sans-precedent-sur-l-iss`, `tempete-solaire-historique`.
2. **Résumé français** (champ « Résumé français », en français, pas une traduction à faire par l'IA) : vide pour tous les articles ; en priorité `bienvenue-sur-n-ko-ni-lonko`, `l-humanite-retourne-vers-la-lune`, `grand-retour-vers-la-lune`, `james-webb-devoile-les-secrets-des-trous-noirs`, `tempete-solaire-historique` (leur carte française a aujourd'hui la phrase par défaut). Pour le N°003 (déjà entièrement dans Sanity, en brouillon) : à vérifier avant la publication du 30 octobre.
3. **Après le 30 octobre** (décision du propriétaire du 23 octobre : 13 disciplines) : reclasser les 3 articles « Revue Mensuelle » — « Le géant à crête du Niger » → Paléontologie et Archéologie ; « Grand retour vers la Lune » → Astronomie ; « Bienvenue sur N'Ko ni Lonko » → rubrique Édito, sans discipline. Puis « Revue Mensuelle » quitte la liste des disciplines. Écriture dans Sanity : sauvegarde puis accord écrit du propriétaire.
