# Étape 5 Denis - D5.1 : dépôt et lecture du CV PDF

Cette première livraison ajoute le stockage des CV et deux routes protégées.
D5.2 (CV courant et composants React), D5.3 (copie figée du dossier) et D5.4
(conservation des versions jointes et nettoyage) restent à réaliser séparément.
Les pages profil et candidature de Lasry gardent leur comportement actuel.

## Installation

Pour une base Docker existante, appliquer la migration additive avant de redémarrer l’API :

```sh
docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < db/migrations/001_cv_documents.sql
docker compose up -d --build backend
```

La migration crée seulement `cv_documents` et son index. Elle peut être réexécutée ;
elle ne modifie ni les comptes ni les candidatures. Pour une installation neuve,
`db/job_board_schema.sql` crée déjà cette table avant le chargement du seed.
Les scripts d’initialisation Docker ne migrent pas les volumes PostgreSQL existants.

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
Chaque dépôt crée une version indépendante ; il ne désigne pas encore de CV courant
et ne modifie aucune candidature.

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
`size_bytes` et `created_at`. Les contraintes vérifient le propriétaire, le nom de
stockage, le type PDF et la taille. La paire `(id, person_id)` est unique pour préparer
les futures références de candidature contrôlant le propriétaire.

Docker utilise le volume nommé `cv_data` monté à `/app/storage/cv`. Les PDF restent
présents après redémarrage ou recréation du backend. Les sessions sont actuellement
en mémoire : après un redémarrage, se reconnecter avant de vérifier le fichier.
`docker compose down -v` effacerait les volumes SQL et CV : ne pas utiliser cette
commande pour vérifier la persistance.

Le seed reste un outil de réinitialisation volontaire : il vide aussi les métadonnées
CV pour respecter la clé étrangère vers people. Il ne supprime pas les fichiers sur
disque ; leur nettoyage est prévu en D5.4. Ne pas lancer le seed pour migrer une base.

## Tests manuels dans Swagger ou Postman

1. Appliquer la migration et démarrer le backend avec les commandes ci-dessus.
2. Se connecter via POST `/api/auth/login`, puis déposer un vrai PDF avec POST
   `/api/cv-documents` (Body > form-data > file de type File dans Postman).
3. Vérifier `201`, conserver l’identifiant et ouvrir `file_url` avec la même session.
   Vérifier la consultation, puis `?download=1`.
4. Déposer un second PDF : nouvel identifiant, premier fichier toujours consultable.
5. Tester un fichier texte renommé `.pdf`, un PDF chiffré, un fichier vide et un fichier
   supérieur à 5 Mo : refus explicites, sans document SQL ni fichier supplémentaire.
6. Reprendre l’URL sans connexion (`401`), avec un autre USER (`404`) et avec ADMIN (`200`).
7. Faire `docker compose up -d --force-recreate backend`, se reconnecter et rouvrir
   le premier PDF : son contenu doit être identique.
8. Vérifier les parcours existants : recherche, profil/projets/expériences, candidature
   avec message, historique et administration. Le profil n’a pas encore de section CV.

Les routes et leurs formats sont documentés dans `/api-docs`.

## Tests automatiques

Le fichier `backend/test/integration.test.js` garde son garde-fou `wtms_test_` et
utilise un répertoire temporaire pour les CV, supprimé après le test. Suivre les
commandes du [guide d’intégration](INTEGRATION-ETAPES-1-2.md). Le test applique
lui-même la migration CV et vérifie sa réexécution, les erreurs d’envoi, les droits,
les versions concurrentes, les octets du fichier, un fichier disparu et la suppression
du fichier lors d’un échec SQL forcé. Il vérifie aussi le contrat Swagger.

Sans `RUN_INTEGRATION_TESTS=1`, `npm test` ignore le test d’intégration : cela ne valide
pas les fonctionnalités. Avec une base isolée configurée, le résultat attendu est
24 scénarios réussis, soit 25 tests en comptant le parent.

## Suite pour Lasry

`id` identifie une version du document et `file_url` permet sa lecture protégée.
La sélection du CV courant, les composants React, le champ `cv_document_id` dans
les candidatures et la copie figée ne sont pas encore livrés. Attendre les contrats
D5.2/D5.3 avant de brancher l’envoi du dossier complet.
