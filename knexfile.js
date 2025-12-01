export default {
  development: {
    client: "pg",
    connection: {
      host: "localhost",
      user: "postgres",
      password: "mythri@14",
      database: "placement"
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./migrations"
    }
  }
};
