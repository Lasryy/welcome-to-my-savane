# Frontend administration

Les pages `/admin`, `/admin/companies`, `/admin/categories`, `/admin/ads`, `/admin/ads/new` et `/admin/ads/:id/edit` utilisent React Router, Tailwind et la direction visuelle de `DESIGN.md`. Le Design Lab conserve ses interactions de démonstration. Les pages admin ne contiennent pas de données fictives ni de stockage local : elles chargent et enregistrent les données avec `fetch` et des chemins relatifs `/api/...`.

## API attendue

| Méthode | Route | Utilisation |
| --- | --- | --- |
| GET | `/api/companies` | Liste des entreprises |
| POST | `/api/companies` | Création d’une entreprise |
| PUT | `/api/companies/:id` | Modification d’une entreprise |
| DELETE | `/api/companies/:id` | Suppression d’une entreprise |
| GET | `/api/categories` | Liste des catégories |
| POST | `/api/categories` | Création d’une catégorie |
| PUT | `/api/categories/:id` | Renommage d’une catégorie |
| DELETE | `/api/categories/:id` | Suppression d’une catégorie |
| GET | `/api/admin/ads` | Toutes les offres `published` et `closed` |
| POST | `/api/admin/ads` | Création d’une offre |
| GET | `/api/admin/ads/:id` | Offre à éditer, y compris lorsqu’elle est fermée |
| PUT | `/api/admin/ads/:id` | Enregistrement de l’offre |
| PATCH | `/api/admin/ads/:id` | Fermeture/réouverture avec `{ "status": "closed" }` ou `{ "status": "published" }` |
| DELETE | `/api/admin/ads/:id` | Suppression sans candidature liée (`204`), sinon refus explicite (`409`) |

Les listes répondent avec un tableau JSON d’objets. Le détail d’une offre répond avec un objet JSON. Les requêtes d’écriture envoient du JSON ; une réponse `200`/`201` avec JSON ou `204` sans contenu est acceptée. Après création, modification ou suppression d’une entreprise ou d’une catégorie, le frontend recharge la liste depuis le serveur. Une erreur utilise un statut HTTP non réussi avec `{ "message": "…" }`.

Champs des entreprises : `id`, `name`, `description`, `website`, `location`, `logo_url`. La création et la modification envoient les cinq champs éditables ; les champs facultatifs vides sont envoyés à `null`. Les URLs renseignées doivent utiliser HTTP ou HTTPS.

Champs des catégories : `id`, `name`. La création et le renommage envoient `{ "name": "…" }`.

Champs des offres : `id`, `title`, `short_description`, `description`, `location`, `company_id`, `company_name`, `category_id`, `category_name`, `salary_min`, `salary_max`, `salary_period`, `contract_type`, `working_time`, `status`, `created_at`. L’édition envoie les champs éditables, sans les noms joints, l’identifiant ni la date de création. `category_id`, les salaires et les champs facultatifs peuvent être `null`. Les IDs et les montants renseignés sont envoyés comme nombres.

Valeurs attendues : `published`/`closed`, `month`/`year`, `internship`/`apprenticeship`/`permanent`/`fixed_term`/`other`, `full_time`/`part_time`. Les filtres et le tri s’effectuent dans le frontend sur la liste complète reçue ; l’API de liste admin ne doit donc pas être paginée sans adaptation du frontend. Le formulaire de création utilise les mêmes champs éditables et redirige vers `/admin/ads` après un succès.

## Intégration

Le backend fournit également `/api/admin/companies` et `/api/admin/categories` comme alias des chemins `/api/companies` et `/api/categories` utilisés par le frontend. Tous ces chemins et `/api/admin/ads` exigent une session `ADMIN` : `401` sans connexion et `403` avec un compte `USER`. Le rôle est relu dans PostgreSQL à chaque requête admin.

La page publique charge `/api/ads` et le détail `/api/ads/:id` sans connexion. Le bouton « Postuler » ouvre le formulaire de Lasry ; les données du compte viennent de `/api/auth/me` et l’envoi utilise `/api/applications`.

`App.jsx` utilise un seul `createBrowserRouter` et `RouterProvider`. `AdminRoute` vérifie le rôle avant de rendre `AdminLayout`. Ce routeur permet de conserver l’avertissement `useBlocker` des formulaires d’offres quand des modifications n’ont pas été enregistrées. `main.jsx` monte l’application sans ajouter de second routeur.

Le schéma PostgreSQL n’a pas besoin de migration pour ces opérations.

Sur `/admin/ads`, chaque offre dispose de boutons « Fermer l’offre » / « Rouvrir l’offre » et « Supprimer ». La suppression demande une confirmation et affiche le refus du serveur si des candidatures sont liées, même lorsque l’offre est fermée. La contrainte SQL `ON DELETE RESTRICT` conserve les candidatures et leurs relations. Après succès, le statut ou la liste est mis à jour à partir de la réponse du serveur ; les actions sont désactivées pendant la requête et un retour de succès ou d’erreur est affiché.

## Fichiers de cette implémentation

Modifiés :

- `src/App.jsx` : routes admin imbriquées et route d’édition d’offre.
- `src/pages/admin/adminPage.jsx`, `adminCompaniesPage.jsx`, `adminCategoriesPage.jsx`, `adminAdsPage.jsx` : accueil, gestion des entreprises/catégories et liste filtrable des offres.
- `src/components/admin/adminCard.jsx` : carte partagée avec les surfaces, bandeaux et actions du design retenu.
- `src/design-lab/round-two.jsx` : import du signe-horizon extrait, sans changement de son rendu.

Créés :

- `src/pages/admin/adminAdCreatePage.jsx`, `adminAdEditPage.jsx`, `adminAdForm.jsx` : formulaires de création/édition, modal de sauvegarde et avertissement en cas de changements non enregistrés.
- `src/components/CustomSelect.jsx`, `src/components/PublicLayout.jsx` : champs déroulants communs et structure publique avec footer en bas.
- `src/pages/jobBoardPage.jsx`, `jobDetailPage.jsx`, `src/components/jobCard.jsx` : job board connecté à l’API et détail d’offre.
- `src/components/admin/adminLayout.jsx`, `adminUi.jsx` : navigation, mise en page, champs, retours et confirmation de suppression.
- `src/components/horizonSign.jsx` : signe-horizon partagé avec le Design Lab.
- `src/hooks/useAdminCollection.js`, `src/services/adminApi.js`, `src/utils/adminUtils.js` : chargement, écritures, erreurs et formats de salaires/dates.
- `src/styles/admin.css` : styles admin isolés, Tailwind et fonte locale.
- `ADMIN.md` : contrat API et guide d’intégration.
