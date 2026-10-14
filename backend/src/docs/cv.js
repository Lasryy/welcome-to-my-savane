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
 *         is_current: { type: boolean, example: true }
 *         file_url: { type: string, example: /api/cv-documents/1/file }
 * /api/cv-documents:
 *   get:
 *     tags: [CV]
 *     summary: Lister les CV du candidat connecté
 *     description: Retourne les CV du profil, avec le CV par défaut en premier.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200':
 *         description: CV enregistrés dans le profil, avec le CV par défaut en premier.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/CvDocument' }
 *       '401': { description: Connexion requise ou compte supprimé. }
 *       '500': { description: Erreur de base de données. }
 *   post:
 *     tags: [CV]
 *     summary: Ajouter un CV PDF au profil
 *     description: Dépose un nouveau document indépendant. Les anciens CV restent disponibles ; le nouveau devient le CV par défaut.
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
 *         description: Métadonnées du CV ajouté.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CvDocument' }
 *       '400': { description: Fichier manquant ou PDF invalide. }
 *       '401': { description: Connexion requise ou compte supprimé. }
 *       '413': { description: Fichier supérieur à 5 Mo. }
 *       '415': { description: Extension ou type MIME différent de PDF. }
 *       '500': { description: Échec du stockage ou de la base de données. }
 * /api/cv-documents/{id}/current:
 *   put:
 *     tags: [CV]
 *     summary: Choisir le CV par défaut
 *     description: Définit comme CV courant un document déjà enregistré par le compte connecté.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200': { description: CV désormais sélectionné par défaut. }
 *       '401': { description: Connexion requise ou compte supprimé. }
 *       '404': { description: CV absent du profil. }
 *       '500': { description: Erreur de base de données. }
 * /api/cv-documents/current:
 *   get:
 *     tags: [CV]
 *     summary: Lire le CV courant du candidat connecté
 *     description: Retourne les métadonnées et le lien protégé du CV courant, ou null si aucun CV n’est sélectionné.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200': { description: CV courant, ou null quand le profil est vide. }
 *       '401': { description: Connexion requise ou compte supprimé. }
 *       '500': { description: Erreur de base de données. }
 *   delete:
 *     tags: [CV]
 *     summary: Retirer le CV courant du profil
 *     description: Le fichier et ses métadonnées sont conservés ; cette route enlève seulement son statut courant.
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '204': { description: CV courant retiré du profil. }
 *       '401': { description: Connexion requise ou compte supprimé. }
 *       '500': { description: Erreur de base de données. }
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
