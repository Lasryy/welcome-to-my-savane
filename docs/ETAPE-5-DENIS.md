# Étape 5 Denis - D5.1 à D5.3 : CV et dossier de candidature figé

Cette livraison ajoute le stockage protégé des CV, la gestion du CV courant,
un composant React autonome et les champs SQL nécessaires pour conserver la
version exacte du CV et une copie figée du dossier envoyé. Lasry monte le
composant CV dans sa page Profil et remplira ces champs lors de l’envoi de la
candidature. D5.4 (accès admin et nettoyage des fichiers inutilisés) reste à
réaliser séparément.

## Installation

Pour une base Docker existante, appliquer la migration additive avant de redémarrer l’API :

```sh
docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < db/migrations/001_cv_documents.sql
docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < db/migrations/002_current_cv.sql
docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < db/migrations/003_frozen_application_dossier.sql
docker compose up -d --build --renew-anon-volumes backend
```

Les migrations sont additives et réexécutables : elles ajoutent la table CV, ses index,
le statut courant, puis les deux colonnes nullable du dossier. Elles ne suppriment ni
compte ni candidature. Pour une installation neuve,
`db/job_board_schema.sql` crée déjà cette table et le statut CV courant avant le chargement du seed.
Il crée également les emplacements du dossier figé sur `applications`. Les scripts
d’initialisation Docker ne migrent pas les volumes PostgreSQL existants.

Hors Docker : `npm --prefix backend ci`, puis `npm --prefix backend run dev`.
Le répertoire par défaut est `backend/storage/cv`. Une variable d’environnement
`CV_STORAGE_DIR` peut définir un autre emplacement ; utiliser un chemin absolu.
Le dossier de stockage est ignoré par Git et exclu du contexte de construction Docker.

## Contrat API

### POST /api/cv-documents

Connexion requise. Envoyer `multipart/form-data`, avec un seul champ fichier nommé
`file`, sans `person_id` ni autre champ. Ne pas fixer manuellement le Content-Type
dans un appel navigateur avec FormData : le navigateur ajoute la boundary.

Contrôles : extension `.pdf`, type `application/pdf`, fichier non vide, taille maximale
de 5 242 880 octets (5 Mo), signature PDF et lecture du document avec au moins une
page. Les PDF chiffrés, illisibles et les faux fichiers renommés `.pdf` sont refusés.
La validation contrôle le format ; elle ne constitue pas un antivirus.

Réponse `201` :

```json
{
  "id": 1,
  "original_name": "cv.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 120000,
  "created_at": "2026-10-14T10:00:00.000Z",
  "file_url": "/api/cv-documents/1/file"
}
```

L’identité vient de la session. Le nom interne est un UUID généré par le serveur,
indépendant du nom original. Le chemin interne et le propriétaire ne sont pas exposés.
Chaque dépôt crée une version indépendante. Le nouveau fichier devient le CV courant ;
l’ancien fichier et ses métadonnées restent enregistrés.

### GET /api/cv-documents/current et DELETE /api/cv-documents/current

Ces deux routes authentifiées n’utilisent que le compte de la session. GET retourne
les métadonnées du CV courant et son `file_url`, ou `null` quand le profil ne contient
pas de CV. DELETE retire le statut courant et répond `204`, même si aucun CV n’était
sélectionné. La version et le fichier sont conservés pour qu’un futur dossier envoyé
puisse s’y référer.

À chaque nouveau POST, un verrou SQL sur le compte sérialise les dépôts concurrents.
La transaction désélectionne l’ancienne version puis désigne la nouvelle comme courante.
L’index unique SQL interdit plusieurs CV courants par candidat.

Erreurs avec `{ "message": "…" }` : `400` fichier/formulaire invalide, `401` session
absente ou compte supprimé, `413` trop volumineux, `415` mauvais type ou extension,
`500` stockage ou SQL en échec. Si l’écriture SQL échoue, le fichier créé est supprimé.

### GET /api/cv-documents/:id/file

Le propriétaire et les ADMIN peuvent consulter le PDF. Le rôle est relu dans la base
à chaque requête. Ajouter `?download=1` pour le télécharger avec son nom original.
Sans ce paramètre, le fichier est servi avec Content-Disposition inline.

La réponse est `application/pdf` avec `Cache-Control: private, no-store` et
`X-Content-Type-Options: nosniff`. Aucun dossier de fichiers n’est exposé par express.static.
La même URL nécessite toujours une session ; elle ne peut pas être partagée publiquement.

Erreurs : `400` identifiant invalide, `401` connexion requise, `404` document absent,
document d’un autre candidat ou fichier manquant, `500` erreur interne.

## SQL et persistance

`cv_documents` contient `id`, `person_id`, `original_name`, `storage_key`, `mime_type`,
`size_bytes`, `created_at` et `is_current`. Les contraintes vérifient le propriétaire, le nom de
stockage, le type PDF et la taille. L’index partiel unique n’autorise qu’un CV courant par
candidat. La paire `(id, person_id)` est unique pour préparer
les futures références de candidature contrôlant le propriétaire.

Docker utilise le volume nommé `cv_data` monté à `/app/storage/cv`. Les PDF restent
présents après redémarrage ou recréation du backend. Les sessions sont actuellement
en mémoire : après un redémarrage, se reconnecter avant de vérifier le fichier.
`docker compose down -v` effacerait les volumes SQL et CV : ne pas utiliser cette
commande pour vérifier la persistance.

Le seed reste un outil de réinitialisation volontaire : il vide aussi les métadonnées
CV pour respecter la clé étrangère vers people. Il ne supprime pas les fichiers sur
disque ; leur nettoyage est prévu en D5.4. Ne pas lancer le seed pour migrer une base.

## D5.3 : contrat SQL du dossier envoyé

La migration `003_frozen_application_dossier.sql` ajoute à `applications` :

- `cv_document_id INTEGER NULL`, référence la version exacte du CV, même si elle
  n’est plus le CV courant. La clé étrangère composite `(cv_document_id, person_id)`
  garantit que le document appartient au candidat de la candidature.
- `submitted_snapshot JSONB NULL`, emplacement du contenu figé au moment de l’envoi.
  La base accepte un objet JSON ou `NULL`; les candidatures préexistantes restent
  à `NULL` et toutes les lignes sont conservées.

Contrat d’écriture pour Lasry : dans la transaction de `POST /api/applications`,
enregistrer les associations choisies, la version CV facultative et un objet JSON
avec les informations qui doivent rester lisibles après modification du profil.
Exemple de structure de `submitted_snapshot` :

```json
{
  "person": { "first_name": "Ada", "last_name": "Lovelace", "email": "ada@example.com", "phone": null },
  "message": "Mon message envoyé",
  "projects": [{ "id": 12, "title": "Projet", "description": "Description copiée", "project_url": null, "repository_url": null }],
  "experiences": [{ "id": 4, "company": "Société", "position": "Développeuse", "description": "Expérience copiée", "start_date": "2024-01-01", "end_date": null }]
}
```

Les identifiants servent à retrouver l’origine, mais les valeurs des champs sont
copiées dans le JSON. `cv_document_id` reste séparé et vaut `NULL` sans CV.
Construire la copie depuis les données SQL du candidat et des éléments dont le
propriétaire correspond à la session ; ne pas accepter la copie fournie par le
client. L’association CV, le message, les lignes `application_projects` et
`application_experiences`, et la copie doivent être enregistrés dans la même
transaction. Les anciennes candidatures sans copie restent consultables avec les
données qu’elles possèdent.

## Tests manuels dans Swagger ou Postman

1. Appliquer la migration et démarrer le backend avec les commandes ci-dessus.
2. Se connecter via POST `/api/auth/login`, puis déposer un vrai PDF avec POST
   `/api/cv-documents` (Body > form-data > file de type File dans Postman).
3. Vérifier `201`, conserver l’identifiant et ouvrir `file_url` avec la même session.
   Vérifier la consultation, puis `?download=1`.
4. Vérifier GET `/api/cv-documents/current`, déposer un second PDF et vérifier que son
   identifiant devient courant pendant que le premier reste consultable.
5. Retirer le CV courant avec DELETE `/api/cv-documents/current` : GET renvoie `null`
   et les URLs des anciennes versions restent protégées et lisibles.
6. Tester un fichier texte renommé `.pdf`, un PDF chiffré, un fichier vide et un fichier
   supérieur à 5 Mo : refus explicites, sans document SQL ni fichier supplémentaire.
7. Reprendre une URL CV sans connexion (`401`), avec un autre USER (`404`) et ADMIN (`200`).
8. Faire `docker compose up -d --force-recreate backend`, se reconnecter et rouvrir
   le premier PDF : son contenu doit être identique.
9. Vérifier les parcours existants : recherche, profil/projets/expériences, candidature
   avec message, historique et administration. Lasry doit encore monter le composant CV dans le profil.

Les routes et leurs formats sont documentés dans `/api-docs`.

## Tests automatiques

Le fichier `backend/test/integration.test.js` garde son garde-fou `wtms_test_` et
utilise un répertoire temporaire pour les CV, supprimé après le test. Suivre les
commandes du [guide d’intégration](INTEGRATION-ETAPES-1-2.md). Le test applique
lui-même les migrations CV et dossier figé et vérifie leur réexécution, la conservation
des candidatures existantes, les références de propriété, les erreurs d’envoi, les droits,
les versions concurrentes, les octets du fichier, un fichier disparu et la suppression
du fichier lors d’un échec SQL forcé. Il vérifie aussi le contrat Swagger.

Sans `RUN_INTEGRATION_TESTS=1`, `npm test` ignore le test d’intégration : cela ne valide
pas les fonctionnalités. Avec une base isolée configurée, le résultat attendu est
26 scénarios réussis, soit 27 tests en comptant le parent.

## Suite pour Lasry

`id` identifie une version du document et `file_url` permet sa lecture protégée.
`frontend/src/components/profile/CvManager.jsx` fournit le composant React autonome
de gestion du CV courant. Lasry peut le monter dans `ProfilePage.jsx`.
`applications.cv_document_id` et `applications.submitted_snapshot` sont prêts pour
L5.2/L6.1. La base protège le lien du CV par propriétaire. Lasry reste propriétaire
de `POST /api/applications`, des tables de liaison et du contenu produit pour la copie ;
D5.4 complètera la consultation admin et le nettoyage du stockage.
