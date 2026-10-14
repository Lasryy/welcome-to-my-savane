# CV du profil et CV joint aux candidatures

Le candidat peut conserver plusieurs CV PDF dans son profil, choisir un CV par défaut
et joindre un CV précis à chaque candidature. Les candidatures déjà présentes restent
valides même si elles ont été créées avant le rattachement d’un CV.

## Installation

Pour une base Docker existante, appliquer la migration additive avant de redémarrer l’API :

```sh
docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < db/migrations/001_cv_documents.sql
docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < db/migrations/002_current_cv.sql
docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < db/migrations/003_frozen_application_dossier.sql
docker compose up -d --build --renew-anon-volumes backend
```

Les migrations sont additives et peuvent être réexécutées. La troisième ajoute une
référence nullable entre une candidature et un CV appartenant au même candidat.
Pour une installation neuve, `db/job_board_schema.sql` crée déjà les tables et liens nécessaires.
Les scripts d’initialisation Docker ne migrent pas les volumes PostgreSQL existants.

Hors Docker : `npm --prefix backend ci`, puis `npm --prefix backend run dev`.
Le répertoire par défaut est `backend/storage/cv`. Une variable d’environnement
`CV_STORAGE_DIR` peut définir un autre emplacement ; utiliser un chemin absolu.
Le dossier de stockage est ignoré par Git et exclu du contexte de construction Docker.

## Contrat API

### GET /api/cv-documents et POST /api/cv-documents

GET liste les CV du profil, avec le CV par défaut en premier. Chaque élément contient
son nom, sa taille, sa date d’ajout, `is_current` et un `file_url` protégé.

POST ajoute un nouveau document indépendant. Les CV déjà déposés restent disponibles ;
le dernier dépôt devient le CV par défaut.

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
  "is_current": true,
  "file_url": "/api/cv-documents/1/file"
}
```

L’identité vient de la session. Le nom interne est un UUID généré par le serveur,
indépendant du nom original. Le chemin interne et le propriétaire ne sont pas exposés.
Chaque dépôt crée un document indépendant. Le candidat peut consulter les CV depuis
son profil et changer le CV par défaut sans perdre les autres fichiers.

### PUT /api/cv-documents/:id/current

Choisit comme CV par défaut un document déjà enregistré appartenant au compte connecté.
Ce choix sert de préselection dans le formulaire ; le candidat peut en choisir un autre
pour une candidature donnée.

### GET /api/cv-documents/current et DELETE /api/cv-documents/current

Ces routes authentifiées n’utilisent que le compte de la session. GET retourne
les métadonnées du CV courant et son `file_url`, ou `null` quand le profil ne contient
pas de CV. DELETE retire le statut courant et répond `204`, même si aucun CV n’était
sélectionné. La version et le fichier sont conservés pour qu’un futur dossier envoyé
puisse s’y référer.

À chaque nouveau dépôt ou changement de CV par défaut, un verrou SQL sur le compte
sérialise les modifications concurrentes. Une transaction désigne un seul CV par défaut.
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
les références de candidature contrôlant le propriétaire. `applications.cv_document_id`
est aussi relié à `applications.person_id` : la base empêche d’associer le CV d’une
autre personne à une candidature. `applications.submitted_snapshot` est un emplacement
nullable pour une copie du dossier ; le parcours actuel ne le remplit pas encore.

Docker utilise le volume nommé `cv_data` monté à `/app/storage/cv`. Les PDF restent
présents après redémarrage ou recréation du backend. Les sessions sont actuellement
en mémoire : après un redémarrage, se reconnecter avant de vérifier le fichier.
`docker compose down -v` effacerait les volumes SQL et CV : ne pas utiliser cette
commande pour vérifier la persistance.

Le seed reste un outil de réinitialisation volontaire : il vide aussi les métadonnées
CV pour respecter la clé étrangère vers people. Il ne supprime pas les fichiers sur
disque. Ne pas lancer le seed pour migrer une base.

Les fichiers UUID sans métadonnée sont nettoyés avec `npm --prefix backend run cleanup:cv`.
Le script supprime uniquement les fichiers orphelins de plus de 24 heures ; il conserve
les CV ayant une ligne en base, qu’ils soient courants ou joints à une candidature.

## Tests manuels dans Swagger ou Postman

1. Appliquer la migration et démarrer le backend avec les commandes ci-dessus.
2. Se connecter via POST `/api/auth/login`, puis déposer un vrai PDF avec POST
   `/api/cv-documents` (Body > form-data > file de type File dans Postman).
3. Vérifier `201`, conserver l’identifiant et ouvrir `file_url` avec la même session.
   Vérifier la consultation, puis `?download=1`.
4. Vérifier GET `/api/cv-documents`, déposer un second PDF et vérifier que les deux
   documents apparaissent ; le nouveau devient le CV par défaut.
5. Retirer le CV courant avec DELETE `/api/cv-documents/current` : GET renvoie `null`
   et les URLs des anciennes versions restent protégées et lisibles.
6. Tester un fichier texte renommé `.pdf`, un PDF chiffré, un fichier vide et un fichier
   supérieur à 5 Mo : refus explicites, sans document SQL ni fichier supplémentaire.
7. Reprendre une URL CV sans connexion (`401`), avec un autre USER (`404`) et ADMIN (`200`).
8. Faire `docker compose up -d --force-recreate backend`, se reconnecter et rouvrir
   le premier PDF : son contenu doit être identique.
9. Depuis le Profil, déposer plusieurs PDF, les consulter et changer le CV par défaut.
   Postuler en choisissant un CV différent selon l’offre ; vérifier le récapitulatif,
   puis le lien vers le document envoyé dans l’historique et l’administration.

Les routes et leurs formats sont documentés dans `/api-docs`.

## Tests automatiques

Le fichier `backend/test/integration.test.js` garde son garde-fou `wtms_test_` et
utilise un répertoire temporaire pour les CV, supprimé après le test. Il applique les
migrations CV et dossier figé et couvre notamment leur réexécution et la conservation
des candidatures existantes.

Sans `RUN_INTEGRATION_TESTS=1`, `npm test` ignore le test d’intégration : cela ne valide
pas les fonctionnalités. Utilise uniquement une base isolée dont le nom commence par
`wtms_test_` pour lancer ces scénarios.

## CV associé à une candidature

`POST /api/applications` exige `ad_id` et `message`. `cv_document_id` est facultatif ;
s’il est renseigné, le serveur vérifie que le CV appartient au compte connecté. La
candidature garde le document choisi si le candidat change ensuite son CV par défaut.
Les anciennes lignes peuvent aussi avoir `cv_document_id = NULL`.
