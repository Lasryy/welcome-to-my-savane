const path = require("node:path");

const MAX_CV_SIZE = 5 * 1024 * 1024;
const CV_STORAGE_DIR = path.resolve(
  process.env.CV_STORAGE_DIR || path.join(__dirname, "../../storage/cv"),
);

module.exports = { MAX_CV_SIZE, CV_STORAGE_DIR };
