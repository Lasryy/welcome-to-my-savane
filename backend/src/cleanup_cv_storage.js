const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const pool = require("./db/pool");
const { cleanupUnusedCvFiles } = require("./services/cv_storage_cleanup");

async function main() {
  try {
    const { removedCount } = await cleanupUnusedCvFiles();
    console.log(`${removedCount} fichier(s) CV orphelin(s) supprimé(s).`);
  } catch (error) {
    console.error("Impossible de nettoyer le stockage CV :", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
