import { defineField, defineType } from 'sanity';
import React from 'react';

// ============================================================================
// N'KO NI LONKO — Numéro de la revue mensuelle (ex. N°003)
// ============================================================================
// Le numéro POINTE vers ses articles (sommaire ordonné) ; l'article ne stocke
// pas son numéro : une seule source de vérité. Le site retrouve le numéro d'un
// article avec *[_type == "numero" && references(^._id)].
// Les libellés N'Ko viennent de la rédaction et sont saisis dans le Studio.
// ============================================================================

const API_VERSION = '2025-02-19';

// « 3 » → « 003 » : le lien d'un numéro se calcule à partir de son numéro
const enLien = (n: unknown) => {
  const nombre = Number(n);
  return Number.isInteger(nombre) && nombre > 0 ? String(nombre).padStart(3, '0') : '';
};

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

// Sens automatique selon le texte saisi (N'Ko ou français), comme les champs SEO des articles
const ChampAuto = (props: import('sanity').StringInputProps) => {
  const nko = contientNko(String((props as { value?: string }).value || ''));
  return React.createElement('div', { dir: nko ? 'rtl' : 'ltr', style: { textAlign: nko ? 'right' : 'left' } }, props.renderDefault(props));
};

// Identifiant publié d'un document (sans le préfixe « drafts. »)
const idPublie = (id?: string) => (id || '').replace(/^drafts\./, '');

type Ref = { _ref?: string };

// L'édito et l'article à la une doivent faire partie du sommaire
const regleDansSommaire = (valeur: unknown, document: { sommaire?: Ref[] } | undefined) => {
  const ref = (valeur as Ref | undefined)?._ref;
  if (!ref) return true;
  return (document?.sommaire || []).some((r) => r?._ref === ref)
    ? true
    : 'Cet article doit aussi figurer dans le sommaire.';
};

export default defineType({
  name: 'numero',
  title: 'Numéro',
  type: 'document',
  icon: () => '📚',
  groups: [
    { name: 'content', title: 'Rédaction', default: true },
    { name: 'media', title: 'Médias' },
    { name: 'seo', title: 'SEO & partage' },
  ],
  // 🔒 Règle 6 : tout texte doit rester en Unicode normalisé (NFC). Avertissement non bloquant.
  validation: (rule) =>
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
  fields: [
    // =========================================================================
    // ✍️ RÉDACTION
    // =========================================================================
    defineField({
      name: 'numero',
      title: 'Numéro',
      description: 'Ex : 3 pour le N°003. Unique.',
      type: 'number',
      group: 'content',
      validation: (rule) => [
        rule.required().integer().min(1).error('Le numéro est un nombre entier à partir de 1.'),
        rule.custom(async (valeur, context) => {
          if (typeof valeur !== 'number') return true;
          const id = idPublie(context.document?._id);
          const autre = await context
            .getClient({ apiVersion: API_VERSION })
            .fetch<string | null>(
              `*[_type == "numero" && numero == $valeur && !(_id in [$id, "drafts." + $id])][0]._id`,
              { valeur, id }
            );
          return autre ? 'Un autre document porte déjà ce numéro.' : true;
        }),
      ],
    }),
    defineField({
      name: 'titleNko',
      title: 'Titre (N\'Ko)',
      description: 'Facultatif. Fourni par la rédaction.',
      type: 'string',
      group: 'content',
      components: { input: ChampRtl },
    }),
    defineField({
      name: 'titleFr',
      title: 'Titre (français)',
      description: 'Facultatif.',
      type: 'string',
      group: 'content',
      components: { input: ChampLtr },
    }),
    defineField({
      name: 'saison',
      title: 'Saison',
      description: 'Ex : 1',
      type: 'number',
      group: 'content',
      validation: (rule) => rule.integer().min(1).error('La saison est un nombre entier à partir de 1.'),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de parution',
      type: 'datetime',
      group: 'content',
      validation: (rule) => rule.required().error('La date de parution est obligatoire.'),
    }),
    defineField({
      name: 'sommaire',
      title: 'Sommaire',
      description: "Les articles du numéro, dans l'ordre de la revue (glisser pour changer l'ordre).",
      type: 'array',
      group: 'content',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: (rule) => [
        rule.required().min(1).error('Le sommaire doit contenir au moins un article.'),
        rule.unique().error('Un article ne peut figurer qu\'une fois dans le sommaire.'),
      ],
    }),
    defineField({
      name: 'edito',
      title: 'Édito',
      description: "L'article d'édito. Il doit figurer dans le sommaire.",
      type: 'reference',
      to: [{ type: 'article' }],
      group: 'content',
      validation: (rule) =>
        rule.custom((valeur, context) => regleDansSommaire(valeur, context.document as { sommaire?: Ref[] } | undefined)),
    }),
    defineField({
      name: 'aLaUne',
      title: 'À la une',
      description: "L'article mis en avant. Il doit figurer dans le sommaire.",
      type: 'reference',
      to: [{ type: 'article' }],
      group: 'content',
      validation: (rule) =>
        rule.custom((valeur, context) => regleDansSommaire(valeur, context.document as { sommaire?: Ref[] } | undefined)),
    }),

    // =========================================================================
    // 🖼️ MÉDIAS
    // =========================================================================
    defineField({
      name: 'couverture',
      title: 'Couverture',
      description: 'Facultative, mais conseillée (page du numéro, archive, partage sur les réseaux).',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texte alternatif',
          description: "Description de l'image pour les personnes aveugles et Google.",
          validation: (rule) => rule.required().error("Le texte alternatif de la couverture est obligatoire."),
        },
        {
          name: 'captionNko',
          type: 'text',
          title: 'Légende (N\'Ko)',
          rows: 2,
          components: { input: ChampRtl },
        },
        {
          name: 'caption',
          type: 'text',
          title: 'Légende (français)',
          rows: 2,
          components: { input: ChampLtr },
        },
        // Crédit de la couverture (même modèle que le champ « source » des images intégrées),
        // affiché en petit sous l'image ; le crédit N'Ko (ci-dessous), s'il existe, passe avant
        {
          name: 'source',
          type: 'string',
          title: 'Source ou crédit (ex. NASA/SDO)',
        },
        // Crédit en N'Ko (facultatif, fourni par la rédaction) : affiché AVANT le crédit français
        {
          name: 'sourceNko',
          type: 'string',
          title: "Source ou crédit (N'Ko)",
          description: "Facultatif. Texte de la rédaction, affiché avant le crédit français.",
          components: { input: ChampRtl },
        },
      ],
      validation: (rule) =>
        rule
          .custom((valeur) => ((valeur as { asset?: unknown } | undefined)?.asset ? true : 'Pas encore de couverture : elle est conseillée.'))
          .warning(),
    }),

    // =========================================================================
    // 🚀 SEO & PARTAGE
    // =========================================================================
    defineField({
      name: 'slug',
      title: 'Lien (slug)',
      description: 'Calculé à partir du numéro (3 → « 003 ») : cliquer sur « Générer ».',
      type: 'slug',
      group: 'seo',
      options: { source: 'numero', slugify: (source) => enLien(source) },
      components: { input: ChampLtr },
      validation: (rule) => [
        rule.required().error('Le lien est obligatoire.'),
        rule.custom((slug, context) => {
          const attendu = enLien((context.document as { numero?: unknown } | undefined)?.numero);
          if (!slug?.current || !attendu) return true;
          return slug.current === attendu
            ? true
            : `Le lien doit être « ${attendu} » pour ce numéro : cliquer sur « Générer ».`;
        }),
      ],
    }),
    defineField({
      name: 'seoTitle',
      title: 'Titre SEO (facultatif)',
      description: 'Version courte du titre pour Google.',
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.max(60).warning('Un titre SEO de plus de 60 caractères sera coupé par Google.'),
      components: { input: ChampAuto },
    }),
    defineField({
      name: 'excerpt',
      title: 'Résumé (facultatif)',
      description: "S'il est vide, la page du numéro utilise le résumé de l'édito.",
      type: 'text',
      group: 'seo',
      rows: 3,
      validation: (rule) => rule.max(200).warning('Le résumé ne doit pas dépasser 200 caractères.'),
      components: { input: ChampAuto },
    }),
  ],
  orderings: [
    { title: 'Numéro (le plus récent en premier)', name: 'numeroDesc', by: [{ field: 'numero', direction: 'desc' }] },
  ],
  preview: {
    select: { numero: 'numero', saison: 'saison', titleFr: 'titleFr', titleNko: 'titleNko', media: 'couverture' },
    prepare: ({ numero, saison, titleFr, titleNko, media }) => ({
      title: `N°${enLien(numero) || '?'}${typeof saison === 'number' ? ` · Saison ${saison}` : ''}`,
      subtitle: titleFr || titleNko || '',
      media,
    }),
  },
});
