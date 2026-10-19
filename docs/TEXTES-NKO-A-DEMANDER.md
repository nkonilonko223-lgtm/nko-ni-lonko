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
| L6 | Usage de l'IA | Lien du pied de page | `app/messages/nko.json` → clé `footer.ia` (à ajouter) |
| L7 | Usage de l'intelligence artificielle | Titre de la page `/ia` | `app/ia/page.tsx` → `TITRE.nko` |
| L8 | Texte complet de la page `/ia` (7 paragraphes) | Page `/ia` | `app/ia/page.tsx` (version N'Ko de chaque section, après validation du texte français par le propriétaire) |
| L9 | Clause « Intelligence artificielle » du pacte des auteurs | Pacte des auteurs | `docs/PACTE-AUTEURS-CLAUSE-IA.md` (après validation du texte français) |

Déjà fournis et réutilisés tels quels : « Sommaire », « Édito », « À la une », « Lire l'article », « Saison », le numéro (`ߝߕ°…߲`), « Voir dans le lexique », « Se désabonner », le nom du site.
