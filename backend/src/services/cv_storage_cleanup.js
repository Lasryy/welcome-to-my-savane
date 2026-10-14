const fs = require("node:fs/promises");
const path = require("node:path");
const pool = require("../db/pool");
const { CV_STORAGE_DIR } = require("../config/cv");

const CV_FILENAME_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/;
const DEFAULT_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

// Deletes only old UUID PDFs that have no metadata record; referenced versions are kept.
async function cleanupUnusedCvFiles({
  storageDir = CV_STORAGE_DIR,
  gracePeriodMs = DEFAULT_GRACE_PERIOD_MS,
  now = Date.now(),
} = {}) {
  let entries;
  try {
    entries = await fs.readdir(storageDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return { removedCount: 0 };
    throw error;
  }

  const result = await pool.query("SELECT storage_key FROM cv_documents");
  const referencedKeys = new Set(result.rows.map((row) => row.storage_key));
  let removedCount = 0;

  for (const entry of entries) {
    if (!entry.isFile() || !CV_FILENAME_PATTERN.test(entry.name) || referencedKeys.has(entry.name)) {
      continue;
    }

    const filePath = path.join(storageDir, entry.name);
    const file = await fs.stat(filePath);
    if (now - file.mtimeMs < gracePeriodMs) continue;

    await fs.unlink(filePath);
    removedCount += 1;
  }

  return { removedCount };
}

module.exports = { cleanupUnusedCvFiles, DEFAULT_GRACE_PERIOD_MS };
