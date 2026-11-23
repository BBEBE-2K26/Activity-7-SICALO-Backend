require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../db");

async function setup() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");
    const seed = fs.readFileSync(path.join(__dirname, "..", "seed.sql"), "utf8");
    await pool.query(schema);
    await pool.query(seed);
    console.log("Database table is ready and seed data has been checked.");
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setup();