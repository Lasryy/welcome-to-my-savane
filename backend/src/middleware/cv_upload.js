const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const { MAX_CV_SIZE } = require("../config/cv");

// Keep the upload in memory until its contents have been checked.
const upload = multer({
  defParamCharset: "utf8",
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CV_SIZE, files: 1, fields: 0, parts: 1 },
}).single("file");

function receiveCv(req, res, next) {
  if (!req.is("multipart/form-data")) {
    return res.status(400).json({ message: "Envoie le CV en multipart/form-data dans le champ file." });
  }

  upload(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Le CV ne peut pas dépasser 5 Mo." });
      }
      return res.status(400).json({ message: "Envoie un seul fichier dans le champ file, sans autre champ." });
    }
    return next();
  });
}

async function validateCv(req, res, next) {
  const file = req.file;
  if (!file || !file.size) {
    return res.status(400).json({ message: "Choisis un CV PDF non vide." });
  }

  if (file.mimetype !== "application/pdf" || !/\.pdf$/i.test(file.originalname)) {
    return res.status(415).json({ message: "Le CV doit être un fichier PDF (.pdf, application/pdf)." });
  }

  // A .pdf extension and a declared MIME type do not prove the file is a PDF.
  if (!/^%PDF-\d\.\d/.test(file.buffer.subarray(0, 8).toString("ascii"))) {
    return res.status(400).json({ message: "Le contenu du fichier n’est pas un PDF valide." });
  }

  try {
    const pdf = await PDFDocument.load(file.buffer, { throwOnInvalidObject: true });
    if (!pdf.getPageCount()) {
      return res.status(400).json({ message: "Le CV PDF doit contenir au moins une page." });
    }
  } catch (error) {
    return res.status(400).json({ message: "Le PDF est illisible, invalide ou protégé par un mot de passe." });
  }

  return next();
}

module.exports = { receiveCv, validateCv };
