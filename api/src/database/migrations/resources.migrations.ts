import { Migration } from './migrations.source';
import { Knex } from 'knex';

export const generateResourceMigrations = (
  resourceName: string,
): Migration[] => [
  {
    name: `create_${resourceName}_records_and_history`,
    async up(knex: Knex) {
      const commonFields = (table: Knex.CreateTableBuilder) => {
        table.string('name', 255).checkRegex('^[a-z][a-z0-9-]*$').notNullable();
        table
          .string('namespace', 255)
          .checkRegex('^[a-z][a-z0-9-]*$')
          .notNullable();

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

      await knex.schema.createTable(`resource_${resourceName}`, (table) => {
        commonFields(table);
        table.primary(['name', 'namespace']);
      });

      await knex.schema.createTable(
        `resource_${resourceName}_history`,
        (table) => {
          commonFields(table);
          table.primary(['name', 'namespace', 'revision_id']);
          //make sure bugs can't update history
          //might need to be able to delete history
          knex.raw(
            `REVOKE UPDATE ON resource_${resourceName}_history FROM optd`,
          );
          knex.raw(
            `REVOKE UPDATE ON resource_${resourceName}_history FROM optd`,
          );
        },
      );
    },
    async down(knex: Knex) {
      await knex.schema.dropTable(`resource_${resourceName}_history`);
      await knex.schema.dropTable(`resource_${resourceName}`);
    },
  },
  {
    name: `create_${resourceName}_execution_history`,
    async up(knex: Knex) {
      await knex.schema.alterTable(
        `resource_${resourceName}_history`,
        (table) => {
          table.unique('revision_id');
        },
      );
      await knex.schema.createTable(
        `resource_${resourceName}_execution_history`,
        (table) => {
          table.uuid('id').primary();
          table.datetime('started_at', { useTz: true }).notNullable();
          table.datetime('ended_at', { useTz: true }).notNullable();
          table.jsonb('stdout').notNullable();
          table.jsonb('stderr').notNullable();
          table.smallint('exit_code').notNullable();
          table
            .uuid('script_revision')
            .references(`resource_${resourceName}_history.revision_id`)
            .notNullable();
          table.string('event_name', 255).notNullable();
        },
      );
    },
    async down(knex: Knex) {
      return knex.schema.dropTable(
        `resource_${resourceName}_execution_history`,
      );
    },
  },
];
