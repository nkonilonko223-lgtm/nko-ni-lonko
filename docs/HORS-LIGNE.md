# Lecture hors ligne (Lot 2)

> Pour le propriétaire et toute autre IA. Fichier technique : `public/sw.js` (« service worker »,
> écrit à la main, sans dépendance). Installé par `app/components/LectureHorsLigne.tsx`, en
> production seulement, après le chargement complet de la page.

## Ce que voit le lecteur

- Une page déjà lue s'ouvre **sans connexion** (la dernière version lue).
- Un article mis dans **« Ma bibliothèque »** (le signet) est gardé à part, sans limite, avec
  ses images : il reste lisible sans connexion, et la carte affiche « Lisible sans connexion ».
- Un **numéro téléchargé** (bouton de la page du numéro) se lit entièrement sans connexion.
- Une page jamais lue, sans connexion : la page `/offline` (« pas de connexion »), dans la langue
  du lecteur, avec la liste de ce qui est disponible sur l'appareil.
- Connecté, le lecteur voit **toujours la version en ligne** (le réseau passe d'abord).

## Règles

| Quoi | Règle |
|---|---|
| Pages | Réseau d'abord ; la copie ne sert que sans connexion ; 60 pages au plus (+ la bibliothèque) |
| « Ma bibliothèque » | Copie gardée **avec ses images** quand on met le signet, oubliée (images comprises) quand on l'enlève (N'Ko `/article/…` et français `/fr/article/…`) |
| Numéros téléchargés | « Télécharger le numéro » : page du numéro et articles, avec leurs images, dans un cache par numéro et par langue (`nko-numero-003-nqo`), sans limite ; « Retirer de l'appareil » l'efface (`docs/APPLICATION.md`) |
| Copies gardées (bibliothèque, numéros) | Mises à jour à chaque lecture connectée |
| Page « pas de connexion » | `/offline` (N'Ko) ou `/fr/offline` (français), selon l'adresse ; gardée à part, jamais effacée par la limite des 60 pages |
| Fichiers aux noms uniques (`/_next/static`) ou versionnés (polices d'icônes `/icones/…?v=…`) | Gardés une fois pour toutes ; une seule version par fichier |
| Fichiers à adresse fixe (polices `/fonts`, motif de fond) | Copie montrée tout de suite, mise à jour en arrière-plan |
| Images (`/_next/image`) | Images de Sanity (adresse unique) : la copie suffit, rien n'est retéléchargé (données mobiles épargnées). Autres : copie montrée tout de suite, mise à jour en arrière-plan. 200 au plus (hors bibliothèque et numéros). Sans connexion, à défaut de la taille demandée : la même image à une autre taille |

**Polices d'icônes** : leur adresse contient l'empreinte de leur contenu (`?v=…`, ajoutée par
`scripts/icones/generer-icones.mjs`). Une police refaite change donc d'adresse : le lecteur ne
peut jamais garder l'ancienne (correction du 23 octobre 2026 : avant, une copie ancienne pouvait
montrer des carrés vides à la place des nouvelles icônes).
| **Jamais** | `/studio`, `/api/…`, navigation interne de Next.js (`?_rsc=`), réponses « no-store » (aperçu des brouillons), autres sites |

Rien n'est envoyé : tout reste sur l'appareil du lecteur (pas de données personnelles).

## Vérifier soi-même (Chrome sur ordinateur)

1. Ouvrir le site (version en ligne ou aperçu Vercel), lire un article, mettre le signet.
2. `F12` → onglet **Application** → **Service workers** : « sw.js » est **activated**.
3. Onglet **Network** → cocher **Offline** → recharger l'article : il s'affiche.
4. Ouvrir une page jamais lue : la page « pas de connexion » s'affiche.

Contrôle automatique (Chrome sans fenêtre, réseau vraiment coupé, page **et** service worker) :
`node scripts/tester-hors-ligne.mjs` sur le serveur d'essai local (`next start -p 3100` : le
service worker ne s'installe pas avec `next dev`).

## Arrêt d'urgence

Si un jour la lecture hors ligne pose problème : remplacer **tout** le contenu de `public/sw.js`
par le court texte « ARRÊT D'URGENCE » écrit en tête de ce fichier, puis mettre en ligne.
Chaque lecteur le reçoit à sa visite suivante : les copies sont effacées et le service worker
se désinstalle seul. Ne **pas** simplement supprimer le fichier (les navigateurs garderaient
l'ancien service worker).
