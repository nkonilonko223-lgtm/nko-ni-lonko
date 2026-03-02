import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'article',
  title: 'Articles / ߞߎߡߘߊ',
  type: 'document',
  icon: () => '📄',
  groups: [
    { name: 'content', title: '✍️ ߛߓߍߟߌ / Rédaction', default: true },
    { name: 'media', title: '🖼️ ߖߌ߬ߦߊ߬ߓߍ / Médias' },
    { name: 'seo', title: '🚀 ߢߌߣߌ߲ߞߏ / SEO & Partage' },
  ],
  fields: [
    // =========================================================================
    // ✍️ ONGLET : RÉDACTION (CONTENT)
    // =========================================================================
    defineField({
      name: 'title',
      title: "Titre de l'article / ߞߎߡߘߊ ߕߐ߮",
      description: "Titre principal affiché sur le site / ߞߎߡߘߊ ߕߐ߮ ߓߊߖߎߡߊ",
      type: 'string',
      group: 'content',
      validation: (rule) => rule
        .required().error('ߞߎߡߘߊ ߕߐ߮ ߦߋ߫ ߘߌߦߊߜߏߦߊ ߟߋ߬ ߘߌ߫ / Le titre est obligatoire')
        .min(10).warning("ߕߐ߮ ߛߎߘߎ߲ߡߊ߲߫ ߞߏߖߎ߯ߦߊ߫ / Un titre trop court manque d'impact."),
    }),
    
    // 🚀 MULTI-PATERNITÉ (Tableau d'Auteurs)
    defineField({
      name: 'authors', 
      title: 'Auteur(s) / ߛߓߍߦߟߊ ߟߎ߬',
      type: 'array',
      group: 'content',
      of: [{ type: 'reference', to: [{ type: 'author' }] }],
      validation: (rule) => rule.required().min(1).error("ߛߓߍߦߟߊ ߦߋ߫ ߘߌߦߊߜߏߦߊ ߟߋ߬ ߘߌ߫ / Au moins un auteur est obligatoire."),
    }),
    
    defineField({
      name: 'category',
      title: 'Catégorie / ߟߐ߲ߞߏ ߛߎ߯ߦߊ',
      type: 'string',
      group: 'content',
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
        layout: 'radio'
      },
      validation: (rule) => rule.required().error('ߛߎ߯ߦߊ ߛߎߥߊ߲ߘߌ߫ / Veuillez choisir une catégorie'),
    }),

    defineField({
      name: 'tags',
      title: 'Mots-clés (Tags) / ߞߎߡߊߢߌ߲ ߠߎ߬',
      description: "Mots-clés pour classer l'article (ex: Espace, ADN, Gravité)",
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    defineField({
      name: 'publishedAt',
      title: 'Date de publication / ߟߊ߬ߖߍ߲߬ߛߍ߲߬ ߕߎߡߊ',
      type: 'datetime',
      group: 'content',
      initialValue: () => new Date().toISOString(),
    }),

    defineField({
      name: 'body',
      title: 'Contenu complet / ߞߣߘߐ ߘߝߊߣߍ߲',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.required().error('ߞߣߘߐ ߦߋ߫ ߘߌߦߊߜߏߦߊ ߟߋ߬ ߘߌ߫ / Le contenu de l\'article est obligatoire'),
      of: [
        {
          type: 'block',
          marks: {
            annotations: [
              // 1. LE LIEN STANDARD 
              {
                name: 'link',
                type: 'object',
                title: '🔗 Lien Externe',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (rule) => rule.required().uri({ scheme: ['http', 'https', 'mailto'] })
                  }
                ]
              },
              // 2. LE GLOSSAIRE (Divulgation Progressive)
              {
                name: 'definition',
                type: 'object',
                title: '💡 ߞߘߐߦߌߘߊ / Définition',
                fields: [
                  {
                    name: 'description',
                    type: 'text',
                    title: 'Explication scientifique / ߞߎߡߊߘߋ߲ ߞߘߐߦߌߘߊ',
                    description: 'Le texte qui apparaîtra dans la bulle interactive (Tooltip) pour le lecteur.',
                    rows: 3,
                    validation: (rule) => rule.required().error('ߞߘߐߦߌߘߊ ߦߋ߫ ߘߌߦߊߜߏߦߊ ߟߋ߬ ߘߌ߫ / La définition est requise.'),
                  }
                ]
              }
            ]
          }
        },
        // Les autres types de blocs
        {
          type: 'image',
          title: 'Image intégrée / ߖߌ߬ߦߊ߬ߓߍ',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Légende / ߖߌ߬ߦߊ߬ߓߍ ߞߘߐߟߊ߫ ߛߓߍ',
              options: { isHighlighted: true },
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Texte Alternatif / ߖߌ߬ߦߊ߬ߓߍ ߡߊ߲߬ߞߕߎ',
              options: { isHighlighted: true },
              validation: (rule) => rule.required().warning("L'alt text est fortement recommandé."),
            },
            {
              name: 'source',
              type: 'string',
              title: 'Source ou Crédit (ex: NASA) / ߓߐߛߎ߲',
              options: { isHighlighted: true },
            }
          ],
        },
        {
          type: 'latex',
          title: '🧮 ߘߡߊ߬ߟߐ߲ / Équation Mathématique',
        },
        {
          type: 'code',
          title: '💻 ߛߋߒߞߏߟߊߘߐߦߊ / Bloc de Code',
          options: { withFilename: true }
        },
        // 🚀 NOUVEAU : Bloc Vidéo YouTube
        {
          type: 'object',
          name: 'youtube',
          title: '▶️ Vidéo YouTube / ߖߌ߬ߦߊ߬ߖߟߎ',
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'Lien YouTube',
              description: "Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] })
            }
          ]
        },
        // 🚀 NOUVEAU : Bloc Encart Scientifique (Callout)
        {
          type: 'object',
          name: 'callout',
          title: '📌 Encart (Callout) / ߟߊ߬ߞߙߐ߬ߛߌ߬ߟߌ',
          fields: [
            {
              name: 'intent',
              type: 'string',
              title: 'Type d\'information',
              options: {
                list: [
                  { title: 'Information (Défaut)', value: 'info' },
                  { title: 'Avertissement / Attention', value: 'warning' },
                  { title: 'Succès / Validation', value: 'success' }
                ],
                layout: 'radio'
              },
              initialValue: 'info'
            },
            {
              name: 'text',
              type: 'text',
              title: 'Texte de l\'encart',
              rows: 3,
              validation: (rule) => rule.required()
            }
          ]
        }
      ],
    }),

    defineField({
      name: 'references',
      title: 'Sources & Bibliographie / ߦߟߌߡߊߛߙߋ ߟߎ߬',
      description: "Liste des sources scientifiques, livres ou articles de référence utilisés.",
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'referenceItem',
          fields: [
            { 
              name: 'title', 
              title: 'Titre de la source / ߓߐߛߎ߲ ߕߐ߮', 
              type: 'string', 
              validation: (rule) => rule.required().error('ߕߐ߮ ߦߋ߫ ߘߌߦߊߜߏߦߊ ߟߋ߬ ߘߌ߫ / Le titre de la source est requis') 
            },
            { 
              name: 'url', 
              title: 'Lien (URL optionnel) / ߛߘߌ߬ߜߋ߲', 
              type: 'url',
              validation: (rule) => rule.uri({ scheme: ['http', 'https'] }).warning("ߛߘߌ߬ߜߋ߲ ߓߍ߲߬ߣߍ߲߫ ߕߍ߫ / L'URL n'est pas sécurisée (doit commencer par http/https)")
            }
          ]
        }
      ]
    }),

    // =========================================================================
    // 🖼️ ONGLET : MÉDIAS (MEDIA)
    // =========================================================================
    defineField({
      name: 'mainImage',
      title: 'Image de couverture / ߢߊߝߍ߫ ߖߌߦߊߓߍ',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texte alternatif (SEO) / ߖߌ߬ߦߊ߬ߓߍ ߡߊ߲߬ߞߕߎ',
          description: 'Description de l\'image pour les aveugles et Google.',
          validation: (rule) => rule.required().error("ߖߌ߬ߦߊ߬ߓߍ ߡߊ߲߬ߞߕߎ ߦߋ߫ ߘߌߦߊߜߏߦߊ ߟߋ߬ ߘߌ߫ / L'alt text est absolument obligatoire pour l'accessibilité."),
        }
      ],
      validation: (rule) => rule.required().error('ߖߌ߬ߦߊ߬ߓߍ ߦߋ߫ ߘߌߦߊߜߏߦߊ ߟߋ߬ ߘߌ߫ / Une image de couverture est obligatoire'),
    }),

    // =========================================================================
    // 🚀 ONGLET : SEO & PARTAGE (SEO)
    // =========================================================================
    defineField({
      name: 'seoTitle',
      title: 'Titre SEO (Optionnel) / ߜ߭ߎߜ߭ߏߟ ߕߐ߮',
      description: "Si le titre principal est trop long pour Google, écrivez une version courte ici.",
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.max(60).warning("Un titre SEO de plus de 60 caractères sera coupé par Google."),
    }),

    defineField({
      name: 'slug',
      title: 'Lien (Slug) / ߛߟߐߜ߭',
      description: "ATTENTION : Utilisez des lettres latines (a-z) et des tirets (-) pour éviter de casser les liens. / ߛߓߍߘߋ߲ ߜߘߍ߫ ߞߊߣߊ߬ ߟߊߓߊ߯ߙߊ߫ ߦߊ߲߬ ߝߏ߫ ߟߊ߬ߕߍ߲",
      type: 'slug',
      group: 'seo',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required()
        .custom((slug) => {
          if (slug && slug.current && /[^a-z0-9-]/.test(slug.current)) {
            return "Le lien ne doit contenir que des minuscules sans accents et des tirets (ex: mon-article-science)";
          }
          return true;
        })
        .error('ߛߟߐߜ߭ ߦߋ߫ ߘߌߦߊߜߏߦߊ ߟߋ߬ ߘߌ߫ / Le slug est obligatoire'),
    }),

    defineField({
      name: 'excerpt',
      title: 'Court Résumé (SEO) / ߞߊ߲߬ߛߓߍ ߞߎߟߎ߲ߣߍ߲',
      description: "Ce texte apparaîtra sur Google et les partages Facebook/WhatsApp.",
      type: 'text',
      group: 'seo',
      rows: 3,
      validation: (rule) => rule
        .required().error('ߞߊ߲߬ߛߓߍ ߦߋ߫ ߘߌߦߊߜߏߦߊ ߟߋ߬ ߘߌ߫ / Le résumé est obligatoire')
        .max(200).warning('ߞߊ߲߬ߛߓߍ ߞߊߊ߬ ߕߊ߬ߡߌ߲߬ ߛߓߍߘߋ߲߫ ߂߀߀ ߟߊ߫ / Le résumé ne doit pas dépasser 200 caractères.'),
    }),
  ],

  // 🚀 PREVIEW
  preview: {
    select: {
      title: 'title',
      author: 'authors.0.name', 
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection;
      return { ...selection, subtitle: author ? `ߛߓߍߦߟߊ : ${author} / Par ${author} (et al.)` : 'Sans auteur' };
    },
  },
});