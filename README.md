# Welcome to My Savane

Job board full-stack en cours de développement.

## Avancement actuel

- Base PostgreSQL : schéma dans `db/job_board_schema.sql` et peuplement détaillé dans `db/seed_mvp.sql`.
- Frontend : job board public relié à l’API, détail des offres et espace d’administration en React + Vite.
- Backend : API Express connectée à PostgreSQL pour les offres publiques et l’administration des offres, entreprises et catégories.
- Comptes : inscription, connexion, déconnexion, profil et sessions côté serveur.
- Candidatures : formulaire prérempli et envoi en SQL ; visiteurs, doublons et offres fermées sont refusés.
- Administration : accès réservé à `ADMIN` dans React et dans les API, y compris les alias entreprises/catégories.
- Étape 3 Lasry : historique personnel, suivi des statuts, liste des candidatures admin et gestion des comptes.
- Swagger : documentation disponible sur `http://localhost:3000/api-docs`, spécification sur `/api-docs/openapi.json`.
- Étape 3 Denis : CRUD des offres complet, boutons de fermeture/réouverture et suppression refusée lorsqu’une candidature est liée.
- Étape 4 Lasry : profil éditable sur `/profile`, avec gestion des projets et expériences du compte connecté. Les API vérifient le propriétaire, les champs autorisés, les URLs et les dates ; supprimer une preuve déjà liée à une candidature est refusé.
- Étape 4 Denis (V3) : recherche SQL, filtres combinables, tri récent/salaire et pagination, choix conservés dans l’URL et présentation des entreprises sur les offres.
- Docker Compose : PostgreSQL, API et frontend peuvent être lancés ensemble.
- Étape 5 Denis, D5.1 : dépôt de CV PDF (5 Mo), métadonnées SQL et consultation réservée au propriétaire ou aux ADMIN, avec volume Docker persistant. [Installation et tests](docs/ETAPE-5-DENIS.md).

## Technologies

React · Vite · Node.js/Express · PostgreSQL · Docker

## Installation et commandes

Prérequis : Node.js, npm et Docker.

```bash
cp .env.example .env
docker compose up -d postgres
```

Le schéma et le peuplement sont chargés automatiquement au premier démarrage de PostgreSQL, lorsque le volume est vide. Le fichier `db/seed_mvp.sql` contient des données entièrement fictives :

- 30 entreprises et 20 catégories de métiers ;
- 240 offres détaillées : 195 publiées et 45 fermées ;
- 120 candidats et 2 administrateurs, avec des mots de passe hachés en bcrypt ;
- 360 projets, 360 expériences et 720 candidatures ;
- 1 440 projets joints et 1 440 expériences jointes aux candidatures.

Les offres couvrent le développement, la data, la cybersécurité, le design, le commerce, les RH, la finance, l’industrie et d’autres secteurs. Chaque description comprend un contexte sectoriel, six missions propres au métier, les livrables, l’accompagnement, les apprentissages, le profil, les compétences, les langues et les conditions du poste. Les attentes sont adaptées au niveau : junior, confirmé, senior, stage ou alternance. Les fourchettes `salary_min` et `salary_max` sont exprimées en euros bruts pour le temps de travail indiqué : `salary_period = 'month'` pour les stages et alternances, et `'year'` pour les autres contrats. Deux bornes à `NULL` indiquent un montant non renseigné. Les dates sont calculées par rapport au jour du chargement.

Le seed respecte les valeurs du schéma actuel : contrats `permanent`, `fixed_term`, `internship`, `apprenticeship`, temps de travail `full_time` ou `part_time` et candidatures `sent`, `in_progress`, `technical_test`, `accepted` ou `rejected`. Les associations de pièces jointes renseignent `person_id` afin de respecter les clés étrangères composites qui garantissent leur propriétaire.

Pour recharger le peuplement sur une base de développement utilisant déjà le schéma actuel de `db/job_board_schema.sql` (cette commande ne migre pas une ancienne base) :

```bash
docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < db/seed_mvp.sql
```

**Attention : cette commande remplace toutes les données des neuf tables et réinitialise leurs identifiants.** Le script utilise une transaction et vérifie les volumes, les propriétaires des pièces jointes, les doublons et la chronologie avant validation. Une erreur annule le chargement.

Comptes de démonstration : `alice.martin@example.com` (candidat) et `admin@jobboard.example.com` (administrateur). Tous les comptes du seed utilisent le mot de passe `JobBoardDemo2026!`. La connexion est disponible sur `/login`.

Lancer le frontend :

```bash
cd frontend
npm install
npm run dev
```

Application : <http://localhost:5173>

Documentation interactive de l’API : <http://localhost:3000/api-docs> (ou le port défini par `BACK_PORT` dans `.env`). Le document OpenAPI JSON est disponible sur `/api-docs/openapi.json`.

Commandes frontend :

```bash
npm run build   # build de production
npm run lint    # vérification ESLint
npm run preview # prévisualisation du build
```

Arrêter les conteneurs :

```bash
docker compose down
```

Lancer les trois services :

```bash
docker compose up --build
```

## Structure

```text
db/        Schéma et seed PostgreSQL
frontend/  Application React/Vite
backend/   API Express, contrôleurs, routes et connexion PostgreSQL (`pg`)
```

## Prochaines étapes

Les deux parties de l’étape 4 et leurs contrats sont documentés : [recherche et catalogue public](docs/ETAPE-4-DENIS.md) et [profil candidat](docs/superpowers/specs/2026-10-13-etape-4-profil-candidat.md).

Le dépôt et le stockage protégé des CV sont livrés en D5.1. Une base existante nécessite la [migration CV](docs/ETAPE-5-DENIS.md). Prochaine livraison Denis : gestion du CV courant et composants React (D5.2), puis préparation du dossier figé (D5.3) et conservation/nettoyage (D5.4). Lasry branchera la sélection des projets, expériences et CV aux candidatures.

La fusion des étapes 1 et 2 et les commandes de vérification sont décrites dans [le guide d’intégration](docs/INTEGRATION-ETAPES-1-2.md).
