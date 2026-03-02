import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'subscriber',
  title: 'ߡߊ߬ߝߘߎ߬ߟߋ߲ ߠߎ߬ (Abonnés)',
  type: 'document',
  icon: () => '📧',
  fieldsets: [
    { 
      name: 'identity', 
      title: 'ߦߙߍ߬ߕߞߌ߬ߦߊ ߡߊ߬ߟߐ߲ (Identité Souveraine)', 
      options: { collapsible: true, collapsed: false } 
    },
    { 
      name: 'deliverability', 
      title: 'ߗߋߦߊߟߌ ߗߏ߯ߦߊ (Statut de Délivrabilité)', 
      options: { collapsible: true, collapsed: false } 
    },
    { 
      name: 'tracking', 
      title: 'ߕߊ߯ߛߌߟߊ ߣߌ ߞߎ߬ߘߎ߲  (Traçabilité & Segmentation)', 
      options: { collapsible: true, collapsed: true } 
    },
  ],
  fields: [
    // --- BLOC 1 : IDENTITÉ SOUVERAINE ---
    defineField({
      name: 'email',
      title: 'ߞߘߎߡߊ (Adresse E-mail)',
      type: 'string',
      fieldset: 'identity',
      validation: (Rule) => 
        Rule.required()
          .regex(
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
            { name: 'email', invert: false }
          )
          .error('ߞߘߎߡߊ ߓߘߍ ߡߊߢߌߣߌ߲ߣߍ߲ ߠߋ߬ ߘߏ߲߬ (Une adresse e-mail valide est exigée)'),
    }),
    defineField({
      name: 'firstName',
      title: 'ߕߐ߮ (Prénom)',
      type: 'string',
      fieldset: 'identity',
    }),
    defineField({
      name: 'languagePreference',
      title: 'ߞߊ߲ ߛߎߥߊ߲ߘߌߣߍ߲ (Langue Préférée)',
      type: 'string',
      fieldset: 'identity',
      options: {
        list: [
          { title: 'ߒߞߏ (N\'Ko)', value: 'nko' },
          { title: 'Français', value: 'fr' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'nko',
      validation: (Rule) => Rule.required(),
    }),

    // --- BLOC 2 : DÉLIVRABILITÉ ---
    defineField({
      name: 'status',
      title: 'ߛߌ߬ߣߦߊ߬ߟߌ ߗߏ߯ߦߊ (Statut de l\'abonnement)',
      type: 'string',
      fieldset: 'deliverability',
      description: 'Le standard 1/1000 exige un contrôle strict pour protéger le nom de domaine.',
      options: {
        list: [
          { title: '🟡 ߡߊ߬ߞߐ߬ߣߐ߲߬ߠߌ߲ (En attente de confirmation / Double Opt-in)', value: 'pending' },
          { title: '🟢 ߌ ߓߘߊ߫ ߕߘߍ߬ (Vérifié & Actif)', value: 'verified' },
          { title: '⚪ ߓߐߟߌ (Désabonné)', value: 'unsubscribed' },
          { title: '🔴 ߗߌߙߏ߲ߣߍ߲ (Rejeté / Bounce)', value: 'bounced' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),

    // --- BLOC 3 : TRAÇABILITÉ & SEGMENTATION ---
    defineField({
      name: 'source',
      title: 'ߛߎ߲ (Source d\'inscription)',
      type: 'string',
      fieldset: 'tracking',
      initialValue: 'footer',
      readOnly: true,
    }),
    defineField({
      name: 'tags',
      title: 'ߞߛߊߞߊ (Centres d\'intérêt / Tags)',
      type: 'array',
      fieldset: 'tracking',
      of: [{ type: 'string' }],
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
      name: 'subscribedAt',
      title: 'ߕߎ߬ߡߊ߬ߘߊ (Date d\'inscription)',
      type: 'datetime',
      fieldset: 'tracking',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'languagePreference',
      status: 'status',
    },
    prepare({ title, subtitle, status }) {
      const statusIcon = 
        status === 'verified' ? '🟢' : 
        status === 'pending' ? '🟡' : 
        status === 'unsubscribed' ? '⚪' : '🔴';
      
      const lang = subtitle === 'nko' ? 'ߒߞߏ' : 'FR';
      
      return {
        title: title,
        subtitle: `${statusIcon} ${lang}`,
      };
    },
  },
});