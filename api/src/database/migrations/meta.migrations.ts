import { Migration } from './migrations.source';
import { Knex } from 'knex';

export const generateMetaMigrations = (resourceName: string): Migration[] => [
  {
    name: `create_${resourceName}_records_and_history`,
    async up(knex: Knex) {
      const commonFields = (table: Knex.CreateTableBuilder) => {
        table.string('name', 255).checkRegex('^[a-z][a-z0-9-]*$').notNullable();

        // unstructured in database
        table.jsonb('metadata_annotations').notNullable();
        table.jsonb('metadata_labels').notNullable();
        table.jsonb('status').notNullable();

        //single string to represent current state
        table
          .string('state', 255)
          .checkRegex('^[a-z][a-z0-9-]*$')
          .notNullable();

        //spec is unstructured
        table.jsonb('spec').notNullable();

        //history
        table.uuid('revision_id').notNullable();
        table.datetime('revision_at', { useTz: true }).notNullable();
        table.string('revision_by', 255).notNullable();
        table.text('revision_message').nullable();
        table.uuid('revision_parent').nullable();
      };

      await knex.schema.createTable(`meta_${resourceName}`, (table) => {
        commonFields(table);
      });

      await knex.schema.createTable(`meta_${resourceName}_history`, (table) => {
        commonFields(table);
        table.primary(['name', 'revision_id']);
        //make sure bugs can't update history?
        //might need to be able to delete history?
        knex.raw(`REVOKE UPDATE ON meta_${resourceName}_history FROM optd`);
        knex.raw(`REVOKE UPDATE ON meta_${resourceName}_history FROM optd`);
      });
    },
    async down(knex: Knex) {
      await knex.schema.dropTable(`meta_${resourceName}_history`);
      await knex.schema.dropTable(`meta_${resourceName}`);
    },
  },
];
