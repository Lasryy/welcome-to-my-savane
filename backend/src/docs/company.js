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
 */
