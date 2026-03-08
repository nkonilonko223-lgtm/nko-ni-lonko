import { defineField, defineType } from 'sanity';
import React from 'react'; // 🚀 IMPORT VITAL : Moteur d'interface RTL

// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKO - SCHÉMA AUTEUR (1/1000 SCIENTIFIQUE)
// ============================================================================

export default defineType({
  name: 'author',
  title: 'Auteur / ߛߓߍߦߟߊ',
  type: 'document',
  icon: () => '🧑‍🔬',
  
  // 🚀 L'Interface Cinématique (Les Onglets d'Édition)
  groups: [
    { name: 'profile', title: '👤 ߡߊ߬ߟߐ߲ / Profil & Rôle', default: true },
    { name: 'bio', title: '✍️ ߞߊ߲߬ߛߓߍ / Biographie' },
    { name: 'social', title: '🌐 ߞߙߏ߬ߝߏ ߟߎ߬ / Réseaux Sociaux' },
  ],

  fields: [
    // =========================================================================
    // 👤 ONGLET : PROFIL, RÔLE & EXPERTISE (PROFILE)
    // =========================================================================
    defineField({
      name: 'name',
      title: 'Nom complet / ߕߐ߮ ߘߝߊߣߍ߲',
      type: 'string',
      group: 'profile',
      validation: (Rule) => Rule.required().error('ߕߐ߮ ߦߋ߫ ߘߌߦߊߜߏߦߊ ߟߋ߬ ߘߌ߫ / Le nom est obligatoire'),
    }),
    
   defineField({
      name: 'nameNko',
      title: "Nom complet (N'Ko) / ߒߞߏ ߕߐ߮",
      type: 'string',
      group: 'profile',
      // 🚀 BIDI ENGINE : Force l'alignement à droite dans le Studio
      components: {
        input: (props: import('sanity').StringInputProps) => 
          React.createElement('div', { dir: 'rtl', style: { textAlign: 'right' } }, props.renderDefault(props))
      }
    }),
    
    defineField({
      name: 'slug',
      title: 'Identifiant URL (Slug) / ߛߟߐߜ߭',
      type: 'slug',
      group: 'profile',
      options: { source: 'name', maxLength: 96 },
      // 🚀 Le Bouclier URL (Protège les liens du site)
      validation: (Rule) => Rule.required()
        .custom((slug) => {
          if (slug && slug.current && /[^a-z0-9-]/.test(slug.current)) {
            return "ߛߓߍߘߋ߲ ߜߘߍ߫ ߞߊߣߊ߬ ߟߊߓߊ߯ߙߊ߫ ߦߊ߲߬ ߝߏ߫ ߟߊ߬ߕߍ߲ / Le lien ne doit contenir que des minuscules sans accents et des tirets";
          }
          return true;
        })
        .error('ߛߟߐߜ߭ ߦߋ߫ ߘߌߦߊߜߏߦߊ ߟߋ߬ ߘߌ߫ / Le slug est obligatoire'),
    }),
   defineField({
      name: 'role',
      title: 'Rôle ou Titre / ߗߋߘߊ',
      description: "Ex: Chercheur en Physique, Astrophysicien...",
      type: 'string',
      group: 'profile',
    }),

    // 🚀 NOUVEAU : Rôle traduit en N'Ko (Dogme 1)
    defineField({
      name: 'roleNko',
      title: 'Rôle (N\'Ko) / ߒߞߏ ߗߋߘߊ',
      description: "Ex: ߘߐ߬ߞߏ ߟߐ߲ߞߏߕߌ߮...",
      type: 'string',
      group: 'profile',
      components: {
        input: (props: import('sanity').StringInputProps) => 
          React.createElement('div', { dir: 'rtl', style: { textAlign: 'right' } }, props.renderDefault(props))
      }
    }),

    // 🚀 NOUVEAU : Champ Institution (100% Optionnel)
    defineField({
      name: 'institution',
      title: 'Institution ou Affiliation (Optionnel) / ߘߋ߬ߙߌ߬ߘߊ',
      description: "Laissez vide si l'auteur n'est rattaché à aucune université ou centre. Rien ne s'affichera sur le site si ce champ est vide. / ߣߴߊ߬ ߕߍ߫ ߘߋ߬ߙߌ߬ߘߊ߫ ߜߘߍ߫ ߟߊ߫߸ ߊ߬ ߕߏ߫ ߘߊ߲߬ߠߊ߫",
      type: 'string',
      group: 'profile',
    }),

    // 🚀 NOUVEAU : Identifiant ORCID (100% Optionnel, avec sécurité Regex implacable)
    defineField({
      name: 'orcid',
      title: 'Identifiant Scientifique ORCID (Optionnel) / ߟߐ߲ߞߏߕߌ߯ ߡߊߟߐ߲߫ ߜߋ߲',
      description: "Ex: 0000-0002-1825-0097. Laissez vide si l'auteur n'en a pas. Attribuera le badge officiel.",
      type: 'string',
      group: 'profile',
      validation: (Rule) => Rule.custom((orcid) => {
        // S'il est vide, on laisse passer (100% Optionnel)
        if (!orcid) return true;
        // S'il est rempli, on exige la perfection mathématique du format ORCID
        if (!/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcid)) {
          return "ߊ߬ ߛߓߍߢߊ ߓߍ߲߬ߣߍ߲߫ ߕߍ߫ / Format invalide. L'ORCID doit ressembler à 0000-0000-0000-000X";
        }
        return true;
      })
    }),

    // 🚀 NOUVEAU : Domaines d'Expertise (100% Optionnel)
    defineField({
      name: 'expertise',
      title: 'Domaines d\'expertise / ߟߐ߲ߞߏ ߓߏߟߏ߲ ߠߎ߬',
      description: "Mots-clés de spécialité (ex: Physique Quantique, Virologie).",
      type: 'array',
      group: 'profile',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    defineField({
      name: 'image',
      title: 'Photo de profil / ߖߌ߬ߦߊ߬ߓߍ',
      type: 'image',
      group: 'profile',
      options: { hotspot: true },
    }),
// =========================================================================
    // ✍️ ONGLET : BIOGRAPHIE (BIO)
    // =========================================================================
   defineField({
      name: 'bio',
      title: 'Biographie courte (Français) / ߞߊ߲߬ߛߓߍ',
      description: "Une brève présentation de l'auteur (Max 200 caractères).",
      type: 'text',
      group: 'bio',
      rows: 3,
      validation: (Rule) => Rule.max(200).warning('La biographie ne doit pas dépasser 200 caractères pour le design.'),
      // 🚀 BIDI ENGINE : Verrouillage strict de l'alignement à gauche (LTR) pour le Français
      components: {
        input: (props: import('sanity').StringInputProps) => 
          React.createElement('div', { dir: 'ltr', style: { textAlign: 'left' } }, props.renderDefault(props))
      }
    }),

    // 🚀 NOUVEAU : Biographie en N'Ko (Dogme 1)
    defineField({
      name: 'bioNko',
      title: 'Biographie (N\'Ko) / ߒߞߏ ߞߊ߲߬ߛߓߍ',
      description: "ߛߓߍߦߟߊ ߟߊ߫ ߞߊ߲߬ߛߓߍ ߞߎߟߎ߲ߣߍ߲",
      type: 'text',
      group: 'bio',
      rows: 3,
      validation: (Rule) => Rule.max(200).warning('ߞߊ߲߬ߛߓߍ ߞߊߣߊ߬ ߕߊ߬ߡߌ߲߬ ߛߓߍߘߋ߲߫ ߂߀߀ ߟߊ߫'),
      components: {
        input: (props: import('sanity').StringInputProps) => 
          React.createElement('div', { dir: 'rtl', style: { textAlign: 'right' } }, props.renderDefault(props))
      }
    }),

    // =========================================================================
    // 🌐 ONGLET : RÉSEAUX SOCIAUX (SOCIAL)
    // =========================================================================
    defineField({
      name: 'socials',
      title: 'Réseaux Sociaux / ߞߙߏ߬ߝߏ ߟߎ߬',
      type: 'array',
      group: 'social',
      of: [
        {
          type: 'object',
          name: 'social',
          fields: [
            { 
              name: 'platform', 
              title: 'Plateforme / ߞߣߍ', 
              type: 'string',
              options: {
                list: [
                  { title: 'X (Twitter)', value: 'x' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'GitHub', value: 'github' },
                  // 🚀 NOUVEAU : Canaux de diffusion massifs
                  { title: 'WhatsApp', value: 'whatsapp' },
                  { title: 'TikTok', value: 'tiktok' },
                  { title: 'Telegram', value: 'telegram' }
                ]
              },
              validation: (Rule) => Rule.required().error('ߞߣߍ ߛߎߥߊ߲ߘߌ߫ / Veuillez choisir une plateforme')
            },
            { 
              name: 'url', 
              title: 'Lien (URL) / ߛߘߌ߬ߜߋ߲', 
              description: "ATTENTION : Le lien doit OBLIGATOIREMENT commencer par https:// (Ex: https://wa.me/223... ou https://www.tiktok.com/...)", // 🚀 NOUVEAU : La notice anti-erreur
              type: 'url',
              // 🚀 Le Verrouillage de Sécurité URL
              validation: (Rule) => Rule.uri({
                scheme: ['http', 'https']
              }).required().error('ߛߘߌ߬ߜߋ߲ ߓߍ߲߬ߣߍ߲߫ ߕߍ߫ / URL invalide, n\'oubliez pas le https://')
            }
          ]
        }
      ]
    })
  ],
  
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'image' },
  },
});