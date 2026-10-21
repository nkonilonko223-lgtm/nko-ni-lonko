# Diagnostic du site en ligne — 21 octobre 2026

> Pour MckV (propriétaire) et Cowork. Rédigé par Claude Code.
> Diagnostic fait **en lecture seule** sur https://www.nkonilonko.com : rien n'a été écrit dans Sanity, rien n'a été changé sur le site.
> Rappel des règles : **gel du site jusqu'au 30 octobre** (corrections seulement) ; rien sur `main` sans « fusionner » écrit ; aucune écriture dans Sanity sans export complet **et** accord écrit ; aucun texte N'Ko écrit par une IA.

## 1. Conditions de mesure

- **Téléphone moyen simulé** : écran 390 px, processeur 4 fois plus lent, 4G lente (1,6 Mbit/s, 150 ms de latence). Ce sont à peu près les réglages de Google (Lighthouse).
- Chaque page est mesurée **plusieurs fois**, cache vidé. Les chiffres varient d'une mesure à l'autre : on donne la fourchette.
- Accessibilité : outil **axe-core** (règles WCAG 2.2, niveaux A et AA), en mode N'Ko.
- Sécurité : en-têtes du site, redirections, fichiers sensibles, réglages publics du domaine (DNS).
- Google PageSpeed Insights n'a pas pu être utilisé ce jour-là (quota du service épuisé).

## 2. Ce qui est déjà au niveau des meilleurs

| Domaine | Constat |
|---|---|
| Sécurité | Connexion toujours chiffrée (HSTS 2 ans) ; toutes les adresses redirigent vers `https://www.` ; `.env`, `.git` et cartes du code source introuvables (404) ; liste des autorités de certificats (CAA) ; e-mails signés (DKIM de Resend) ; SPF en place |
| Référencement | 16 pages dans le plan du site, toutes en état 200 ; aucun lien interne cassé ; aucun titre en double ; vraie page « introuvable » (404) ; `robots.txt` correct ; image de partage sur toutes les pages |
| Vitesse | `/lexique`, `/numeros`, `/about` : affichage principal en 1,1 à 1,8 s ; la page ne « saute » pas pendant le chargement (CLS ≤ 0,065, objectif < 0,1) ; couverture d'article en AVIF (13 Ko) et préchargée |
| Accessibilité | `/lexique` et `/numeros` : aucun problème détecté |

## 3. Constat n° 1 : l'écran de chargement de l'accueil

- Un écran noir (la lettre N'Ko qui clignote) couvrait **tout l'accueil** jusqu'à la fin du JavaScript, plus 400 ms, plus 0,8 s de fondu.
- Mesuré 4 fois : l'écran se levait entre **4,3 et 6,6 s** (+ 0,8 s de fondu), alors que le contenu était prêt vers **2,4 s**.
- **Sans JavaScript** (certains navigateurs légers très utilisés en Afrique de l'Ouest), l'accueil restait **noir pour toujours**.
- Google ne voyait pas ce délai dans ses mesures (LCP), mais le visiteur le subissait.

**Correction préparée** sur la branche `fix/ecran-chargement-accueil` (commit `07099d6`), **non fusionnée** :
- écran de chargement retiré (`app/components/HomeClient.tsx`, `app/globals.css`) ;
- essai local, même téléphone simulé : contenu visible à 3,0 s ; sans JavaScript, l'accueil s'affiche ;
- le N'Ko du fichier est inchangé (seuls les 3 textes N'Ko de l'écran de chargement partent avec lui).

**Effet à connaître** : l'écran noir cachait aussi le changement de langue. Un visiteur qui a choisi le **français** voit maintenant l'accueil en N'Ko environ 1,3 s (téléphone lent), puis en français. C'est déjà le cas sur toutes les autres pages. Le vrai remède est « la langue dans l'adresse » (B6, `docs/PLAN-LOT-2.md`).

## 4. Autres constats mesurés

### Vitesse

| Page | Affichage principal (LCP) | Blocage du téléphone (TBT) | Poids |
|---|---|---|---|
| Accueil | 1,7 à 4,8 s | 1,0 à 4,5 s | 621 Ko |
| Article (« Le géant à crête du Niger ») | 2,9 à 5,2 s | 0,2 à 1,8 s | 635 Ko |
| `/lexique`, `/numeros`, `/about` | 1,1 à 2,5 s | 0 à 1,4 s | 364 à 404 Ko |

- Sur l'article, la couverture est légère (13 Ko) : le retard vient du partage de la bande passante avec les **polices (≈ 155 Ko)** et le **JavaScript (≈ 210 Ko)**.
- **Police Kigelia** : elle contient 63 signes N'Ko sur environ 370 caractères (latin de base, latin étendu, autres). Depuis le 20 octobre, le français s'affiche en Montserrat : la partie latine de Kigelia sert donc peu.
- **Accueil** : le gros composant client (`HomeClient.tsx`, 886 lignes) bloque le téléphone 1 à 4,5 s.

### Accessibilité (axe-core, mode N'Ko)

| Problème | Où | Nombre |
|---|---|---|
| Contraste un peu faible : 4,17 à 4,24 au lieu de 4,5 minimum | Accueil : dates et métadonnées des cartes (`text-slate-500`, `ArticleCard.tsx`) ; légendes d'images des articles (`CustomPortableText.tsx`) ; Contact | 24 + 8 + 1 |
| Texte alternatif fait d'**un seul espace** | Couverture de l'article `un-evenement-sans-precedent-sur-l-iss` | 1 |
| Pas de zone « contenu principal » (`<main>`) | `/about`, `/contact` | 2 pages |
| Lien flèche sans nom (en haut de l'article) | Déjà corrigé dans la pile Lot 2 (commit `18614fa`) | — |
| Intertitre H4 juste sous le titre H1 | « Le géant à crête du Niger » (déjà signalé à la rédaction) | 1 |

### Sécurité et e-mails

| Point | État | Proposition |
|---|---|---|
| DMARC | `p=none`, **sans adresse de rapports** | Ajouter une adresse qui reçoit les rapports (`rua=mailto:…`), observer 2 à 4 semaines, puis passer à `p=quarantine`. À faire **avant la lettre d'information**. Le domaine est géré chez **Vercel** (DNS) |
| `/.well-known/security.txt` | Absent | Petit fichier : adresse pour signaler une faille (norme RFC 9116) |
| `X-XSS-Protection: 1; mode=block` | Réglage ancien, déconseillé | Mettre `0` ou le retirer |
| `Cross-Origin-Opener-Policy` | Absent | `same-origin` (à tester avec Turnstile) |
| CSP | En « rapport seulement » | Passage en mode appliqué, déjà prévu (`docs/PLAN-LOT-2.md`) |
| Liste HSTS « preload » | L'en-tête le demande, mais le domaine n'est pas inscrit | Facultatif, à faire avec prudence (engage tous les sous-domaines en HTTPS) |
| DNSSEC | Non | Facultatif |

### Référencement

- **11 titres de page dépassent 65 caractères** (Google coupe vers 60) :
  - 8 articles, ainsi que `/lexique`, `/terms` et `/privacy` ;
  - les titres d'articles ont la forme « titre N'Ko (TITRE FRANÇAIS EN MAJUSCULES) », avec des **doubles espaces**.
- **Descriptions** :
  - trop longues (plus de 160 caractères) : `/contact`, `/privacy`, `/terms` et « Origines et ADN » ;
  - trop courte : « Tempête solaire » (54 caractères).
- **Nom de la revue en double** dans le titre de `/terms` et `/privacy` (en lettres latines puis en N'Ko).
- **Balises de langue (hreflang)** : présentes, mais le N'Ko et le français pointent vers la **même adresse**. Le vrai remède est B6.
- **Pas de flux RSS** (`/feed.xml`).
- **Google Scholar** : les balises `citation_*` sont en place. Il manque le numéro (`citation_issue`), le PDF (`citation_pdf_url`) et l'ISSN (`citation_issn`).
- **Données Google** : l'accueil et `/numeros` n'ont que les données générales (WebSite et Organization).
- **Image** : une image du « Géant à crête » a une **adresse web** comme texte alternatif. Plusieurs autres ont « Illustration scientifique », trop général.

## 5. Propositions, par priorité

### A. Corrections possibles avant le 30 octobre (MckV décide)

| # | Correction | Qui | État |
|---|---|---|---|
| 1 | Retirer l'écran de chargement de l'accueil | Claude Code | **Branche prête** : `fix/ecran-chargement-accueil` |
| 2 | Éclaircir le gris des petits textes (contraste ≥ 4,5) | Claude Code | À faire si accord |
| 3 | Traiter un texte alternatif fait d'espaces comme vide (code : `.trim()`) | Claude Code | À faire si accord |
| 4 | Ajouter `<main>` sur `/about` et `/contact` | Claude Code | À faire si accord |

### B. Sans code (MckV, Cowork, rédaction)

1. **DMARC** : ajouter l'adresse de rapports dans le DNS chez Vercel (MckV).
2. **Champ « titre SEO »** des articles : un titre court, sans majuscules partout, pour les 8 articles concernés. La rédaction l'écrit (N'Ko compris). Pour Cowork : **export complet puis accord écrit** avant toute écriture dans Sanity.
3. **Textes alternatifs** :
   - couverture de l'article sur l'ISS (vide) ;
   - image du « Géant à crête » (une adresse web à la place d'une description).
4. **Résumé** de « Tempête solaire » : 120 à 160 caractères.
5. **Google Search Console** et mesure PageSpeed : déjà dans `docs/AVANT-PUBLICATION-N003.md` (points 6 et 7).

### C. Après le 30 octobre (Lot 2)

1. **Alléger Kigelia** :
   - garder le N'Ko, la ponctuation et les chiffres (outil fontTools) ;
   - puis vérifier **à l'œil** les liaisons N'Ko sur plusieurs pages ;
   - gain attendu : une bonne part des ≈ 100 Ko, à mesurer.
2. **Alléger le JavaScript de l'accueil** : passer les parties fixes en composants serveur (dogme 8, Server-First).
3. **Flux RSS** `/feed.xml`.
4. **Google Scholar** : ajouter `citation_issue` (numéro de la revue), puis `citation_pdf_url` avec le PDF du numéro.
5. **Données Google** : `Periodical` (la revue) sur l'accueil et `CollectionPage` sur `/numeros`.
6. **Sécurité** :
   - ajouter `security.txt` ;
   - mettre `X-XSS-Protection` à `0` ;
   - ajouter `Cross-Origin-Opener-Policy` ;
   - appliquer la CSP (déjà prévu).
7. **Titres** : retirer le doublon du nom de la revue sur `/terms` et `/privacy`.
8. **Langue dans l'adresse** (B6) : supprime le passage N'Ko → français au chargement, et rend les balises hreflang utiles.

### D. Long terme (niveau des grandes revues scientifiques)

1. **ISSN** : numéro officiel de la revue (gratuit).
2. **DOAJ** : annuaire mondial des revues en accès libre (demande l'ISSN, la licence et la politique de relecture).
3. **DOI** : un identifiant permanent par article (Crossref, payant ; ou Zenodo, gratuit).
4. **Vitesse réelle des visiteurs** : Vercel Speed Insights. C'est une nouvelle dépendance, à discuter d'abord.

## 6. Vérifier soi-même

- **Écran noir** : sur un téléphone, en 4G sans Wi-Fi et en fenêtre privée, ouvrir l'accueil et compter les secondes avant de voir le contenu. Comparer le site en ligne et l'aperçu Vercel de la branche.
- **Vitesse** : https://pagespeed.web.dev, choisir « Mobile ».
- **Sécurité** : https://securityheaders.com avec l'adresse du site.
- **E-mails** : un outil public de vérification DMARC (par exemple MXToolbox) avec `nkonilonko.com`.
