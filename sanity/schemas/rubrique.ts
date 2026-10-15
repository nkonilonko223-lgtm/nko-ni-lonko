import { defineField, defineType } from 'sanity';
import React from 'react';

// ============================================================================
// N'KO NI LONKO — Rubrique de la revue mensuelle (Édito, Grand sujet…)
// ============================================================================
// Les libellés N'Ko viennent de la rédaction et sont saisis dans le Studio.
// Un article indique sa rubrique (champ « rubrique » de l'article) ;
// le numéro, lui, liste ses articles dans son sommaire.
// ============================================================================

// Champ saisi de droite à gauche (N'Ko)
const ChampRtl = (props: import('sanity').StringInputProps) =>
  React.createElement('div', { dir: 'rtl', style: { textAlign: 'right' } }, props.renderDefault(props));

// Champ saisi de gauche à droite (français) : le Studio hérite du sens « rtl » du site
const ChampLtr = (props: import('sanity').InputProps) =>
  React.createElement('div', { dir: 'ltr', style: { textAlign: 'left' } }, props.renderDefault(props));

export default defineType({
  name: 'rubrique',
  title: 'Rubrique',
  type: 'document',
  icon: () => '🗂️',
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
    defineField({
      name: 'titleNko',
      title: 'Titre (N\'Ko)',
      description: 'Fourni par la rédaction.',
      type: 'string',
      validation: (rule) => rule.required().error('Le titre en N\'Ko est obligatoire.'),
      components: { input: ChampRtl },
    }),
    defineField({
      name: 'titleFr',
      title: 'Titre (français)',
      type: 'string',
      validation: (rule) => rule.required().error('Le titre en français est obligatoire.'),
      components: { input: ChampLtr },
    }),
    defineField({
      name: 'slug',
      title: 'Lien (slug)',
      description: 'Créé à partir du titre français. Seulement a-z, chiffres et tirets (ex : grand-sujet).',
      type: 'slug',
      options: { source: 'titleFr', maxLength: 96 },
      components: { input: ChampLtr },
      validation: (rule) => [
        rule.required().error('Le lien est obligatoire.'),
        rule.custom((slug) =>
          slug?.current && /[^a-z0-9-]/.test(slug.current)
            ? 'Le lien ne doit contenir que des minuscules sans accents, des chiffres et des tirets.'
            : true
        ),
      ],
    }),
    defineField({
      name: 'ordre',
      title: 'Ordre dans la revue',
      description: '1 pour la première rubrique, 2 pour la suivante…',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1).error('L\'ordre est un nombre entier à partir de 1.'),
    }),
    defineField({
      name: 'descriptionFr',
      title: 'Description (français)',
      description: 'Facultatif.',
      type: 'text',
      rows: 3,
      components: { input: ChampLtr },
    }),
  ],
  orderings: [
    { title: 'Ordre de la revue', name: 'ordreAsc', by: [{ field: 'ordre', direction: 'asc' }] },
  ],
  preview: {
    select: { titleNko: 'titleNko', titleFr: 'titleFr', ordre: 'ordre' },
    prepare: ({ titleNko, titleFr, ordre }) => ({
      title: titleNko || titleFr || 'Rubrique sans titre',
      subtitle: [titleFr, typeof ordre === 'number' ? `ordre ${ordre}` : null].filter(Boolean).join(' · '),
    }),
  },
});
