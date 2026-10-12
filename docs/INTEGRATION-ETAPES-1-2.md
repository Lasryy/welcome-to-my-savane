# Intégration Lasry + Denis : étapes 1 et 2

Branche : `integration/etapes-1-2`.

Sources : `feature/lasry-etape-2` au commit `6bb7bd7` et `denis` au commit `e40c49d`. Le périmètre suit les étapes 1 et 2 de la Roadmap Job Board V2. Les fonctions supplémentaires déjà présentes chez Denis sont conservées.

## Fonctions réunies

| Partie | Fonctions conservées |
| --- | --- |
| Lasry, étape 1 | Inscription, connexion, déconnexion, profil SQL et contrôle du rôle admin. |
| Lasry, étape 2 | Formulaire « Postuler », identité préremplie, candidature en SQL, refus sans connexion, en double ou sur une offre fermée. |
| Denis, étape 1 | Liste des offres publiées, cartes avec salaire, détail et refus des offres absentes ou fermées. |
| Denis, étape 2 | Accueil admin, CRUD entreprises et catégories, liste des offres publiées et fermées. |
| Autres fonctions existantes de Denis | Recherche et filtres frontend, création/modification d’offres, avertissement des modifications non enregistrées, Design Lab et migration Tailwind. |

## Choix de fusion

- `backend/src/app.js` monte les routes des deux branches. La configuration `.env` est chargée avant la connexion SQL et le middleware de session.
- `require_admin.js` contrôle la session puis relit le rôle dans `people`. Le contrôle couvre les routes `/api/admin/ads`, `/api/companies`, `/api/admin/companies`, `/api/categories` et `/api/admin/categories`, pour tous les verbes HTTP.
- `frontend/src/App.jsx` garde le routeur de Denis pour que `useBlocker` fonctionne. Les pages de Lasry sont ajoutées et `AdminRoute` protège toutes les pages du catalogue. Après connexion, une demande d’accès admin revient à la page demandée.
- Les pages publiques et le catalogue gardent les composants Tailwind de Denis. Les pages auth et candidature utilisent les classes lisibles avec `@apply` de Lasry. Toutes partagent `styles/tailwind.css`. L’ancienne feuille `site.css`, qui n’était plus importée, a été retirée.
- Le détail d’offre garde sa mise en page Tailwind et ouvre `ApplicationForm`. Après la connexion, y compris après une inscription depuis cette offre, le parcours revient à l’offre et rouvre le formulaire.
- Les neuf conflits Git ont été résolus. Les fichiers fusionnés automatiquement ont aussi été contrôlés : suppression de l’import `process` en double dans Vite et choix d’un seul routeur dans l’application.

## Vérifications

Le frontend est vérifié avec :

```sh
npm --prefix frontend run lint
npm --prefix frontend run build
```

Le test `backend/test/integration.test.js` utilise de vraies requêtes HTTP et PostgreSQL. Il couvre les comptes, les droits sur chaque URL admin, les CRUD entreprises/catégories, les offres publiques/admin, les candidatures, la fermeture/réouverture, les relations SQL, un changement de rôle et la déconnexion.

Il est ignoré par `npm test` si `RUN_INTEGRATION_TESTS=1` n’est pas défini. Pour le lancer, utiliser une base temporaire dédiée : le nom doit commencer par `wtms_test_` et le schéma doit être chargé. Ne pas utiliser votre base de développement pour ces tests.

Depuis la racine du dépôt :

```sh
docker run --rm -d --name wtms-integration-test-db \
  --tmpfs /var/lib/postgresql/data \
  -e POSTGRES_USER=wtms_test \
  -e POSTGRES_PASSWORD=local_integration_only \
  -e POSTGRES_DB=wtms_test_integration \
  -p 127.0.0.1:5545:5432 postgres:17

until docker exec wtms-integration-test-db pg_isready -U wtms_test -d wtms_test_integration; do
  sleep 1
done

docker exec -i wtms-integration-test-db \
  psql -v ON_ERROR_STOP=1 -U wtms_test -d wtms_test_integration \
  < db/job_board_schema.sql

RUN_INTEGRATION_TESTS=1 \
DB_HOST=127.0.0.1 DB_PORT=5545 \
DB_USER=wtms_test DB_PASSWORD=local_integration_only \
DB_NAME=wtms_test_integration \
SESSION_SECRET=temporary-integration-session NODE_ENV=test \
npm --prefix backend test

docker stop wtms-integration-test-db
```

La base temporaire disparaît à l’arrêt du conteneur. Les douze scénarios doivent réussir (Node affiche treize tests en comptant le test parent), y compris les vérifications de modification et de suppression contrôlée ajoutées pour l’étape 3 de Denis.

Le contrôle dans le navigateur couvre également la recherche publique, l’inscription, la connexion avec retour à l’offre, le préremplissage, l’envoi, le profil, la déconnexion, le refus admin pour un `USER`, les listes admin et l’avertissement des modifications non enregistrées.

## Suite prévue par la roadmap

Pour Lasry : historique des candidatures, statuts et CRUD utilisateurs admin à l’étape 3.

L’étape 3 de Denis est terminée : les formulaires de création/modification déjà présents sont conservés, la liste admin propose la fermeture/réouverture et la suppression contrôlée refuse les offres avec candidatures liées. La recherche publique actuellement présente est un filtre frontend ; la recherche, les filtres et le tri côté API restent prévus à l’étape 4.
