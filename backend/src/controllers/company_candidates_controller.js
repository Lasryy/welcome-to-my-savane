const pool = require("../db/pool");
const { parseId } = require("./admin_validation");
const { parsePagination, paginated } = require("./pagination");

const CANDIDATE_PAGE_SIZE = 12;

function getSearchFilter(query, values) {
  if (query.q !== undefined && typeof query.q !== "string") {
    return { error: "Le texte de recherche est invalide." };
  }

  const search = query.q?.trim() || "";
  if (search.length > 200) return { error: "Le texte de recherche est trop long." };
  if (!search) return { value: "" };

  values.push(`%${search}%`);
  return { value: `AND (
    people.first_name ILIKE $1 OR people.last_name ILIKE $1
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE projects.person_id = people.id
      AND (projects.title ILIKE $1 OR COALESCE(projects.description, '') ILIKE $1
        OR COALESCE(projects.project_url, '') ILIKE $1
        OR COALESCE(projects.repository_url, '') ILIKE $1)
    )
    OR EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.person_id = people.id
      AND (experiences.company_name ILIKE $1 OR experiences.job_title ILIKE $1
        OR COALESCE(experiences.description, '') ILIKE $1)
    )
  )` };
}

async function getCompanyCandidates(req, res) {
  const pagination = parsePagination(req.query, CANDIDATE_PAGE_SIZE);
  if (pagination.error) return res.status(400).json({ message: pagination.error });

  const values = [];
  const searchFilter = getSearchFilter(req.query, values);
  if (searchFilter.error) return res.status(400).json({ message: searchFilter.error });

  const filter = `WHERE people.role = 'USER'
    AND people.is_visible_to_recruiters = TRUE ${searchFilter.value}`;
  const { page, pageSize, offset } = pagination.value;

  try {
    const count = await pool.query(
      `SELECT COUNT(*)::int AS total FROM people ${filter}`,
      values,
    );
    const result = await pool.query(
      `SELECT people.id, people.first_name, people.last_name,
        (SELECT COUNT(*)::int FROM projects WHERE projects.person_id = people.id) AS project_count,
        (SELECT COUNT(*)::int FROM experiences WHERE experiences.person_id = people.id) AS experience_count
       FROM people ${filter}
       ORDER BY people.last_name ASC, people.first_name ASC, people.id ASC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, pageSize, offset],
    );
    return res.status(200).json(paginated(result.rows, page, pageSize, count.rows[0].total));
  } catch (error) {
    console.error("Error while searching company candidates:", error);
    return res.status(500).json({ message: "Impossible de charger l’annuaire de candidats." });
  }
}

async function getCompanyCandidate(req, res) {
  const personId = parseId(req.params.personId);
  if (personId === null) return res.status(400).json({ message: "L’identifiant du candidat est invalide." });

  try {
    const person = await pool.query(
      `SELECT id, first_name, last_name FROM people
       WHERE id = $1 AND role = 'USER' AND is_visible_to_recruiters = TRUE`,
      [personId],
    );
    if (!person.rowCount) return res.status(404).json({ message: "Profil candidat introuvable." });

    const [projects, experiences] = await Promise.all([
      pool.query(
        `SELECT id, title, description, project_url, repository_url
         FROM projects WHERE person_id = $1 ORDER BY id`,
        [personId],
      ),
      pool.query(
        `SELECT id, company_name, job_title, description, start_date, end_date
         FROM experiences WHERE person_id = $1 ORDER BY start_date DESC NULLS LAST, id DESC`,
        [personId],
      ),
    ]);

    return res.status(200).json({
      ...person.rows[0],
      projects: projects.rows,
      experiences: experiences.rows,
    });
  } catch (error) {
    console.error("Error while loading a company candidate:", error);
    return res.status(500).json({ message: "Impossible de charger le profil candidat." });
  }
}

module.exports = { getCompanyCandidates, getCompanyCandidate };
