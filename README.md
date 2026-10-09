# Welcome to My Savane

Job board full-stack en cours de développement.

## Avancement actuel

- Base PostgreSQL : schéma dans `db/job_board_schema.sql` et peuplement détaillé dans `db/seed_mvp.sql`.
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

Le schéma et le peuplement sont chargés automatiquement au premier démarrage de PostgreSQL, lorsque le volume est vide. Le fichier `db/seed_mvp.sql` contient des données entièrement fictives :

- 30 entreprises et 20 catégories de métiers ;
- 240 offres détaillées : 195 publiées, 15 brouillons et 30 fermées ;
- 120 candidats et 2 administrateurs, avec des mots de passe hachés en bcrypt ;
- 360 projets, 360 expériences et 720 candidatures ;
- 1 440 projets joints et 1 440 expériences jointes aux candidatures.

Les offres couvrent le développement, la data, la cybersécurité, le design, le commerce, les RH, la finance, l’industrie et d’autres secteurs. Chaque description comprend un contexte sectoriel, six missions propres au métier, les livrables, l’accompagnement, les apprentissages, le profil, les compétences, les langues et les conditions du poste. Les attentes sont adaptées au niveau : junior, confirmé, senior, stage ou alternance. Les montants de `salary` sont toujours exprimés en euros bruts annuels, y compris les stages et alternances ; `NULL` indique un montant non renseigné. Les dates sont calculées par rapport au jour du chargement.

Pour recharger le peuplement sur une base existante de développement :

```bash
docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < db/seed_mvp.sql
```

**Attention : cette commande remplace toutes les données des neuf tables et réinitialise leurs identifiants.** Le script utilise une transaction et vérifie les volumes, les propriétaires des pièces jointes, les doublons et la chronologie avant validation. Une erreur annule le chargement.

Comptes de démonstration : `alice.martin@example.com` (candidat) et `admin@jobboard.example.com` (administrateur). Tous les comptes du seed utilisent le mot de passe `JobBoardDemo2026!`. Le seed prépare les comptes pour une future authentification ; il ne crée pas de routes de connexion.

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
