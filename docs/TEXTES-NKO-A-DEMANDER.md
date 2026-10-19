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

Déjà fournis et réutilisés tels quels : « Sommaire », « Édito », « À la une », « Lire l'article », « Saison », le numéro (fabriqué par numeroNko, règle de la rédaction), « Voir dans le lexique », « Se désabonner », le nom du site.
