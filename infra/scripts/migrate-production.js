const { resolve } = require("node:path");
const migrationRunner = require("node-pg-migrate").default;

// Espelha o `infra/database.js`, para que as migrations rodem com a mesma
// conexão da aplicação e não dependam de uma DATABASE_URL separada.
function getConnection() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  return {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  };
}

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return { ca: process.env.POSTGRES_CA };
  }

  return process.env.NODE_ENV === "production";
}

async function runPendingMigrations() {
  const migratedMigrations = await migrationRunner({
    databaseUrl: getConnection(),
    dir: resolve("infra", "migrations"),
    direction: "up",
    migrationsTable: "pgmigrations",
    dryRun: false,
  });

  console.log(
    migratedMigrations.length === 0
      ? "Nenhuma migration pendente."
      : `Migrations aplicadas: ${migratedMigrations.map((migration) => migration.name).join(", ")}`,
  );
}

runPendingMigrations().catch((error) => {
  console.error("Não foi possível rodar as migrations:", error);
  process.exit(1);
});
