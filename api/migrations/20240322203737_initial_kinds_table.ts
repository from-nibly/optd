import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
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
    table.string('state', 255).checkRegex('^[a-z][a-z0-9-]*$').notNullable();

    //spec is unstructured
    table.jsonb('spec').notNullable();

    //history
    table.uuid('revision_id').notNullable();
    table.datetime('revision_at', { useTz: true }).notNullable();
    table.string('revision_by', 255).notNullable();
    table.text('revision_message').nullable();
  };

  await knex.schema.createTable('meta_kind', (table) => {
    commonFields(table);
    table.primary(['name', 'namespace']);
  });

  await knex.schema.createTable('meta_kind_history', (table) => {
    commonFields(table);
    table.primary(['name', 'namespace', 'revision_id']);
    table.uuid('revision_parent').notNullable();
    //make sure bugs can't update history?
    //might need to be able to delete history?
    knex.raw('REVOKE UPDATE ON meta_kind_history FROM optd');
    knex.raw('REVOKE UPDATE ON meta_kind_history FROM optd');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meta_kind_history');
  await knex.schema.dropTable('meta_kind');
}
