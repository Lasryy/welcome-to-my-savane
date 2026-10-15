# Welcome to My Savane

**Welcome to My Savane** est un job board réalisé en équipe dans le cadre du projet Epitech T-WEB-501. Les candidats peuvent consulter des offres, créer leur profil et envoyer des candidatures. L’administration gère les offres, les entreprises, les catégories et les comptes.

> Projet pédagogique en cours de développement. Les données de démonstration sont fictives ; ne l’utilisez pas pour stocker des données personnelles réelles.

## Fonctionnalités disponibles

- Consultation des offres publiées, recherche et filtres.
- Création de compte, connexion et déconnexion avec session.
- Profil candidat : coordonnées, projets et expériences.
- Candidatures : message de motivation, choix des projets et expériences à présenter, puis récapitulatif avant l’envoi.
- Historique des candidatures et suivi de leur statut.
- Espace d’administration pour les offres, les entreprises, les catégories, les candidatures et les comptes.
- Espace recruteur pour gérer les offres et candidatures de son entreprise ; les comptes recruteur sont attribués par un Admin.
- Documentation interactive de l’API avec Swagger.
- CV : bibliothèque de plusieurs CV PDF dans le Profil. Pour chaque candidature, le candidat choisit le CV envoyé ; le candidat et l’administration peuvent ensuite le consulter avec leur session.

## Prérequis

- Git
- Docker Desktop avec Docker Compose v2

Le lancement recommandé utilise Docker : Node.js et PostgreSQL sont déjà fournis dans les images des conteneurs. Pour lancer les commandes de développement hors de Docker, installez aussi Node.js 22 et npm.

## Installation depuis GitHub

Clonez le dépôt puis entrez dans son dossier :

```bash
git clone https://github.com/EpitechMscProPromo2029/T-WEB-501-PAR-5-1-job_board-6.git
cd T-WEB-501-PAR-5-1-job_board-6
```

Créez le fichier local de configuration :

```bash
cp .env.example .env
```

Remplacez `SESSION_SECRET` dans `.env` par une valeur privée générée avec :

```bash
openssl rand -hex 32
```

Gardez cette valeur dans votre `.env` local : **ne la publiez pas et ne la committez pas**. Le fichier `.env` est ignoré par Git.

Démarrez PostgreSQL, le backend et le frontend :

```bash
docker compose up --build -d
docker compose ps
```

Ouvrez ensuite :

- Site : <http://localhost:5173>
- API : <http://localhost:3000>
- Documentation Swagger : <http://localhost:3000/api-docs>

Les ports peuvent être changés dans `.env` avec `FRONT_PORT`, `BACK_PORT` et `POSTGRES_PORT`.

Pour suivre les journaux :

```bash
docker compose logs -f
```

Pour arrêter les services sans supprimer les données PostgreSQL :

```bash
docker compose down
```

### Base de données et données de démonstration

Au premier démarrage, lorsque le volume PostgreSQL est vide, Docker exécute automatiquement `db/job_board_schema.sql`, puis `db/seed_mvp.sql`. Le seed contient des offres, des entreprises, des catégories, des comptes, des projets, des expériences et des candidatures fictifs.

Les scripts d’initialisation ne sont **pas rejoués** si le volume PostgreSQL existe déjà. Pour supprimer la base locale et la recréer depuis zéro :

```bash
docker compose down -v
docker compose up --build -d
```

La commande `down -v` supprime définitivement les données conservées dans le volume local. Ne l’utilisez que si vous souhaitez vraiment réinitialiser votre base.

Comptes de démonstration créés par le seed :

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| Candidat | `alice.martin@example.com` | `JobBoardDemo2026!` |
| Administrateur | `admin@jobboard.example.com` | `JobBoardDemo2026!` |

Ces comptes sont présents après une initialisation neuve de la base. Ils servent uniquement au développement local et ne doivent pas être réutilisés en production.

## Technologies et versions

Le projet utilise Node.js 22 et PostgreSQL 17 dans Docker. Les versions exactes des dépendances JavaScript sont verrouillées dans les fichiers `package-lock.json`.

| Élément | Version utilisée |
| --- | --- |
| React | 19.3.0 |
| React DOM | 19.3.0 |
| React Router DOM | 7.18.4 |
| Vite | 8.3.3 |
| Tailwind CSS | 4.3.3 |
| Express | 5.2.1 |
| express-session | 1.19.0 |
| node-postgres (`pg`) | 8.23.1 |
| bcrypt | 6.0.0 |

## Commandes de développement

Les commandes suivantes s’exécutent depuis le dossier correspondant :

```bash
# Frontend
cd frontend
npm ci
npm run dev
npm run build
npm run lint
```

```bash
# Backend, dans un autre terminal
cd backend
npm ci
npm run dev
```

Pour un lancement manuel, le backend doit pouvoir joindre PostgreSQL et doit recevoir les variables de `.env`. Docker Compose configure ces connexions automatiquement ; pour une première prise en main, utilisez plutôt la procédure Docker ci-dessus.

## Structure du dépôt

```text
backend/   API Express, routes, contrôleurs, sessions et documentation Swagger
db/        Schéma PostgreSQL et données de démonstration
docs/      Roadmaps, choix techniques et guides du projet
frontend/  Interface React et styles Tailwind CSS
```

## API

Les routes de l’API sont documentées dans Swagger à l’adresse <http://localhost:3000/api-docs> lorsque Docker Compose est lancé.

Une base déjà initialisée doit recevoir les migrations dans l’ordre : `001_cv_documents.sql`, `002_current_cv.sql`, `003_frozen_application_dossier.sql`, `004_company_recruiters.sql`, puis `005_candidate_visibility.sql` (dans `db/migrations/`). La migration 004 ajoute le rôle recruteur et le rattachement des comptes à une entreprise ; la migration 005 ajoute le choix du candidat concernant sa visibilité auprès des recruteurs. Les nouveaux comptes recruteur sont attribués par un Admin depuis la page Utilisateurs. Le [guide CV](docs/GUIDE-CV.md) explique le stockage, les routes et le CV joint à une candidature.

Pour les requêtes protégées, le backend identifie le compte à partir de la session. Le navigateur conserve un cookie de session ; le mot de passe est stocké sous forme de hash bcrypt.

## État du projet

Le parcours candidat permet de choisir les projets, les expériences et un CV à joindre à une candidature, puis de vérifier un récapitulatif avant l’envoi. Les CV restent dans le Profil pour être réutilisés sur d’autres offres.
