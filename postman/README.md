# Tests Postman de Denis (étapes 3 et 4)

La collection `Denis-Stage-3-and-4.postman_collection.json` teste les accès public et admin, la recherche, les filtres, le tri des salaires, la pagination, le catalogue entreprise/catégorie, le CRUD d’offres, la fermeture/réouverture et les suppressions protégées.

## Lancer les tests

1. Démarrer PostgreSQL avec le schéma et les données de démonstration, puis l’API (`docker compose up --build` depuis la racine du projet).
2. Dans Postman, **Import** puis choisir le fichier de collection.
3. Vérifier les variables de collection : `baseUrl` vaut `http://localhost:3000`. Le compte ADMIN par défaut est `admin@jobboard.example.com`, mot de passe `JobBoardDemo2026!`. Tu peux remplacer ces valeurs si ta base utilise un autre compte.
4. Lancer toute la collection dans le **Collection Runner**, dans l’ordre des requêtes. Le runner conserve le cookie de session entre les appels ; la première requête vide un ancien cookie pour vérifier le cas visiteur.

La collection crée des entreprises, catégories, offres et un candidat temporaires avec un nom unique. Elle supprime ces données en fin de parcours. Le candidat temporaire est supprimé pour retirer la candidature de test avant de nettoyer l’offre associée. Utilise une base de développement jetable ou dédiée et laisse le runner terminer ; un arrêt au milieu du parcours peut laisser des données temporaires.

Chaque requête possède ses assertions dans l’onglet **Scripts > Post-response** (anciennement **Tests**). Le résultat apparaît dans le rapport du Runner.
