# Textes N'Ko à demander à la rédaction (Lot 2, 19 octobre 2026)

> Règle : **aucun N'Ko n'est écrit par une IA**. Tant qu'un texte manque, son emplacement reste **vide** et seul le français s'affiche.
> Quand la rédaction fournit un texte : le copier **sans modification**, par programme, à l'endroit indiqué, puis vérifier le NFC.

| # | Français | Où il s'affiche | Fichier et emplacement |
|---|---|---|---|
| L1 | À lire aussi | Fin de chaque article (articles proches) | `app/components/VoirAussi.tsx` → `A_LIRE_AUSSI.nko` |
| L2 | Terme du jour | Haut du dictionnaire `/lexique` | `app/components/lexique/TermeDuJour.tsx` → `TERME_DU_JOUR.nko` |
| L3 | Télécharger le PDF | Page d'un numéro (lien vers le PDF) | `app/components/numero/VueNumero.tsx` → `TELECHARGER_PDF.nko` |
| L4 | Lire le numéro en ligne | Lettre d'information (bouton principal) | `scripts/lettre/envoyer.mts` → `LIRE_NUMERO.nko` |
| L5 | Vous recevez cette lettre parce que vous êtes abonné(e) à N'Ko ni Lonko. | Lettre d'information (bas de page) | `scripts/lettre/envoyer.mts` → `POURQUOI.nko` |
| L6 | Intelligence artificielle (titre « 10. Intelligence artificielle », « En clair », 8 paragraphes) | Conditions d'utilisation, partie 10 | `app/terms/TermsClient.tsx` → clause `intelligence-artificielle` (champs `titleNko`, `tldrNko`, `textNko`) |
| L7 | Intelligence artificielle · « Vos données ne servent jamais à entraîner une intelligence artificielle. » · « Notre usage de l'IA (Conditions d'utilisation, partie 10) » | Confidentialité (bas de page) | `app/privacy/PrivacyClient.tsx` → bloc `intelligence-artificielle` |
| L8 | Dernière mise à jour : octobre 2026 | En-tête des Conditions (la date N'Ko actuelle dit « février 2026 » : à changer avec le français, en même temps) | `app/terms/TermsClient.tsx` (en-tête) |
| L9 | Clause « Intelligence artificielle » du pacte des auteurs | Pacte des auteurs | `docs/PACTE-AUTEURS-CLAUSE-IA.md` (après validation du texte français) |
| L10 | Reprendre la lecture | Article : bouton proposé au retour du lecteur | `app/components/ArticleClient.tsx` → `REPRENDRE.nko` |
| L11 | Langue de lecture | Article : nom (lecteurs d'écran) du choix « N'Ko + FR / N'Ko / FR » | `app/components/ArticleClient.tsx` → `LANGUE_LECTURE.nko` |
| L12 | Signaler une erreur | Article : bouton de la barre d'outils | `app/components/ArticleTools.tsx` → `SIGNALER.nko` |
| L13 | Partager en image | Article (barre de sélection) et fiche d'un terme du lexique | `app/components/texte/imageCitation.ts` → `PARTAGER_IMAGE.nko` (un seul endroit pour les deux) |
| L14 | Sauvegardé · Ma bibliothèque | Article : message après le signet | `app/components/ArticleTools.tsx` → `SAUVEGARDE.nko`, `MA_BIBLIOTHEQUE.nko` |
| L15 | Ma bibliothèque · « Les articles sauvegardés avec le signet restent sur cet appareil. Rien n'est envoyé. » · « Aucun article sauvegardé pour l'instant. Touchez le signet d'un article pour le retrouver ici. » · Retirer de ma bibliothèque · Lisible sans connexion | Page `/bibliotheque` | `app/components/bibliotheque/MaBibliotheque.tsx` → `TEXTES` (titre, explication, vide, retirer, horsLigne) |
| L16 | Ma bibliothèque | Menu du pied de page de l'accueil | `app/components/SiteFooter.tsx` (lien `/bibliotheque`, aujourd'hui en français, `lang="fr"`) |

Déjà fournis et réutilisés tels quels : « Sommaire », « Édito », « À la une », « Lire l'article », « Saison », le numéro (fabriqué par numeroNko, règle de la rédaction), « Voir dans le lexique », « Se désabonner », le nom du site, « Retour » (pages Conditions, Confidentialité…, repris pour le bouton Retour des pages numéros, auteurs, bibliothèque), « Accueil », « Articles », « Numéros » (dictionnaire du site), « Citer cet article », « en ligne » (ancienne citation N'Ko, reprise dans la citation N'Ko de « Citer »).

## À vérifier par la rédaction (constats du 20 octobre 2026, rien n'a été modifié)

1. **Marque doublée** dans le texte de l'article publié « Le géant à crête du Niger » (deux marques de ton sur une même lettre). Le correcteur N'Ko du Studio l'affichera en avertissement après la fusion du Lot 2.
2. **Nom N'Ko du fondateur écrit de deux façons** : la fiche auteur de Sanity (affichée sur la page auteur et sous chaque article) et les données Google du site (`app/layout.tsx`, `app/article/[slug]/page.tsx` et `app/about/page.tsx`, « founder ») n'ont pas la même orthographe du nom de famille (place de la lettre « m » et de la marque de ton). Laquelle est la bonne ? La bonne sera recopiée aux autres endroits.
3. **Structure des titres** dans les longs articles : sous le titre de l'article, les intertitres commencent au niveau 4 (le niveau 2 est sauté). Pour les lecteurs d'écran et Google, il vaut mieux commencer les intertitres au niveau 2 (« H2 ») dans le Studio.
