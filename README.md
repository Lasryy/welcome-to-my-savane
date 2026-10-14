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
- Documentation interactive de l’API avec Swagger.
- CV (D5.1 Denis) : dépôt de PDF jusqu’à 5 Mo, métadonnées dans PostgreSQL et fichier privé sur un volume Docker. L’API autorise la consultation au propriétaire ou à un administrateur.

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

Compte candidat de démonstration :

- E-mail : `alice.martin@example.com`
- Mot de passe : `JobBoardDemo2026!`

Un compte administrateur de démonstration existe aussi : `admin@jobboard.example.com`, avec le même mot de passe. Ces identifiants sont réservés au seed local et ne doivent pas être réutilisés en production.

## Technologies et versions

Les versions des dépendances JavaScript viennent des `package-lock.json`. Node.js et PostgreSQL correspondent aux versions observées dans les conteneurs locaux le 14 octobre 2026. npm est fourni avec Node.js. Les tags Docker du dépôt (`node:22-alpine` et `postgres:17`) ne fixent que leur version majeure : Docker peut donc télécharger un correctif plus récent lors d’une nouvelle installation.

| Élément | Version utilisée |
| --- | --- |
| Node.js | 22.23.3 (`node:22-alpine` dans les Dockerfiles) |
| PostgreSQL | 17.11 (`postgres:17` dans Compose) |
| React | 19.3.0 |
| React DOM | 19.3.0 |
| React Router DOM | 7.18.4 |
| Vite | 8.3.3 |
| Tailwind CSS | 4.3.3 |
| Express | 5.2.1 |
| express-session | 1.19.0 |
| node-postgres (`pg`) | 8.23.1 |
| bcrypt | 6.0.0 |

Versions de l’environnement Docker local observées : Docker Engine 29.8.0 et Docker Compose 5.5.1. Les versions Node.js et PostgreSQL peuvent évoluer si les images `node:22-alpine` ou `postgres:17` sont reconstruites plus tard ; les numéros du tableau décrivent l’environnement utilisé pour cette documentation.

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

Les routes principales sont documentées dans Swagger à l’adresse <http://localhost:3000/api-docs> lorsque Docker Compose est lancé.

- Authentification : `/api/auth`
- Offres : `/api/ads` et `/api/public`
- Candidatures : `/api/applications`
- Profil, projets et expériences : `/api/people`, `/api/projects`, `/api/experiences`
- CV : `/api/cv-documents`
- Administration : `/api/admin`

Une base déjà initialisée doit recevoir la migration `db/migrations/001_cv_documents.sql` pour créer la table des CV. Le guide [Étape 5 Denis](docs/ETAPE-5-DENIS.md) explique la migration, le stockage Docker et les tests des routes CV.

Pour les requêtes protégées, le backend identifie le compte à partir de la session. Le navigateur conserve un cookie de session ; le mot de passe est stocké sous forme de hash bcrypt.

## État du projet

Les étapes 1 à 4 sont intégrées dans `main`. L’étape 5 est en cours : le parcours candidat permet de sélectionner les projets et expériences à joindre à une candidature, de vérifier un récapitulatif et de consulter le nombre de candidatures envoyées dans la journée. Le dépôt et la consultation sécurisée du CV (D5.1 Denis) sont disponibles côté API ; son interface et son rattachement à une candidature restent à réaliser.
