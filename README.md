# WelcomeToMyJungle

Job board full-stack en cours de développement.

## Avancement actuel

- Base PostgreSQL : schéma et données de démonstration disponibles dans `db/`.
- Frontend : base React + Vite initialisée, interface métier à développer.
- Backend : structure Node.js prévue, API et authentification encore à implémenter.
- Docker Compose : configuration préparée pour PostgreSQL, backend et frontend ; elle devra être ajustée lorsque le backend sera ajouté.

## Technologies

React · Vite · Node.js/Express · PostgreSQL · Docker

## Installation rapide

Prérequis : Node.js, npm et Docker.

```bash
git clone <url-du-repo>
cd WelcomeToMyJungle
cp .env.example .env
```

### Base de données

Le schéma est chargé automatiquement au premier démarrage de PostgreSQL.

```bash
docker compose up -d postgres
```

Arrêter les conteneurs :

```bash
docker compose down
```

Pour charger les données de démonstration :

```bash
docker cp db/seed_mvp.sql postgres-db:/tmp/seed_mvp.sql
docker exec -i postgres-db psql -U admin -d welcometomyjungle -f /tmp/seed_mvp.sql
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Application disponible sur <http://localhost:5173>.

Commandes utiles :

```bash
npm run build   # build de production
npm run lint    # vérification ESLint
npm run preview # prévisualisation du build
```

## Structure

```text
db/        Schéma et seed PostgreSQL
frontend/  Application React/Vite
backend/   API Node.js prévue
```

## Prochaines étapes

1. Corriger/compléter la configuration Docker et créer l’API Express.
2. Ajouter l’inscription, la connexion et les sessions utilisateur.
3. Implémenter les offres, les candidatures et les profils.
4. Remplacer l’écran de démonstration Vite par l’interface du job board.
