# L'application du site (étapes 1 et 2) — 23 octobre 2026

> Pour le propriétaire et toute autre IA. Branche `lot2/application` (posée sur `correctif/hors-ligne`).
> **Mise en ligne prévue le 31 octobre** (après la publication du N°003), après « fusionner » écrit.
> Aucun changement de schéma Sanity, rien n'est écrit dans Sanity.

## Ce que voit le lecteur

| Appareil | Ce qui se passe |
|---|---|
| **Android** (Chrome, Samsung Internet, Edge) | Jamais à la première visite. À partir du **2ᵉ article lu**, à la **moitié** de l'article : une carte discrète en bas « Installer l'application » · « Plus tard ». « Installer » ouvre la vraie fenêtre d'installation, **avec des captures du site**. « Plus tard » : plus rien pendant 2 mois. |
| **iPhone / iPad** | Même carte ; « Installer » ouvre un **guide en 3 gestes** (Partager → Sur l'écran d'accueil → Ajouter). Le bouton « Installer l'application » du menu de l'accueil ouvre aussi ce guide. Ouverture sans écran blanc (écrans de démarrage) et barre d'état noire. |
| **Ordinateur** (Chrome, Edge) | Bouton « Installer » du menu de l'accueil et carte sous les articles ; fenêtre d'installation avec captures. |
| **Application installée** | Icône ronde propre sur Android (logo entier), nom N'Ko (ou français si installée depuis `/fr`), **raccourcis** par appui long : Numéros, Lexique, Ma bibliothèque. Plus aucune proposition d'installer. |
| **Page d'un numéro** | Bouton **« Télécharger le numéro »** : le numéro entier (page, articles, images) est gardé sur l'appareil, puis se lit **sans connexion**. Avancement visible, reprise si interrompu, taille affichée, « Retirer de l'appareil ». |
| **Sans connexion** | La page « pas de connexion » liste ce qui est disponible : numéros téléchargés, « Ma bibliothèque », pages lues récemment. Les articles de « Ma bibliothèque » sont gardés **avec leurs images**. |

Rien n'est envoyé : tout reste dans le navigateur du lecteur (articles lus, « Plus tard », copies).

## Fichiers

| Fichier | Rôle |
|---|---|
| `public/manifest.json` · `public/manifest-fr.json` | « Carte d'identité » de l'application, N'Ko (s'ouvre sur `/`) et français (s'ouvre sur `/fr`). **Fabriqués** par le générateur : ne pas modifier à la main |
| `public/application/` | Icône de l'application (`icone-192/512`, `icone-masquable-192/512`), icône d'onglet (`onglet-192`), raccourcis, écrans de démarrage (iPhone, iPad), captures (fabriqués) |
| `scripts/application/icone.mjs` | **Dessin de l'icône** (choix du propriétaire, 24 octobre 2026) : le logo original agrandi sur fond bleu nuit, léger halo, retouches très fines ; onglet = les lettres seules. Utilisé par `generer.mjs` (icônes de l'application, `public/apple-touch-icon.png`) et `scripts/icones/favicon.mjs` (`app/favicon.ico`, `onglet-192`). Le logo du site (`public/icon-512x512.png`) n'est jamais modifié : c'est la source |
| `app/lib/ecrans-demarrage.json` | Liste des écrans de démarrage, lue par le gabarit (fabriquée) |
| `app/components/application/textes.ts` | **Tous les textes** de l'application (N'Ko de la rédaction, L21 à L34 à fournir) |
| `app/lib/installation.ts` | État de l'installation (fenêtre du navigateur, guide iPhone, « déjà installée ») |
| `app/components/application/` | `Application.tsx` (chargée à la demande), `PropositionInstallation.tsx`, `GuideIphone.tsx`, `TelechargerNumero.tsx`, `DisponibleHorsLigne.tsx`, `Libelle.tsx` |
| `public/sw.js` | Lecture hors ligne (voir `docs/HORS-LIGNE.md`) |

## Refaire les fichiers (logo changé, nouvelle page à montrer…)

```bash
node scripts/application/generer.mjs
node scripts/application/generer.mjs --captures
```

La première commande refait les manifestes, icônes, raccourcis et écrans de démarrage (les
captures déjà faites sont gardées). L'icône d'onglet se refait avec `node scripts/icones/favicon.mjs`. La seconde refait aussi les **captures** à partir du site en
ligne (Chrome sans fenêtre, lecture seule). Les noms N'Ko viennent du manifeste existant et de
`textes.ts` : aucun N'Ko n'est tapé.

## Textes N'Ko à fournir

L21 à L34 dans `docs/TEXTES-NKO-A-DEMANDER.md`. Tant qu'un texte manque, le français s'affiche
(avec `lang="fr"`). Quand la rédaction les fournit : les copier par programme dans `textes.ts`,
puis relancer `node scripts/application/generer.mjs` (pour les raccourcis du manifeste).

## Vérifier

Contrôles automatiques (serveur d'essai local : le service worker ne s'installe pas avec `next dev`) :

```bash
node scripts/tester-application.mjs
node scripts/tester-hors-ligne.mjs
```

`tester-application.mjs` : manifestes (installables selon Chrome), proposition (pas au 1ᵉʳ article,
à la moitié du 2ᵉ, « Plus tard »), guide iPhone (3 étapes, Échap), bibliothèque avec images et
page « pas de connexion ». Après le 30 octobre, le téléchargement d'un vrai numéro :
`node scripts/tester-application.mjs --telechargement /fr/numeros/003` (réseau coupé, chaque
article doit s'ouvrir avec toutes ses images).

Sur un vrai téléphone (aperçu Vercel) :
1. **Android** : lire 2 articles jusqu'à la moitié → la carte apparaît → « Installer » → l'icône
   arrive sur l'écran d'accueil ; appui long sur l'icône → 3 raccourcis.
2. **iPhone** (Safari) : menu de l'accueil → « Installer l'application » → suivre le guide →
   ouvrir l'icône : pas d'écran blanc, rien sous l'heure.
3. **Numéro** (après le 30) : page du N°003 → « Télécharger le numéro » → mode avion → ouvrir
   chaque article : texte et images s'affichent.

## Étapes suivantes (après le 31 octobre)

- **Étape 3** : l'application sur Google Play (même site, emballé). Il faut d'abord le compte
  développeur Google Play du propriétaire (personnel : 12 testeurs pendant 14 jours ;
  organisation : numéro D-U-N-S).
- **Étape 4** : notifications (« Le N°004 est paru »), avec l'accord explicite du lecteur ; textes
  N'Ko demandés à ce moment-là.
- Ordinateur Mac (Safari 17 et plus : « Fichier → Ajouter au Dock ») : guide possible plus tard.
