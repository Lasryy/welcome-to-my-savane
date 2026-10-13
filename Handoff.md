# Handoff — Welcome To My Savane

## Mise à jour du 13 octobre 2026 : étape 4 Lasry

La branche `lasry` contient le profil éditable, les projets et les expériences. `/profile` charge trois sections depuis `GET/PATCH /api/people/me`, `GET/POST /api/projects` et `GET/POST /api/experiences`. Les éléments sont modifiables et supprimables via `PATCH/DELETE` sur leur identifiant.

Le propriétaire vient de la session ; les requêtes filtrent les éléments par identifiant et propriétaire. Les champs de rôle, mot de passe et propriétaire ne sont pas modifiables dans le profil. Les URLs HTTP(S), les limites de texte et les dates sont validées. La suppression d'un projet ou d'une expérience lié à une candidature renvoie 409. Les routes sont documentées dans Swagger.

Avant le push : 17 tests d'intégration réussis sur une base isolée `wtms_test_*`, ESLint et build frontend réussis. La vérification manuelle complète du parcours navigateur reste indiquée comme à faire dans le plan. Cette livraison ne comprend ni CV ni sélection de preuves dans le formulaire de candidature. L'intégration de l'étape 4 Denis dans `main` reste distincte.

## Mise à jour du 12 octobre 2026 : intégration étape 3 et Swagger

La branche Lasry réunit son historique et suivi des candidatures, la gestion admin des comptes et des candidatures, ainsi que le CRUD offres étape 3 et Swagger de Denis (`37c3356`). Le menu de statuts des candidatures conserve le correctif de débordement des cartes.

Swagger est monté sur `/api-docs` et sa spécification sur `/api-docs/openapi.json`. Les routes étape 3 Lasry y sont documentées : historique personnel, liste et statut des candidatures admin, liste/modification/suppression des comptes admin. Les catégories sont déjà gérables dans `/admin/categories` et utilisées par le filtre Domaine des offres.

La suite prévue couvre le profil éditable, les projets et expériences, la recherche côté API, puis le CV et les dossiers personnalisés. Ces fonctionnalités ne sont pas encore livrées. Les sections précédentes restent historiques.

## Mise à jour du 12 octobre 2026 : intégration des étapes 1 et 2

La branche `integration/etapes-1-2` réunit `origin/denis` (`e40c49d`) et `origin/feature/lasry-etape-2` (`6bb7bd7`). Les comptes, sessions, profils et candidatures de Lasry fonctionnent avec le job board, le catalogue admin et le Tailwind de Denis. Les API admin vérifient désormais la session et le rôle en base, et le détail d’une offre ouvre le formulaire de candidature.

Le routeur commun est celui de Denis (`createBrowserRouter` + `RouterProvider`) pour conserver l’avertissement des modifications non enregistrées. Les pages auth et `AdminRoute` y sont intégrées. Les styles auth/candidature restent dans `styles/components.css` avec `@apply`, sur le même thème Tailwind que le catalogue.

Les décisions de fusion, les fonctionnalités conservées et les commandes de vérification sont dans [docs/INTEGRATION-ETAPES-1-2.md](docs/INTEGRATION-ETAPES-1-2.md). La suite de Lasry est l’étape 3 : historique, statuts et utilisateurs admin.

**Les sections ci-dessous décrivent l’état historique du 9 octobre ; leurs mentions « non commité » ou « reste à développer » ne décrivent plus l’application intégrée.**

---

Document de reprise du projet pour la prochaine personne qui travaille sur le produit. Il résume les décisions confirmées, l’état du dépôt et la suite logique du MVP au **9 octobre 2026**.

## Résumé rapide

Welcome To My Savane est un job board français destiné surtout aux étudiants, stagiaires, alternants et jeunes professionnels. La maquette retenue pour la page Offres combine **la composition de Grand Air 2.0**, **la police Bricolage Grotesque de Grand Air 1.0** et **la palette de référence fournie par l’utilisateur**.

- Maquette retenue : [aperçu dans le navigateur](http://localhost:5173/design-lab/selected) — lancer Vite dans `frontend/` si nécessaire.
- Le choix valide la direction de la maquette Offres. Les autres écrans et l’intégration fonctionnelle du MVP restent à réaliser.
- Le laboratoire est une démonstration locale sur données fictives. Ses recherches, filtres et actions n’appellent pas l’API.
- Le frontend métier reste à l’écran Vite initial, accessible à `/`.
- Le backend contient déjà Express et des routes de lecture des offres. Ne pas le décrire comme inexistant : le README général est en partie obsolète.
- Le travail récent est non commité sur la branche `lasry`. Vérifier `git status` avant de commencer et conserver ces changements.

## Produit et périmètre

**Nom :** Welcome To My Savane  
**Langue :** français (France)  
**Utilisateurs visés :** étudiants et jeunes actifs, notamment stagiaires, alternants, juniors et personnes en recherche d’emploi, principalement 18–28 ans.  
**Rôles MVP :** `USER` et `ADMIN`. Le MVP ne prévoit pas de tableau de bord recruteur distinct.

Le produit permet de découvrir une offre, créer un profil, préparer une candidature avec ses projets et expériences, puis suivre son statut. L’administration couvre les offres, entreprises, utilisateurs et candidatures. Welcome to the Jungle sert de référence de ton et d’énergie ; ne pas reprendre son interface ni ses éléments de marque.

### Décisions visuelles confirmées

| Élément | Décision |
| --- | --- |
| Composition | Grand Air 2.0 : grande couverture, signe-horizon géométrique, bande de recherche, grille d’offres en affiches |
| Police | Bricolage Grotesque, police locale reprise de Grand Air 1.0, poids d’affichage 800 |
| Jaune solaire | `#f0e970` |
| Corail | `#f09169` |
| Bleu nuit | `#252a46` |
| Bleu pastel | `#acbefa` |
| Vert menthe | `#bedbc7` |
| Fond neutre | Blanc cassé `#fff9ee` |

> L’image de palette de l’utilisateur est archivée dans `docs/design-lab/references/selected-palette.png`. `DESIGN.md` décrit les règles de la maquette retenue ; son autorité est limitée à la page Offres dans le Design Lab.

## État du dépôt

### Frontend

- React 19, Vite 8, JavaScript et Tailwind CSS 4.
- `frontend/src/main.jsx` route le Design Lab séparément de l’application initiale.
- La maquette retenue est dans `frontend/src/design-lab/round-two.jsx` avec le thème `SelectedSavane`, les composants partagés et `frontend/src/design-lab/selected.css`.
- Les variantes exploratoires sont conservées dans le Design Lab ; elles ne sont pas la décision active.
- La grille utilise six offres et entreprises fictives décrites dans `frontend/src/design-lab/data.js`.
- Build et ESLint ont été exécutés avec succès après l’application de la palette. Les captures et mesures de revue locales se trouvent sous `.impeccable/review/` ; ce dossier est ignoré par Git.

Pour lancer :

```sh
cd frontend
npm ci
npm run dev
```

Vérifications frontend : `npm run build` et `npm run lint` depuis `frontend/`.

### Backend et données

- Express démarre depuis `backend/src/app.js` et monte `/api/ads`.
- `backend/src/routes/ads_routes.js` expose `GET /api/ads` et `GET /api/ads/:id` ; la logique est dans `backend/src/controllers/ads_controller.js`, avec la connexion PostgreSQL dans `backend/src/db/pool.js`.
- `db/job_board_schema.sql` contient les tables et contraintes principales : personnes, entreprises, catégories, annonces, candidatures, projets et expériences.
- `db/seed_mvp.sql` fournit les données locales de démonstration.
- `.env.example` et `docker-compose.yml` existent. Vérifier leur contenu et la configuration locale avant le premier démarrage.
- L’authentification, les routes d’écriture et l’intégration du frontend ne sont pas encore confirmées comme livrées.

Le README général contient des indications de démarrage qui peuvent être dépassées, en particulier sur l’existence du backend. Se fier d’abord aux fichiers présents et au schéma listés ci-dessus.

## Fonctionnalités de la maquette

Le Design Lab comprend une recherche texte/ville, filtres et tri, favoris en mémoire, détails dépliables, états simulés vide/chargement/erreur et retours de démonstration sur les actions de candidature/connexion. Les préférences et favoris sont perdus au rechargement. Aucun compte, candidature ou changement serveur n’est créé.

La navigation vers l’aperçu retenu est `/design-lab/selected` (également la vue par défaut de `/design-lab`). Le laboratoire est accessible avec les autres directions via `/design-lab/compare` et `/design-lab/compare-1` pour l’historique.

## Suite de développement suggérée

1. **Prendre connaissance des changements présents** : `git status`, branche courante, fichiers du Design Lab et `.env.example`. Ne pas écraser les changements non commités.
2. **Clarifier la cible immédiate** avec le propriétaire : l’approbation porte actuellement sur la maquette Offres, pas sur la réalisation automatique de tout le MVP.
3. **Faire évoluer la maquette Offres vers l’application réelle** quand demandé : extraire/réutiliser les composants choisis et remplacer progressivement les données fictives par `GET /api/ads`, en conservant les états de chargement, erreur et résultat vide.
4. **Compléter le backend par étapes** : valider la connexion et les données, puis concevoir les routes de création/modification/suppression d’offres et de gestion des entreprises/utilisateurs/candidatures selon le schéma existant.
5. **Concevoir l’authentification et l’autorisation** pour `USER` et `ADMIN` avant les opérations protégées ; examiner les dépendances déjà présentes (`bcrypt`, `express-session`) et décider explicitement de la stratégie de session/sécurité.
6. **Décliner les autres parcours après demande** : détail d’offre, connexion/inscription, profil et éléments sauvegardés, formulaire de candidature et suivi, puis interfaces d’administration. Ne pas créer un espace recruteur séparé sans modification explicite du périmètre.
7. **Mettre à jour les guides de démarrage** après vérification réelle des services Docker et des commandes afin que `README.md` corresponde au dépôt.

Pour le premier branchement API, confirmer notamment le format retourné par les contrôleurs, les noms de champs, le port/CORS éventuel et la représentation des types de contrat et salaires. Les données du laboratoire sont un jeu de démonstration, pas un contrat API.

## Fichiers de référence

- `PRODUCT.md` — contexte, utilisateurs, portée et contraintes produit.
- `DESIGN.md` — système visuel de la maquette retenue.
- `docs/design-lab/SELECTED.md` — contrat de la direction retenue.
- `docs/design-lab/ROUND-2.md` et `docs/design-lab/BRIEF.md` — explorations et demandes antérieures.
- `docs/design-lab/README.md` — routes et fonctionnement du laboratoire.
- `frontend/src/design-lab/assets/README.md` — crédits des images employées par les explorations.
- `frontend/public/logo-welcome-to-my-savane.svg` — logo de marque fourni.
- `db/job_board_schema.sql`, `db/seed_mvp.sql` — schéma et données de développement.

## Garde-fous de reprise

- Garder le Design Lab isolé du frontend métier et ne pas supprimer les anciens écrans sans décision produit.
- Préserver le logo fourni ; ne pas imiter l’identité de Welcome to the Jungle.
- Signaler clairement les données fictives et ne pas présenter des entreprises, salaires, témoignages ou résultats de démo comme réels.
- Ne modifier ni le schéma/API/Docker au cours d’une tâche purement visuelle, sauf demande explicite.
- L’approbation actuelle ne vaut pas validation des écrans restants, de l’authentification, du modèle de données ou des choix d’intégration.

