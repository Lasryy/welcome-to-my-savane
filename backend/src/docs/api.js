/**
 * OpenAPI documentation for the routes mounted in src/app.js.
 * Request fields, response shapes, and status codes are based on the controllers.
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
 *     summary: List published offers
 *     description: Returns all published offers, newest first.
 *     responses:
 *       '200':
 *         description: Offers returned successfully.
 *         content:
 *           application/json:
 *             example:
 *               - id: 12
 *                 title: Développeur frontend
 *                 short_description: Rejoignez notre équipe web.
 *                 description: Vous développerez les interfaces du produit.
 *                 location: Paris
 *                 salary_min: 42000
 *                 salary_max: 48000
 *                 salary_period: year
 *                 contract_type: permanent
 *                 working_time: full_time
 *                 status: published
 *                 created_at: '2026-01-15T10:00:00.000Z'
 *                 company_id: 3
 *                 company_name: Savane Tech
 *                 category_id: 2
 *                 category_name: Développement
 *                 salary: 42 000 – 48 000 € / an
 *       '500':
 *         description: Internal database error.
 *         content:
 *           application/json:
 *             example:
 *               message: Une erreur interne est survenue.
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
 *     description: Requires a logged-in account. person_id is taken from the session and must not be sent in the body. The offer must still be published.
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
 *               message: { type: string, minLength: 1, maxLength: 5000 }
 *           example: { ad_id: 12, message: Je souhaite rejoindre votre équipe car... }
 *     responses:
 *       '201':
 *         description: Application submitted.
 *         content:
 *           application/json:
 *             example:
 *               id: 41
 *               ad_id: 12
 *               message: Je souhaite rejoindre votre équipe car...
 *               status: sent
 *               created_at: '2026-01-15T10:00:00.000Z'
 *       '400': { description: Invalid offer ID or motivation message. }
 *       '401': { description: Login required. }
 *       '404': { description: Offer not found. }
 *       '409': { description: Offer is closed or the account already applied. }
 *       '500': { description: Internal database error. }
 */

/**
 * @openapi
 * /api/applications/mine:
 *   get:
 *     tags: [Applications]
 *     summary: List the current account's applications
 *     description: Returns offer title, company, location, status and creation date, newest first.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200': { description: Array of applications belonging to the logged-in account. }
 *       '401': { description: Login required. }
 *       '500': { description: Internal database error. }
 * /api/admin/applications:
 *   get:
 *     tags: [Admin - Applications]
 *     summary: List applications for administrators
 *     description: Includes the offer, company, candidate name and email, status and creation date.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200': { description: Array of applications. }
 *       '401': { description: Login required. }
 *       '403': { description: ADMIN role required. }
 *       '500': { description: Internal database error. }
 * /api/admin/applications/{id}:
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
 *     security:
 *       - sessionCookie: []
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
 *               role: { type: string, enum: [USER, ADMIN] }
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
 *       '500': { description: Internal database error. }
 */
