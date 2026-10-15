const pool = require("../db/pool");
const {
  isRecord,
  nullablePositiveId,
  nullableSalary,
  parseId,
  stringField,
} = require("./admin_validation");
const { parsePagination, paginated } = require("./pagination");

const CONTRACT_TYPES = new Set(["internship", "apprenticeship", "permanent", "fixed_term", "other"]);
const WORKING_TIMES = new Set(["full_time", "part_time"]);
const STATUSES = new Set(["published", "closed"]);
const ADMIN_STATUSES = new Set(["all", ...STATUSES]);
const SALARY_PERIODS = new Set(["month", "year"]);
const AD_FIELDS = [
  "title",
  "short_description",
  "description",
  "location",
  "company_id",
  "category_id",
  "salary_min",
  "salary_max",
  "salary_period",
  "contract_type",
  "working_time",
  "status",
];

const AD_SELECT = `
  SELECT
    ads.id, ads.title, ads.short_description, ads.description, ads.location,
    ads.company_id, companies.name AS company_name, companies.location AS company_location,
    ads.category_id, categories.name AS category_name,
    ads.salary_min, ads.salary_max, ads.salary_period,
    ads.contract_type, ads.working_time, ads.status, ads.created_at
  FROM ads
  JOIN companies ON companies.id = ads.company_id
  LEFT JOIN categories ON categories.id = ads.category_id
`;

function enumValue(value, field, allowedValues, { required = false } = {}) {
  const isMissing = value === undefined || value === null || value === "";
  if (isMissing) {
    if (required) {
      return { error: `${field} est obligatoire.` };
    }

    return { value: null };
  }

  const isAllowed = typeof value === "string" && allowedValues.has(value);
  if (!isAllowed) {
    return { error: `${field} doit être l’une des valeurs autorisées.` };
  }

  return { value };
}

function validateAd(body, { partial = false } = {}) {
  if (!isRecord(body)) {
    return { error: "Le corps de la requête doit être un objet JSON." };
  }

  const values = {};
  const definitions = {
    title: () => stringField(body.title, "Le titre", { required: !partial, maxLength: 200, nullable: false }),
    short_description: () => stringField(body.short_description, "Le résumé", { maxLength: 500 }),
    description: () => stringField(body.description, "La description", { required: !partial, maxLength: 100000, nullable: false }),
    location: () => stringField(body.location, "La localisation", { maxLength: 255 }),
    company_id: () => nullablePositiveId(body.company_id, "L’entreprise", { required: !partial }),
    category_id: () => nullablePositiveId(body.category_id, "La catégorie"),
    salary_min: () => nullableSalary(body.salary_min, "Le salaire minimum"),
    salary_max: () => nullableSalary(body.salary_max, "Le salaire maximum"),
    salary_period: () => enumValue(body.salary_period, "La période de salaire", SALARY_PERIODS, { required: !partial }),
    contract_type: () => enumValue(body.contract_type, "Le type de contrat", CONTRACT_TYPES),
    working_time: () => enumValue(body.working_time, "Le temps de travail", WORKING_TIMES),
    status: () => enumValue(body.status, "Le statut", STATUSES, { required: !partial }),
  };

  for (const field of AD_FIELDS) {
    const fieldWasSent = Object.prototype.hasOwnProperty.call(body, field);
    if (partial && !fieldWasSent) {
      continue;
    }

    const result = definitions[field]();
    if (result.error) {
      return result;
    }

    values[field] = result.value;
  }

  const hasBothSalaries = values.salary_min != null && values.salary_max != null;
  const minimumExceedsMaximum = hasBothSalaries && values.salary_min > values.salary_max;
  if (minimumExceedsMaximum) {
    return { error: "Le salaire minimum doit être inférieur ou égal au salaire maximum." };
  }

  const hasNoFieldsToUpdate = partial && Object.keys(values).length === 0;
  if (hasNoFieldsToUpdate) {
    return { error: "Indiquez au moins un champ à modifier." };
  }

  return { value: values };
}

function parseOptionalId(value, label) {
  const isMissing = value === undefined || value === "";
  if (isMissing) {
    return { value: null };
  }

  const id = parseId(value);
  if (id === null) {
    return { error: `Le filtre ${label} est invalide.` };
  }

  return { value: id };
}

function databaseError(res, error, context) {
  if (error.code === "23503") {
    return res.status(409).json({ message: "L’entreprise ou la catégorie sélectionnée n’existe plus." });
  }

  if (error.code === "23505") {
    return res.status(409).json({ message: "Cette modification entre en conflit avec une donnée existante." });
  }

  console.error(`${context}:`, error);
  return res.status(500).json({ message: "Une erreur interne est survenue." });
}

async function getAdminAds(req, res) {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ message: pagination.error });
  const { page, pageSize, offset } = pagination.value;
  const { status = "all", q = "", contract_type: contractType } = req.query;
  if (!ADMIN_STATUSES.has(status)) {
    return res.status(400).json({ message: "Le filtre status accepte all, published ou closed." });
  }

  const hasValidQuery = typeof q === "string" && q.length <= 200;
  if (!hasValidQuery) {
    return res.status(400).json({ message: "Le texte de recherche est invalide ou trop long (200 caractères maximum)." });
  }

  const hasContractFilter = contractType !== undefined && contractType !== "";
  if (hasContractFilter && !CONTRACT_TYPES.has(contractType)) {
    return res.status(400).json({ message: "Le filtre contract_type est invalide." });
  }

  const company = parseOptionalId(req.query.company_id, "company_id");
  const category = parseOptionalId(req.query.category_id, "category_id");
  if (company.error || category.error) {
    const validationMessage = company.error || category.error;
    return res.status(400).json({ message: validationMessage });
  }

  // Sort columns come from this allow-list; request values never enter SQL directly.
  const sortOptions = {
    recent: "ads.created_at DESC, ads.id DESC",
    oldest: "ads.created_at ASC, ads.id ASC",
    title: "ads.title ASC, ads.id ASC",
    company: "companies.name ASC, ads.title ASC",
  };
  const sort = req.query.sort || "recent";
  if (!Object.hasOwn(sortOptions, sort)) {
    return res.status(400).json({ message: "Le tri demandé n’est pas pris en charge." });
  }

  const conditions = ["ads.status IN ('published', 'closed')"];
  const values = [];

  function addFilter(column, value) {
    values.push(value);
    conditions.push(`${column} = $${values.length}`);
  }

  if (status !== "all") {
    addFilter("ads.status", status);
  }
  if (contractType) {
    addFilter("ads.contract_type", contractType);
  }
  if (company.value !== null) {
    addFilter("ads.company_id", company.value);
  }
  if (category.value !== null) {
    addFilter("ads.category_id", category.value);
  }

  const searchText = q.trim();
  if (searchText) {
    values.push(`%${searchText}%`);
    const searchParameter = `$${values.length}`;
    conditions.push(`(
      ads.title ILIKE ${searchParameter}
      OR companies.name ILIKE ${searchParameter}
      OR COALESCE(ads.location, '') ILIKE ${searchParameter}
      OR COALESCE(ads.short_description, '') ILIKE ${searchParameter}
    )`);
  }

  try {
    const where = `WHERE ${conditions.join(" AND ")}`;
    const count = await pool.query(
      `SELECT COUNT(*)::int AS total FROM ads JOIN companies ON companies.id = ads.company_id LEFT JOIN categories ON categories.id = ads.category_id ${where}`,
      values,
    );
    const result = await pool.query(
      `${AD_SELECT} ${where} ORDER BY ${sortOptions[sort]} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, pageSize, offset],
    );
    const hasPagination = req.query.page !== undefined || req.query.page_size !== undefined;
    return res.status(200).json(hasPagination
      ? paginated(result.rows, page, pageSize, count.rows[0].total)
      : result.rows);
  } catch (error) {
    return databaseError(res, error, "Error while fetching admin ads");
  }
}

async function createAdminAd(req, res) {
  const { value, error: validationError } = validateAd(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const values = AD_FIELDS.map((field) => value[field] ?? null);
  const placeholders = AD_FIELDS.map((field, index) => `$${index + 1}`).join(", ");

  try {
    const created = await pool.query(
      `INSERT INTO ads (${AD_FIELDS.join(", ")}) VALUES (${placeholders}) RETURNING id`,
      values,
    );
    const result = await pool.query(`${AD_SELECT} WHERE ads.id = $1`, [created.rows[0].id]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return databaseError(res, error, "Error while creating admin ad");
  }
}

async function getAdminAdById(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de l’offre est invalide." });
  }

  try {
    const result = await pool.query(`${AD_SELECT} WHERE ads.id = $1`, [id]);
    if (!result.rowCount) {
      return res.status(404).json({ message: "Offre introuvable." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return databaseError(res, error, "Error while fetching admin ad");
  }
}

async function updateAdminAd(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de l’offre est invalide." });
  }

  const isPartialUpdate = req.method === "PATCH";
  const { value, error: validationError } = validateAd(req.body, { partial: isPartialUpdate });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const fields = Object.keys(value);
  const values = fields.map((field) => value[field]);
  values.push(id);
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");

  try {
    const result = await pool.query(
      `UPDATE ads SET ${assignments} WHERE id = $${values.length} RETURNING id`,
      values,
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Offre introuvable." });
    }

    const updated = await pool.query(`${AD_SELECT} WHERE ads.id = $1`, [id]);
    return res.status(200).json(updated.rows[0]);
  } catch (error) {
    return databaseError(res, error, "Error while updating admin ad");
  }
}

async function deleteAdminAd(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de l’offre est invalide." });
  }

  try {
    // ON DELETE RESTRICT also protects applications submitted during deletion.
    const result = await pool.query("DELETE FROM ads WHERE id = $1 RETURNING id", [id]);
    if (!result.rowCount) {
      return res.status(404).json({ message: "Offre introuvable." });
    }

    return res.status(204).end();
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        message: "Cette offre est liée à une ou plusieurs candidatures et ne peut pas être supprimée. Vous pouvez la fermer pour arrêter les nouvelles candidatures.",
      });
    }

    return databaseError(res, error, "Error while deleting admin ad");
  }
}

module.exports = { getAdminAds, getAdminAdById, createAdminAd, updateAdminAd, deleteAdminAd, validateAd };
