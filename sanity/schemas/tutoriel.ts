import { defineField, defineType, type Rule } from 'sanity';
import React from 'react';
import { verifierMarquesDoublees } from '../correcteur-nko';

// ============================================================================
// N'KO NI LONKO — Tutoriel vidéo « Bien utiliser N'Ko ni Lonko » (page /tutoriels)
// ============================================================================
// Une vidéo YouTube verticale et les diapositives de ses étapes. Le N'Ko vient des fichiers _2
// validés de la rédaction, copié par programme : il n'est jamais écrit ici.
// Import : docs/GUIDE-IMPORT-IA.md (§ 4 ter), contrôlé par scripts/verifier-import.mts.
// ============================================================================

const API_VERSION = '2025-02-19';

// Formats attendus, aussi contrôlés par scripts/verifier-import.mts
export const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;
export const DUREE = /^[0-9]{1,2}:[0-5][0-9]$/;
export const IMAGE_DIAPO = /-1080x1350-webp$/;

// Contient au moins une lettre N'Ko (plage U+07C0 à U+07FF)
const contientNko = (texte: string) =>
  [...texte].some((c) => {
    const code = c.codePointAt(0) ?? 0;
    return code >= 0x07c0 && code <= 0x07ff;
  });

// Champ saisi de droite à gauche (N'Ko)
const ChampRtl = (props: import('sanity').StringInputProps) =>
  React.createElement('div', { dir: 'rtl', style: { textAlign: 'right' } }, props.renderDefault(props));

// Champ saisi de gauche à droite (français) : le Studio hérite du sens « rtl » du site
const ChampLtr = (props: import('sanity').InputProps) =>
  React.createElement('div', { dir: 'ltr', style: { textAlign: 'left' } }, props.renderDefault(props));

// Identifiant publié d'un document (sans le préfixe « drafts. »)
const idPublie = (id?: string) => (id || '').replace(/^drafts\./, '');

// Texte dans les deux langues : { nko, fr }, les deux obligatoires
const bilingue = (type: 'string' | 'text', nom: string, titre: string) =>
  defineField({
    name: nom,
    title: titre,
    type: 'object',
    options: { columns: 1 },
    validation: (rule) => rule.required().error(`${titre} : le N'Ko et le français sont obligatoires.`),
    fields: [
      {
        name: 'nko',
        title: "N'Ko",
        description: 'Copié du fichier _2 validé, jamais tapé.',
        type,
        components: { input: ChampRtl },
        validation: (rule: Rule) => [
          rule.required().error("Le N'Ko est obligatoire."),
          rule.custom((v) => (typeof v === 'string' && v && !contientNko(v) ? "Ce champ doit contenir du N'Ko." : true)),
        ],
      },
      {
        name: 'fr',
        title: 'Français',
        type,
        components: { input: ChampLtr },
        validation: (rule: Rule) => [
          rule.required().error('Le français est obligatoire.'),
          rule.custom((v) => (typeof v === 'string' && contientNko(v) ? "Ce champ est en français : le N'Ko va dans le champ « N'Ko »." : true)),
        ],
      },
    ],
  });

export default defineType({
  name: 'tutoriel',
  title: 'Tutoriel vidéo',
  type: 'document',
  icon: () => '🎬',
  // 🔒 Règle 6 : tout texte doit rester en Unicode normalisé (NFC). Avertissement non bloquant.
  // ✍️ Correcteur N'Ko (sanity/correcteur-nko.ts) : marque doublée. Il signale, il ne corrige jamais.
  validation: (rule) => [
    rule.custom((doc) => {
      if (!doc) return true;
      const champs = Object.entries(doc as Record<string, unknown>).filter(([cle]) => !cle.startsWith('_'));
      const fautif = champs.find(([, valeur]) => {
        const texte = JSON.stringify(valeur ?? '');
        return texte !== texte.normalize('NFC');
      });
      return fautif
        ? { message: 'Ce champ contient du texte non normalisé (NFC). Signalez-le avant publication.', path: [fautif[0]] }
        : true;
    }).warning(),
    rule.custom((doc) => verifierMarquesDoublees(doc as Record<string, unknown> | undefined)).warning(),
  ],
  fields: [
    defineField({
      name: 'numero',
      title: 'Numéro de la vidéo',
      description: 'De 1 à 13 : ordre sur la page. Unique.',
      type: 'number',
      validation: (rule) => [
        rule.required().integer().min(1).error('Le numéro est un nombre entier à partir de 1.'),
        rule.custom(async (valeur, context) => {
          if (typeof valeur !== 'number') return true;
          const id = idPublie(context.document?._id);
          const autre = await context
            .getClient({ apiVersion: API_VERSION })
            .fetch<string | null>(
              `*[_type == "tutoriel" && numero == $valeur && !(_id in [$id, "drafts." + $id])][0]._id`,
              { valeur, id }
            );
          return autre ? 'Un autre tutoriel porte déjà ce numéro.' : true;
        }),
      ],
    }),
    bilingue('string', 'titre', 'Titre'),
    bilingue('text', 'resume', 'Résumé'),
    defineField({
      name: 'youtubeId',
      title: 'Identifiant YouTube',
      description: "Seulement les 11 caractères après « v= » dans l'adresse de la vidéo, pas l'adresse entière.",
      type: 'string',
      components: { input: ChampLtr },
      validation: (rule) => [
        rule.required().error("L'identifiant YouTube est obligatoire."),
        rule.custom((v) => (typeof v === 'string' && !ID_YOUTUBE.test(v) ? "Il faut l'identifiant seul : 11 caractères (lettres, chiffres, - ou _)." : true)),
      ],
    }),
    defineField({
      name: 'duree',
      title: 'Durée',
      description: 'Minutes:secondes, comme sur YouTube. Ex : 3:50',
      type: 'string',
      components: { input: ChampLtr },
      validation: (rule) => [
        rule.required().error('La durée est obligatoire.'),
        rule.custom((v) => (typeof v === 'string' && !DUREE.test(v) ? 'Écrire la durée ainsi : 3:50' : true)),
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de mise en ligne sur YouTube',
      description: 'Demandée par Google pour les vidéos (uploadDate).',
      type: 'datetime',
      validation: (rule) => rule.required().error('La date de mise en ligne est obligatoire.'),
    }),
    defineField({
      name: 'miniature',
      title: 'Miniature',
      description: "L'image affichée avant la lecture. Le mieux : verticale, 1080 × 1920. Une image en largeur reste possible : elle s'affiche entière au milieu du cadre.",
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required().error('La miniature est obligatoire.'),
    }),
    defineField({
      name: 'diapos',
      title: 'Diapositives',
      description: "Les étapes, dans l'ordre (glisser pour changer l'ordre).",
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'diapo',
          title: 'Diapositive',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              description: 'WebP, 1080 × 1350.',
              type: 'image',
              validation: (rule) => [
                rule.required().error("L'image est obligatoire."),
                rule
                  .custom((v) => {
                    const ref = (v as { asset?: { _ref?: string } } | undefined)?.asset?._ref;
                    return ref && !IMAGE_DIAPO.test(ref) ? 'Attendu : une image WebP de 1080 × 1350.' : true;
                  })
                  .warning(),
              ],
            }),
            bilingue('text', 'legende', 'Légende'),
          ],
          preview: {
            select: { titre: 'legende.nko', sousTitre: 'legende.fr', media: 'image' },
          },
        },
      ],
      validation: (rule) => rule.custom((v) => (Array.isArray(v) && v.length ? true : 'Pas encore de diapositive.')).warning(),
    }),
  ],
  orderings: [
    { title: 'Numéro', name: 'numeroAsc', by: [{ field: 'numero', direction: 'asc' }] },
  ],
  preview: {
    select: { numero: 'numero', titre: 'titre.nko', sousTitre: 'titre.fr', media: 'miniature' },
    prepare: ({ numero, titre, sousTitre, media }) => ({
      title: titre || sousTitre || 'Tutoriel sans titre',
      subtitle: [typeof numero === 'number' ? `Vidéo ${numero}` : null, sousTitre].filter(Boolean).join(' · '),
      media,
    }),
  },
});
