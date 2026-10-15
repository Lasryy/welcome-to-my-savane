/**
 * OpenAPI documentation for the routes mounted in src/app.js.
 * Request fields, response shapes, and status codes are based on the controllers.
 */

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: List the current candidate's projects
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200': { description: Projects owned by the current account, newest first. }
 *       '401': { description: Login required. }
 *       '500': { description: Database error. }
 *   post:
 *     tags: [Projects]
 *     summary: Add a project to the current candidate's profile
 *     description: Ownership is assigned from the session. The request cannot set person_id.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [title]
 *             properties:
 *               title: { type: string, minLength: 1, maxLength: 200 }
 *               description: { type: string, nullable: true, maxLength: 5000 }
 *               project_url: { type: string, nullable: true, maxLength: 500, format: uri }
 *               repository_url: { type: string, nullable: true, maxLength: 500, format: uri }
 *           example: { title: Portfolio, description: Site personnel, project_url: 'https://example.com', repository_url: 'https://github.com/example/site' }
 *     responses:
 *       '201': { description: Created project. }
 *       '400': { description: Invalid or unsupported fields. }
 *       '401': { description: Login required. }
 *       '500': { description: Database error. }
 * /api/projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Edit an owned project
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, minProperties: 1, additionalProperties: false, properties: { title: { type: string, maxLength: 200 }, description: { type: string, nullable: true, maxLength: 5000 }, project_url: { type: string, nullable: true, maxLength: 500, format: uri }, repository_url: { type: string, nullable: true, maxLength: 500, format: uri } } }
 *     responses:
 *       '200': { description: Updated project. }
 *       '400': { description: Invalid ID or fields. }
 *       '401': { description: Login required. }
 *       '404': { description: Project not found for this account. }
 *       '500': { description: Database error. }
 *   delete:
 *     tags: [Projects]
 *     summary: Delete an owned project not linked to an application
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '204': { description: Project deleted. }
 *       '400': { description: Invalid ID. }
 *       '401': { description: Login required. }
 *       '404': { description: Project not found for this account. }
 *       '409': { description: Project is linked to an application. }
 *       '500': { description: Database error. }
 * /api/experiences:
 *   get:
 *     tags: [Experiences]
 *     summary: List the current candidate's experiences
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200': { description: Experiences owned by the current account, most recent first. }
 *       '401': { description: Login required. }
 *       '500': { description: Database error. }
 *   post:
 *     tags: [Experiences]
 *     summary: Add an experience to the current candidate's profile
 *     description: Ownership is assigned from the session. End date is optional for a current experience.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [company_name, job_title]
 *             properties:
 *               company_name: { type: string, minLength: 1, maxLength: 200 }
 *               job_title: { type: string, minLength: 1, maxLength: 200 }
 *               description: { type: string, nullable: true, maxLength: 5000 }
 *               start_date: { type: string, nullable: true, format: date }
 *               end_date: { type: string, nullable: true, format: date }
 *           example: { company_name: Savane Tech, job_title: Developer, start_date: '2023-04-01', end_date: null }
 *     responses:
 *       '201': { description: Created experience. }
 *       '400': { description: Invalid fields or date range. }
 *       '401': { description: Login required. }
 *       '500': { description: Database error. }
 * /api/experiences/{id}:
 *   patch:
 *     tags: [Experiences]
 *     summary: Edit an owned experience
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, minProperties: 1, additionalProperties: false, properties: { company_name: { type: string, maxLength: 200 }, job_title: { type: string, maxLength: 200 }, description: { type: string, nullable: true, maxLength: 5000 }, start_date: { type: string, nullable: true, format: date }, end_date: { type: string, nullable: true, format: date } } }
 *     responses:
 *       '200': { description: Updated experience. }
 *       '400': { description: Invalid ID, fields or date range. }
 *       '401': { description: Login required. }
 *       '404': { description: Experience not found for this account. }
 *       '500': { description: Database error. }
 *   delete:
 *     tags: [Experiences]
 *     summary: Delete an owned experience not linked to an application
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '204': { description: Experience deleted. }
 *       '400': { description: Invalid ID. }
 *       '401': { description: Login required. }
 *       '404': { description: Experience not found for this account. }
 *       '409': { description: Experience is linked to an application. }
 *       '500': { description: Database error. }
 */

/**
 * @swagger
 * tags:
 *   - name: Ads
 *     description: Public job offers
 *   - name: Admin - Companies
 *     description: Company management (ADMIN session required)
 *   - name: Admin - Categories
 *     description: Category management (ADMIN session required)
 *   - name: Admin - Ads
 *     description: Job offer management (ADMIN session required)
 *   - name: Auth
 *     description: Account and session management
 *   - name: Applications
 *     description: Job applications
 * components:
 *   schemas:
 *     AdminError:
 *       type: object
 *       required: [message]
 *       properties:
 *         message:
 *           type: string
 *           description: Human-readable reason why the admin action was refused.
 *
 * /api/ads:
 *   get:
 *     tags: [Ads]
 *     summary: Search published offers
 *     description: All filters combine. Text and location ignore case. Without page/page_size the historical array is returned. With either pagination parameter returns an object with ads, total, page, page_size and total_pages. Salary sorting uses salary_min (otherwise salary_max), annualized by multiplying monthly amounts by 12; missing amounts come last, ties use newest date then highest ID. Pages beyond the last return an empty ads array and the actual total.
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Text in title, descriptions, company name or offer location. LIKE wildcards are treated literally.
 *         schema: { type: string, minLength: 1, maxLength: 255 }
 *       - in: query
 *         name: location
 *         description: Part of the offer location.
 *         schema: { type: string, minLength: 1, maxLength: 255 }
 *       - in: query
 *         name: company_id
 *         schema: { type: integer, minimum: 1, maximum: 2147483647 }
 *       - in: query
 *         name: category_id
 *         schema: { type: integer, minimum: 1, maximum: 2147483647 }
 *       - in: query
 *         name: contract_type
 *         schema: { type: string, enum: [internship, apprenticeship, permanent, fixed_term, other] }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [recent, salary_asc, salary_desc], default: recent }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, maximum: 2147483647, default: 1 }
 *       - in: query
 *         name: page_size
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 12 }
 *     responses:
 *       '200':
 *         description: Published offers, optionally paginated.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items: { type: object }
 *                 - type: object
 *                   required: [ads, total, page, page_size, total_pages]
 *                   properties:
 *                     ads:
 *                       type: array
 *                       items: { type: object }
 *                     total: { type: integer, minimum: 0 }
 *                     page: { type: integer, minimum: 1 }
 *                     page_size: { type: integer, minimum: 1, maximum: 100 }
 *                     total_pages: { type: integer, minimum: 0 }
 *             examples:
 *               paginated:
 *                 value:
 *                   ads: [{ id: 12, title: Développeur frontend, company_id: 3, company_name: Savane Tech, salary_min: 42000, salary_max: 48000, salary_period: year, status: published }]
 *                   total: 1
 *                   page: 1
 *                   page_size: 12
 *                   total_pages: 1
 *               historical:
 *                 value: [{ id: 12, title: Développeur frontend, company_name: Savane Tech, status: published }]
 *       '400':
 *         description: Unknown, empty, repeated or invalid search parameter.
 *         content:
 *           application/json:
 *             example: { message: Le type de contrat est invalide. }
 *       '500':
 *         description: Internal database error.
 *
 * /api/ads/{id}:
 *   get:
 *     tags: [Ads]
 *     summary: Get a published offer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 12
 *     responses:
 *       '200':
 *         description: Offer returned successfully.
 *         content:
 *           application/json:
 *             example:
 *               id: 12
 *               title: Développeur frontend
 *               short_description: Rejoignez notre équipe web.
 *               description: Vous développerez les interfaces du produit.
 *               location: Paris
 *               salary_min: 42000
 *               salary_max: 48000
 *               salary_period: year
 *               contract_type: permanent
 *               working_time: full_time
 *               status: published
 *               created_at: '2026-01-15T10:00:00.000Z'
 *               company_id: 3
 *               company_name: Savane Tech
 *               company_description: Éditeur de logiciels.
 *               company_website: https://savane.example
 *               company_location: Paris
 *               company_logo_url: https://savane.example/logo.png
 *               category_id: 2
 *               category_name: Développement
 *               salary: 42 000 – 48 000 € / an
 *       '400':
 *         description: Invalid offer ID.
 *         content:
 *           application/json:
 *             example:
 *               message: L’identifiant de l’offre est invalide.
 *       '404':
 *         description: Offer does not exist or is not published.
 *         content:
 *           application/json:
 *             example:
 *               message: Offre introuvable.
 *       '500':
 *         description: Internal database error.
 */

/**
 * @swagger
 * /api/admin/companies:
 *   get:
 *     tags: [Admin - Companies]
 *     summary: List companies
 *     description: Requires an authenticated ADMIN session. The same router is also mounted at /api/companies.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200':
 *         description: Companies ordered by name.
 *         content:
 *           application/json:
 *             example:
 *               - id: 3
 *                 name: Savane Tech
 *                 description: Éditeur de logiciels.
 *                 website: https://savane.example
 *                 location: Paris
 *                 logo_url: https://savane.example/logo.png
 *                 created_at: '2026-01-15T10:00:00.000Z'
 *       '401':
 *         description: Login required.
 *       '403':
 *         description: The account is not an administrator.
 *       '500':
 *         description: Internal database or access-check error.
 *   post:
 *     tags: [Admin - Companies]
 *     summary: Create a company
 *     description: Requires an authenticated ADMIN session. The same router is also mounted at /api/companies.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, maxLength: 150 }
 *               description: { type: string, nullable: true, maxLength: 100000 }
 *               website: { type: string, format: uri, nullable: true, maxLength: 255 }
 *               location: { type: string, nullable: true, maxLength: 255 }
 *               logo_url: { type: string, format: uri, nullable: true, maxLength: 500 }
 *           example:
 *             name: Savane Tech
 *             description: Éditeur de logiciels.
 *             website: https://savane.example
 *             location: Paris
 *             logo_url: https://savane.example/logo.png
 *     responses:
 *       '201':
 *         description: Company created.
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               name: Savane Tech
 *               description: Éditeur de logiciels.
 *               website: https://savane.example
 *               location: Paris
 *               logo_url: https://savane.example/logo.png
 *               created_at: '2026-01-15T10:00:00.000Z'
 *       '400':
 *         description: Invalid or missing company fields.
 *       '401':
 *         description: Login required.
 *       '403':
 *         description: The account is not an administrator.
 *       '409':
 *         description: Company conflicts with existing data.
 *       '500':
 *         description: Internal database error.
 *
 * /api/admin/companies/{id}:
 *   get:
 *     tags: [Admin - Companies]
 *     summary: Get one company
 *     description: Requires an ADMIN session. Also available at /api/companies/{id}.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200':
 *         description: Company returned.
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               name: Savane Tech
 *               description: Éditeur de logiciels.
 *               website: https://savane.example
 *               location: Paris
 *               logo_url: https://savane.example/logo.png
 *               created_at: '2026-01-15T10:00:00.000Z'
 *       '400': { description: Invalid company ID. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '404': { description: Company not found. }
 *       '500': { description: Internal database error. }
 *   put:
 *     tags: [Admin - Companies]
 *     summary: Replace company fields
 *     description: Requires an ADMIN session. This route uses PUT; PATCH is not registered. Also available at /api/companies/{id}.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, maxLength: 150 }
 *               description: { type: string, nullable: true, maxLength: 100000 }
 *               website: { type: string, format: uri, nullable: true, maxLength: 255 }
 *               location: { type: string, nullable: true, maxLength: 255 }
 *               logo_url: { type: string, format: uri, nullable: true, maxLength: 500 }
 *           example:
 *             name: Savane Tech
 *             description: Nouvelle description
 *             website: https://savane.example
 *             location: Paris
 *             logo_url: https://savane.example/logo.png
 *     responses:
 *       '200':
 *         description: Updated company returned.
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               name: Savane Tech
 *               description: Nouvelle description
 *               website: https://savane.example
 *               location: Paris
 *               logo_url: https://savane.example/logo.png
 *               created_at: '2026-01-15T10:00:00.000Z'
 *       '400': { description: Invalid ID or company fields. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '404': { description: Company not found. }
 *       '409': { description: Company conflicts with existing data. }
 *       '500': { description: Internal database error. }
 *   delete:
 *     tags: [Admin - Companies]
 *     summary: Delete a company
 *     description: Requires an ADMIN session. Deletion is rejected while offers reference the company. Also available at /api/companies/{id}.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '204': { description: Company deleted; no response body. }
 *       '400': { description: Invalid company ID. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '404': { description: Company not found. }
 *       '409': { description: Company is still referenced by offers. }
 *       '500': { description: Internal database error. }
 */

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     tags: [Admin - Categories]
 *     summary: List categories
 *     description: Requires an authenticated ADMIN session. Also mounted at /api/categories.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200':
 *         description: Categories ordered by name.
 *         content:
 *           application/json:
 *             example:
 *               - id: 2
 *                 name: Développement
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '500': { description: Internal database error. }
 *   post:
 *     tags: [Admin - Categories]
 *     summary: Create a category
 *     description: Requires an authenticated ADMIN session. Also mounted at /api/categories.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, maxLength: 100 }
 *           example: { name: Développement }
 *     responses:
 *       '201':
 *         description: Category created.
 *         content:
 *           application/json:
 *             example: { id: 2, name: Développement }
 *       '400': { description: Missing or invalid name. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '409': { description: Category name already exists. }
 *       '500': { description: Internal database error. }
 *
 * /api/admin/categories/{id}:
 *   put:
 *     tags: [Admin - Categories]
 *     summary: Update a category
 *     description: Requires an ADMIN session. PUT and PATCH use the same controller; both require name. Also mounted at /api/categories/{id}.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, maxLength: 100 }
 *           example: { name: Produit }
 *     responses:
 *       '200':
 *         description: Updated category.
 *         content:
 *           application/json:
 *             example: { id: 2, name: Produit }
 *       '400': { description: Invalid ID or missing/invalid name. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '404': { description: Category not found. }
 *       '409': { description: Category name already exists. }
 *       '500': { description: Internal database error. }
 *   patch:
 *     tags: [Admin - Categories]
 *     summary: Update a category
 *     description: Same behavior as PUT; name remains required. Also mounted at /api/categories/{id}.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, maxLength: 100 }
 *           example: { name: Produit }
 *     responses:
 *       '200':
 *         description: Updated category.
 *         content:
 *           application/json:
 *             example: { id: 2, name: Produit }
 *       '400': { description: Invalid ID or missing/invalid name. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '404': { description: Category not found. }
 *       '409': { description: Category name already exists. }
 *       '500': { description: Internal database error. }
 *   delete:
 *     tags: [Admin - Categories]
 *     summary: Delete a category
 *     description: Requires an ADMIN session. Deletion is rejected while offers reference the category. Also mounted at /api/categories/{id}.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '204': { description: Category deleted; no response body. }
 *       '400': { description: Invalid category ID. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '404': { description: Category not found. }
 *       '409': { description: Category is still referenced by offers. }
 *       '500': { description: Internal database error. }
 */

/**
 * @swagger
 * /api/admin/ads:
 *   get:
 *     tags: [Admin - Ads]
 *     summary: List and filter offers
 *     description: Requires an ADMIN session. Results include published and closed offers.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [all, published, closed], default: all }
 *       - in: query
 *         name: q
 *         description: Search title, company, location, and short description; up to 200 characters.
 *         schema: { type: string, maxLength: 200 }
 *       - in: query
 *         name: contract_type
 *         schema: { type: string, enum: [internship, apprenticeship, permanent, fixed_term, other] }
 *       - in: query
 *         name: company_id
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: category_id
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [recent, oldest, title, company], default: recent }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: page_size
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       '200':
 *         description: Filtered offers.
 *         content:
 *           application/json:
 *             example:
 *               - id: 12
 *                 title: Développeur frontend
 *                 short_description: Rejoignez notre équipe web.
 *                 description: Vous développerez les interfaces du produit.
 *                 location: Paris
 *                 company_id: 3
 *                 company_name: Savane Tech
 *                 company_location: Paris
 *                 category_id: 2
 *                 category_name: Développement
 *                 salary_min: 42000
 *                 salary_max: 48000
 *                 salary_period: year
 *                 contract_type: permanent
 *                 working_time: full_time
 *                 status: published
 *                 created_at: '2026-01-15T10:00:00.000Z'
 *       '400': { description: Invalid filter or sort value. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '500': { description: Internal database error. }
 *   post:
 *     tags: [Admin - Ads]
 *     summary: Create an offer
 *     description: Requires an ADMIN session. Title, description, company_id, salary_period and status are required. The company and optional category must exist. A published offer appears in the public list; a closed offer remains visible only to administrators.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, company_id, salary_period, status]
 *             properties:
 *               title: { type: string, maxLength: 200 }
 *               short_description: { type: string, nullable: true, maxLength: 500 }
 *               description: { type: string, maxLength: 100000 }
 *               location: { type: string, nullable: true, maxLength: 255 }
 *               company_id: { type: integer, minimum: 1 }
 *               category_id: { type: integer, nullable: true, minimum: 1 }
 *               salary_min: { type: integer, nullable: true, minimum: 1 }
 *               salary_max: { type: integer, nullable: true, minimum: 1 }
 *               salary_period: { type: string, enum: [month, year] }
 *               contract_type: { type: string, nullable: true, enum: [internship, apprenticeship, permanent, fixed_term, other] }
 *               working_time: { type: string, nullable: true, enum: [full_time, part_time] }
 *               status: { type: string, enum: [published, closed] }
 *           example:
 *             title: Développeur frontend
 *             short_description: Rejoignez notre équipe web.
 *             description: Vous développerez les interfaces du produit.
 *             location: Paris
 *             company_id: 3
 *             category_id: 2
 *             salary_min: 42000
 *             salary_max: 48000
 *             salary_period: year
 *             contract_type: permanent
 *             working_time: full_time
 *             status: published
 *     responses:
 *       '201':
 *         description: Created offer with company and category names.
 *         content:
 *           application/json:
 *             example:
 *               id: 12
 *               title: Développeur frontend
 *               short_description: Rejoignez notre équipe web.
 *               description: Vous développerez les interfaces du produit.
 *               location: Paris
 *               company_id: 3
 *               company_name: Savane Tech
 *               company_location: Paris
 *               category_id: 2
 *               category_name: Développement
 *               salary_min: 42000
 *               salary_max: 48000
 *               salary_period: year
 *               contract_type: permanent
 *               working_time: full_time
 *               status: published
 *               created_at: '2026-01-15T10:00:00.000Z'
 *       '400': { description: Missing or invalid offer fields. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '409': { description: Referenced company/category does not exist or data conflict. }
 *       '500': { description: Internal database error. }
 *
 * /api/admin/ads/{id}:
 *   get:
 *     tags: [Admin - Ads]
 *     summary: Get an offer for administration
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200':
 *         description: Offer returned, including closed offers.
 *         content:
 *           application/json:
 *             example:
 *               id: 12
 *               title: Développeur frontend
 *               short_description: Rejoignez notre équipe web.
 *               description: Vous développerez les interfaces du produit.
 *               location: Paris
 *               company_id: 3
 *               company_name: Savane Tech
 *               company_location: Paris
 *               category_id: 2
 *               category_name: Développement
 *               salary_min: 42000
 *               salary_max: 48000
 *               salary_period: year
 *               contract_type: permanent
 *               working_time: full_time
 *               status: published
 *               created_at: '2026-01-15T10:00:00.000Z'
 *       '400': { description: Invalid offer ID. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '404': { description: Offer not found. }
 *       '500': { description: Internal database error. }
 *   put:
 *     tags: [Admin - Ads]
 *     summary: Replace offer fields
 *     description: All required create fields must be sent. Use PATCH for a partial update.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, company_id, salary_period, status]
 *             properties:
 *               title: { type: string, maxLength: 200 }
 *               short_description: { type: string, nullable: true, maxLength: 500 }
 *               description: { type: string, maxLength: 100000 }
 *               location: { type: string, nullable: true, maxLength: 255 }
 *               company_id: { type: integer, minimum: 1 }
 *               category_id: { type: integer, nullable: true, minimum: 1 }
 *               salary_min: { type: integer, nullable: true, minimum: 1 }
 *               salary_max: { type: integer, nullable: true, minimum: 1 }
 *               salary_period: { type: string, enum: [month, year] }
 *               contract_type: { type: string, nullable: true, enum: [internship, apprenticeship, permanent, fixed_term, other] }
 *               working_time: { type: string, nullable: true, enum: [full_time, part_time] }
 *               status: { type: string, enum: [published, closed] }
 *           example:
 *             title: Développeur frontend
 *             description: Description complète de l'offre.
 *             company_id: 3
 *             salary_period: year
 *             status: published
 *     responses:
 *       '200':
 *         description: Updated offer returned.
 *         content:
 *           application/json:
 *             example:
 *               id: 12
 *               title: Développeur frontend
 *               short_description: Rejoignez notre équipe web.
 *               description: Vous développerez les interfaces du produit.
 *               location: Paris
 *               company_id: 3
 *               company_name: Savane Tech
 *               company_location: Paris
 *               category_id: 2
 *               category_name: Développement
 *               salary_min: 42000
 *               salary_max: 48000
 *               salary_period: year
 *               contract_type: permanent
 *               working_time: full_time
 *               status: published
 *               created_at: '2026-01-15T10:00:00.000Z'
 *       '400': { description: Invalid ID or offer fields. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '404': { description: Offer not found. }
 *       '409': { description: Referenced company/category does not exist or data conflict. }
 *       '500': { description: Internal database error. }
 *   patch:
 *     tags: [Admin - Ads]
 *     summary: Edit, close or reopen an offer
 *     description: Requires an ADMIN session. Send one or more editable fields; omitted fields are preserved and empty updates are rejected. Setting status to closed removes the offer from public routes and refuses new applications (409), while preserving existing applications. Setting status to published reopens the offer and makes it publicly visible again.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title: { type: string, maxLength: 200 }
 *               short_description: { type: string, nullable: true, maxLength: 500 }
 *               description: { type: string, maxLength: 100000 }
 *               location: { type: string, nullable: true, maxLength: 255 }
 *               company_id: { type: integer, minimum: 1 }
 *               category_id: { type: integer, nullable: true, minimum: 1 }
 *               salary_min: { type: integer, nullable: true, minimum: 1 }
 *               salary_max: { type: integer, nullable: true, minimum: 1 }
 *               salary_period: { type: string, enum: [month, year] }
 *               contract_type: { type: string, nullable: true, enum: [internship, apprenticeship, permanent, fixed_term, other] }
 *               working_time: { type: string, nullable: true, enum: [full_time, part_time] }
 *               status: { type: string, enum: [published, closed] }
 *           examples:
 *             edit:
 *               summary: Modify the offer content
 *               value:
 *                 title: Développeur frontend confirmé
 *                 description: Vous développerez et maintiendrez les interfaces React du produit.
 *             close:
 *               summary: Close the offer and stop new applications
 *               value: { status: closed }
 *             reopen:
 *               summary: Reopen the offer for applications
 *               value: { status: published }
 *     responses:
 *       '200':
 *         description: Updated offer returned.
 *         content:
 *           application/json:
 *             example:
 *               id: 12
 *               title: Développeur frontend
 *               short_description: Rejoignez notre équipe web.
 *               description: Vous développerez les interfaces du produit.
 *               location: Paris
 *               company_id: 3
 *               company_name: Savane Tech
 *               company_location: Paris
 *               category_id: 2
 *               category_name: Développement
 *               salary_min: 42000
 *               salary_max: 48000
 *               salary_period: year
 *               contract_type: permanent
 *               working_time: full_time
 *               status: published
 *               created_at: '2026-01-15T10:00:00.000Z'
 *       '400': { description: Invalid ID, empty update, or invalid field. }
 *       '401': { description: Login required. }
 *       '403': { description: The account is not an administrator. }
 *       '404': { description: Offer not found. }
 *       '409': { description: Referenced company/category does not exist or data conflict. }
 *       '500': { description: Internal database error. }
 *   delete:
 *     tags: [Admin - Ads]
 *     summary: Delete an offer without applications
 *     description: Requires an ADMIN session. Permanently deletes a published or closed offer only if it has no linked applications. If any application exists, returns 409 and preserves the offer, applications and their attachments. Close the offer with PATCH instead to stop new applications. No request body is needed.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '204': { description: Offer deleted. No response body. }
 *       '400':
 *         description: Invalid offer ID.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AdminError' }
 *             example: { message: L’identifiant de l’offre est invalide. }
 *       '401':
 *         description: Login required or account no longer exists.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AdminError' }
 *             example: { message: Connectez-vous pour accéder à l’administration. }
 *       '403':
 *         description: The account is not an administrator.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AdminError' }
 *             example: { message: Cette action est réservée à l’administration. }
 *       '404':
 *         description: Offer not found or already deleted.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AdminError' }
 *             example: { message: Offre introuvable. }
 *       '409':
 *         description: Linked applications prevent deletion.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AdminError' }
 *             example:
 *               message: Cette offre est liée à une ou plusieurs candidatures et ne peut pas être supprimée. Vous pouvez la fermer pour arrêter les nouvelles candidatures.
 *       '500':
 *         description: Internal database error or failure to check admin access.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AdminError' }
 *             example: { message: Une erreur interne est survenue. }
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password]
 *             properties:
 *               first_name: { type: string, maxLength: 100 }
 *               last_name: { type: string, maxLength: 100 }
 *               email: { type: string, format: email, maxLength: 255 }
 *               password: { type: string, format: password, minLength: 8, maxLength: 72 }
 *               phone: { type: string, nullable: true, maxLength: 30 }
 *           example:
 *             first_name: Alice
 *             last_name: Martin
 *             email: alice@example.com
 *             password: JobBoardDemo2026!
 *             phone: '+33123456789'
 *     responses:
 *       '201':
 *         description: Account created with the USER role.
 *         content:
 *           application/json:
 *             example: { id: 5, first_name: Alice, last_name: Martin, email: alice@example.com, phone: '+33123456789', role: USER }
 *       '400': { description: Required field, length, email, or password validation error. }
 *       '409': { description: Email address already exists. }
 *       '500': { description: Internal server error. }
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and create a session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *           example: { email: alice@example.com, password: JobBoardDemo2026! }
 *     responses:
 *       '200':
 *         description: Account data. The response sets the connect.sid session cookie.
 *         headers:
 *           Set-Cookie:
 *             schema: { type: string }
 *             example: connect.sid=s%3A...; Path=/; HttpOnly; SameSite=Lax
 *         content:
 *           application/json:
 *             example: { id: 5, first_name: Alice, last_name: Martin, email: alice@example.com, phone: null, role: USER }
 *       '400': { description: Email or password missing. }
 *       '401': { description: Invalid email or password. }
 *       '500': { description: Session or server error. }
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current account
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200':
 *         description: Current account without password hash.
 *         content:
 *           application/json:
 *             example: { id: 5, first_name: Alice, last_name: Martin, email: alice@example.com, phone: null, role: USER }
 *       '401': { description: Login required or account no longer exists. }
 *       '500': { description: Internal server error. }
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: End the current session
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200':
 *         description: Session ended and cookie cleared.
 *         content:
 *           application/json:
 *             example: { message: Déconnexion réussie. }
 *       '500': { description: Session configuration or server error. }
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     tags: [Applications]
 *     summary: Submit an application to an offer
 *     description: Requires a logged-in account. An optional CV and all selected projects and experiences must belong to that account. person_id is taken from the session. The offer must still be published. The application and its selections are saved together.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ad_id, message]
 *             properties:
 *               ad_id: { type: integer, minimum: 1 }
 *               cv_document_id: { type: integer, minimum: 1, nullable: true, description: Optional CV document owned by the logged-in account. }
 *               message: { type: string, minLength: 1, maxLength: 5000 }
 *               project_ids:
 *                 type: array
 *                 items: { type: integer, minimum: 1 }
 *                 description: Optional profile project IDs to include in the application.
 *               experience_ids:
 *                 type: array
 *                 items: { type: integer, minimum: 1 }
 *                 description: Optional profile experience IDs to include in the application.
 *           example: { ad_id: 12, cv_document_id: 4, message: Je souhaite rejoindre votre équipe car..., project_ids: [3], experience_ids: [8] }
 *     responses:
 *       '201':
 *         description: Application submitted.
 *         content:
 *           application/json:
 *             example:
 *               id: 41
 *               ad_id: 12
 *               message: Je souhaite rejoindre votre équipe car...
 *               cv_document_id: 4
 *               status: sent
 *               created_at: '2026-01-15T10:00:00.000Z'
 *       '400': { description: Invalid offer ID, CV, message, or selected profile items. }
 *       '401': { description: Login required. }
 *       '404': { description: Offer not found. }
 *       '409': { description: Offer is closed or the account already applied. }
 *       '500': { description: Internal database error. }
 * /api/applications/today:
 *   get:
 *     tags: [Applications]
 *     summary: Count the current account's applications for the current Paris calendar day
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200':
 *         description: Number of applications created by the account today.
 *         content:
 *           application/json:
 *             example: { count: 2 }
 *       '401': { description: Login required. }
 *       '500': { description: Internal database error. }
 */

/**
*/

/**
* @swagger
 * /api/applications/mine:
 *   get:
 *     tags: [Applications]
 *     summary: List the current account's applications
 *     description: Returns offer title, company, location, submitted CV name and protected file URL, status and creation date, newest first.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200': { description: Array of applications belonging to the logged-in account. }
 *       '401': { description: Login required. }
 *       '500': { description: Internal database error. }
 * /api/applications/mine/{id}:
 *   get:
 *     tags: [Applications]
 *     summary: Read one application dossier owned by the current account
 *     description: New applications include a frozen copy of the profile, message, selected projects and experiences, and CV version. Older applications return the data still available and snapshot_available=false.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200':
 *         description: The application dossier. Only its owner can read it.
 *         content:
 *           application/json:
 *             example:
 *               id: 41
 *               ad_id: 12
 *               title: Développeur junior
 *               company_name: Savane Tech
 *               location: Lyon
 *               status: sent
 *               snapshot_available: true
 *               submitted_snapshot:
 *                 person: { first_name: Camille, last_name: Petit, email: camille@example.com, phone: '0612345678' }
 *                 message: Je souhaite rejoindre votre équipe.
 *                 projects: [{ id: 3, title: Portfolio, description: Mon projet, project_url: 'https://example.com', repository_url: 'https://github.com/example' }]
 *                 experiences: [{ id: 8, company_name: Savane Tech, job_title: Développeuse, description: Première expérience, start_date: '2024-01-01', end_date: null }]
 *                 cv: { id: 4, original_name: CV.pdf, created_at: '2026-01-15T10:00:00.000Z' }
 *               cv: { id: 4, original_name: CV.pdf, file_url: /api/cv-documents/4/file }
 *       '400': { description: Invalid application ID. }
 *       '401': { description: Login required. }
 *       '404': { description: Application does not exist or belongs to another account. }
 *       '500': { description: Internal database error. }
 * /api/people/me:
 *   get:
 *     tags: [Profile]
 *     summary: Read the profile for the current account
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200': { description: Account ID, first and last name, email, phone and role. Password hash is never returned. }
 *       '401': { description: Login required or account not found. }
 *       '500': { description: Internal database error. }
 *   patch:
 *     tags: [Profile]
 *     summary: Update editable fields on the current account
 *     description: The role and password cannot be changed through this route. Empty phone clears the optional number.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             minProperties: 1
 *             properties:
 *               first_name: { type: string, minLength: 1, maxLength: 100 }
 *               last_name: { type: string, minLength: 1, maxLength: 100 }
 *               email: { type: string, format: email, maxLength: 255 }
 *               phone: { type: string, nullable: true, maxLength: 30 }
 *           example: { first_name: Camille, phone: '0612345678' }
 *     responses:
 *       '200': { description: Updated public account without password hash. }
 *       '400': { description: Empty, unknown, or invalid profile fields. }
 *       '401': { description: Login required or account not found. }
 *       '409': { description: Email already used by another account. }
 *       '500': { description: Internal database error. }
 * /api/admin/applications:
 *   get:
 *     tags: [Admin - Applications]
 *     summary: List applications for administrators
 *     description: Includes the offer, company, candidate name and email, submitted CV name and protected file URL, status and creation date. Results can be filtered by company_id, ad_id and status; closed offers remain included.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: ad_id
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [all, sent, in_progress, technical_test, accepted, rejected], default: all }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: page_size
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       '200': { description: Array of applications. }
 *       '400': { description: Invalid filter value. }
 *       '401': { description: Login required. }
 *       '403': { description: ADMIN role required. }
 *       '500': { description: Internal database error. }
 * /api/admin/applications/{id}:
 *   get:
 *     tags: [Admin - Applications]
 *     summary: Read a complete application dossier
 *     description: Returns the frozen identity, message, selected projects and experiences, plus the protected submitted CV. Legacy applications expose only currently available data and mark person_is_current=true.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200': { description: Complete application dossier for an administrator. }
 *       '400': { description: Invalid application ID. }
 *       '401': { description: Login required. }
 *       '403': { description: ADMIN role required. }
 *       '404': { description: Application not found. }
 *       '500': { description: Internal database error. }
 *   patch:
 *     tags: [Admin - Applications]
 *     summary: Update an application status
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [sent, in_progress, technical_test, accepted, rejected]
 *           example: { status: in_progress }
 *     responses:
 *       '200': { description: Updated application ID and status. }
 *       '400': { description: Invalid ID or status, or unexpected fields. }
 *       '401': { description: Login required. }
 *       '403': { description: ADMIN role required. }
 *       '404': { description: Application not found. }
 *       '500': { description: Internal database error. }
 * /api/admin/users:
 *   get:
 *     tags: [Admin - Users]
 *     summary: List accounts without password hashes
 *     description: Supports q and role filters. With page or page_size, returns an items/page/page_size/total/total_pages envelope.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string, maxLength: 200 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [all, USER, COMPANY, ADMIN], default: all }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: page_size
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       '200': { description: Array of accounts with ID, name, email, phone, role and creation date. }
 *       '401': { description: Login required. }
 *       '403': { description: ADMIN role required. }
 *       '500': { description: Internal database error. }
 * /api/admin/users/{id}:
 *   patch:
 *     tags: [Admin - Users]
 *     summary: Update an account's allowed fields
 *     description: At least one field is required. Administrators cannot change their own role or demote the last administrator.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             minProperties: 1
 *             properties:
 *               first_name: { type: string, minLength: 1, maxLength: 100 }
 *               last_name: { type: string, minLength: 1, maxLength: 100 }
 *               email: { type: string, format: email, maxLength: 255 }
 *               phone: { type: string, nullable: true, maxLength: 30 }
 *               role: { type: string, enum: [USER, COMPANY, ADMIN] }
 *               company_id: { type: integer, nullable: true, minimum: 1, description: Required when role is COMPANY. Multiple accounts may share an existing company. }
 *           example: { first_name: Camille, phone: null }
 *     responses:
 *       '200': { description: Updated account without password hash. }
 *       '400': { description: Invalid ID or account fields. }
 *       '401': { description: Login required. }
 *       '403': { description: ADMIN role required. }
 *       '404': { description: Account not found. }
 *       '409': { description: Email conflict, own role change or last administrator demotion. }
 *       '500': { description: Internal database error. }
 *   delete:
 *     tags: [Admin - Users]
 *     summary: Delete an account
 *     description: Own account deletion and last administrator deletion are forbidden. Related candidate data follows the database cascade constraints.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '204': { description: Account deleted, no response body. }
 *       '400': { description: Invalid account ID. }
 *       '401': { description: Login required. }
 *       '403': { description: ADMIN role required. }
 *       '404': { description: Account not found. }
 *       '409': { description: Own account or last administrator deletion. }
 */

/**
* @swagger
 * /api/public/companies:
 *   get:
 *     tags: [Ads]
 *     summary: List public company information for offer filters
 *     description: Public read-only route, sorted by name then ID. Admin writes remain protected at /api/admin/companies and /api/companies.
 *     responses:
 *       '200':
 *         description: Public company fields only.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   name: { type: string }
 *                   description: { type: string, nullable: true }
 *                   website: { type: string, nullable: true }
 *                   location: { type: string, nullable: true }
 *                   logo_url: { type: string, nullable: true }
 *       '500': { description: Internal database error. }
 * /api/public/categories:
 *   get:
 *     tags: [Ads]
 *     summary: List public categories for offer filters
 *     description: Public read-only route, sorted by name then ID. Admin writes remain protected at /api/admin/categories and /api/categories.
 *     responses:
 *       '200':
 *         description: Category identifiers and names.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   name: { type: string }
  *       '500': { description: Internal database error. }
 */
