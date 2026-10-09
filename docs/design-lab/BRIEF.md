# Exploration de la page Offres

Statut : quatre prototypes à comparer, aucune direction sélectionnée. Surface `/design-lab`, mode Operate. Le brief utilisateur fixe A, B, C et D et demande de choisir seulement après inspection ; il prime sur le tirage `c5894565`, indice 6. Aucun écran du MVP supplémentaire n'est construit. Construction directe en React confirmée par l'utilisateur.

## Architecture et validation

Chargement séparé de l'application existante et du laboratoire dans `frontend/src/main.jsx`. Modules autonomes sous `frontend/src/design-lab/`. Contenu, recherche, filtres, tri et favoris partagés ; quatre compositions indépendantes. Détails et candidature restent des démonstrations locales et ne créent aucune donnée réelle. Une barre de comparaison permet de parcourir les variantes, de voir une synthèse et de déclencher les états de chargement, vide et erreur. Aucun appel API.

Validation : build et ESLint, inspection des quatre variantes à 1440 px et 390 px en une passe groupée, correction groupée puis confirmation au besoin. Contrôle de navigation clavier, recherche, filtres, tri, détails et sauvegarde. Documents et évaluation finale précisent que la sélection attend l'utilisateur.

## Direction contract — A / L'Éclaireur

THESIS : un journal de carrières où l'on parcourt des opportunités comme des articles utiles ; les annonces sont structurées par filets et hiérarchie plutôt que par boîtes interchangeables.

OWN-WORLD : papier ivoire, encre vert forêt, ocre discret ; Bodoni Moda pour les titres, Manrope pour les informations ; colonnes asymétriques, navigation fine, boutons rectangulaires et lignes éditoriales.

STORY : reconnaître une marque accueillante, chercher un métier et comparer six annonces françaises avec leurs contrats, lieux et salaires.

FIRST VIEWPORT : masthead vert, hero typographique à gauche et manifeste bref à droite, recherche sur une ligne ; liste d'offres dominante et petit sommaire de filtres ; un premier poste visible avant le pli à 1440 px.

FORM : monde A fixé par l'utilisateur, seed c5894565. Signature : soulignement éditorial au survol et à la sélection ; mouvements courts sans déplacer la lecture. Don des catalogues : discipline de lecture et alignement des fiches, sans motifs empruntés.

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Direction contract — B / Terrain

THESIS : un outil de recrutement mature centré sur la rapidité de comparaison, avec un accent cobalt identifiable et une densité assumée.

OWN-WORLD : gris froid très clair, blanc et bleu cobalt ; Public Sans ; rails alignés, filtres latéraux, lignes compactes, chiffres tabulaires, petits badges et actions claires.

STORY : situer immédiatement les résultats, affiner sa recherche puis décider quel poste mérite une lecture.

FIRST VIEWPORT : header blanc compact, hero de taille modérée à fond cobalt, recherche intégrée ; filtre latéral de 230 px face à une liste large ; titre, salaire et actions faciles à scanner sans ouvrir de détail.

FORM : monde B fixé par l'utilisateur, seed c5894565. Signature : le compteur et la liste se mettent à jour ensemble en filtrant ; aucune animation qui ralentit le travail. Don du catalogue dense : densité courageuse, avec taille de texte accessible.

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Direction contract — C / Grand Air

THESIS : un studio créatif qui donne envie d'explorer son prochain poste ; la couleur organise le contenu et le caractère reste adulte.

OWN-WORLD : bleu encre, citron et lavande claire ; Bricolage Grotesque ; typographie expressive, grands champs de couleur, géométrie simple, grille de fiches avec des angles distinctifs et contrôles francs.

STORY : sentir un produit confiant, saisir son métier, explorer les mêmes opportunités sans perdre les informations essentielles.

FIRST VIEWPORT : identité sombre et navigation, hero citron partagé entre un titre sur deux lignes et une phrase d'orientation ; recherche ancrée sous le titre, filtres horizontaux, premières fiches en grille de trois colonnes.

FORM : monde C fixé par l'utilisateur, seed c5894565. Signature : un tracé géométrique discret répond à la recherche et les boutons fléchés bougent de quelques pixels au survol ; arrêt en reduced-motion. Aucune illustration animale.

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Direction contract — D / Horizon

THESIS : un bureau de lecture nocturne, expérimental dans sa composition mais précis dans la comparaison des opportunités.

OWN-WORLD : charbon riche, surfaces légèrement relevées, ivoire et cuivre ; Barlow Condensed pour les titres, Public Sans pour le corps ; grille de lignes lisibles, panneau de lecture, règles fines sans glow ni glass.

STORY : parcourir des postes à forte lisibilité et lire une opportunité sans perdre la liste ni ses filtres.

FIRST VIEWPORT : masthead sombre, titre condensé ample à gauche et index des métiers à droite ; recherche horizontale, filtres en barre puis offres en lignes à gauche d'un panneau de détail persistent sur desktop.

FORM : monde D fixé par l'utilisateur, seed c5894565. Signature : une sélection remplit le panneau de lecture par une transition courte, avec distinction visible de la ligne active ; panneaux empilés sur mobile, sans réduire une table complète.

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Décisions ouvertes

La direction finale, ses éventuels mélanges de qualités et le prochain écran du MVP attendent la réponse de l'utilisateur. La recommandation est argumentée mais ne constitue pas une sélection.
