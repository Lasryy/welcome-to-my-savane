/**
 * @openapi
 * components:
 *   schemas:
 *     CvDocument:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         original_name: { type: string, example: cv.pdf }
 *         mime_type: { type: string, example: application/pdf }
 *         size_bytes: { type: integer, example: 120000 }
 *         created_at: { type: string, format: date-time }
 *         file_url: { type: string, example: /api/cv-documents/1/file }
 * /api/cv-documents:
 *   post:
 *     tags: [CV]
 *     summary: Déposer une nouvelle version de CV PDF
 *     description: Un seul champ file, PDF lisible non chiffré avec au moins une page, maximum 5242880 octets (5 Mo). Le propriétaire vient de la session. Aucun CV courant ni lien de candidature n’est modifié à cette étape.
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       '201':
 *         description: Métadonnées de la nouvelle version. Le chemin interne du fichier reste privé.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CvDocument' }
 *       '400': { description: Fichier manquant, faux PDF, PDF illisible ou formulaire invalide. }
 *       '401': { description: Connexion requise ou compte supprimé. }
 *       '413': { description: Fichier supérieur à 5 Mo. }
 *       '415': { description: Extension ou type MIME différent de PDF. }
 *       '500': { description: Échec du stockage ou de la base de données. }
 * /api/cv-documents/{id}/file:
 *   get:
 *     tags: [CV]
 *     summary: Consulter ou télécharger un CV avec une session autorisée
 *     description: Accès au propriétaire ou à un ADMIN dont le rôle est relu en base. Un document absent et un document d’autrui donnent le même 404. Aucun lien public ni cache du document.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 2147483647 }
 *       - in: query
 *         name: download
 *         description: Ajouter download=1 pour télécharger plutôt que consulter.
 *         schema: { type: string, enum: ['1'] }
 *     responses:
 *       '200':
 *         description: CV PDF. Cache-Control private, no-store.
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 *       '400': { description: Identifiant invalide. }
 *       '401': { description: Connexion requise ou compte supprimé. }
 *       '404': { description: CV introuvable pour ce compte ou fichier indisponible. }
 *       '500': { description: Erreur interne. }
 */
