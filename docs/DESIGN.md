# Design du site — palette « Nuit du Mandé », ambiances de lecture, police Literata

> Branche `lot2/design-nuit-du-mande` (24 octobre 2026), feu vert du propriétaire pour les 4 points :
> palette du site, ambiances de lecture, police de lecture, correction du lexique (branche à part).
> Mise en ligne prévue **début novembre**, après l'application (31 octobre). À lire avant de toucher
> une couleur.

## 1. La palette « Nuit du Mandé »

Un **bleu nuit chaud** au lieu du noir, un **texte ivoire** au lieu du blanc pur (moins de fatigue
en lecture longue), l'**or** un peu adouci. Contrastes mesurés (règle WCAG, 4,5:1 minimum) :

| Rôle | Couleur | Contraste sur le fond |
|---|---|---|
| Fond (`void`) | `#0e1322` | — |
| Panneaux (`surface`) | `#151c30` | — |
| Texte (`white`) | `#ebe5d8` | 14,7:1 |
| Texte secondaire (`gray-400`) | `#b9b2a4` | 8,8:1 |
| Mentions discrètes (`gray-500`) | `#9a9488` | 6,1:1 |
| Or des textes et filets (`or`) | `#f2b544` | 10,1:1 |
| Boutons pleins (inchangés) | `#fbbf24`, texte noir | 11,5:1 |

Avant : fond `#02040a` (presque noir) et texte `#ffffff`.

## 2. Où sont les couleurs (une seule source)

- **`app/globals.css`**, haut du fichier : chaque couleur est une variable en trois nombres
  (`--rgb-void: 14 19 34;`). C'est le **seul endroit** où changer une couleur du site.
- **`tailwind.config.ts`** : les noms de couleurs des classes renvoient à ces variables (`jeton`).
- **Attention** : dans ce site, **`white` = la couleur du TEXTE** (ivoire la nuit, encre sur le papier),
  et `gray-200` à `gray-500` sont ses nuances. Pour un **vrai blanc** (impression, survol d'un bouton
  doré, texte sur une couverture) : **`blanc`**.
- Noms à utiliser dans le code : `bg-void` (fond), `bg-surface` (panneau), `text-or` / `border-or/30`
  (or qui suit l'ambiance), `bg-[#fbbf24]` (bouton doré plein, avec `text-black`).
- Ne plus écrire `#02040a`, `#0b1121` ni `text-[#fbbf24]` : utiliser `void`, `surface`, `or`.

## 3. Les ambiances de lecture (articles seulement)

Bouton **« Ambiance »** dans la barre d'outils de l'article : **Nuit → Papier → Jour**.

| Ambiance | Fond | Texte | Or | Pour qui |
|---|---|---|---|---|
| Nuit | `#0e1322` | `#ebe5d8` | `#f2b544` | le site, le soir |
| Papier | `#f4ecda` (crème) | `#2a2119` (encre brune), 13,4:1 | `#8a5210`, 5,4:1 | lecture longue |
| Jour | `#fbfaf7` (blanc cassé) | `#23242a`, 14,8:1 | `#94590c`, 5,5:1 | plein soleil |

- Choix gardé dans le navigateur du lecteur (`nko_ambiance`), rien n'est envoyé. Sans choix : celle de
  son téléphone (téléphone en mode clair → Jour).
- Code : `app/lib/ambiance.ts` (choix, petit script posé **avant l'affichage** par la page article :
  pas de changement de couleur sous les yeux), `app/components/ArticleTools.tsx` (bouton ; pose
  l'ambiance en arrivant par un lien interne, la **retire en quittant l'article** : les autres pages
  restent en Nuit), `app/globals.css` (`html[data-ambiance="papier"]`, `…="jour"`).
- Les ambiances ne changent **que les variables** : tout ce qui utilise `white`, `gray-…`, `or`, `void`,
  `surface`, et les couleurs du lexique et des encadrés (`blue-…`, `emerald-300`…) suit tout seul.
- **Îlot toujours sombre** (visionneuses d'images) : classe **`ambiance-nuit`** sur le conteneur.
- **Impression** : encre noire sur blanc, quelle que soit l'ambiance (bloc `@media print` des variables).
- Libellés N'Ko du bouton : **L35 à L37**, à demander (`docs/TEXTES-NKO-A-DEMANDER.md`).

## 4. Police de lecture : Literata

- Le **texte français** des articles (paragraphes, listes, citations, légendes) est en **Literata**,
  police à empattements dessinée pour la lecture longue sur écran (licence libre OFL). Titres,
  encadrés et interface gardent **Montserrat** ; le **N'Ko garde Kigelia**.
- `app/fonts/lecture.ts` : téléchargée par Next.js à la construction et **servie par le site** (aucun
  appel à Google chez le lecteur) ; chargée **seulement** sur les articles et le PDF d'un numéro ;
  pas de préchargement (l'image de couverture passe d'abord).
- **N'Ko d'abord** : dans un article, le paragraphe N'Ko prend l'encre pleine, le français (sa
  traduction) une encre à peine plus douce.

## 5. Vérifier soi-même

1. Ouvrir un article, toucher **⋮** (téléphone) puis **« Ambiance »** : la page passe en Papier, puis Jour,
   puis Nuit. Recharger la page : l'ambiance choisie reste.
2. Revenir à l'accueil : il reste en Nuit (bleu nuit).
3. Imprimer un article (ordinateur) : noir sur blanc, quelle que soit l'ambiance.
4. Contrôles automatiques : `node scripts/tester-impression.mjs`, `node scripts/tester-langues.mjs`,
   `node scripts/tester-application.mjs`, `node scripts/tester-hors-ligne.mjs`.

## 6. Reste à décider (propositions)

- Images de partage (`public/og/`, `scripts/images-partage/`) : encore sur l'ancien fond `#02040a`.
  Les passer au bleu nuit demande de toutes les refaire (changer `VERSION`) : à décider.
