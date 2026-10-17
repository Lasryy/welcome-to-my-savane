/**
 * @openapi
 * /api/company:
 *   get:
 *     tags: [Company]
 *     summary: Read the company linked to the recruiter account
 *     security: [{ sessionCookie: [] }]
 *     responses:
 *       '200': { description: Company profile for the authenticated recruiter. }
 *       '401': { description: Login required. }
 *       '403': { description: COMPANY role required. }
 * /api/company/ads:
 *   get:
 *     tags: [Company]
 *     summary: List this company's offers
 *     description: Supports status, search, and pagination. Results are always scoped to the company read from the session account.
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [all, published, closed], default: all }
 *       - in: query
 *         name: q
 *         schema: { type: string, maxLength: 200 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: page_size
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       '200': { description: Paginated company offers. }
 *       '403': { description: COMPANY role required. }
 *   post:
 *     tags: [Company]
 *     summary: Create an offer for the authenticated company
 *     description: company_id is assigned from the session and cannot be selected by the request.
 *     security: [{ sessionCookie: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, salary_period, status]
 *             properties:
 *               title: { type: string, maxLength: 200 }
 *               short_description: { type: string, nullable: true, maxLength: 500 }
 *               description: { type: string }
 *               location: { type: string, nullable: true, maxLength: 255 }
 *               salary_period: { type: string, enum: [month, year] }
 *               status: { type: string, enum: [published, closed] }
 *     responses:
 *       '201': { description: Created offer. }
 *       '400': { description: Invalid offer fields. }
 *       '403': { description: COMPANY role required. }
 * /api/company/ads/{id}:
 *   patch:
 *     tags: [Company]
 *     summary: Update or publish/close an offer owned by the authenticated company
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200': { description: Updated offer. }
 *       '404': { description: Offer not found for this company. }
 * /api/company/applications:
 *   get:
 *     tags: [Company]
 *     summary: List applications received by this company
 *     description: Supports status, ad_id, and pagination. Candidate contact information and CV files are available only inside an owned application dossier.
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [all, sent, in_progress, technical_test, accepted, rejected], default: all }
 *       - in: query
 *         name: ad_id
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: page_size
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       '200': { description: Paginated applications for the recruiter company. }
 *       '403': { description: COMPANY role required. }
 * /api/company/applications/{id}:
 *   get:
 *     tags: [Company]
 *     summary: Read the submitted dossier for an application belonging to this company
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200': { description: Submitted snapshot, status, and protected CV file URL when present. }
 *       '404': { description: Application not found for this company. }
 *   patch:
 *     tags: [Company]
 *     summary: Update status of an application belonging to this company
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [status], properties: { status: { type: string, enum: [sent, in_progress, technical_test, accepted, rejected] } } }
 *     responses:
 *       '200': { description: Updated application status. }
 *       '404': { description: Application not found for this company. }
 * /api/company/candidates:
 *   get:
 *     tags: [Company]
 *     summary: Search candidates who opted in to recruiter visibility
 *     description: Searches candidate names, project details and experience details. Results contain only names and project/experience counts; contact details, password data and CVs are not returned. Each result is unique even when several fields match.
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Optional keyword, up to 200 characters.
 *         schema: { type: string, maxLength: 200 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: page_size
 *         description: Defaults to 12 and cannot exceed 100.
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 12 }
 *     responses:
 *       '200':
 *         description: Paginated candidate summaries visible to recruiters.
 *         content:
 *           application/json:
 *             example:
 *               items: [{ id: 7, first_name: Camille, last_name: Petit, project_count: 2, experience_count: 1 }]
 *               page: 1
 *               page_size: 12
 *               total: 1
 *               total_pages: 1
 *       '400': { description: Invalid search or pagination parameters. }
 *       '401': { description: Login required. }
 *       '403': { description: COMPANY role required. }
 *       '500': { description: Internal database error. }
 * /api/company/candidates/{personId}:
 *   get:
 *     tags: [Company]
 *     summary: Read the profile of a candidate who opted in
 *     description: Returns the candidate's name, projects and experiences. Email, phone, password data and CVs are never included. Hidden and missing profiles both return 404.
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200':
 *         description: Candidate profile and professional details.
 *         content:
 *           application/json:
 *             example:
 *               id: 7
 *               first_name: Camille
 *               last_name: Petit
 *               projects: [{ id: 3, title: Portfolio, description: Site personnel, project_url: 'https://example.com', repository_url: 'https://github.com/example/site' }]
 *               experiences: [{ id: 8, company_name: Savane Tech, job_title: Développeuse, description: Première expérience, start_date: '2024-01-01', end_date: null }]
 *       '400': { description: Invalid candidate ID. }
 *       '401': { description: Login required. }
 *       '403': { description: COMPANY role required. }
 *       '404': { description: Candidate profile is missing or hidden. }
 *       '500': { description: Internal database error. }
 * /api/company/users:
 *   get:
 *     tags: [Company]
 *     summary: List recruiter accounts for the authenticated company
 *     description: Results are scoped to the company from the session and include no password data. Supports text search and pagination.
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Optional search in first name, last name, and email, up to 200 characters.
 *         schema: { type: string, maxLength: 200 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: page_size
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       '200': { description: Paginated recruiter accounts with their company name and no password data. }
 *       '400': { description: Invalid search or pagination parameters. }
 *       '401': { description: Login required. }
 *       '403': { description: COMPANY role required. }
 *       '500': { description: Internal database error. }
 *   post:
 *     tags: [Company]
 *     summary: Create a recruiter account for the authenticated company
 *     description: The company and COMPANY role are assigned from the session. Passwords are hashed and never returned.
 *     security: [{ sessionCookie: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [first_name, last_name, email, password]
 *             properties:
 *               first_name: { type: string, minLength: 1, maxLength: 100 }
 *               last_name: { type: string, minLength: 1, maxLength: 100 }
 *               email: { type: string, format: email, maxLength: 255 }
 *               phone: { type: string, nullable: true, maxLength: 30 }
 *               password: { type: string, format: password, minLength: 8, maxLength: 72, description: Maximum 72 UTF-8 bytes. }
 *           example: { first_name: Camille, last_name: Petit, email: camille@example.com, phone: null, password: 'mot-de-passe-solide' }
 *     responses:
 *       '201': { description: Created recruiter account with ID, name, email, phone, role, company and creation date. }
 *       '400': { description: Invalid account fields or password. }
 *       '401': { description: Login required. }
 *       '403': { description: COMPANY role required. }
 *       '409': { description: Email address is already in use. }
 *       '500': { description: Internal database error. }
 * /api/company/users/{id}:
 *   patch:
 *     tags: [Company]
 *     summary: Update a recruiter account belonging to the authenticated company
 *     description: Only first name, last name, email, and phone can be changed. Company, role, and password cannot be changed through this route.
 *     security: [{ sessionCookie: [] }]
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
 *           example: { phone: null }
 *     responses:
 *       '200': { description: Updated recruiter account without password data. }
 *       '400': { description: Invalid account ID or fields. }
 *       '401': { description: Login required. }
 *       '403': { description: COMPANY role required. }
 *       '404': { description: Recruiter account not found for this company. }
 *       '409': { description: Email address is already in use. }
 *       '500': { description: Internal database error. }
 *   delete:
 *     tags: [Company]
 *     summary: Delete a recruiter account belonging to the authenticated company
 *     description: A recruiter cannot delete their own account through this route.
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '204': { description: Recruiter account deleted, no response body. }
 *       '400': { description: Invalid account ID. }
 *       '401': { description: Login required. }
 *       '403': { description: COMPANY role required. }
 *       '404': { description: Recruiter account not found for this company. }
 *       '409': { description: Own account deletion is forbidden. }
 *       '500': { description: Internal database error. }
 */
