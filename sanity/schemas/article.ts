import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'article',
  title: 'Articles / ߞߎߡߘߊ',
  type: 'document',
  // Icône pour le studio (facultatif mais sympa)
  icon: () => '📄',
  fields: [
    // --- 1. EN-TÊTE ---
    defineField({
      name: 'title',
      title: "Titre de l'article",
      description: "Titre en N'Ko (et Français entre parenthèses)",
      type: 'string',
      validation: (rule) => rule.required().min(10).warning("Un titre trop court est moins visible."),
    }),
    defineField({
      name: 'slug',
      title: 'Lien (Slug)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),

    // --- 2. CLASSIFICATION ---
    defineField({
      name: 'author',
      title: 'Auteur / ߛߓߍߦߟߊ',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (rule) => rule.required().error("Chaque article doit avoir un auteur."),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie / ߟߐ߲ߞߏ ߛߎ߯ߦߊ',
      type: 'string',
      options: {
        list: [
          // ✅ CORRECTION : Titres N'Ko mis à jour, 'value' préservée pour le Frontend
          { title: 'Astronomie / ߛߊ߲ߡߊߛߓߍߟߐ߲ߘߐߦߊ', value: 'Astronomie' },
          { title: 'Biologie / ߣߌߡߊߞߊߙߊ߲', value: 'Biologie' },
          { title: 'Physique / ߘߐ߬ߞߏ', value: 'Physique' },
          { title: 'Mathématiques / ߘߡߊ߬ߟߐ߲', value: 'Mathématiques' },
          { title: 'Chimie / ߖߎ߯ߛߊߟߐ߲ߘߐߦߊ', value: 'Chimie' },
          { title: 'Géologie / ߘߎ߰ߘߐ߬ߟߐ߲ߘߐߦߊ', value: 'Géologie' },
          { title: 'Technologie / ߛߋߒߞߏߟߊߘߐߦߊ', value: 'Technologie' }, 
          { title: 'Histoire / ߘߐ߬ߝߐ', value: 'Histoire' },
          { title: 'Santé / ߞߍ߲ߘߍߦߊ', value: 'Santé' },
        ],
        layout: 'radio' // Ou 'dropdown' si la liste devient longue
      },
      validation: (rule) => rule.required(),
    }),

    // --- 3. PRÉSENTATION ---
    defineField({
      name: 'mainImage',
      title: 'Image de couverture',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texte alternatif (SEO)',
          description: 'Description de l\'image pour les aveugles et Google.',
          validation: (rule) => rule.required().warning("L'alt text est crucial pour le SEO."),
        }
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Court Résumé (SEO)',
      description: "Ce texte apparaîtra sur Google et les partages Facebook/WhatsApp.",
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(200).required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),

    // --- 4. CORPS DU TEXTE ---
    defineField({
      name: 'body',
      title: 'Contenu complet',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          title: 'Image intégrée',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Légende',
              options: { isHighlighted: true }, // Affiche le champ directement dans l'éditeur
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Texte Alternatif',
              options: { isHighlighted: true },
            },
            {
              name: 'source',
              type: 'string',
              title: 'Source / Crédit photo (ex: NASA)', // ✨ Touche Pro
            }
          ],
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection;
      return { ...selection, subtitle: author ? `Par ${author}` : 'Sans auteur' };
    },
  },
});