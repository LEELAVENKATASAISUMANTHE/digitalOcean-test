/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Create roles table
  await knex.schema.createTable('roles', (table) => {
    table.increments('role_id').primary();
    table.string('role_name', 50).notNullable();
    table.text('role_description');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // 2. Create permissions table
  await knex.schema.createTable('permissions', (table) => {
    table.increments('permission_id').primary();
    table.string('permission_name', 100).notNullable();
    table.string('module', 50);
    table.text('description');
  });

  // 3. Create role_permissions table (Many-to-Many link)
  await knex.schema.createTable('role_permissions', (table) => {
    table.integer('role_id').unsigned().notNullable()
      .references('role_id').inTable('roles')
      .onDelete('CASCADE');
    table.integer('permission_id').unsigned().notNullable()
      .references('permission_id').inTable('permissions')
      .onDelete('CASCADE');
    
    // Composite Primary Key
    table.primary(['role_id', 'permission_id']);
  });

  // 4. Create users table
  await knex.schema.createTable('users', (table) => {
    table.increments('user_id').primary();
    table.string('username', 100).notNullable().unique();
    table.text('password_hash').notNullable();
    table.string('email', 150).unique();
    table.string('full_name', 200);
    
    // Foreign Key to roles
    table.integer('role_id').unsigned()
      .references('role_id').inTable('roles')
      .onDelete('SET NULL'); // or CASCADE depending on requirement

    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('last_login', { useTz: true });
  });

  // 5. Create student_users table (1-to-1 link for student specific users)
  await knex.schema.createTable('student_users', (table) => {
    // Assuming student_id comes from an external students table not shown in this specific diagram snippet,
    // but usually it's an integer. If it's a PK here, we define it as such.
    table.integer('student_id').notNullable(); 
    
    table.integer('user_id').unsigned().notNullable()
      .references('user_id').inTable('users')
      .onDelete('CASCADE');

    // Based on the key icons in the diagram, both might be part of a composite key 
    // or user_id is a unique key to ensure 1:1 mapping.
    table.primary(['student_id', 'user_id']);
    table.unique('user_id'); // Ensures one user maps to only one student record
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop tables in reverse order of creation to avoid foreign key constraint errors
  await knex.schema.dropTableIfExists('student_users');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
};
