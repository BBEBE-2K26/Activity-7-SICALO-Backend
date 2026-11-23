const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Add it to your .env file before using database routes.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render PostgreSQL commonly requires SSL for external connections.
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

module.exports = pool;