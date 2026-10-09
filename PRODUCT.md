# Welcome To My Savane

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Étudiants, jeunes actifs, stagiaires, alternants, développeurs juniors et autres personnes en recherche d'emploi, principalement âgés de 18 à 28 ans (précision confirmée lors de la deuxième exploration). Les administrateurs gèrent les offres, entreprises, utilisateurs et candidatures. Deux rôles : USER et ADMIN. Aucun espace recruteur ou entreprise distinct dans le MVP.

## Product Purpose

Une plateforme de recrutement en français (France) pour découvrir des offres, créer un profil et déposer des candidatures. Le parcours doit permettre de comprendre une opportunité, préparer une candidature avec ses projets et expériences, puis suivre son statut.

## Positioning

Le nom est une référence ludique à « Welcome to the Jungle ». Le produit doit construire sa propre identité et ne pas reproduire son interface. Une différenciation commerciale supplémentaire reste à décider ; ne pas inventer de promesses de recrutement.

## Operating Context

Projet étudiant full-stack Epitech. Le frontend existant utilise React, Vite, Tailwind CSS et JavaScript ; le backend Node.js/Express expose une API REST, avec PostgreSQL et Docker Compose. La première exploration utilise des données fictives, sans intégration backend.

## Capabilities and Constraints

Le MVP visé comporte : liste d'offres avec recherche et filtres ; détail d'offre ; connexion ; inscription ; profil utilisateur avec informations personnelles, projets et expériences sauvegardés ; formulaire de candidature avec sélection de projets et expériences ; historique et statuts de candidatures ; tableau de bord administrateur ; gestion des offres ; gestion des entreprises ; gestion des utilisateurs et candidatures.

Ces capacités décrivent le périmètre prévu, pas des fonctionnalités déjà livrées. Au moment de l'initialisation, le frontend contient la démonstration Vite et le backend possède des routes de lecture des offres. Le README est partiellement antérieur au backend actuel.

Les expériences visuelles restent dans `/design-lab`, isolées de l'application existante. Préserver la structure et les fonctionnalités ; ne pas modifier backend, base de données, API ou Docker. Les autres écrans attendent le choix et l'approbation de l'utilisateur.

## Brand Commitments

Nom : Welcome To My Savane. Langue : français (France). Personnalité : moderne, accueillante, professionnelle, confiante, mémorable et légèrement ludique. Inspiration savane subtile et sophistiquée ; pas de jungle littérale, d'animaux cartoon ou de graphisme enfantin. Réutiliser le logo fourni.

La deuxième exploration renforce cette intention : coloré, vivant, humain, jeune sans être enfantin, professionnel sans être corporate. Welcome to the Jungle est une référence d'énergie et de proximité avec les jeunes, pas une interface à reproduire. Les quatre premières pistes sont jugées trop génériques par l'utilisateur ; Grand Air est la base la plus intéressante, sans sélection finale. Les trois nouvelles pistes demandées sont Grand Air 2.0, Savane Pop (néo-brutalisme corail) et Creative Editorial Savanna.

Choix confirmé le 9 octobre 2026 pour la maquette de la page Job Board : composition de Grand Air 2.0, typographie Bricolage Grotesque de Grand Air 1.0 (C) et couleurs de Savane Pop. La combinaison est présentée dans `/design-lab/selected`. L'approbation concerne cette maquette ; la réalisation des autres écrans du MVP attend une prochaine demande.

## Evidence on Hand

- Logo blanc fourni par l'utilisateur : `frontend/public/logo-welcome-to-my-savane.svg` (emblème acacia).
- Modèle de données : `db/job_board_schema.sql` ; seed de développement : `db/seed_mvp.sql`.
- Routes d'offres existantes : `backend/src/routes/ads_routes.js`.
- Les entreprises, annonces et rémunérations du design lab sont des données de démonstration explicitement signalées. Aucun témoignage, résultat commercial, client ou chiffre d'adoption confirmé.

## Product Principles

- Rendre l'exploration des offres immédiatement compréhensible et utilisable.
- Donner les informations qui permettent de décider : entreprise, poste, contrat, lieu, salaire et description.
- Construire une identité propre sans compromettre la lisibilité.
- Garder la candidature cohérente avec les projets et expériences du profil.
- Offrir une administration claire adaptée aux deux rôles du MVP.

## Accessibility & Inclusion

Le brief demande un contraste accessible et une interface responsive. Prévoir des libellés explicites, une navigation au clavier, des états lisibles et une réduction des animations selon la préférence du système. Aucune autre exigence spécifique confirmée.

La palette de référence fournie ensuite par l'utilisateur fixe cinq teintes : jaune solaire `#f0e970`, corail `#f09169`, bleu nuit `#252a46`, bleu pastel `#acbefa`, vert menthe `#bedbc7`. Source persistée dans `docs/design-lab/references/selected-palette.png`. Le bleu nuit porte les textes et bandeaux ; le blanc cassé reste une surface utilitaire.
