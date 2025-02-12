import { BaseSchema } from '@adonisjs/lucid/schema';

export default class Migration extends BaseSchema {
  protected tableName = 'tags';

  // eslint-disable-next-line @typescript-eslint/require-await
  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary().notNullable();
      table.uuid('uuid').notNullable().unique();

      table.string('name').notNullable().unique();

      table.timestamp('created_at').defaultTo(this.now());
      table.timestamp('updated_at').defaultTo(this.now());
    });

    // Ajout d'une clé étrangère dans la table todos pour la relation
    this.schema.alterTable('todos', (table) => {
      table.integer('tag_id').unsigned().nullable();
      table.foreign('tag_id').references('id').inTable('tags').onDelete('set null');
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async down() {
    this.schema.alterTable('todos', (table) => {
      table.dropForeign(['tag_id']);
      table.dropColumn('tag_id');
    });

    this.schema.dropTable(this.tableName);
  }
}
