import vine, { SimpleMessagesProvider } from '@vinejs/vine';

export const createTagSchema = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(30).unique(async (_, value) => {
      const existingTag = await import('#models/tag').then(({ default: Tag }) => Tag.findBy('name', value));
      return existingTag === null;
    }),
  }),
);

createTagSchema.messagesProvider = new SimpleMessagesProvider({
  'name.minLength': 'Le nom du tag doit faire au moins 2 caractères',
  'name.maxLength': 'Le nom du tag doit faire au plus 30 caractères',
  'name.unique': 'Ce tag existe déjà, veuillez en choisir un autre',
});

export const updateTagSchema = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(30).optional().unique(async (_, value) => {
      const existingTag = await import('#models/tag').then(({ default: Tag }) => Tag.findBy('name', value));
      return existingTag === null;
    }),
  }),
);

updateTagSchema.messagesProvider = new SimpleMessagesProvider({
  'name.minLength': 'Le nom du tag doit faire au moins 2 caractères',
  'name.maxLength': 'Le nom du tag doit faire au plus 30 caractères',
  'name.unique': 'Ce tag existe déjà, veuillez en choisir un autre',
});
