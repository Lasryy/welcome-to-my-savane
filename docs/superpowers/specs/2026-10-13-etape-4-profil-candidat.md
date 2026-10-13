# Étape 4 Lasry — Profil candidat

## But

Permettre au candidat connecté de modifier ses informations personnelles et de gérer ses propres projets et expériences depuis sa page Profil. Les données persistent dans PostgreSQL et un compte ne peut jamais lire ou modifier les éléments d’un autre compte.

## Portée

- Profil : prénom, nom, e-mail et téléphone facultatif via `GET/PATCH /api/people/me`.
- Projets : `GET/POST /api/projects` et `PATCH/DELETE /api/projects/:id`.
- Expériences : `GET/POST /api/experiences` et `PATCH/DELETE /api/experiences/:id`.
- Une seule page `/profile`, organisée en sections Compte, Projets et Expériences, avec formulaires simples, listes, états de chargement/erreur/succès et confirmation avant suppression.
- Requêtes SQL paramétrées ; le propriétaire est toujours `req.session.userId`, jamais un `person_id` fourni par le navigateur.
- Documenter ces opérations dans Swagger.

## Règles de données

- Réutiliser les tables existantes `people`, `projects` et `experiences`; aucune migration n’est prévue.
- Un utilisateur peut n’avoir aucun projet ni aucune expérience.
- E-mail converti en minuscules, format vérifié et doublon renvoyé avec HTTP 409.
- Champs requis conservés : prénom/nom non vides, titre de projet non vide, entreprise et poste d’expérience non vides. Les longueurs ne dépassent pas les colonnes SQL.
- Les URLs facultatives doivent être HTTP ou HTTPS ; dates d’expérience cohérentes avec le schéma, `end_date` facultative.
- Une modification ou suppression vise simultanément l’identifiant et le propriétaire connecté. Si le projet ou l’expérience est déjà associé à une candidature, refuser la suppression avec HTTP 409 pour ne pas casser un dossier existant.
- Ne jamais exposer `password_hash` ni permettre de changer `role` depuis le profil.

## Fichiers et responsabilités visés

- Nouveau contrôleur de profil : validations et mise à jour de `people`.
- Nouveaux contrôleurs/routes projets et expériences : lecture et CRUD limités au propriétaire.
- `backend/src/app.js` : monter les routes et exposer le contrat dans Swagger.
- `frontend/src/pages/auth/ProfilePage.jsx` : profil et état de chargement ; composants dédiés pour formulaires/liste de projets et expériences si utiles.
- `frontend/src/styles/components.css` ou classes Tailwind existantes : sections lisibles cohérentes avec le thème.

## Validation

1. GET et PATCH profil : visiteur reçoit 401 ; utilisateur voit et modifie son profil ; rôle et mot de passe restent privés.
2. Deux comptes : aucun ne peut lister, lire, modifier ou supprimer les données de l’autre, même en remplaçant un ID dans l’URL.
3. CRUD projet et expérience : données valides persistantes après reconnexion ; entrées vides, trop longues, URL invalide et période inversée refusées proprement.
4. Suppression d’un élément lié à une candidature refusée sans perdre la relation ; suppression d’un élément libre fonctionne après confirmation UI.
5. L’interface indique chargement, erreurs, succès et listes vides ; elle fonctionne au clavier et sur mobile.
6. Swagger décrit routes, sessions, entrées, succès et erreurs. Build/lint et tests API ciblés confirment la livraison.

## Hors portée

Recherche d’offres de Denis, CV, sélection d’éléments au moment de postuler et copie figée du dossier : étapes suivantes de la Roadmap V3.
