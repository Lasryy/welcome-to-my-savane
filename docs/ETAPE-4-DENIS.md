# Étape 4 Denis — Recherche et informations entreprise

Périmètre : D4.1, D4.2 et D4.3 de la Roadmap Job Board V3. Les pages profil, projets, expériences et candidature restent dans le chantier Lasry. Aucune migration SQL n’est nécessaire.

## Contrat de recherche

`GET /api/ads` accepte ces paramètres combinables :

| Paramètre | Valeurs et comportement |
| --- | --- |
| `q` | Texte de 1 à 255 caractères après trim, recherché dans titre, résumé, description, nom d’entreprise et lieu de l’offre. |
| `location` | Texte de 1 à 255 caractères après trim, recherché dans le lieu de l’offre. |
| `company_id`, `category_id` | Entier positif jusqu’à 2147483647. Un identifiant absent de la base donne zéro résultat. |
| `contract_type` | `internship`, `apprenticeship`, `permanent`, `fixed_term`, `other`. |
| `sort` | `recent` (défaut), `salary_asc`, `salary_desc`. |
| `page` | Entier de 1 à 2147483647 ; défaut 1. |
| `page_size` | Entier de 1 à 100 ; défaut 12. |

La recherche texte est partielle et insensible à la casse ; les accents restent significatifs. `%`, `_` et `\` sont traités littéralement. Les paramètres inconnus, répétés, vides ou invalides donnent `400` avec `{ "message": "…" }`. Toutes les valeurs de filtres sont des paramètres SQL ; le tri provient d’une liste autorisée. Les offres fermées sont toujours exclues.

Le tri salaire compare `salary_min`, ou `salary_max` si le minimum manque. Un montant mensuel est multiplié par 12 avant comparaison, sans modifier le salaire affiché sur l’offre. Aucun ajustement au temps plein n’est effectué. Les salaires absents arrivent en dernier dans les deux sens. À égalité, la date récente puis l’identifiant décroissant stabilisent l’ordre et la pagination.

Pour conserver les appels existants, **sans `page` ni `page_size` la réponse reste un tableau**, même si des filtres sont présents. Avec l’un de ces paramètres, la réponse est :

```json
{
  "ads": [],
  "total": 0,
  "page": 1,
  "page_size": 12,
  "total_pages": 0
}
```

`total` compte toutes les offres publiées qui correspondent aux critères. `total_pages` vaut `ceil(total / page_size)`. Une page au-delà des résultats reçoit `ads: []` avec le total réel et la page demandée. Les routes admin gardent leurs formats JSON actuels.

## Lecture publique des entreprises et domaines

- `GET /api/public/companies` : tableau trié par nom puis ID avec `id`, `name`, `description`, `website`, `location`, `logo_url` uniquement.
- `GET /api/public/categories` : tableau trié par nom puis ID avec `id`, `name`.
- `GET /api/ads/:id` : objet existant enrichi de `company_description`, `company_website`, `company_location`, `company_logo_url`. Ces champs sont également présents dans les listes d’offres.

Les nouveaux chemins ne montent que des contrôleurs GET. Une tentative d’écriture y reçoit `404`. Les écritures et anciennes lectures sur `/api/companies`, `/api/categories` et leurs alias `/api/admin/...` restent protégées : `401` visiteur, `403` USER. Les routes publiques n’exposent aucun compte ni candidature. Swagger est à jour sur `/api-docs`.

## Interface et organisation du code

Le formulaire conserve ses critères soumis dans l’URL, avec la page et un éventuel `page_size`. Rechercher revient à la page 1 ; la pagination garde les critères ; le rechargement, le partage du lien et l’historique navigateur les restaurent. Modifier une saisie ne lance pas de requête avant Rechercher. Réinitialiser vide l’URL. Les états chargement, vide, page dépassée et erreur proposent un retour utile. Les listes de filtres sont indépendantes de la page de résultats.

La fiche offre montre la présentation de l’entreprise et distingue son lieu de celui du poste. Les liens et images acceptent uniquement HTTP(S). Les informations manquantes affichent un texte simple ; le logo reste facultatif.

- `backend/src/controllers/ads_search.js` : validation des paramètres, filtres SQL et trois tris.
- `backend/src/controllers/ads_controller.js` : lecture des offres et compte des résultats paginés.
- `backend/src/routes/public_catalogue_routes.js` : deux lectures publiques sans contrôleurs admin.
- `frontend/src/pages/jobBoardPage.jsx` : formulaire, URL, chargement et pagination ; réutilise `CustomSelect` et `JobCard`.
- `frontend/src/pages/jobDetailPage.jsx` : présentation de l’entreprise.

## Vérifications

```sh
npm --prefix frontend run lint
npm --prefix frontend run build
```

Le test d’intégration utilise une vraie base PostgreSQL temporaire, selon [le guide d’intégration](INTEGRATION-ETAPES-1-2.md). Les quinze scénarios (seize tests avec le parent) couvrent aussi le cumul des filtres, l’exclusion des offres fermées, les pages vides, les totaux, le tri mois/an, les égalités, les salaires absents, les saisies invalides, les caractères SQL et les routes publiques sans écriture.

Contrôle navigateur : chercher une ville, choisir un tri et Rechercher ; actualiser et vérifier les choix ; passer à la page suivante puis revenir ; ouvrir une offre et lire l’entreprise ; réinitialiser ; essayer un terme absent puis une URL avec `page=0`. Vérifier les menus au clavier et l’absence de débordement à 390 px.

Validation effectuée le 13 octobre 2026 : ESLint et build réussis, 16 tests HTTP/SQL réussis sur une base PostgreSQL temporaire ensuite supprimée. Dans le navigateur, recherche Lyon avec tri salaire conservée après actualisation, page suivante et retour navigateur, réinitialisation, état vide, erreur `page=0`, sélection du contrat au clavier et présentation de ShopFlow vérifiés. La largeur du document reste de 390 px sur un viewport de 390 px, pour la recherche et le détail de l’offre.
