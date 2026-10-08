# Welcome to My Savane

Job board full-stack en cours de développement.

## Avancement actuel

- Base PostgreSQL : schéma dans `db/job_board_schema.sql` et seed MVP dans `db/seed_mvp.sql`.
- Frontend : base React + Vite initialisée, interface métier à développer.
- Backend : dépendances Node.js installées, mais l’API et l’authentification restent à implémenter.
- Docker Compose : services configurés ; le backend ne démarre pas encore car `backend/src/app.js` n’existe pas.

## Technologies

React · Vite · Node.js/Express · PostgreSQL · Docker

## Installation et commandes

Prérequis : Node.js, npm et Docker.

```bash
cp .env.example .env
docker compose up -d postgres
```

Le schéma est chargé automatiquement au premier démarrage de PostgreSQL. Pour charger les données de démonstration :

```bash
docker cp db/seed_mvp.sql postgres-db:/tmp/seed_mvp.sql
docker exec -i postgres-db psql -U admin -d WTMS -f /tmp/seed_mvp.sql
```

Lancer le frontend :

```bash
cd frontend
npm install
npm run dev
```

Application : <http://localhost:5173>

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

Le lancement complet avec `docker compose up --build` attend la création du backend.

## Structure

```text
db/        Schéma et seed PostgreSQL
frontend/  Application React/Vite
backend/   API Node.js à implémenter
```

## Prochaines étapes

1. Créer l’API Express dans `backend/src/app.js`.
2. Ajouter l’inscription, la connexion et les sessions utilisateur.
3. Implémenter les offres, candidatures et profils.
4. Remplacer l’écran de démonstration Vite par l’interface du job board.
