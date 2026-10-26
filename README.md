# Welcome to My Savane

<p align="center">
  <img src="frontend/public/logo-welcome-to-my-savane.svg" alt="Logo Welcome to My Savane" width="270">
</p>

<p align="center">
  <strong>Un nouveau job. Un nouvel horizon.</strong><br>
  Un job board en français pour découvrir des offres et préparer sa candidature.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=20232a">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white">
  <img alt="Node.js et Express" src="https://img.shields.io/badge/Node.js%20%2B%20Express-222222?logo=express&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white">
  <img alt="Docker Compose" src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white">
</p>

> Projet pédagogique Epitech T-WEB-501. Les comptes et annonces préchargés sont fictifs. Utilisez uniquement des données de démonstration.

## Origine et contributions

Cette copie personnelle présente un **projet terminé, réalisé en binôme** dans le cadre d’EPITECH. Elle conserve l’historique du [dépôt d’équipe](https://github.com/EpitechMscProPromo2029/T-WEB-501-PAR-5-1-job_board-6) et les contributions de ses deux auteurs.

- **[Lasry BESKIWIN](https://github.com/Lasryy)** : authentification et sessions, profils, parcours de candidature et sélection des éléments du dossier, copie figée en transaction SQL, suivi des candidatures et comptes admin, API d’annuaire candidat avec visibilité choisie, accueil et expérience de recherche.
- **[Denis Vuong](https://github.com/DenisVuong)** : catalogue et filtres d’offres, administration du catalogue, dépôt et versionnage des CV, espace entreprise et gestion des comptes recruteurs.

L’intégration, les corrections et la livraison sont un travail de binôme. Cette présentation n’attribue pas l’ensemble de l’application à un seul auteur.

### Un nom volontairement parodique

**Welcome To My Savane** est un clin d’œil parodique à « Welcome to the Jungle ». Le mot français **« savane »** remplace volontairement l’anglais **« savanna »** pour accentuer ce décalage.

## Le projet

Welcome to My Savane est une plateforme de recrutement en français qui accompagne candidats et recruteurs, de la recherche d’offres au suivi des candidatures.

## L’application en images

Voici six aperçus de l’application sur ordinateur et sur mobile. Cliquez sur une image pour ouvrir la capture complète.

<table>
  <tr>
    <td width="50%" valign="top">
      <a href="docs/assets/readme/01-accueil-desktop.png"><img src="docs/assets/readme/previews/01-accueil-desktop.webp" alt="Page d’accueil sur ordinateur : la recherche d’offres et l’illustration de la savane." width="100%"></a>
      <p><strong>Accueil</strong><br>La page de départ et son moteur de recherche.</p>
    </td>
    <td width="50%" valign="top">
      <a href="docs/assets/readme/02-offres-filtrees-desktop.png"><img src="docs/assets/readme/previews/02-offres-desktop.webp" alt="Page des offres sur ordinateur avec les filtres de contrat, de domaine et d’entreprise." width="100%"></a>
      <p><strong>Explorer les offres</strong><br>Parcourir les annonces et affiner la recherche.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="docs/assets/readme/03-detail-offre-desktop.png"><img src="docs/assets/readme/previews/03-detail-offre-desktop.webp" alt="Détail d’une offre CraftWorks avec le poste, le contrat, le lieu et la rémunération." width="100%"></a>
      <p><strong>Détail d’une offre</strong><br>Consulter le poste, l’entreprise et les conditions.</p>
    </td>
    <td width="50%" valign="top">
      <a href="docs/assets/readme/04-candidature-recap-desktop.png"><img src="docs/assets/readme/previews/04-candidature-desktop.webp" alt="Préparation d’une candidature : choisir les projets et expériences à présenter." width="100%"></a>
      <p><strong>Préparer une candidature</strong><br>Choisir les projets et expériences à joindre au dossier.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="docs/assets/readme/05-administration-desktop.png"><img src="docs/assets/readme/previews/05-administration-desktop.webp" alt="Tableau de bord d’administration et accès à la gestion des offres, entreprises, catégories et candidatures." width="100%"></a>
      <p><strong>Administration</strong><br>Gérer les offres, entreprises, catégories et candidatures.</p>
    </td>
    <td width="50%" valign="top">
      <a href="docs/assets/readme/06-accueil-mobile.png"><img src="docs/assets/readme/previews/06-accueil-mobile.webp" alt="Page d’accueil adaptée à un écran de téléphone, avec un menu compact et une recherche empilée." width="42%"></a>
      <p><strong>Version mobile</strong><br>La page d’accueil s’adapte aussi aux téléphones.</p>
    </td>
  </tr>
</table>

## Ce que l’application permet de faire

### Côté candidat

- Parcourir les offres, les rechercher par métier ou ville, appliquer des filtres et les enregistrer en favoris.
- Ouvrir une offre pour consulter sa description, son entreprise, son contrat et sa rémunération lorsqu’elle est renseignée.
- Créer un compte et compléter son profil avec des projets, des expériences et plusieurs CV PDF.
- Préparer une candidature en choisissant le CV, les projets et les expériences à joindre, puis relire le récapitulatif avant l’envoi.
- Retrouver ses candidatures et consulter leur statut.
- Choisir si son profil peut être visible dans l’annuaire recruteur.

### Côté recruteur et administration

- L’espace recruteur permet de gérer les offres et candidatures d’une entreprise, de consulter les profils rendus visibles et de gérer les comptes de son équipe.
- L’espace d’administration permet de gérer les offres, les entreprises, les catégories, les comptes et les candidatures. Un administrateur attribue les accès recruteur.

La documentation de l’API est disponible sur [Swagger](http://localhost:3000/api-docs) une fois le projet lancé.

## Présentation de soutenance

[Consulter la présentation de Welcome to My Savane (PDF)](docs/Welcome-to-My-Savane-Soutenance.pdf).

## Démarrage local

Prérequis :

- **Windows ou macOS :** [Docker Desktop](https://docs.docker.com/desktop/) installé et démarré.
- **Linux :** Docker Engine et le [plugin Docker Compose](https://docs.docker.com/compose/install/linux/).

Docker démarre le frontend, l’API et PostgreSQL. Il n’est pas nécessaire d’installer Node.js ou PostgreSQL sur l’ordinateur pour utiliser l’application.

Clonez le dépôt et placez-vous à sa racine. Ces commandes fonctionnent dans PowerShell, Git Bash et les terminaux macOS/Linux :

```bash
git clone https://github.com/Lasryy/welcome-to-my-savane.git
cd welcome-to-my-savane
```

Sans Git, téléchargez le dépôt avec **Code → Download ZIP** sur [GitHub](https://github.com/Lasryy/welcome-to-my-savane), extrayez-le, puis ouvrez un terminal dans le dossier qui contient `docker-compose.yml`.

Créez le fichier de configuration local :

**macOS ou Linux :**

```bash
cp .env.example .env
```

**Windows PowerShell :**

```powershell
Copy-Item .env.example .env
```

Dans `.env`, remplacez `SESSION_SECRET` par une valeur aléatoire privée. Générez-en une :

**macOS ou Linux :** `openssl rand -hex 32`

**Windows PowerShell :**

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[BitConverter]::ToString($bytes).Replace("-", "").ToLower()
```

Copiez la valeur affichée dans `.env`. Gardez ce fichier local et ne le partagez pas.

Démarrez les services depuis la racine du projet :

```bash
docker compose up --build -d
```

Le premier démarrage peut prendre quelques minutes. Vérifiez l’état des services avec `docker compose ps`.

Ouvrez ensuite l’application :

- **Site :** <http://localhost:5173>
- **API :** <http://localhost:3000>
- **Documentation API :** <http://localhost:3000/api-docs>

À la première initialisation d’une base vide, des données de démonstration sont ajoutées.

Si un port est déjà utilisé, arrêtez l’application qui l’occupe ou modifiez les ports dans `.env`, puis relancez Compose.

### Comptes de démonstration

| Profil | Adresse e-mail | Mot de passe |
| --- | --- | --- |
| Candidat | `alice.martin@example.com` | `JobBoardDemo2026!` |
| Recruteur (NovaTech) | `recruteur@jobboard.example.com` | `JobBoardDemo2026!` |
| Administrateur | `admin@jobboard.example.com` | `JobBoardDemo2026!` |

Ces comptes sont destinés à la démonstration locale uniquement.

## Arrêter ou relancer le projet

Afficher les journaux :

```bash
docker compose logs -f
```

Arrêter les services sans effacer les données :

```bash
docker compose down
```

Relancer les services : `docker compose up -d`.

> **Attention — réinitialisation de la base :** `docker compose down -v` supprime les données locales de la base et les CV stockés dans les volumes Docker. Ne lancez cette commande que si vous souhaitez vraiment repartir de zéro.

Les ports locaux par défaut sont `5173` (site), `3000` (API) et `5433` (PostgreSQL). Modifiez-les dans `.env` si nécessaire.

## Stack et versions

| Partie | Technologie | Version verrouillée ou tag Docker |
| --- | --- | --- |
| Interface | React, React DOM | 19.3.0 |
| Navigation | React Router DOM | 7.18.4 |
| Outils frontend | Vite | 8.3.3 |
| Styles | Tailwind CSS | 4.3.3 |
| Runtime backend | Node.js | 22 (`node:22-alpine`, correctif non verrouillé) |
| API | Express | 5.2.1 |
| Sessions | express-session | 1.19.0 |
| Base de données | PostgreSQL | 17 (`postgres:17`, correctif non verrouillé) |
| Connexion à PostgreSQL | `pg` | 8.23.1 |
| Protection des mots de passe | bcrypt | 6.0.0 |
| Environnement local | Docker Compose | V2 (fourni par Docker ; version non verrouillée par le dépôt) |

Les versions JavaScript sont celles verrouillées dans les `package-lock.json`. Les images Docker du dépôt fixent Node.js et PostgreSQL à leur version majeure, mais suivent les mises à jour de correctif de ces branches.

## Développement

Pour lancer uniquement le frontend, installez Node.js 22 puis exécutez dans `frontend/` :

```bash
npm ci
npm run dev
```

Commandes disponibles dans `frontend/` :

```bash
npm run build   # construit le frontend pour la production
npm run lint    # vérifie le code avec ESLint
npm test        # lance les tests unitaires configurés
```

Le frontend seul ne démarre ni l’API ni la base de données. Utilisez Docker Compose pour tester les parcours complets.

## Organisation du dépôt

```text
backend/   API Express, routes, contrôleurs et documentation Swagger
db/        Schéma PostgreSQL, seed de démonstration et migrations
docs/      Guides et documentation du projet
frontend/  Interface React, composants, pages et styles
```
