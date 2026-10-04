import { defineField, defineType } from 'sanity';
import { defineIncomingReferenceDecoration } from 'sanity/structure';
import React from 'react';

// ============================================================================
// N'KO NI LONKO — Terme du lexique (dictionnaire scientifique N'Ko – français)
// ============================================================================
// Un terme est défini UNE seule fois, puis relié depuis le texte des articles.
// Corriger une définition ici la corrige dans tous les articles.
// ============================================================================

// Champ saisi de droite à gauche (N'Ko)
const ChampRtl = (props: import('sanity').StringInputProps) =>
  React.createElement('div', { dir: 'rtl', style: { textAlign: 'right' } }, props.renderDefault(props));

// Champ saisi de gauche à droite (français) : le Studio hérite du sens « rtl » du site
const ChampLtr = (props: import('sanity').InputProps) =>
  React.createElement('div', { dir: 'ltr', style: { textAlign: 'left' } }, props.renderDefault(props));

// Avertit si un autre terme porte déjà le même nom (évite les doublons, surtout lors des imports)
const regleDoublon = (champ: 'termeFr' | 'termeNko') => (rule: import('sanity').StringRule) =>
  rule
    .custom(async (valeur, context) => {
      if (typeof valeur !== 'string' || !valeur.trim()) return true;
      const idBrut = context.document?._id || '';
      const id = idBrut.startsWith('drafts.') ? idBrut.slice('drafts.'.length) : idBrut;
      const doublon = await context
        .getClient({ apiVersion: '2025-02-19' })
        .fetch(
          `*[_type == "terme" && lower(${champ}) == lower($valeur) && !(_id in [$id, "drafts." + $id])][0]._id`,
          { valeur: valeur.trim(), id }
        );
      return doublon ? "Un autre terme du lexique porte déjà ce nom : vérifiez qu'il ne s'agit pas d'un doublon." : true;
    })
    .warning();

export default defineType({
  name: 'terme',
  title: 'ߞߎߡߊߘߋ߲߫ ߛߙߍߘߍ / Lexique',
  type: 'document',
  icon: () => '📖',
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
        ? { message: "Ce champ contient du texte non normalisé (NFC). Signalez-le avant publication.", path: [fautif[0]] }
        : true;
    }).warning(),
  // 🔒 Information éditoriale réservée à la rédaction (jamais affichée sur le site public)
  renderMembers: (members) => [
    ...members,
    defineIncomingReferenceDecoration({
      name: 'articlesQuiUtilisent',
      title: 'Utilisé dans ces articles',
      description: 'Visible seulement dans le Studio (rédaction). Ces liens ne sont pas publics.',
      types: [{ type: 'article' }],
      creationAllowed: false,
    }),
  ],
  fields: [
    defineField({
      name: 'termeNko',
      title: 'Terme (N\'Ko)',
      type: 'string',
      validation: (rule) => [
        rule.required().error('Le terme en N\'Ko est obligatoire.'),
        regleDoublon('termeNko')(rule),
      ],
      components: { input: ChampRtl },
    }),
    defineField({
      name: 'termeFr',
      title: 'Terme (français)',
      type: 'string',
      validation: (rule) => [
        rule.required().error('Le terme en français est obligatoire.'),
        regleDoublon('termeFr')(rule),
      ],
      components: { input: ChampLtr },
    }),
    defineField({
      name: 'definitionNko',
      title: 'Définition (N\'Ko)',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().error('La définition en N\'Ko est obligatoire.'),
      components: { input: ChampRtl },
    }),
    defineField({
      name: 'definitionFr',
      title: 'Définition (français)',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().error('La définition en français est obligatoire.'),
      components: { input: ChampLtr },
    }),
    defineField({
      name: 'domaine',
      title: 'ߡߊ߬ߘߎ߮ / Domaine',
      type: 'string',
      options: {
        list: [
          { title: 'ߛߊ߲ߡߊߛߓߍߟߐ߲ߘߐߦߊ / Astronomie', value: 'ߛߊ߲ߡߊߛߓߍߟߐ߲ߘߐߦߊ' },
          { title: 'ߣߌߡߊߞߊߙߊ߲ / Biologie', value: 'ߣߌߡߊߞߊߙߊ߲' },
          { title: 'ߘߐ߬ߞߏ / Physique', value: 'ߘߐ߬ߞߏ' },
          { title: 'ߘߡߊ߬ߟߐ߲ / Mathématiques', value: 'ߘߡߊ߬ߟߐ߲' },
          { title: 'ߖߎ߯ߛߊߟߐ߲ߘߐߦߊ / Chimie', value: 'ߖߎ߯ߛߊߟߐ߲ߘߐߦߊ' },
          { title: 'ߘߎ߰ߘߐ߬ߟߐ߲ߘߐߦߊ / Géologie', value: 'ߘߎ߰ߘߐ߬ߟߐ߲ߘߐߦߊ' },
          { title: 'ߛߋߒߞߏߟߊߘߐߦߊ / Technologie', value: 'ߛߋߒߞߏߟߊߘߐߦߊ' },
          { title: 'ߘߐ߬ߝߐ / Histoire', value: 'ߘߐ߬ߝߐ' },
          { title: 'ߞߍ߲ߘߍߦߊ / Santé', value: 'ߞߍ߲ߘߍߦߊ' },
        ],
      },
    }),
    defineField({
      name: 'slug',
      title: 'Lien (slug)',
      description: "Créé à partir du terme français. Seulement a-z, chiffres et tirets (ex : trou-noir).",
      type: 'slug',
      options: { source: 'termeFr', maxLength: 96 },
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
  ],
  orderings: [
    { title: 'Terme français (A → Z)', name: 'termeFrAsc', by: [{ field: 'termeFr', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'termeNko', subtitle: 'termeFr' },
  },
});
