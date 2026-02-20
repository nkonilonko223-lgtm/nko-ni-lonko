import { defineField, defineType } from 'sanity';

// 👇 C'est ce mot "default" qui est vital pour que l'import fonctionne
export default defineType({
  name: 'author',
  title: 'Auteur / ߛߓߍߦߟߊ',
  type: 'document',
  icon: () => '🧑‍🔬',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom complet',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'nameNko',
      title: "Nom complet (N'Ko)",
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Rôle / Titre',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Photo de profil',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bio',
      title: 'Biographie',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'socials',
      title: 'Réseaux Sociaux',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'social',
          fields: [
            { name: 'platform', title: 'Plateforme', type: 'string' },
            { name: 'url', title: 'Lien (URL)', type: 'url' }
          ]
        }
      ]
    })
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'image' },
  },
});