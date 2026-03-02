import { defineType, defineField } from 'sanity';

// 🚀 C'est cette ligne "export default" qui provoquait l'erreur rouge dans index.ts
export default defineType({
  name: 'message',
  title: 'ߗߋߛߓߍ ߟߎ߬ (Messages)',
  type: 'document',
  icon: () => '📨',
  fields: [
    defineField({
      name: 'name',
      title: 'ߕߐ߮ (Nom de l\'expéditeur)',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'email',
      title: 'ߢߎߡߍߙߋ߲ߞߏ߲ߘߏ (Adresse E-mail)',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'content',
      title: 'ߗߋߛߓߍ ߞߣߐߘߐ (Contenu du message)',
      type: 'text',
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'ߗߏ߯ߦߊ (Statut de lecture)',
      type: 'string',
      options: {
        list: [
          { title: '🔴 ߡߊ߫ ߘߐߞߊ߬ߙߊ߲߬ (Non lu)', value: 'unread' },
          { title: '🟢 ߓߘߊ߫ ߘߐߞߊ߬ߙߊ߲߬ (Lu)', value: 'read' },
        ],
        layout: 'radio',
      },
      initialValue: 'unread',
    }),
    defineField({
      name: 'submittedAt',
      title: 'ߕߎ߬ߡߊ߬ߘߊ (Date de réception)',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      status: 'status',
    },
    prepare({ title, subtitle, status }) {
      const statusIcon = status === 'read' ? '🟢' : '🔴';
      return {
        title: `${statusIcon} ${title}`,
        subtitle: subtitle,
      };
    },
  },
});