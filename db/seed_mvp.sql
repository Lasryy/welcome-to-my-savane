-- ============================================================
-- JOB BOARD : PEUPLEMENT DÉTAILLÉ POUR LE DÉVELOPPEMENT
-- PostgreSQL 17 ; aucune extension ni dépendance supplémentaire.
-- Données entièrement fictives ; domaines réservés example.com.
-- ============================================================
-- ATTENTION : ce script remplace TOUTES les données des neuf tables.
-- À utiliser uniquement sur une base de développement/démonstration.
-- Exécution conseillée : psql -v ON_ERROR_STOP=1 -f db/seed_mvp.sql
-- Une transaction englobe la réinitialisation et les contrôles :
-- toute erreur annule le peuplement, y compris le TRUNCATE.
-- Réexécutable : mêmes volumes et mêmes associations à chaque passage.
-- Les dates sont relatives à CURRENT_TIMESTAMP pour garder des offres récentes.
--
-- Volumes attendus :
--   122 comptes : 120 candidats USER + 2 administrateurs ADMIN
--   30 entreprises, 20 catégories, 240 offres (60 métiers x 4 variantes)
--   360 projets, 360 expériences, 720 candidatures
--   1 440 liens vers des projets, 1 440 liens vers des expériences
-- Descriptions longues : contexte sectoriel, six missions propres au métier,
-- livrables, apprentissages et attentes adaptées au niveau d’expérience.
--
-- Fourchettes salary_min / salary_max : montants BRUTS en EUR.
-- salary_period : month pour stages/alternances ; year pour les autres.
-- Deux bornes NULL signifient rémunération non renseignée.
-- Les montants sont fictifs et exprimés pour le temps de travail indiqué.
-- Contrats : permanent, fixed_term, internship, apprenticeship.
-- Temps de travail : full_time, part_time.
-- Offres : published (195), closed (45) ; aucun statut draft dans le schéma.
-- Candidatures : sent, in_progress, technical_test, accepted, rejected.
--
-- Connexion de démonstration (hash bcrypt, coût 10) :
--   alice.martin@example.com / JobBoardDemo2026!
--   admin@jobboard.example.com / JobBoardDemo2026!
-- Tous les comptes partagent ce mot de passe de démonstration.
-- Le seed prépare les comptes ; il n'ajoute pas de routes d'authentification.

BEGIN;

TRUNCATE TABLE
    application_experiences, application_projects, experiences, projects,
    applications, ads, categories, companies, people
RESTART IDENTITY;

-- 1. ENTREPRISES : villes, présentation et sites fictifs.
INSERT INTO companies (name, description, website, location, logo_url, created_at)
SELECT name, description, 'https://' || domain || '.example.com', location,
       NULL, CURRENT_TIMESTAMP - INTERVAL '2 years'
FROM (VALUES
    ('NovaTech', 'novatech', 'Paris', 'Éditeur SaaS de 85 personnes qui simplifie les opérations des PME. Nos équipes produit travaillent en cycles courts, avec des tests automatisés et un contact direct avec les clients.'),
    ('DataForge', 'dataforge', 'Lyon', 'Cabinet de 60 spécialistes de la donnée. Nous construisons des plateformes analytiques pour les secteurs de la santé, de la distribution et des transports.'),
    ('CyberShield', 'cybershield', 'Lille', 'Entreprise de cybersécurité de 110 personnes : SOC, audits techniques et accompagnement des équipes clientes. La formation continue et le partage de connaissances font partie de chaque mission.'),
    ('GreenCode', 'greencode', 'Bordeaux', 'Éditeur de logiciels de suivi énergétique. Nos 45 collaborateurs développent des produits accessibles et mesurent leur impact environnemental.'),
    ('CloudNest', 'cloudnest', 'Nantes', 'Plateforme cloud de 70 personnes spécialisée dans les déploiements fiables. Nos équipes exploitent des services à forte disponibilité et pratiquent les revues de code collectives.'),
    ('PixelAtelier', 'pixelatelier', 'Rennes', 'Studio de design de 32 personnes qui accompagne les services numériques. Recherche utilisateur, accessibilité et prototypage structurent nos projets.'),
    ('Finova', 'finova', 'Paris', 'Fintech de 140 personnes qui développe des outils de gestion de trésorerie. Nos produits associent sécurité, qualité des données et simplicité des parcours.'),
    ('MediLink', 'medilink', 'Montpellier', 'Entreprise de santé numérique de 90 personnes. Nous facilitons la coordination entre les professionnels de santé avec des applications sécurisées et accessibles.'),
    ('EduSphere', 'edusphere', 'Toulouse', 'Plateforme de formation de 55 personnes destinée aux organismes de formation et aux entreprises. Nous concevons des parcours pédagogiques personnalisés.'),
    ('UrbanMove', 'urbanmove', 'Strasbourg', 'Entreprise de mobilité de 120 personnes. Nos services aident les collectivités à planifier les transports et les usagers à combiner plusieurs modes de déplacement.'),
    ('ShopFlow', 'shopflow', 'Lyon', 'Éditeur e-commerce de 80 personnes : gestion du catalogue, commandes et expérience client. Nos équipes suivent les résultats de leurs fonctionnalités en production.'),
    ('AgriSense', 'agrisense', 'Dijon', 'Entreprise de 48 personnes qui développe des capteurs et outils de suivi pour les exploitations agricoles. Nous réunissons électronique, analyse de données et accompagnement terrain.'),
    ('OceanBlue', 'oceanblue', 'Brest', 'Bureau d’études de 65 personnes consacré à la surveillance des milieux marins. Nos solutions combinent collecte de mesures, cartographie et études environnementales.'),
    ('LogiBridge', 'logibridge', 'Rouen', 'Société de logistique de 210 personnes. Nous améliorons les flux d’approvisionnement avec des outils numériques et des équipes opérationnelles présentes sur plusieurs sites.'),
    ('BuildWise', 'buildwise', 'Grenoble', 'Entreprise de 95 personnes qui accompagne la rénovation des bâtiments. Nos équipes associent suivi de chantier, modélisation et analyse de la performance énergétique.'),
    ('TalentPulse', 'talentpulse', 'Paris', 'Cabinet RH de 40 personnes spécialisé dans le recrutement et la gestion des talents. Nous accompagnons les candidats avec des retours précis à chaque étape.'),
    ('SocialSpark', 'socialspark', 'Marseille', 'Agence de communication de 38 personnes. Nous concevons des campagnes éditoriales et des contenus numériques pour des marques locales et nationales.'),
    ('MarketWave', 'marketwave', 'Nice', 'Agence de marketing de 52 personnes. Nos équipes pilotent des campagnes d’acquisition, analysent les conversions et améliorent les parcours clients.'),
    ('LegalPilot', 'legalpilot', 'Nancy', 'Legaltech de 35 personnes qui simplifie la gestion documentaire et le suivi contractuel. Juristes et équipes produit conçoivent ensemble les services proposés.'),
    ('ComptaNova', 'comptanova', 'Orléans', 'Cabinet comptable de 75 personnes accompagnant les TPE et PME. Nous automatisons les tâches répétitives pour consacrer davantage de temps au conseil.'),
    ('HelioEnergy', 'helioenergy', 'Aix-en-Provence', 'Entreprise de 160 personnes dédiée aux installations solaires. Nos équipes couvrent les études, les opérations, la maintenance et la relation client.'),
    ('CraftWorks', 'craftworks', 'Saint-Étienne', 'Entreprise industrielle de 230 personnes qui produit des équipements mécaniques. Qualité, maintenance préventive et amélioration continue guident notre travail.'),
    ('HappyDesk', 'happydesk', 'Angers', 'Éditeur de services pour les espaces de travail, avec 42 collaborateurs. Nous aidons les entreprises à gérer leurs bureaux et à améliorer la vie quotidienne des équipes.'),
    ('TravelBloom', 'travelbloom', 'Tours', 'Entreprise de voyage de 68 personnes qui organise des séjours personnalisés. Nous travaillons avec des partenaires locaux et suivons la satisfaction des voyageurs.'),
    ('FoodLoop', 'foodloop', 'Clermont-Ferrand', 'Entreprise de 105 personnes qui optimise la distribution alimentaire. Nous réduisons les invendus grâce à la prévision des besoins et à des opérations adaptées.'),
    ('GameHarbor', 'gameharbor', 'Lille', 'Studio de jeux vidéo de 58 personnes. Nous créons des expériences coopératives avec des équipes artistiques, techniques et de production intégrées.'),
    ('SecurePay', 'securepay', 'Rennes', 'Entreprise de paiement de 115 personnes. Nos solutions traitent les transactions, préviennent la fraude et facilitent le rapprochement des opérations.'),
    ('EcoHabitat', 'ecohabitat', 'La Rochelle', 'Entreprise de 82 personnes spécialisée dans l’habitat durable. Nous accompagnons les projets depuis les études techniques jusqu’au suivi des performances.'),
    ('ConnectCare', 'connectcare', 'Metz', 'Entreprise de services de 130 personnes dédiée à l’accompagnement des clients. Nous développons des outils de support et formons régulièrement nos conseillers.'),
    ('OpenCulture', 'openculture', 'Avignon', 'Structure culturelle de 46 personnes qui développe des outils de billetterie et de médiation. Nous travaillons avec des lieux culturels et des équipes pédagogiques.')
) AS company(name, domain, location, description);

-- 2. CATÉGORIES : métiers numériques et secteurs non techniques.
INSERT INTO categories (name) VALUES
    ('Développement web'),
    ('Data et intelligence artificielle'),
    ('Cybersécurité'),
    ('DevOps et cloud'),
    ('Design et expérience utilisateur'),
    ('Produit et gestion de projet'),
    ('Marketing et acquisition'),
    ('Communication et contenu'),
    ('Commerce et relation client'),
    ('Ressources humaines'),
    ('Finance et comptabilité'),
    ('Juridique et conformité'),
    ('Support et services informatiques'),
    ('Ingénierie et industrie'),
    ('Énergie et environnement'),
    ('Logistique et achats'),
    ('Bâtiment et immobilier'),
    ('Santé et accompagnement'),
    ('Formation et pédagogie'),
    ('Jeux vidéo et création numérique');

-- Tables temporaires de préparation : elles disparaissent au COMMIT.
-- Les relations sont résolues par jointure, sans supposer les IDs SERIAL.
CREATE TEMP TABLE seed_jobs (
    job_no INTEGER PRIMARY KEY,
    category_name TEXT NOT NULL,
    title TEXT NOT NULL,
    base_salary INTEGER NOT NULL,
    missions TEXT NOT NULL,
    profile TEXT NOT NULL,
    tools TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_jobs VALUES
    (1, 'Développement web', 'Développeur backend Node.js', 43000, 'Concevoir des API REST, optimiser les requêtes PostgreSQL et écrire des tests d’intégration', 'Maîtrise de JavaScript, des bases relationnelles et de la gestion des erreurs', 'Node.js, Express, PostgreSQL, Jest'),
    (2, 'Développement web', 'Développeur frontend React', 42000, 'Créer des composants réutilisables, intégrer les API et améliorer les performances et l’accessibilité des interfaces', 'Bonne pratique de React, HTML et CSS ; attention portée aux parcours utilisateurs', 'React, TypeScript, Vite, Testing Library'),
    (3, 'Développement web', 'Développeur full stack', 45000, 'Développer les fonctionnalités de bout en bout, documenter les API et participer aux revues de code', 'Expérience des applications web, compréhension des échanges HTTP et pratique de Git', 'React, Node.js, PostgreSQL, Docker'),
    (4, 'Data et intelligence artificielle', 'Data analyst', 41000, 'Définir les indicateurs métier, préparer les données et concevoir des tableaux de bord documentés', 'Maîtrise de SQL, rigueur analytique et capacité à expliquer les résultats aux équipes métier', 'SQL, Python, Power BI, dbt'),
    (5, 'Data et intelligence artificielle', 'Data engineer', 47000, 'Construire les pipelines de données, automatiser les contrôles de qualité et suivre les traitements quotidiens', 'Pratique de Python et SQL ; compréhension de la modélisation et des traitements distribués', 'Python, Airflow, PostgreSQL, Spark'),
    (6, 'Data et intelligence artificielle', 'Ingénieur machine learning', 50000, 'Évaluer des modèles, préparer les jeux de données et suivre les performances des modèles déployés', 'Connaissances en statistiques, évaluation expérimentale et industrialisation de modèles', 'Python, scikit-learn, PyTorch, MLflow'),
    (7, 'Cybersécurité', 'Analyste SOC', 42000, 'Qualifier les alertes de sécurité, documenter les incidents et améliorer les règles de détection', 'Connaissances des réseaux, des journaux système et des méthodes d’investigation', 'SIEM, Linux, Python, Wireshark'),
    (8, 'Cybersécurité', 'Consultant sécurité applicative', 49000, 'Auditer les applications, accompagner les corrections et former les développeurs aux pratiques de sécurité', 'Compréhension des vulnérabilités web et capacité à rédiger des recommandations exploitables', 'OWASP, Burp Suite, Git, Docker'),
    (9, 'Cybersécurité', 'Ingénieur sécurité cloud', 51000, 'Durcir les environnements cloud, contrôler les permissions et automatiser les vérifications de configuration', 'Pratique des architectures cloud, des identités et de la sécurité des conteneurs', 'AWS, IAM, Terraform, Kubernetes'),
    (10, 'DevOps et cloud', 'Ingénieur DevOps', 48000, 'Automatiser les déploiements, maintenir les pipelines CI/CD et améliorer la supervision des services', 'Pratique de Linux, de la conteneurisation et de l’infrastructure comme code', 'Docker, Kubernetes, Terraform, GitHub Actions'),
    (11, 'DevOps et cloud', 'Site reliability engineer', 53000, 'Définir les objectifs de disponibilité, réduire les incidents récurrents et automatiser les procédures d’exploitation', 'Expérience de la supervision, du diagnostic d’incidents et des architectures distribuées', 'Prometheus, Grafana, Linux, Go'),
    (12, 'DevOps et cloud', 'Administrateur systèmes et réseaux', 39000, 'Administrer les serveurs, gérer les sauvegardes et assurer le suivi des équipements réseau', 'Connaissances Linux et Windows, diagnostic réseau et documentation des procédures', 'Linux, Windows Server, Ansible, TCP/IP'),
    (13, 'Design et expérience utilisateur', 'UX designer', 40000, 'Mener des entretiens utilisateurs, cartographier les parcours et tester les prototypes', 'Capacité à conduire une recherche qualitative et à argumenter les choix de conception', 'Figma, FigJam, tests utilisateurs, design system'),
    (14, 'Design et expérience utilisateur', 'UI designer', 39000, 'Créer les maquettes, maintenir les composants du design system et accompagner leur intégration', 'Maîtrise de la composition, de la typographie et des règles d’accessibilité', 'Figma, Illustrator, WCAG, design tokens'),
    (15, 'Design et expérience utilisateur', 'Product designer', 45000, 'Concevoir les expériences produit, mesurer leur usage et collaborer avec les développeurs', 'Portfolio de produits numériques et pratique du prototypage et des tests', 'Figma, analytics produit, prototypage, HTML/CSS'),
    (16, 'Produit et gestion de projet', 'Product owner', 46000, 'Prioriser le backlog, rédiger les critères d’acceptation et organiser les échanges avec les utilisateurs', 'Capacité à clarifier les besoins, mesurer la valeur et coordonner plusieurs métiers', 'Jira, Scrum, SQL, documentation produit'),
    (17, 'Produit et gestion de projet', 'Chef de projet digital', 43000, 'Planifier les livrables, suivre les budgets et coordonner les prestataires et les équipes internes', 'Organisation, communication et maîtrise du suivi de projet', 'Jira, Notion, tableaux de bord, méthodes agiles'),
    (18, 'Produit et gestion de projet', 'Product manager', 52000, 'Définir la feuille de route, étudier les besoins du marché et suivre les objectifs produit', 'Expérience de la découverte produit, de la priorisation et de l’analyse des résultats', 'Analytics, entretiens clients, roadmap, SQL'),
    (19, 'Marketing et acquisition', 'Chargé de marketing digital', 36000, 'Préparer les campagnes, suivre les conversions et améliorer les pages d’acquisition', 'Bonne compréhension des canaux numériques et des indicateurs de performance', 'GA4, Google Ads, CRM, Excel'),
    (20, 'Marketing et acquisition', 'Spécialiste SEO', 38000, 'Auditer les sites, préparer les recommandations éditoriales et mesurer le trafic organique', 'Connaissances du référencement technique, de la recherche de mots-clés et du suivi de position', 'Search Console, Screaming Frog, Semrush, HTML'),
    (21, 'Marketing et acquisition', 'Growth marketer', 43000, 'Concevoir des expérimentations, analyser les entonnoirs de conversion et automatiser les campagnes', 'Approche expérimentale, aisance avec les données et sens de la rédaction', 'SQL, GA4, HubSpot, tests A/B'),
    (22, 'Communication et contenu', 'Chargé de communication', 34000, 'Organiser le calendrier éditorial, produire les supports et coordonner les événements de communication', 'Qualité rédactionnelle, organisation et adaptation aux différents publics', 'Canva, suite Adobe, calendrier éditorial, CMS'),
    (23, 'Communication et contenu', 'Content manager', 38000, 'Définir les contenus, coordonner les rédacteurs et suivre la performance des publications', 'Pratique de la stratégie éditoriale, du SEO et de la relecture', 'WordPress, Search Console, Notion, analytics'),
    (24, 'Communication et contenu', 'Community manager', 33000, 'Animer les communautés, modérer les échanges et produire les bilans des campagnes sociales', 'Bonne expression écrite, connaissance des plateformes et sens du service', 'Meta Business Suite, Canva, outils de veille, reporting'),
    (25, 'Commerce et relation client', 'Business developer', 37000, 'Identifier les prospects, qualifier leurs besoins et préparer les propositions commerciales', 'Aisance relationnelle, méthode de prospection et goût du travail en équipe', 'HubSpot, LinkedIn, CRM, outils de présentation'),
    (26, 'Commerce et relation client', 'Account manager', 41000, 'Suivre un portefeuille clients, préparer les renouvellements et coordonner les demandes avec les équipes', 'Expérience de la relation B2B, écoute et capacité à suivre plusieurs dossiers', 'Salesforce, CRM, Excel, reporting commercial'),
    (27, 'Commerce et relation client', 'Customer success manager', 40000, 'Accompagner les nouveaux clients, suivre leur adoption du produit et identifier les besoins de formation', 'Sens du service, capacité pédagogique et analyse des usages', 'CRM, outils de support, analytics produit, visioconférence'),
    (28, 'Ressources humaines', 'Chargé de recrutement', 35000, 'Rédiger les offres, organiser les entretiens et accompagner les candidats jusqu’à leur intégration', 'Écoute, organisation et capacité à évaluer les compétences avec des critères explicites', 'ATS, LinkedIn, entretiens structurés, Excel'),
    (29, 'Ressources humaines', 'Gestionnaire RH', 36000, 'Préparer les dossiers du personnel, suivre les absences et répondre aux questions des collaborateurs', 'Rigueur administrative, discrétion et maîtrise des outils de suivi', 'SIRH, Excel, gestion documentaire, reporting'),
    (30, 'Ressources humaines', 'Responsable formation', 43000, 'Recueillir les besoins, organiser les sessions et mesurer les résultats des parcours de formation', 'Pratique de l’ingénierie pédagogique et de la coordination de prestataires', 'LMS, outils de suivi, Excel, conception pédagogique'),
    (31, 'Finance et comptabilité', 'Comptable général', 37000, 'Tenir la comptabilité, préparer les rapprochements et participer aux clôtures périodiques', 'Formation comptable, rigueur et maîtrise des écritures courantes', 'Sage, Excel, rapprochements bancaires, ERP'),
    (32, 'Finance et comptabilité', 'Contrôleur de gestion', 44000, 'Préparer les budgets, analyser les écarts et produire les tableaux de bord financiers', 'Capacité d’analyse, modélisation financière et dialogue avec les équipes opérationnelles', 'Excel, Power BI, ERP, SQL'),
    (33, 'Finance et comptabilité', 'Analyste financier', 47000, 'Étudier les performances, construire les scénarios financiers et préparer les dossiers de décision', 'Maîtrise de l’analyse financière, clarté des synthèses et rigueur méthodologique', 'Excel, Power BI, modélisation, reporting'),
    (34, 'Juridique et conformité', 'Juriste contrats', 41000, 'Préparer les contrats, suivre les renouvellements et expliquer les engagements aux équipes', 'Formation juridique, capacité de synthèse et qualité rédactionnelle', 'Gestion contractuelle, Word, veille juridique, outils documentaires'),
    (35, 'Juridique et conformité', 'Chargé de conformité', 43000, 'Documenter les procédures, suivre les contrôles internes et accompagner les équipes dans leur application', 'Rigueur, capacité d’analyse des processus et pédagogie', 'Gestion des risques, Excel, cartographie des processus, reporting'),
    (36, 'Juridique et conformité', 'Chargé de protection des données', 45000, 'Tenir les registres, organiser les revues des traitements et sensibiliser les équipes', 'Compréhension des flux de données, rédaction de procédures et coordination transverse', 'Cartographie des données, gestion documentaire, ateliers, reporting'),
    (37, 'Support et services informatiques', 'Technicien support informatique', 29000, 'Résoudre les demandes utilisateurs, préparer les postes et documenter les incidents récurrents', 'Connaissances des postes de travail, patience et diagnostic méthodique', 'Windows, Linux, GLPI, outils de prise en main à distance'),
    (38, 'Support et services informatiques', 'Technicien helpdesk', 28000, 'Qualifier les tickets, guider les utilisateurs et transmettre les incidents complexes', 'Sens du service, expression claire et suivi rigoureux des demandes', 'GLPI, Microsoft 365, ticketing, base de connaissances'),
    (39, 'Support et services informatiques', 'Responsable support', 39000, 'Organiser les priorités, suivre les délais de résolution et améliorer la base de connaissances', 'Expérience du support, coordination d’équipe et analyse des indicateurs', 'Zendesk, reporting, ITIL, outils collaboratifs'),
    (40, 'Ingénierie et industrie', 'Ingénieur méthodes', 40000, 'Analyser les processus de fabrication, préparer les modes opératoires et réduire les défauts', 'Formation technique, approche terrain et connaissance de l’amélioration continue', 'CAO, Lean, Excel, analyse de processus'),
    (41, 'Ingénierie et industrie', 'Technicien maintenance', 32000, 'Assurer la maintenance préventive, diagnostiquer les pannes et suivre les interventions', 'Compétences mécaniques et électriques, rigueur et respect des procédures du site', 'GMAO, lecture de plans, diagnostic, automatisme'),
    (42, 'Ingénierie et industrie', 'Ingénieur qualité', 42000, 'Suivre les non-conformités, préparer les plans d’action et accompagner les audits internes', 'Analyse des causes, rédaction de procédures et dialogue avec la production', 'Méthode 8D, AMDEC, Excel, audits internes'),
    (43, 'Énergie et environnement', 'Chargé d’études environnement', 37000, 'Collecter les mesures, préparer les études d’impact et restituer les résultats aux équipes projet', 'Formation environnementale, analyse de données et rédaction de rapports', 'QGIS, Excel, mesures terrain, reporting'),
    (44, 'Énergie et environnement', 'Ingénieur efficacité énergétique', 44000, 'Analyser les consommations, simuler les économies et suivre les actions d’amélioration', 'Connaissances des équipements énergétiques et capacité à exploiter les mesures', 'Simulation énergétique, Python, Excel, capteurs'),
    (45, 'Énergie et environnement', 'Chef de projet solaire', 46000, 'Coordonner les études, planifier les installations et suivre les partenaires techniques', 'Gestion de projet, compréhension des installations électriques et organisation terrain', 'Planification, AutoCAD, suivi budgétaire, reporting'),
    (46, 'Logistique et achats', 'Coordinateur logistique', 34000, 'Planifier les expéditions, suivre les livraisons et résoudre les écarts de stock', 'Organisation, capacité à gérer les priorités et aisance avec les outils de suivi', 'WMS, ERP, Excel, tableaux de bord'),
    (47, 'Logistique et achats', 'Approvisionneur', 35000, 'Préparer les commandes, suivre les délais fournisseurs et anticiper les ruptures', 'Analyse des besoins, rigueur et communication avec les fournisseurs', 'ERP, Excel, prévision, suivi des commandes'),
    (48, 'Logistique et achats', 'Acheteur opérationnel', 40000, 'Comparer les offres, préparer les négociations et suivre la qualité des prestations', 'Capacité d’analyse, communication et compréhension des contraintes opérationnelles', 'ERP, Excel, analyse des coûts, gestion fournisseurs'),
    (49, 'Bâtiment et immobilier', 'Conducteur de travaux', 43000, 'Planifier les interventions, coordonner les entreprises et suivre la qualité des réalisations', 'Formation bâtiment, organisation de chantier et communication avec les intervenants', 'Planification, lecture de plans, suivi budgétaire, reporting'),
    (50, 'Bâtiment et immobilier', 'Dessinateur projeteur BIM', 38000, 'Produire les maquettes, vérifier les plans et coordonner les informations techniques', 'Maîtrise du dessin technique et attention à la cohérence des modèles', 'Revit, AutoCAD, BIM, gestion documentaire'),
    (51, 'Bâtiment et immobilier', 'Gestionnaire immobilier', 36000, 'Suivre les dossiers locatifs, organiser les interventions et accompagner les occupants', 'Organisation administrative, écoute et suivi des prestataires', 'Gestion locative, Excel, CRM, outils documentaires'),
    (52, 'Santé et accompagnement', 'Coordinateur parcours de santé', 35000, 'Organiser les rendez-vous, faciliter les échanges et suivre les étapes des parcours', 'Expérience de la coordination, écoute et respect de la confidentialité', 'Outils de planification, dossiers numériques, reporting, visioconférence'),
    (53, 'Santé et accompagnement', 'Chargé de projet santé numérique', 42000, 'Recueillir les besoins des professionnels, suivre les pilotes et préparer les supports de formation', 'Compréhension des usages en santé et capacité à coordonner plusieurs métiers', 'Gestion de projet, ateliers utilisateurs, outils collaboratifs, reporting'),
    (54, 'Santé et accompagnement', 'Conseiller accompagnement', 30000, 'Accueillir les bénéficiaires, identifier leurs besoins et suivre les actions proposées', 'Écoute, capacité de médiation et qualité du suivi administratif', 'CRM, suivi de dossiers, outils de rendez-vous, documentation'),
    (55, 'Formation et pédagogie', 'Ingénieur pédagogique', 39000, 'Concevoir les parcours, créer les évaluations et améliorer les supports avec les formateurs', 'Connaissances pédagogiques, rédaction claire et pratique des outils numériques', 'Moodle, H5P, outils auteur, évaluation'),
    (56, 'Formation et pédagogie', 'Formateur numérique', 35000, 'Animer les ateliers, adapter les exercices et suivre la progression des apprenants', 'Capacité pédagogique, maîtrise des outils numériques et écoute', 'LMS, visioconférence, exercices pratiques, outils collaboratifs'),
    (57, 'Formation et pédagogie', 'Coordinateur de formation', 34000, 'Planifier les sessions, suivre les inscriptions et coordonner les intervenants', 'Organisation, suivi administratif et sens du service', 'LMS, Excel, planification, gestion documentaire'),
    (58, 'Jeux vidéo et création numérique', 'Développeur gameplay', 41000, 'Implémenter les mécaniques de jeu, optimiser les performances et collaborer avec les designers', 'Pratique d’un moteur de jeu, programmation orientée objet et débogage', 'Unity, C#, Unreal Engine, Git'),
    (59, 'Jeux vidéo et création numérique', 'Artiste 3D', 35000, 'Créer les modèles, préparer les textures et intégrer les assets dans les scènes', 'Portfolio 3D, compréhension des contraintes temps réel et sens artistique', 'Blender, Substance Painter, Unity, Git'),
    (60, 'Jeux vidéo et création numérique', 'Game designer', 38000, 'Prototyper les mécaniques, équilibrer les niveaux et analyser les sessions de test', 'Capacité à formaliser les règles et à intégrer les retours des joueurs', 'Unity, documentation de design, prototypage, analytics');

-- 3. CANDIDATS : 120 identités distinctes et une spécialité par profil.
CREATE TEMP TABLE seed_candidates (
    candidate_no INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    job_no INTEGER NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_candidates VALUES
    (1, 'Alice', 'Martin', 'alice.martin@example.com', 1),
    (2, 'Lucas', 'Martin', 'lucas.martin@example.com', 2),
    (3, 'Emma', 'Martin', 'emma.martin@example.com', 3),
    (4, 'Hugo', 'Martin', 'hugo.martin@example.com', 4),
    (5, 'Léa', 'Martin', 'lea.martin@example.com', 5),
    (6, 'Gabriel', 'Martin', 'gabriel.martin@example.com', 6),
    (7, 'Chloé', 'Martin', 'chloe.martin@example.com', 7),
    (8, 'Louis', 'Martin', 'louis.martin@example.com', 8),
    (9, 'Manon', 'Martin', 'manon.martin@example.com', 9),
    (10, 'Adam', 'Martin', 'adam.martin@example.com', 10),
    (11, 'Inès', 'Martin', 'ines.martin@example.com', 11),
    (12, 'Nathan', 'Martin', 'nathan.martin@example.com', 12),
    (13, 'Sarah', 'Martin', 'sarah.martin@example.com', 13),
    (14, 'Arthur', 'Martin', 'arthur.martin@example.com', 14),
    (15, 'Jade', 'Martin', 'jade.martin@example.com', 15),
    (16, 'Raphaël', 'Martin', 'raphael.martin@example.com', 16),
    (17, 'Camille', 'Martin', 'camille.martin@example.com', 17),
    (18, 'Noah', 'Martin', 'noah.martin@example.com', 18),
    (19, 'Zoé', 'Martin', 'zoe.martin@example.com', 19),
    (20, 'Mohamed', 'Martin', 'mohamed.martin@example.com', 20),
    (21, 'Alice', 'Bernard', 'alice.bernard@example.com', 21),
    (22, 'Lucas', 'Bernard', 'lucas.bernard@example.com', 22),
    (23, 'Emma', 'Bernard', 'emma.bernard@example.com', 23),
    (24, 'Hugo', 'Bernard', 'hugo.bernard@example.com', 24),
    (25, 'Léa', 'Bernard', 'lea.bernard@example.com', 25),
    (26, 'Gabriel', 'Bernard', 'gabriel.bernard@example.com', 26),
    (27, 'Chloé', 'Bernard', 'chloe.bernard@example.com', 27),
    (28, 'Louis', 'Bernard', 'louis.bernard@example.com', 28),
    (29, 'Manon', 'Bernard', 'manon.bernard@example.com', 29),
    (30, 'Adam', 'Bernard', 'adam.bernard@example.com', 30),
    (31, 'Inès', 'Bernard', 'ines.bernard@example.com', 31),
    (32, 'Nathan', 'Bernard', 'nathan.bernard@example.com', 32),
    (33, 'Sarah', 'Bernard', 'sarah.bernard@example.com', 33),
    (34, 'Arthur', 'Bernard', 'arthur.bernard@example.com', 34),
    (35, 'Jade', 'Bernard', 'jade.bernard@example.com', 35),
    (36, 'Raphaël', 'Bernard', 'raphael.bernard@example.com', 36),
    (37, 'Camille', 'Bernard', 'camille.bernard@example.com', 37),
    (38, 'Noah', 'Bernard', 'noah.bernard@example.com', 38),
    (39, 'Zoé', 'Bernard', 'zoe.bernard@example.com', 39),
    (40, 'Mohamed', 'Bernard', 'mohamed.bernard@example.com', 40),
    (41, 'Alice', 'Dubois', 'alice.dubois@example.com', 41),
    (42, 'Lucas', 'Dubois', 'lucas.dubois@example.com', 42),
    (43, 'Emma', 'Dubois', 'emma.dubois@example.com', 43),
    (44, 'Hugo', 'Dubois', 'hugo.dubois@example.com', 44),
    (45, 'Léa', 'Dubois', 'lea.dubois@example.com', 45),
    (46, 'Gabriel', 'Dubois', 'gabriel.dubois@example.com', 46),
    (47, 'Chloé', 'Dubois', 'chloe.dubois@example.com', 47),
    (48, 'Louis', 'Dubois', 'louis.dubois@example.com', 48),
    (49, 'Manon', 'Dubois', 'manon.dubois@example.com', 49),
    (50, 'Adam', 'Dubois', 'adam.dubois@example.com', 50),
    (51, 'Inès', 'Dubois', 'ines.dubois@example.com', 51),
    (52, 'Nathan', 'Dubois', 'nathan.dubois@example.com', 52),
    (53, 'Sarah', 'Dubois', 'sarah.dubois@example.com', 53),
    (54, 'Arthur', 'Dubois', 'arthur.dubois@example.com', 54),
    (55, 'Jade', 'Dubois', 'jade.dubois@example.com', 55),
    (56, 'Raphaël', 'Dubois', 'raphael.dubois@example.com', 56),
    (57, 'Camille', 'Dubois', 'camille.dubois@example.com', 57),
    (58, 'Noah', 'Dubois', 'noah.dubois@example.com', 58),
    (59, 'Zoé', 'Dubois', 'zoe.dubois@example.com', 59),
    (60, 'Mohamed', 'Dubois', 'mohamed.dubois@example.com', 60),
    (61, 'Alice', 'Moreau', 'alice.moreau@example.com', 1),
    (62, 'Lucas', 'Moreau', 'lucas.moreau@example.com', 2),
    (63, 'Emma', 'Moreau', 'emma.moreau@example.com', 3),
    (64, 'Hugo', 'Moreau', 'hugo.moreau@example.com', 4),
    (65, 'Léa', 'Moreau', 'lea.moreau@example.com', 5),
    (66, 'Gabriel', 'Moreau', 'gabriel.moreau@example.com', 6),
    (67, 'Chloé', 'Moreau', 'chloe.moreau@example.com', 7),
    (68, 'Louis', 'Moreau', 'louis.moreau@example.com', 8),
    (69, 'Manon', 'Moreau', 'manon.moreau@example.com', 9),
    (70, 'Adam', 'Moreau', 'adam.moreau@example.com', 10),
    (71, 'Inès', 'Moreau', 'ines.moreau@example.com', 11),
    (72, 'Nathan', 'Moreau', 'nathan.moreau@example.com', 12),
    (73, 'Sarah', 'Moreau', 'sarah.moreau@example.com', 13),
    (74, 'Arthur', 'Moreau', 'arthur.moreau@example.com', 14),
    (75, 'Jade', 'Moreau', 'jade.moreau@example.com', 15),
    (76, 'Raphaël', 'Moreau', 'raphael.moreau@example.com', 16),
    (77, 'Camille', 'Moreau', 'camille.moreau@example.com', 17),
    (78, 'Noah', 'Moreau', 'noah.moreau@example.com', 18),
    (79, 'Zoé', 'Moreau', 'zoe.moreau@example.com', 19),
    (80, 'Mohamed', 'Moreau', 'mohamed.moreau@example.com', 20),
    (81, 'Alice', 'Laurent', 'alice.laurent@example.com', 21),
    (82, 'Lucas', 'Laurent', 'lucas.laurent@example.com', 22),
    (83, 'Emma', 'Laurent', 'emma.laurent@example.com', 23),
    (84, 'Hugo', 'Laurent', 'hugo.laurent@example.com', 24),
    (85, 'Léa', 'Laurent', 'lea.laurent@example.com', 25),
    (86, 'Gabriel', 'Laurent', 'gabriel.laurent@example.com', 26),
    (87, 'Chloé', 'Laurent', 'chloe.laurent@example.com', 27),
    (88, 'Louis', 'Laurent', 'louis.laurent@example.com', 28),
    (89, 'Manon', 'Laurent', 'manon.laurent@example.com', 29),
    (90, 'Adam', 'Laurent', 'adam.laurent@example.com', 30),
    (91, 'Inès', 'Laurent', 'ines.laurent@example.com', 31),
    (92, 'Nathan', 'Laurent', 'nathan.laurent@example.com', 32),
    (93, 'Sarah', 'Laurent', 'sarah.laurent@example.com', 33),
    (94, 'Arthur', 'Laurent', 'arthur.laurent@example.com', 34),
    (95, 'Jade', 'Laurent', 'jade.laurent@example.com', 35),
    (96, 'Raphaël', 'Laurent', 'raphael.laurent@example.com', 36),
    (97, 'Camille', 'Laurent', 'camille.laurent@example.com', 37),
    (98, 'Noah', 'Laurent', 'noah.laurent@example.com', 38),
    (99, 'Zoé', 'Laurent', 'zoe.laurent@example.com', 39),
    (100, 'Mohamed', 'Laurent', 'mohamed.laurent@example.com', 40),
    (101, 'Alice', 'Petit', 'alice.petit@example.com', 41),
    (102, 'Lucas', 'Petit', 'lucas.petit@example.com', 42),
    (103, 'Emma', 'Petit', 'emma.petit@example.com', 43),
    (104, 'Hugo', 'Petit', 'hugo.petit@example.com', 44),
    (105, 'Léa', 'Petit', 'lea.petit@example.com', 45),
    (106, 'Gabriel', 'Petit', 'gabriel.petit@example.com', 46),
    (107, 'Chloé', 'Petit', 'chloe.petit@example.com', 47),
    (108, 'Louis', 'Petit', 'louis.petit@example.com', 48),
    (109, 'Manon', 'Petit', 'manon.petit@example.com', 49),
    (110, 'Adam', 'Petit', 'adam.petit@example.com', 50),
    (111, 'Inès', 'Petit', 'ines.petit@example.com', 51),
    (112, 'Nathan', 'Petit', 'nathan.petit@example.com', 52),
    (113, 'Sarah', 'Petit', 'sarah.petit@example.com', 53),
    (114, 'Arthur', 'Petit', 'arthur.petit@example.com', 54),
    (115, 'Jade', 'Petit', 'jade.petit@example.com', 55),
    (116, 'Raphaël', 'Petit', 'raphael.petit@example.com', 56),
    (117, 'Camille', 'Petit', 'camille.petit@example.com', 57),
    (118, 'Noah', 'Petit', 'noah.petit@example.com', 58),
    (119, 'Zoé', 'Petit', 'zoe.petit@example.com', 59),
    (120, 'Mohamed', 'Petit', 'mohamed.petit@example.com', 60);

INSERT INTO people (first_name, last_name, email, phone, password_hash, role, created_at)
SELECT first_name, last_name, email,
       '+33 6 00 ' || lpad((candidate_no / 100)::text, 2, '0') || ' '
                  || lpad((candidate_no % 100)::text, 2, '0') || ' 00',
       '$2b$10$OozsG2pijPcjPx5I1a/feO1tzKKWhupzIMjhTpHcVQkohbnehpzra',
       'USER', CURRENT_TIMESTAMP - (500 + candidate_no) * INTERVAL '1 day'
FROM seed_candidates
ORDER BY candidate_no;

INSERT INTO people (first_name, last_name, email, phone, password_hash, role, created_at) VALUES
    ('Denis', 'Admin', 'admin@jobboard.example.com', NULL,
     '$2b$10$OozsG2pijPcjPx5I1a/feO1tzKKWhupzIMjhTpHcVQkohbnehpzra',
     'ADMIN', CURRENT_TIMESTAMP - INTERVAL '2 years'),
    ('Sophie', 'Gestion', 'moderation@jobboard.example.com', NULL,
     '$2b$10$OozsG2pijPcjPx5I1a/feO1tzKKWhupzIMjhTpHcVQkohbnehpzra',
     'ADMIN', CURRENT_TIMESTAMP - INTERVAL '2 years');

-- 4. OFFRES : quatre variantes par métier, avec missions et profil détaillés.
-- Les employeurs sont choisis selon leur secteur d’activité.
-- Le schéma ne comporte pas de champ
-- télétravail : cette information figure dans le lieu et la description.
CREATE TEMP TABLE seed_company_map ON COMMIT DROP AS
SELECT id, name, description, location, row_number() OVER (ORDER BY id)::integer AS company_no
FROM companies;

CREATE TEMP TABLE seed_category_companies (
    category_name TEXT PRIMARY KEY,
    company_names TEXT[] NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_category_companies VALUES
    ('Développement web', ARRAY['NovaTech', 'GreenCode', 'Finova', 'ShopFlow']),
    ('Data et intelligence artificielle', ARRAY['DataForge', 'AgriSense', 'FoodLoop', 'LogiBridge']),
    ('Cybersécurité', ARRAY['CyberShield', 'SecurePay', 'LegalPilot', 'Finova']),
    ('DevOps et cloud', ARRAY['CloudNest', 'NovaTech', 'SecurePay', 'MediLink']),
    ('Design et expérience utilisateur', ARRAY['PixelAtelier', 'GreenCode', 'HappyDesk', 'OpenCulture']),
    ('Produit et gestion de projet', ARRAY['NovaTech', 'EduSphere', 'UrbanMove', 'ShopFlow']),
    ('Marketing et acquisition', ARRAY['MarketWave', 'ShopFlow', 'TravelBloom', 'FoodLoop']),
    ('Communication et contenu', ARRAY['SocialSpark', 'OpenCulture', 'TravelBloom', 'GameHarbor']),
    ('Commerce et relation client', ARRAY['Finova', 'LogiBridge', 'HelioEnergy', 'HappyDesk']),
    ('Ressources humaines', ARRAY['TalentPulse', 'CraftWorks', 'ComptaNova', 'ConnectCare']),
    ('Finance et comptabilité', ARRAY['ComptaNova', 'Finova', 'SecurePay', 'FoodLoop']),
    ('Juridique et conformité', ARRAY['LegalPilot', 'MediLink', 'SecurePay', 'EcoHabitat']),
    ('Support et services informatiques', ARRAY['ConnectCare', 'HappyDesk', 'CloudNest', 'EduSphere']),
    ('Ingénierie et industrie', ARRAY['CraftWorks', 'AgriSense', 'BuildWise', 'HelioEnergy']),
    ('Énergie et environnement', ARRAY['HelioEnergy', 'EcoHabitat', 'OceanBlue', 'BuildWise']),
    ('Logistique et achats', ARRAY['LogiBridge', 'FoodLoop', 'AgriSense', 'CraftWorks']),
    ('Bâtiment et immobilier', ARRAY['BuildWise', 'EcoHabitat', 'HelioEnergy', 'HappyDesk']),
    ('Santé et accompagnement', ARRAY['MediLink', 'ConnectCare', 'MediLink', 'ConnectCare']),
    ('Formation et pédagogie', ARRAY['EduSphere', 'TalentPulse', 'OpenCulture', 'ConnectCare']),
    ('Jeux vidéo et création numérique', ARRAY['GameHarbor', 'GameHarbor', 'EduSphere', 'OpenCulture']);

-- Contenus éditoriaux : vingt contextes sectoriels et soixante fiches métier.
-- Ils alimentent uniquement la description longue des offres.
CREATE TEMP TABLE seed_category_details (
    category_name TEXT PRIMARY KEY,
    sector_context TEXT NOT NULL,
    sector_challenges TEXT NOT NULL,
    team_description TEXT NOT NULL,
    education TEXT NOT NULL,
    learning TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_category_details VALUES
    ('Développement web', 'Les applications web sont devenues un point de contact quotidien entre les entreprises, leurs clients et leurs partenaires. La multiplication des usages, des terminaux et des échanges de données impose de concevoir des services compréhensibles, rapides et faciles à faire évoluer. Un parcours réussi repose autant sur la qualité de l’interface que sur la fiabilité des traitements exécutés en arrière-plan.', 'Nos produits doivent accompagner de nouveaux usages sans fragiliser les fonctionnalités existantes. Nous travaillons sur la modularité du code, la performance, la protection des données et l’accessibilité, avec une attention particulière aux retours des utilisateurs. Les décisions techniques sont discutées à partir de besoins concrets et validées par des tests avant leur mise en production.', 'Vous rejoindrez une équipe réunissant développeurs, designer et responsable produit. Un référent technique vous accompagnera dans la compréhension de l’architecture ; les revues de code et les démonstrations de fin de cycle permettront de partager les choix et les difficultés rencontrées.', 'informatique, développement logiciel ou conception d’applications web', '- Comprendre le cycle complet d’une fonctionnalité, du besoin à son utilisation en production.
- Développer une pratique des tests et des revues de code.
- Mesurer les performances et améliorer l’accessibilité des parcours.
- Documenter une solution et expliquer ses compromis à l’équipe.'),
    ('Data et intelligence artificielle', 'Les organisations accumulent des données issues de leurs applications, de leurs équipements et de leurs échanges avec les clients. Ces informations restent souvent réparties entre plusieurs systèmes, avec des formats, des niveaux de qualité et des rythmes de mise à jour différents. Leur exploitation exige de comprendre leur origine, leur signification et les usages auxquels elles sont destinées.', 'Notre équipe construit des méthodes pour transformer ces données en informations fiables et en outils d’aide à la décision. Les travaux portent sur l’intégration des sources, la traçabilité des transformations et l’évaluation des analyses ou des modèles. La confidentialité, les droits d’accès et la reproductibilité des résultats font partie du travail quotidien, au même titre que la performance technique.', 'Vous travaillerez avec des data analysts, des data engineers et des interlocuteurs métier. Un référent data vous aidera à cadrer les hypothèses ; des revues régulières permettront de discuter les jeux de données, les méthodes et les limites des résultats avant leur diffusion.', 'informatique, statistiques, mathématiques appliquées, data science ou systèmes d’information', '- Approfondir les étapes de collecte, de préparation et de valorisation des données.
- Évaluer la qualité d’un jeu de données et documenter ses limites.
- Construire des analyses reproductibles et interpréter les résultats avec prudence.
- Présenter une méthode et ses résultats à un public technique et métier.'),
    ('Cybersécurité', 'L’ouverture des systèmes d’information et la multiplication des services numériques augmentent les surfaces d’exposition. Les équipes doivent protéger des environnements qui évoluent rapidement, tout en maintenant leur disponibilité pour les utilisateurs. Les informations utiles à la détection sont dispersées entre journaux, configurations, applications et équipements réseau.', 'Notre démarche associe prévention, détection et traitement des incidents. Chaque investigation doit produire des éléments vérifiables, distinguer les faits des hypothèses et conduire à des mesures concrètes. Les travaux sont réalisés dans des périmètres autorisés et documentés, avec une attention particulière à la confidentialité des informations et à l’impact des changements sur les services.', 'Vous intégrerez une équipe sécurité composée d’analystes et d’ingénieurs, en lien avec les responsables des applications et de l’infrastructure. Un référent validera les plans d’intervention et les restitutions ; les retours d’expérience serviront à améliorer les procédures collectives.', 'informatique, réseaux, administration des systèmes ou cybersécurité', '- Structurer une investigation et conserver des éléments vérifiables.
- Évaluer un risque en tenant compte de son contexte d’exploitation.
- Proposer des corrections et vérifier leur efficacité.
- Rédiger des comptes rendus utilisables par les équipes techniques.'),
    ('DevOps et cloud', 'Les équipes produit doivent livrer de nouvelles fonctionnalités tout en garantissant la continuité des services. La multiplication des environnements, des dépendances et des configurations rend les opérations manuelles difficiles à suivre. Les plateformes doivent rester observables, reproductibles et suffisamment simples pour être comprises par les équipes qui les utilisent.', 'Nous développons une infrastructure qui facilite les déploiements et rend les incidents plus faciles à diagnostiquer. L’automatisation, la gestion des configurations et la supervision sont pensées ensemble. Nous suivons la disponibilité, les délais de livraison et l’usage des ressources afin de décider des améliorations à partir de mesures et de retours d’exploitation.', 'Vous rejoindrez les équipes plateforme et exploitation, avec des échanges réguliers avec les développeurs. Un ingénieur référent accompagnera vos premiers changements ; les procédures de validation et de retour arrière seront préparées avant toute intervention sur un service partagé.', 'informatique, systèmes, réseaux ou ingénierie cloud', '- Automatiser une opération tout en conservant sa traçabilité.
- Construire des environnements reproductibles et vérifier leur configuration.
- Interpréter les métriques et les journaux d’un service.
- Préparer une intervention, son contrôle et son retour arrière.'),
    ('Design et expérience utilisateur', 'Un service numérique doit être compris par des utilisateurs qui possèdent des habitudes, des besoins et des contraintes variés. La multiplication des fonctionnalités peut rendre les parcours difficiles à lire et augmenter les erreurs. Concevoir une interface pertinente demande d’observer les usages réels plutôt que de se limiter aux préférences de l’équipe projet.', 'Notre démarche rapproche recherche utilisateur, conception et réalisation. Nous cherchons à rendre les actions importantes accessibles, à harmoniser les composants et à vérifier les choix avec des prototypes. Les observations, les contraintes techniques et les objectifs métier sont discutés ensemble pour construire des solutions utilisables et cohérentes.', 'Vous travaillerez avec des designers, des responsables produit et des développeurs. Des ateliers de critique constructive permettront de discuter les pistes ; un référent design vous accompagnera dans la préparation des tests et la transmission des spécifications.', 'design d’interface, ergonomie, communication visuelle ou conception de services', '- Relier les décisions de conception à des observations utilisateurs.
- Prototyper un parcours et organiser son évaluation.
- Faire évoluer un design system sans perdre sa cohérence.
- Présenter des choix et accompagner leur réalisation technique.'),
    ('Produit et gestion de projet', 'Les besoins des utilisateurs et les priorités des organisations évoluent plus vite que les capacités de réalisation des équipes. Plusieurs demandes peuvent se concurrencer sans poursuivre les mêmes objectifs. La réussite d’un produit ou d’un projet nécessite un cadre clair pour comprendre les problèmes, arbitrer les priorités et suivre les résultats obtenus.', 'Nous organisons le travail autour de besoins explicités, de livrables vérifiables et d’indicateurs partagés. Les échanges avec les métiers doivent permettre d’identifier les dépendances et de rendre les décisions compréhensibles. Le suivi porte sur la valeur produite, les risques, la qualité et les ressources mobilisées, avec des ajustements réguliers fondés sur les retours du terrain.', 'Vous intégrerez une équipe réunissant produit, réalisation et interlocuteurs métier. Un responsable de pôle accompagnera les arbitrages ; des points de coordination courts permettront de traiter les blocages et de suivre les décisions prises avec les parties prenantes.', 'gestion de projet, management, systèmes d’information ou ingénierie', '- Transformer un besoin imprécis en objectif et en livrable vérifiable.
- Prioriser les travaux selon leur valeur et leurs dépendances.
- Animer des échanges et documenter les décisions.
- Suivre les résultats après livraison et proposer les ajustements utiles.'),
    ('Marketing et acquisition', 'Les parcours d’achat combinent recherche en ligne, contenus, campagnes et recommandations. Les équipes marketing disposent de nombreux canaux, mais doivent comprendre ceux qui répondent réellement aux besoins des publics visés. Les indicateurs de visibilité ne suffisent pas à expliquer la qualité des contacts ni leur contribution aux objectifs de l’entreprise.', 'Notre travail consiste à construire des campagnes mesurables et à améliorer les parcours à partir de données interprétables. Les budgets, les messages et les audiences sont suivis avec une logique d’expérimentation. Nous prenons en compte la qualité du suivi analytique, les préférences exprimées par les utilisateurs et la cohérence des messages diffusés sur les différents canaux.', 'Vous travaillerez avec les équipes acquisition, contenu et commerce. Un responsable marketing vous aidera à cadrer les objectifs ; les résultats seront discutés avec les équipes qui reçoivent les contacts afin de relier les performances des campagnes aux besoins commerciaux.', 'marketing, communication, commerce ou analyse de données appliquée', '- Construire une campagne avec des objectifs et des indicateurs explicites.
- Vérifier la qualité du suivi avant d’interpréter les résultats.
- Comparer des variantes et documenter les enseignements.
- Présenter un bilan qui relie les dépenses, les conversions et la qualité des contacts.'),
    ('Communication et contenu', 'Les publics rencontrent une marque à travers des contenus, des événements et des échanges sur plusieurs plateformes. La diversité des formats et des interlocuteurs peut rendre les messages incohérents ou difficiles à comprendre. Une communication efficace exige une ligne éditoriale claire, une connaissance des publics et une organisation fiable de la production.', 'Nous préparons des contenus qui répondent à des questions précises et respectent l’identité de l’entreprise. Les publications sont relues, contextualisées et adaptées à chaque canal. Nous suivons leur réception pour améliorer les prochaines actions, avec une attention portée à la qualité des sources, aux droits d’utilisation des supports et à la clarté des informations transmises.', 'Vous intégrerez l’équipe communication, en lien avec les experts internes et les partenaires créatifs. Un responsable éditorial validera les contenus sensibles ; les points de préparation permettront d’anticiper les échéances et de coordonner les contributions.', 'communication, lettres, journalisme, marketing ou création de contenus', '- Adapter un message à un public et à un canal.
- Construire un calendrier de production réaliste.
- Vérifier les sources et préparer une publication relue.
- Analyser les retours pour améliorer les contenus suivants.'),
    ('Commerce et relation client', 'Les clients attendent des interlocuteurs capables de comprendre leurs besoins et de suivre les engagements pris. Les cycles de décision impliquent souvent plusieurs personnes et des contraintes de budget ou d’organisation. Développer une relation durable demande de qualifier les attentes, de coordonner les réponses et de rendre les prochaines étapes visibles.', 'Notre démarche commerciale associe écoute, connaissance du service et suivi méthodique des échanges. Nous privilégions les propositions adaptées au contexte du client et des engagements vérifiés avec les équipes opérationnelles. Le CRM doit permettre de partager une information fiable, d’anticiper les échéances et de mesurer la satisfaction ainsi que la progression des dossiers.', 'Vous rejoindrez les équipes commerce et relation client, avec des échanges fréquents avec le produit et les opérations. Un manager vous accompagnera dans les premiers rendez-vous ; des revues de portefeuille permettront de discuter les priorités et les obstacles rencontrés.', 'commerce, négociation, gestion de la relation client ou développement d’activité', '- Conduire un entretien de découverte et reformuler les besoins.
- Construire un suivi client partagé et actualisé.
- Préparer une proposition avec des engagements réalistes.
- Analyser la progression d’un portefeuille et prioriser les actions.'),
    ('Ressources humaines', 'L’évolution des métiers et des organisations transforme les attentes des collaborateurs et les besoins en compétences. Les équipes RH doivent accompagner les parcours tout en assurant un suivi administratif fiable. Les informations traitées sont sensibles et demandent des règles claires de confidentialité, de partage et de conservation.', 'Nous cherchons à proposer des démarches compréhensibles pour les candidats, les collaborateurs et les managers. Les processus sont documentés et améliorés à partir des questions reçues et des difficultés rencontrées. Le suivi combine qualité du service, fiabilité des dossiers et capacité à anticiper les besoins de recrutement, de formation et d’accompagnement.', 'Vous travaillerez avec l’équipe RH, les managers et les prestataires spécialisés. Un responsable RH vous accompagnera sur les dossiers nouveaux ; les demandes nécessitant une interprétation particulière seront examinées avec les interlocuteurs compétents avant réponse.', 'ressources humaines, gestion, psychologie du travail ou administration des organisations', '- Conduire un processus RH avec des étapes et des critères explicites.
- Traiter les informations personnelles avec discrétion.
- Construire des indicateurs utiles au suivi des parcours.
- Communiquer une procédure de manière claire aux collaborateurs.'),
    ('Finance et comptabilité', 'Les décisions d’investissement et de pilotage reposent sur des informations financières fiables et disponibles au bon moment. Les données proviennent de plusieurs activités et doivent être rapprochées avec leurs justificatifs. Un chiffre utile doit pouvoir être expliqué, retracé et comparé à une période ou à une hypothèse clairement définie.', 'Notre équipe améliore les processus de préparation, de contrôle et de restitution des informations financières. Les travaux associent rigueur des opérations, analyse des écarts et dialogue avec les équipes métier. Nous documentons les hypothèses et les contrôles pour rendre les résultats vérifiables et faciliter les clôtures, les prévisions et les décisions de gestion.', 'Vous rejoindrez l’équipe finance et comptabilité, en lien avec les responsables opérationnels. Un référent validera les travaux préparatoires ; les points de revue permettront d’expliquer les écarts et de préparer les éléments nécessaires aux échéances de reporting.', 'comptabilité, finance, gestion, économie ou analyse financière', '- Rapprocher une donnée financière avec ses justificatifs.
- Construire un contrôle et documenter les anomalies.
- Présenter une analyse des écarts avec des hypothèses explicites.
- Organiser les travaux selon les échéances de clôture et de reporting.'),
    ('Juridique et conformité', 'La multiplication des partenaires, des contrats et des flux d’information rend les engagements des organisations plus difficiles à suivre. Les équipes opérationnelles ont besoin de comprendre les règles applicables à leurs activités et les responsabilités associées. Le travail juridique et de conformité doit transformer des exigences complexes en démarches utilisables.', 'Nous développons des procédures qui permettent de repérer les risques, de conserver les éléments justificatifs et de suivre les actions engagées. Les dossiers sont examinés avec leurs faits, leurs documents et leurs échéances. Les réponses doivent distinguer ce qui est établi, ce qui reste à vérifier et les décisions qui nécessitent une validation par un responsable compétent.', 'Vous travaillerez avec les équipes juridique, conformité et opérations. Un référent examinera les dossiers sensibles ; des échanges avec les métiers permettront de comprendre les pratiques avant de proposer une procédure ou une recommandation.', 'droit, conformité, gestion des risques ou protection des données', '- Constituer un dossier avec des éléments vérifiables.
- Lire un engagement et identifier les points à clarifier.
- Transformer une recommandation en action suivie.
- Rédiger une synthèse compréhensible par les équipes opérationnelles.'),
    ('Support et services informatiques', 'Les outils informatiques structurent le travail quotidien des collaborateurs. Une panne, un accès manquant ou une configuration incomprise peut interrompre une activité et provoquer des demandes répétées. Le support doit qualifier rapidement la situation tout en guidant des utilisateurs dont les connaissances techniques sont très différentes.', 'Notre équipe améliore la résolution des demandes et la prévention des incidents récurrents. Chaque ticket doit conserver le contexte, les vérifications réalisées et la solution appliquée. La qualité de service repose sur un diagnostic méthodique, une communication régulière et une base de connaissances accessible aux utilisateurs comme aux équipes techniques.', 'Vous intégrerez le service support, avec des échanges avec l’administration des systèmes et les équipes métier. Un référent accompagnera les cas nouveaux ; les incidents dépassant votre périmètre seront transmis avec un diagnostic documenté pour faciliter leur traitement.', 'informatique, maintenance des postes de travail, systèmes ou assistance aux utilisateurs', '- Qualifier une demande sans perdre son contexte utilisateur.
- Diagnostiquer une panne avec une suite de vérifications reproductibles.
- Expliquer une solution avec des termes accessibles.
- Documenter les incidents pour réduire leur répétition.'),
    ('Ingénierie et industrie', 'Les ateliers doivent produire des équipements fiables tout en maîtrisant les délais, les ressources et les variations de qualité. Les écarts observés peuvent provenir des méthodes, des réglages, des équipements ou des approvisionnements. Comprendre un problème nécessite de rapprocher les mesures, les documents techniques et les observations réalisées sur le terrain.', 'Nos équipes améliorent les procédés à partir de faits et d’essais préparés. Les changements sont documentés et évalués avant leur déploiement, en tenant compte des contraintes de production et de sécurité du site. Nous cherchons à réduire les défauts, à fiabiliser les équipements et à rendre les pratiques plus faciles à transmettre aux opérateurs.', 'Vous travaillerez avec les équipes production, méthodes, maintenance et qualité. Un référent technique accompagnera vos premières analyses ; les interventions sur les équipements seront préparées avec les personnes habilitées et les responsables du site.', 'génie industriel, mécanique, électrotechnique, maintenance ou qualité', '- Observer un procédé et collecter les données utiles à son analyse.
- Rechercher les causes d’un écart avec une méthode structurée.
- Préparer un essai et comparer ses résultats aux objectifs.
- Rédiger une procédure exploitable par les équipes de terrain.'),
    ('Énergie et environnement', 'Les projets énergétiques et environnementaux demandent de comprendre des situations locales, des mesures parfois incomplètes et des contraintes de fonctionnement. Les choix techniques ont des effets sur les consommations, les coûts et les usages. Une étude utile doit rendre ses hypothèses visibles et expliquer les limites des résultats présentés.', 'Nous accompagnons les projets depuis la collecte des informations jusqu’au suivi des actions retenues. Les travaux combinent analyse de données, observations de terrain et échanges avec les exploitants. Nous cherchons à proposer des solutions réalistes, à comparer les scénarios et à vérifier les performances dans la durée plutôt que de nous limiter aux estimations initiales.', 'Vous rejoindrez les équipes études et projets, avec des échanges avec les exploitants et les partenaires techniques. Un responsable d’études accompagnera la préparation des méthodes ; les relevés de terrain seront organisés selon les conditions et les procédures du site.', 'énergie, environnement, génie thermique, génie électrique ou études techniques', '- Préparer une collecte de mesures et contrôler leur cohérence.
- Construire un scénario en explicitant ses hypothèses.
- Comparer les performances attendues et les résultats observés.
- Présenter une recommandation technique aux responsables d’un projet.'),
    ('Logistique et achats', 'Les chaînes d’approvisionnement relient des fournisseurs, des stocks et des équipes opérationnelles soumis à des délais variables. Une information erronée sur une quantité ou une date peut provoquer une rupture, un surstock ou un retard de livraison. Le pilotage nécessite une vision partagée des besoins et des engagements pris.', 'Nous améliorons la circulation des informations entre les achats, les entrepôts et les utilisateurs des produits. Les écarts sont analysés avec leurs causes et leurs effets sur l’activité. Le suivi combine qualité des données, anticipation des risques et coordination des interlocuteurs pour sécuriser les flux sans mobiliser inutilement les ressources.', 'Vous intégrerez les équipes logistique et achats, en lien avec les fournisseurs et les responsables d’exploitation. Un référent accompagnera vos premiers dossiers ; les priorités seront discutées à partir des besoins opérationnels, des stocks et des délais annoncés.', 'logistique, supply chain, achats, gestion ou commerce', '- Relier les besoins opérationnels aux commandes et aux stocks.
- Analyser un retard ou un écart de quantité.
- Comparer des propositions avec des critères documentés.
- Construire un suivi fournisseur utile à la coordination des équipes.'),
    ('Bâtiment et immobilier', 'Les projets de bâtiment et la gestion des espaces impliquent des acteurs nombreux, des documents techniques et des échéances interdépendantes. Une information non transmise ou un plan non actualisé peut provoquer des retards et des reprises. Le travail doit relier les besoins des occupants, les contraintes techniques et les engagements des intervenants.', 'Nous organisons les projets avec des documents partagés, des points de contrôle et un suivi des décisions. Les observations du terrain sont rapprochées des plans, des budgets et du calendrier. Nous cherchons à rendre les responsabilités visibles, à anticiper les difficultés et à conserver une trace des modifications jusqu’à la réception ou à la clôture des interventions.', 'Vous travaillerez avec les équipes projets, les gestionnaires et les partenaires techniques. Un responsable de dossier vous accompagnera ; les visites et interventions seront préparées avec les référents du site et réalisées selon les procédures prévues.', 'bâtiment, génie civil, modélisation BIM, immobilier ou gestion technique', '- Lire un dossier et identifier les dépendances entre intervenants.
- Suivre les modifications d’un plan ou d’une intervention.
- Préparer un point d’avancement avec des éléments factuels.
- Rédiger un compte rendu qui facilite les actions suivantes.'),
    ('Santé et accompagnement', 'Les parcours de santé et d’accompagnement mobilisent plusieurs interlocuteurs, des rendez-vous et des informations sensibles. Les personnes concernées peuvent rencontrer des difficultés à comprendre les démarches ou à coordonner les étapes proposées. La qualité du suivi repose sur des informations claires, une écoute attentive et une organisation fiable.', 'Nous développons des méthodes de coordination qui facilitent les échanges et réduisent les ruptures de parcours. Les demandes sont suivies avec le consentement et les règles de confidentialité prévus dans le service. Notre rôle consiste à organiser, informer et orienter dans le périmètre de la mission, en sollicitant les professionnels compétents pour les questions qui dépassent ce cadre.', 'Vous rejoindrez une équipe de coordination et d’accompagnement, en lien avec les professionnels partenaires. Un responsable de parcours vous aidera à prendre connaissance des procédures ; des temps d’échange permettront de traiter les situations nécessitant une coordination renforcée.', 'coordination de parcours, intervention sociale, gestion de projet santé ou accompagnement', '- Préparer un suivi qui respecte les besoins et les disponibilités de la personne.
- Partager les informations utiles avec les interlocuteurs autorisés.
- Repérer un blocage et organiser une orientation adaptée.
- Rédiger des comptes rendus clairs en respectant la confidentialité.'),
    ('Formation et pédagogie', 'Les apprenants suivent des parcours avec des niveaux de départ, des objectifs et des contraintes différents. Les ressources numériques multiplient les possibilités, mais leur disponibilité ne garantit pas l’apprentissage. Une formation pertinente doit proposer une progression claire, des activités adaptées et des moyens de vérifier la compréhension.', 'Nous concevons et organisons des parcours à partir de compétences observables. Les supports, les exercices et les évaluations sont relus avec les formateurs puis ajustés selon les retours des apprenants. Le suivi doit rendre les difficultés visibles et permettre des améliorations concrètes, tout en conservant une organisation fiable des sessions et des ressources.', 'Vous travaillerez avec les équipes pédagogiques, les formateurs et les responsables de programme. Un référent vous accompagnera dans la préparation des activités ; les retours de session serviront à améliorer les contenus et l’organisation des prochains parcours.', 'sciences de l’éducation, ingénierie pédagogique, formation ou coordination de programmes', '- Traduire un objectif en activité et en critère d’évaluation.
- Adapter un support au niveau des apprenants.
- Organiser une session et suivre son déroulement.
- Exploiter les retours pour améliorer un parcours de formation.'),
    ('Jeux vidéo et création numérique', 'La création d’une expérience interactive repose sur la coordination des mécaniques, des contenus visuels et de la réalisation technique. Les intentions de conception doivent être vérifiées avec des prototypes et des tests de jeu. Les contraintes de performance, de lisibilité et de production influencent les choix à chaque étape du développement.', 'Notre équipe construit des expériences jouables à partir d’itérations courtes et de retours observés. Les fonctionnalités et les assets sont intégrés avec une attention portée à leur cohérence et à leur coût technique. Nous documentons les règles, les conventions et les décisions afin de faciliter le travail commun entre design, programmation, art et production.', 'Vous intégrerez une équipe réunissant programmation, design et création artistique. Un référent de votre discipline accompagnera vos premiers livrables ; les sessions de test permettront de discuter les résultats et de préparer les itérations suivantes.', 'développement de jeux, informatique, création 3D, game design ou production interactive', '- Passer d’une intention à un prototype jouable.
- Comprendre les contraintes des autres disciplines de production.
- Intégrer un livrable et vérifier son comportement dans le moteur.
- Utiliser les retours de test pour préparer une amélioration argumentée.');

CREATE TEMP TABLE seed_job_details (
    job_no INTEGER PRIMARY KEY REFERENCES seed_jobs(job_no),
    role_context TEXT NOT NULL,
    detailed_missions TEXT NOT NULL,
    deliverables TEXT NOT NULL,
    optional_skills TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_job_details VALUES
    (1, 'Vous contribuerez à la fiabilisation des services qui gèrent les comptes, les catalogues et les opérations du produit. L’objectif est de proposer des API compréhensibles, de réduire les erreurs et de faciliter l’évolution du modèle de données.', '- Concevoir des routes REST avec des contrats d’entrée et de sortie explicites.
- Implémenter la validation des paramètres, la gestion des erreurs et les contrôles d’accès.
- Analyser les plans d’exécution SQL et améliorer les requêtes les plus coûteuses.
- Écrire des tests d’intégration sur les parcours nominaux et les cas d’échec.
- Préparer des migrations de base de données avec une procédure de retour arrière.
- Documenter les endpoints et contribuer aux revues de code de l’équipe.', 'une API testée, sa documentation et un bilan des améliorations de performance', '- TypeScript et documentation OpenAPI.
- Pratique du cache et des traitements asynchrones.'),
    (2, 'Vous interviendrez sur les écrans utilisés quotidiennement par nos clients. Les travaux visent à rendre les parcours lisibles, à maintenir des interactions fluides et à traiter correctement les états de chargement, d’erreur et d’absence de données.', '- Transformer les maquettes en composants React réutilisables et accessibles.
- Intégrer les API en gérant les chargements, les erreurs et les annulations de requêtes.
- Construire les formulaires avec validation et messages compréhensibles.
- Vérifier les parcours au clavier et la lisibilité sur plusieurs tailles d’écran.
- Mesurer le temps de chargement et réduire les rendus ou ressources inutiles.
- Écrire des tests de composants et présenter les fonctionnalités au designer.', 'un parcours responsive documenté, ses tests et une revue d’accessibilité', '- Gestion des états avec des hooks ou une bibliothèque dédiée.
- Connaissance des tests de parcours avec Playwright.'),
    (3, 'Vous prendrez part à la réalisation de fonctionnalités qui relient interface, API et stockage. Le poste demande de comprendre le parcours utilisateur complet et de vérifier la cohérence des échanges entre chaque couche de l’application.', '- Décomposer une demande produit en tâches frontend, backend et base de données.
- Développer les écrans React et les endpoints nécessaires à leur fonctionnement.
- Concevoir les relations SQL et préparer les migrations associées.
- Mettre en place les validations et les contrôles d’accès côté serveur.
- Tester un parcours complet et corriger les écarts entre interface et API.
- Préparer la livraison avec documentation, revue de code et suivi des erreurs.', 'une fonctionnalité complète avec migrations, tests et note de livraison', '- Déploiement d’une application conteneurisée.
- Compréhension des sessions et de l’authentification web.'),
    (4, 'Vous aiderez les équipes métier à distinguer les tendances utiles des variations ponctuelles. Le périmètre comprend la définition des indicateurs, le contrôle de leurs sources et la restitution de résultats dont les limites peuvent être expliquées.', '- Recueillir les questions métier et formaliser les définitions des indicateurs.
- Explorer les sources SQL et vérifier la qualité des données utilisées.
- Préparer les jeux d’analyse en documentant les transformations et les exclusions.
- Construire des tableaux de bord avec filtres, comparaisons et définitions visibles.
- Analyser les écarts et distinguer les observations des hypothèses explicatives.
- Présenter les conclusions avec des recommandations et les limites de l’analyse.', 'un tableau de bord, un dictionnaire d’indicateurs et une note d’analyse reproductible', '- Statistiques descriptives et tests d’hypothèses.
- Pratique de dbt ou d’un outil de versionnement des analyses.'),
    (5, 'Vous participerez à la construction d’une plateforme qui rapproche des exports métier, des flux applicatifs et des mesures d’équipements. L’enjeu est de rendre ces données disponibles, traçables et réutilisables malgré leurs différences de structure et de fréquence.', '- Inventorier les sources, leurs formats, leurs propriétaires et leurs fréquences de mise à jour.
- Développer des traitements d’ingestion avec contrôles de schéma et gestion des rejets.
- Modéliser les tables de stockage en explicitant les clés et les règles de rapprochement.
- Orchestrer les traitements et prévoir leur reprise après un échec.
- Automatiser les vérifications de complétude, de fraîcheur et de cohérence.
- Documenter la traçabilité des transformations et suivre les performances des pipelines.', 'un pipeline orchestré, ses contrôles de qualité et un guide d’exploitation', '- Traitements distribués avec Spark.
- Modélisation de données et compréhension des formats Parquet.'),
    (6, 'Vous travaillerez sur des modèles destinés à améliorer une prévision ou à automatiser une classification métier. Le projet commence par un cadrage du besoin et une solution de référence ; les approches plus complexes sont comparées sur des données séparées de l’entraînement.', '- Traduire le besoin métier en objectif mesurable et en protocole d’évaluation.
- Préparer les données en contrôlant les biais, les valeurs manquantes et les fuites de cible.
- Construire une baseline puis comparer plusieurs méthodes de modélisation.
- Suivre les expériences avec leurs paramètres, leurs données et leurs métriques.
- Préparer une mise à disposition du modèle avec tests et suivi de dérive.
- Expliquer les performances, les limites et les conditions d’utilisation du modèle.', 'un modèle évalué, un rapport d’expérimentation et un prototype d’inférence', '- Traitement du langage naturel et modèles préentraînés.
- Suivi des modèles en production et interprétabilité.'),
    (7, 'Vous contribuerez à la qualification des alertes remontées par les équipements et les applications. Le travail consiste à reconstruire les événements utiles, à limiter les faux positifs et à transmettre une chronologie exploitable à l’équipe de réponse.', '- Examiner les alertes du SIEM et recueillir leur contexte technique.
- Rapprocher les journaux de plusieurs sources pour établir une chronologie.
- Identifier les événements attendus et les indices nécessitant une investigation.
- Documenter les preuves et les actions réalisées dans le dossier d’incident.
- Proposer des ajustements de règles avec validation sur des événements de test.
- Préparer une transmission claire aux équipes chargées de la remédiation.', 'des dossiers d’alerte documentés et une proposition de règle de détection validée', '- Scripting Python pour l’analyse de journaux.
- Connaissance des tactiques et techniques décrites par MITRE ATT&CK.'),
    (8, 'Vous accompagnerez les développeurs dans l’identification et la correction des défauts de sécurité applicative. Les audits seront conduits dans un périmètre autorisé, avec des résultats reproductibles et une attention à la faisabilité des corrections.', '- Préparer le périmètre d’audit et recenser les fonctionnalités exposées.
- Examiner les contrôles d’authentification, d’autorisation et de validation des entrées.
- Reproduire les défauts dans un environnement de test et qualifier leur impact.
- Rédiger les constats avec conditions de reproduction et recommandations.
- Accompagner les corrections avec les développeurs puis réaliser les contre-tests.
- Préparer des ateliers de sensibilisation adaptés aux technologies de l’équipe.', 'un rapport d’audit priorisé et un suivi des corrections vérifiées', '- Lecture de code et analyse de dépendances.
- Intégration de contrôles de sécurité dans la CI.'),
    (9, 'Vous participerez à la sécurisation de plateformes cloud partagées par plusieurs équipes. Les travaux portent sur les identités, les configurations et la visibilité des actions, afin de réduire les permissions inutiles et de repérer les écarts.', '- Inventorier les ressources cloud et les chemins d’accès aux données.
- Analyser les politiques IAM et proposer une réduction des permissions excessives.
- Définir des configurations de référence pour les réseaux et les services exposés.
- Automatiser des contrôles sur les fichiers Terraform et les déploiements.
- Vérifier la collecte des journaux et les alertes sur les changements sensibles.
- Documenter les écarts et préparer un plan de remédiation avec les équipes plateforme.', 'un état des configurations, des contrôles automatisés et un plan de durcissement', '- Sécurité des images de conteneurs.
- Gestion des secrets et des identités de service.'),
    (10, 'Vous contribuerez à un socle de livraison commun qui réduit les opérations manuelles et facilite le diagnostic des déploiements. Les changements devront être reproductibles et accompagnés de vérifications avant et après mise à disposition.', '- Construire des pipelines CI/CD avec étapes de tests et contrôles de livraison.
- Préparer les images Docker et maîtriser leurs dépendances.
- Décrire les environnements avec Terraform et versionner les configurations.
- Automatiser les déploiements et tester les procédures de retour arrière.
- Mettre en place les métriques et les journaux nécessaires au suivi des services.
- Documenter les usages du socle et accompagner les équipes produit.', 'un pipeline de livraison, des configurations versionnées et un guide de déploiement', '- Gestion des déploiements progressifs.
- Optimisation des ressources et suivi des coûts cloud.'),
    (11, 'Vous aiderez l’équipe à comprendre les incidents récurrents et à définir un niveau de service observable. Le poste associe analyse des métriques, automatisation de tâches d’exploitation et préparation des changements qui améliorent la fiabilité.', '- Définir les indicateurs de disponibilité et de latence avec les équipes produit.
- Construire des tableaux de supervision et des alertes actionnables.
- Analyser les incidents en reconstituant leurs causes et leurs effets.
- Automatiser les opérations répétitives et les vérifications de bon fonctionnement.
- Préparer des essais de charge et comparer les résultats aux objectifs.
- Rédiger les retours d’expérience et suivre les actions de fiabilisation.', 'un tableau de fiabilité, un runbook et une automatisation d’exploitation', '- Pratique des systèmes distribués.
- Développement d’outils d’exploitation en Go ou Python.'),
    (12, 'Vous participerez au maintien d’un parc de serveurs et d’équipements réseau utilisé par plusieurs équipes. L’objectif est de fiabiliser les accès, les sauvegardes et les configurations tout en conservant une documentation actualisée.', '- Administrer les comptes et les services selon les procédures d’accès.
- Suivre les mises à jour et préparer les interventions de maintenance.
- Contrôler les sauvegardes et réaliser des essais de restauration.
- Diagnostiquer les incidents réseau à partir des journaux et des mesures.
- Automatiser les configurations répétitives avec des scripts ou Ansible.
- Actualiser l’inventaire et les procédures de reprise des services.', 'un inventaire vérifié, une procédure de restauration testée et des configurations documentées', '- Virtualisation et administration des annuaires.
- Lecture des captures réseau avec Wireshark.'),
    (13, 'Vous aiderez l’équipe à comprendre les difficultés rencontrées dans les parcours prioritaires du service. Les recommandations devront être fondées sur des observations et accompagnées de prototypes permettant de tester les pistes proposées.', '- Préparer les objectifs de recherche avec le produit et les parties prenantes.
- Conduire des entretiens et synthétiser les besoins sans les confondre avec des solutions.
- Cartographier les parcours et repérer les points de friction.
- Prototyper plusieurs pistes avec une hiérarchie d’information explicite.
- Organiser des tests utilisateurs et documenter les observations.
- Restituer les recommandations avec leurs arguments et leurs limites.', 'une synthèse de recherche, une cartographie de parcours et un prototype testé', '- Recherche quantitative et analyse des usages.
- Conception de services accessibles.'),
    (14, 'Vous contribuerez à la cohérence visuelle des écrans et à la qualité des composants utilisés par les développeurs. Le travail porte sur les états d’interface, la hiérarchie visuelle et la transmission de spécifications suffisamment précises pour l’intégration.', '- Décliner les parcours en maquettes avec états de chargement, d’erreur et de succès.
- Créer les composants et variantes dans la bibliothèque Figma.
- Définir les règles de typographie, d’espacement et de contraste.
- Documenter les comportements et les adaptations aux tailles d’écran.
- Échanger avec les développeurs sur la faisabilité et vérifier les écrans intégrés.
- Faire évoluer les composants à partir des retours de test.', 'une bibliothèque de composants et des maquettes annotées prêtes à intégrer', '- Animation d’interface et prototypage avancé.
- Gestion des design tokens avec les développeurs.'),
    (15, 'Vous accompagnerez un sujet produit depuis sa compréhension jusqu’à la vérification de son usage. Le poste demande de rapprocher les retours utilisateurs, les contraintes de réalisation et les objectifs de l’équipe pour concevoir une solution cohérente.', '- Cadrer le problème avec le produit à partir des retours et des données disponibles.
- Explorer plusieurs solutions avec des croquis et des prototypes.
- Préparer des tests pour comparer la compréhension des parcours.
- Concevoir les interfaces en utilisant le design system partagé.
- Accompagner la réalisation et vérifier les écarts de comportement.
- Suivre l’usage après livraison et proposer une itération argumentée.', 'un dossier de conception avec prototype, résultats de test et suivi d’usage', '- Analyse des événements produit.
- Notions d’intégration HTML et CSS.'),
    (16, 'Vous faciliterez la traduction des besoins métier en fonctionnalités compréhensibles par l’équipe de réalisation. Le backlog doit rendre visibles les objectifs, les dépendances et les conditions permettant d’accepter un livrable.', '- Recueillir les demandes et reformuler le problème à résoudre.
- Rédiger les user stories avec exemples et critères d’acceptation.
- Prioriser les éléments du backlog selon leur valeur et leurs dépendances.
- Préparer les échanges de clarification avec les développeurs et le design.
- Vérifier les livrables et organiser les démonstrations avec les utilisateurs.
- Suivre les retours après livraison et actualiser les prochaines priorités.', 'un backlog priorisé, des critères d’acceptation et un bilan de livraison', '- Lecture de données SQL pour analyser les usages.
- Expérience de facilitation d’ateliers.'),
    (17, 'Vous coordonnerez un projet numérique impliquant une équipe interne et des partenaires. Les travaux visent à rendre les échéances réalistes, à anticiper les dépendances et à conserver une trace claire des arbitrages et des risques.', '- Établir le périmètre, les livrables et les responsabilités du projet.
- Construire un calendrier en identifiant les dépendances et les validations.
- Suivre les charges, les dépenses et les écarts au plan initial.
- Animer les points d’avancement avec un suivi des décisions et des actions.
- Préparer les recettes et coordonner les corrections avant livraison.
- Rédiger le bilan du projet et les recommandations pour la suite.', 'un plan de projet, un suivi des risques et un dossier de recette', '- Coordination de prestataires techniques.
- Gestion d’un budget et préparation d’un comité de pilotage.'),
    (18, 'Vous contribuerez à la définition des problèmes prioritaires à traiter par le produit. La feuille de route devra expliquer les objectifs recherchés et les moyens de vérifier la valeur des fonctionnalités réalisées.', '- Conduire des entretiens clients et rapprocher leurs besoins des usages observés.
- Analyser les opportunités avec les équipes commerce et réalisation.
- Définir les objectifs produit et les indicateurs de résultat.
- Préparer une feuille de route en explicitant les choix et les hypothèses.
- Coordonner la découverte et la réalisation des sujets prioritaires.
- Comparer les résultats après lancement et réviser les hypothèses initiales.', 'une note d’opportunité, une feuille de route et un suivi des résultats produit', '- Analyse de cohortes et mesure de rétention.
- Recherche marché et cadrage d’expérimentations.'),
    (19, 'Vous participerez à la préparation de campagnes qui rapprochent une audience identifiée d’une proposition claire. Le suivi devra relier les contenus, les dépenses et les conversions, en tenant compte de la qualité des contacts générés.', '- Définir les audiences et les objectifs avec le responsable marketing.
- Préparer les messages et les pages de destination avec l’équipe contenu.
- Configurer les campagnes et vérifier les liens et événements de suivi.
- Contrôler les dépenses et repérer les écarts de performance.
- Comparer les variantes de messages avec des critères définis en amont.
- Rédiger un bilan et proposer les ajustements de la campagne suivante.', 'un plan de campagne, un tableau de suivi et un bilan d’acquisition', '- Automatisation des campagnes dans un CRM.
- Rédaction de pages de destination.'),
    (20, 'Vous travaillerez sur la visibilité organique des contenus et la compréhension du site par les moteurs de recherche. Les recommandations devront distinguer les problèmes techniques, les besoins éditoriaux et les possibilités d’amélioration des parcours.', '- Réaliser un audit de crawl et identifier les pages difficiles à explorer.
- Étudier les recherches des utilisateurs et organiser les intentions de requête.
- Préparer les recommandations de structure, de balisage et de maillage interne.
- Rédiger les briefs éditoriaux avec objectifs et critères de qualité.
- Suivre les impressions, les clics et les conversions du trafic organique.
- Vérifier les corrections techniques et documenter les résultats observés.', 'un audit SEO priorisé, des briefs et un tableau de suivi organique', '- Données structurées et analyse des logs.
- Notions de performance web.'),
    (21, 'Vous aiderez l’équipe à améliorer une étape du parcours d’acquisition ou d’activation. Chaque expérimentation devra partir d’une hypothèse explicite, disposer d’un suivi fiable et produire une décision compréhensible.', '- Analyser les étapes du parcours et identifier les abandons importants.
- Formuler les hypothèses et définir les indicateurs avant chaque test.
- Préparer les variantes avec le design, le contenu et les développeurs.
- Vérifier le suivi analytique et la répartition des audiences.
- Interpréter les résultats en tenant compte des volumes et des limites.
- Documenter les apprentissages et préparer l’expérimentation suivante.', 'un dossier d’expérimentation avec hypothèse, suivi et décision argumentée', '- Statistiques des tests A/B.
- Automatisation marketing et segmentation CRM.'),
    (22, 'Vous contribuerez à rendre les actions de l’entreprise compréhensibles auprès de ses publics. Le poste associe préparation des contenus, coordination des contributeurs et suivi des publications ou événements.', '- Recueillir les informations auprès des équipes et vérifier leurs sources.
- Préparer les messages selon les publics et les canaux de diffusion.
- Rédiger les supports et organiser leur circuit de relecture.
- Coordonner les prestataires et suivre les échéances de production.
- Préparer la communication des événements et les supports associés.
- Produire un bilan des actions avec retours et pistes d’amélioration.', 'un calendrier de communication, des supports validés et un bilan de diffusion', '- Organisation d’événements.
- Création de visuels avec la suite Adobe.'),
    (23, 'Vous participerez à l’organisation d’une production éditoriale cohérente et utile aux lecteurs. Les sujets seront priorisés selon les questions des publics et suivis depuis le brief jusqu’à la mesure de leur réception.', '- Définir les sujets avec les experts internes et les équipes marketing.
- Préparer les briefs avec cible, angle, sources et format attendu.
- Coordonner les rédacteurs et suivre les validations avant publication.
- Relire les contenus pour vérifier leur clarté et leur cohérence.
- Publier dans le CMS avec liens, visuels et métadonnées vérifiés.
- Analyser les résultats et préparer la mise à jour des contenus existants.', 'un plan éditorial, des contenus publiés et un bilan de performance', '- Gestion d’un CMS et d’une bibliothèque de médias.
- Pratique de l’écriture web et du SEO.'),
    (24, 'Vous animerez les échanges avec les communautés en veillant à la qualité des réponses et à la cohérence des messages. Les retours reçus devront aider les équipes à comprendre les attentes et les sujets sensibles.', '- Construire le calendrier social avec contenus et objectifs de publication.
- Préparer les visuels et adapter les messages aux plateformes.
- Répondre aux demandes avec les éléments validés par les équipes compétentes.
- Modérer les échanges selon une charte et transmettre les situations sensibles.
- Suivre les interactions et distinguer les retours récurrents des événements isolés.
- Rédiger un bilan de communauté et proposer de nouveaux formats.', 'un calendrier social, une synthèse de veille et un bilan d’engagement', '- Veille de marque et suivi des mentions.
- Création de formats vidéo courts.'),
    (25, 'Vous contribuerez à ouvrir de nouvelles relations commerciales auprès d’organisations dont les besoins correspondent à nos services. Le travail commence par une qualification rigoureuse et se poursuit par une proposition construite avec l’équipe.', '- Identifier les segments de prospects et vérifier leur adéquation avec l’offre.
- Préparer les prises de contact avec un message adapté au contexte.
- Conduire les échanges de découverte et documenter les besoins.
- Qualifier les opportunités avec critères, interlocuteurs et prochaines étapes.
- Construire les propositions avec les équipes capables de tenir les engagements.
- Actualiser le CRM et analyser les motifs de progression ou de perte.', 'un portefeuille d’opportunités qualifiées et des propositions documentées', '- Vente de services B2B.
- Préparation de démonstrations et de rendez-vous commerciaux.'),
    (26, 'Vous suivrez un portefeuille de clients avec des engagements, des échéances et des attentes différents. L’objectif est de conserver une relation transparente, d’anticiper les besoins et de coordonner les réponses internes.', '- Préparer les plans de compte avec interlocuteurs, besoins et échéances.
- Organiser les points clients et consigner les décisions prises.
- Suivre les engagements de service avec les équipes opérationnelles.
- Préparer les renouvellements en vérifiant les usages et les conditions.
- Identifier les besoins complémentaires et qualifier leur pertinence.
- Produire un état du portefeuille avec risques et prochaines actions.', 'des plans de compte actualisés et un suivi des renouvellements', '- Négociation de renouvellements.
- Construction de prévisions commerciales.'),
    (27, 'Vous accompagnerez les clients dans l’adoption du service après leur démarrage. Le suivi cherchera à repérer les difficultés, à faciliter la prise en main et à mesurer les progrès vers les objectifs convenus.', '- Préparer l’intégration des nouveaux clients avec un plan de prise en main.
- Animer les sessions de découverte et vérifier la compréhension du service.
- Suivre les indicateurs d’usage et repérer les signaux de difficulté.
- Coordonner les demandes de support et tenir le client informé.
- Préparer les points de suivi avec bilan, besoins et prochaines étapes.
- Transmettre les retours au produit avec leur contexte et leur fréquence.', 'un parcours d’intégration, un suivi d’adoption et une synthèse de retours client', '- Formation des utilisateurs d’un SaaS.
- Analyse des usages et segmentation des comptes.'),
    (28, 'Vous participerez à des recrutements avec des critères de sélection partagés et des étapes compréhensibles pour les candidats. Le suivi devra permettre des décisions argumentées et des retours réguliers tout au long du parcours.', '- Clarifier les besoins et les critères du poste avec le manager.
- Rédiger les annonces et vérifier la cohérence des informations diffusées.
- Rechercher les profils et documenter leur adéquation avec les critères.
- Organiser les entretiens et préparer les grilles d’évaluation.
- Partager les synthèses avec les managers et suivre les décisions.
- Informer les candidats et préparer les éléments nécessaires à leur intégration.', 'des dossiers candidats suivis et un bilan de recrutement', '- Sourcing sur plusieurs canaux.
- Conduite d’entretiens structurés.'),
    (29, 'Vous contribuerez à la fiabilité des dossiers RH et à la qualité des réponses apportées aux collaborateurs. Le poste demande de suivre des échéances variées et de traiter les informations personnelles selon les procédures internes.', '- Préparer les dossiers d’entrée et vérifier les pièces nécessaires.
- Mettre à jour les informations dans le SIRH avec contrôles de cohérence.
- Suivre les absences et transmettre les éléments aux interlocuteurs concernés.
- Répondre aux demandes courantes à partir des procédures validées.
- Préparer les tableaux de suivi et signaler les anomalies.
- Classer les documents avec les règles d’accès et de conservation prévues.', 'des dossiers actualisés, un suivi des échéances et des procédures clarifiées', '- Pratique d’un SIRH.
- Préparation des variables pour les équipes paie.'),
    (30, 'Vous aiderez l’organisation à relier ses besoins en compétences à des actions de formation évaluables. Les parcours devront être adaptés aux équipes, organisés avec les prestataires et suivis au-delà de la participation aux sessions.', '- Recueillir les besoins et les relier aux situations de travail visées.
- Construire le plan de formation avec priorités et objectifs pédagogiques.
- Comparer les propositions de prestataires avec critères documentés.
- Organiser les sessions et coordonner les inscriptions avec les managers.
- Préparer les évaluations de satisfaction et de progression.
- Présenter un bilan et proposer les ajustements des prochains parcours.', 'un plan de formation, un suivi des sessions et un bilan d’évaluation', '- Conception de parcours mixtes présentiel et distance.
- Pilotage d’un budget de formation.'),
    (31, 'Vous participerez à la production d’une comptabilité suivie et justifiable. Les opérations devront être rapprochées de leurs pièces et préparées dans les délais de clôture avec des contrôles explicites.', '- Contrôler les pièces et préparer les écritures selon les procédures du cabinet.
- Rapprocher les opérations bancaires et rechercher les écarts.
- Suivre les comptes fournisseurs et clients avec les interlocuteurs concernés.
- Préparer les travaux de clôture et les justificatifs des soldes.
- Documenter les anomalies et les corrections validées.
- Améliorer les fichiers de suivi et les contrôles répétitifs.', 'des comptes justifiés, des rapprochements et un dossier de clôture préparé', '- Pratique d’un ERP comptable.
- Automatisation de contrôles dans Excel.'),
    (32, 'Vous contribuerez au pilotage des activités en rapprochant budgets, réalisations et prévisions. Les analyses devront expliquer les variations et faciliter les échanges avec les responsables opérationnels.', '- Recueillir les données budgétaires et vérifier leur périmètre.
- Construire les tableaux de suivi avec indicateurs et définitions partagés.
- Analyser les écarts entre réalisé, budget et période précédente.
- Échanger avec les responsables pour documenter les causes des variations.
- Préparer les prévisions avec hypothèses et scénarios explicités.
- Présenter les conclusions et suivre les actions décidées.', 'un tableau de pilotage, une analyse des écarts et une prévision documentée', '- Modélisation dans Power BI.
- Extraction de données financières avec SQL.'),
    (33, 'Vous participerez à l’évaluation de situations financières et de scénarios de décision. Le travail cherchera à rendre les hypothèses visibles, à tester leur sensibilité et à produire des synthèses compréhensibles.', '- Rassembler les informations financières et vérifier leur comparabilité.
- Analyser les résultats et les flux de trésorerie.
- Construire les scénarios avec hypothèses et sources identifiées.
- Tester la sensibilité des résultats aux variables importantes.
- Préparer les supports de décision avec risques et limites de l’analyse.
- Actualiser les modèles à partir des nouvelles informations disponibles.', 'un modèle financier, une analyse de sensibilité et une note de décision', '- Analyse de trésorerie et de rentabilité.
- Présentation de scénarios à des responsables métier.'),
    (34, 'Vous aiderez les équipes à préparer et à suivre les engagements contractuels de leurs activités. Les dossiers devront conserver les versions, les validations et les échéances nécessaires à une gestion claire des relations avec les partenaires.', '- Recueillir le besoin et réunir les documents nécessaires au dossier.
- Relire les projets de contrat et repérer les clauses à clarifier.
- Préparer les échanges avec les équipes métier et les partenaires.
- Rédiger les propositions sous validation du référent juridique.
- Suivre les versions, les signatures et les échéances de renouvellement.
- Mettre à jour les modèles et les fiches pratiques à partir des dossiers traités.', 'des dossiers contractuels suivis et une synthèse des points à valider', '- Gestion d’une base contractuelle.
- Expérience des contrats de prestations ou de services numériques.'),
    (35, 'Vous participerez à la mise en œuvre de contrôles qui rendent les procédures de l’organisation vérifiables. Les recommandations devront tenir compte des pratiques réelles et prévoir des actions suivies par les équipes concernées.', '- Cartographier les activités et réunir les procédures existantes.
- Identifier les points de contrôle avec les responsables opérationnels.
- Préparer les vérifications et conserver les éléments justificatifs.
- Analyser les écarts et distinguer les causes de procédure ou d’exécution.
- Formaliser les plans d’action avec responsables et échéances.
- Suivre les corrections et préparer les synthèses de conformité.', 'une cartographie de contrôles et un suivi documenté des actions correctives', '- Audit interne et gestion des risques.
- Conception de supports de sensibilisation.'),
    (36, 'Vous contribuerez à la compréhension des traitements de données personnelles et au suivi de leurs mesures de protection. Les travaux seront préparés avec les équipes métier et examinés par le référent chargé de la protection des données.', '- Recenser les traitements avec finalités, catégories de données et interlocuteurs.
- Décrire les flux et les accès avec les équipes techniques.
- Mettre à jour les registres à partir des informations vérifiées.
- Préparer les analyses et les points nécessitant une validation du référent.
- Suivre les demandes et les actions selon les procédures du service.
- Concevoir des supports de sensibilisation adaptés aux activités des équipes.', 'des fiches de traitement actualisées et un suivi des mesures de protection', '- Cartographie des flux applicatifs.
- Gestion documentaire et suivi des demandes de personnes concernées.'),
    (37, 'Vous aiderez les utilisateurs à retrouver un poste de travail fonctionnel et à comprendre les solutions appliquées. Les interventions devront être suivies dans le ticketing et réalisées selon les procédures de configuration du parc.', '- Qualifier les demandes avec symptômes, contexte et impact sur l’activité.
- Diagnostiquer les problèmes de poste, de périphérique et de connexion.
- Préparer les équipements avec logiciels et paramètres validés.
- Résoudre les incidents courants et vérifier le résultat avec l’utilisateur.
- Transmettre les cas complexes avec les vérifications déjà réalisées.
- Mettre à jour l’inventaire et les fiches de résolution de la base de connaissances.', 'des tickets documentés, des postes préparés et des fiches de résolution', '- Gestion d’un parc avec GLPI.
- Administration courante de Microsoft 365.'),
    (38, 'Vous constituerez le premier point de contact pour les demandes informatiques courantes. La mission consiste à guider les utilisateurs, à qualifier les incidents et à faciliter leur prise en charge par le bon interlocuteur.', '- Accueillir les demandes et préciser les informations manquantes.
- Attribuer une priorité selon l’impact et les procédures du service.
- Guider l’utilisateur dans les vérifications simples.
- Appliquer les solutions connues et confirmer leur efficacité.
- Escalader les incidents avec un résumé clair et les éléments collectés.
- Suivre les retours et améliorer les réponses de la base de connaissances.', 'des demandes qualifiées et des procédures de premier niveau améliorées', '- Support à distance.
- Préparation de tutoriels à destination des utilisateurs.'),
    (39, 'Vous contribuerez à l’organisation d’un support capable de traiter les demandes avec des priorités explicites. Le poste associe suivi des délais, amélioration des pratiques et accompagnement des personnes qui répondent aux utilisateurs.', '- Organiser la répartition des tickets selon leurs impacts et leurs compétences requises.
- Suivre les délais et repérer les files de demandes en difficulté.
- Analyser les incidents récurrents avec les équipes techniques.
- Améliorer les procédures de qualification et d’escalade.
- Accompagner les conseillers et organiser le partage des connaissances.
- Présenter les indicateurs de service et les actions d’amélioration.', 'un tableau de pilotage du support et un plan d’amélioration des procédures', '- Coordination d’une équipe de support.
- Mise en place d’une base de connaissances partagée.'),
    (40, 'Vous participerez à l’amélioration des méthodes de fabrication d’un périmètre atelier. Les propositions seront fondées sur des observations, des temps mesurés et des essais discutés avec les opérateurs.', '- Observer les opérations et décrire les étapes du procédé.
- Mesurer les temps et repérer les contraintes de flux.
- Analyser les défauts avec les équipes production et qualité.
- Préparer des essais de modification et définir leurs critères de réussite.
- Rédiger les modes opératoires avec les personnes qui les utilisent.
- Comparer les résultats et suivre les actions d’amélioration retenues.', 'un diagnostic de procédé, un mode opératoire et un bilan d’essai', '- Outils Lean et cartographie des flux.
- Lecture de plans et pratique de la CAO.'),
    (41, 'Vous contribuerez à la disponibilité des équipements par des interventions préparées et un suivi de leurs défaillances. Les travaux sur machine seront réalisés dans le cadre des procédures du site et des habilitations requises.', '- Préparer les interventions préventives à partir du plan de maintenance.
- Examiner les symptômes et rechercher les causes des pannes.
- Réaliser les opérations autorisées avec les procédures de mise en sécurité.
- Vérifier le fonctionnement après intervention avec les équipes du site.
- Enregistrer les actions et les pièces utilisées dans la GMAO.
- Proposer des ajustements du plan préventif à partir des pannes observées.', 'des interventions tracées et une proposition d’amélioration du plan préventif', '- Diagnostic d’automatismes.
- Lecture de schémas électriques et mécaniques.'),
    (42, 'Vous aiderez les équipes à comprendre les non-conformités et à éviter leur répétition. Les travaux associeront vérification des données, recherche des causes et contrôle de l’efficacité des actions mises en place.', '- Recueillir les non-conformités et vérifier les conditions d’apparition.
- Analyser les causes avec une méthode adaptée au problème.
- Préparer les plans d’action avec responsables et critères de vérification.
- Suivre les essais et confirmer la réduction du défaut.
- Actualiser les procédures et les points de contrôle.
- Préparer les éléments des audits internes et partager les retours d’expérience.', 'un dossier de résolution de problème et un suivi des actions qualité', '- Pratique de l’AMDEC et de la méthode 8D.
- Analyse statistique de données de production.'),
    (43, 'Vous participerez à des études qui rapprochent observations de terrain, mesures et informations cartographiques. Les résultats devront expliciter le périmètre étudié, les sources et les limites des données disponibles.', '- Préparer le plan de collecte avec les informations nécessaires à l’étude.
- Organiser les relevés et vérifier leur localisation et leur cohérence.
- Structurer les données et documenter leurs sources.
- Produire les cartes et les analyses utiles aux questions du projet.
- Comparer les scénarios en décrivant les hypothèses retenues.
- Rédiger le rapport et présenter les points à approfondir.', 'un jeu de données contrôlé, des cartes et un rapport d’étude', '- Traitement de données géographiques avec QGIS.
- Analyse de séries de mesures environnementales.'),
    (44, 'Vous contribuerez à l’analyse des consommations et à la préparation de scénarios d’amélioration. Les recommandations devront être confrontées aux usages réels et aux contraintes d’exploitation des équipements.', '- Recueillir les consommations et les caractéristiques des installations.
- Contrôler les mesures et repérer les périodes ou usages atypiques.
- Construire un état de référence avec hypothèses documentées.
- Simuler les actions d’amélioration et comparer leurs effets attendus.
- Préparer un plan de suivi des performances après intervention.
- Présenter les résultats et discuter les contraintes avec les exploitants.', 'un diagnostic énergétique, des scénarios comparés et un plan de mesure', '- Automatisation des analyses avec Python.
- Simulation thermique et instrumentation.'),
    (45, 'Vous participerez à la coordination d’un projet solaire depuis les études jusqu’à la préparation de sa mise en service. Le suivi devra rendre visibles les dépendances techniques, les validations et les ressources nécessaires.', '- Recueillir les besoins et les informations techniques du site.
- Coordonner les études et suivre les points nécessitant une validation.
- Préparer le calendrier avec les partenaires et les responsables de chantier.
- Suivre le budget et documenter les changements de périmètre.
- Organiser les contrôles et les éléments nécessaires à la réception.
- Préparer le transfert des documents vers les équipes d’exploitation.', 'un dossier projet, un suivi des validations et un plan de mise en service', '- Lecture de plans électriques.
- Suivi de projets d’installation et coordination de prestataires.'),
    (46, 'Vous contribuerez à la fiabilité des flux entre réception, stockage et livraison. L’objectif est de disposer d’informations actualisées sur les commandes et de traiter rapidement les écarts qui affectent l’exploitation.', '- Planifier les expéditions selon les besoins et les capacités disponibles.
- Vérifier les informations de stock et les documents de livraison.
- Suivre les transporteurs et confirmer les étapes importantes.
- Traiter les écarts de quantité ou de délai avec les interlocuteurs concernés.
- Actualiser les données dans le WMS ou l’ERP.
- Analyser les incidents récurrents et proposer une amélioration du flux.', 'un planning logistique actualisé et une analyse des écarts de livraison', '- Pratique d’un WMS.
- Construction de tableaux de suivi opérationnels.'),
    (47, 'Vous participerez à l’anticipation des besoins et au suivi des commandes fournisseurs. Les décisions devront rapprocher les prévisions, les stocks disponibles et les délais réellement observés.', '- Analyser les besoins et vérifier les niveaux de stock.
- Préparer les commandes selon les règles d’approvisionnement.
- Confirmer les délais avec les fournisseurs et documenter les engagements.
- Repérer les risques de rupture et discuter les solutions possibles.
- Mettre à jour les données de suivi dans l’ERP.
- Comparer les prévisions aux réalisations et ajuster les paramètres proposés.', 'un suivi d’approvisionnement et un plan d’action sur les risques de rupture', '- Analyse des prévisions et des rotations de stock.
- Gestion des paramètres d’approvisionnement dans un ERP.'),
    (48, 'Vous aiderez les équipes à sélectionner des prestations et des produits adaptés à leurs besoins. Les comparaisons devront tenir compte du coût, des délais, de la qualité et des conditions de suivi du fournisseur.', '- Clarifier le besoin avec les utilisateurs et préparer les critères de comparaison.
- Consulter les fournisseurs avec un dossier cohérent.
- Analyser les offres et vérifier les points techniques ou commerciaux.
- Préparer les négociations sous validation du responsable achats.
- Suivre les commandes et les écarts de prestation.
- Mettre à jour les évaluations fournisseurs et documenter les décisions.', 'un dossier de consultation, une comparaison d’offres et un suivi fournisseur', '- Analyse du coût complet.
- Conduite de consultations et négociation opérationnelle.'),
    (49, 'Vous contribuerez au suivi de chantiers dont les interventions doivent être coordonnées avec précision. Le poste demande de rapprocher l’avancement réel, le planning et les documents techniques pour préparer les décisions.', '- Préparer le planning avec les entreprises et les dépendances de travaux.
- Suivre l’avancement sur le terrain et documenter les écarts.
- Vérifier les points de contrôle avec les référents techniques.
- Coordonner les interventions et les informations nécessaires aux équipes.
- Préparer les réunions de chantier avec décisions et actions attendues.
- Suivre les réserves et les documents de réception.', 'un suivi de chantier, des comptes rendus et un état des réserves', '- Lecture de plans techniques.
- Suivi budgétaire et coordination de sous-traitants.'),
    (50, 'Vous participerez à la production de maquettes et de plans partagés entre plusieurs disciplines. Les livrables devront conserver des conventions claires et permettre la vérification des interfaces techniques.', '- Recueillir les données d’entrée et vérifier les conventions du projet.
- Produire les modèles et les plans selon le niveau de détail attendu.
- Contrôler les dimensions et les informations associées aux objets.
- Repérer les conflits entre disciplines et préparer les points à arbitrer.
- Actualiser les versions après validation des modifications.
- Préparer les exports et documenter les livrables transmis.', 'une maquette BIM contrôlée, des plans et un suivi des modifications', '- Détection des conflits dans une maquette fédérée.
- Gestion des conventions BIM et des exports IFC.'),
    (51, 'Vous contribuerez au suivi d’un portefeuille de locaux et des demandes de leurs occupants. Les dossiers devront permettre de comprendre les engagements, les interventions prévues et les actions restant à effectuer.', '- Mettre à jour les dossiers locatifs et les informations de contact.
- Qualifier les demandes des occupants et préciser leur urgence.
- Coordonner les interventions avec les prestataires.
- Suivre les échéances et les documents nécessaires aux dossiers.
- Préparer les comptes rendus et informer les personnes concernées.
- Analyser les demandes récurrentes pour améliorer l’organisation du service.', 'des dossiers suivis et un tableau des interventions et échéances', '- Pratique d’un logiciel de gestion immobilière.
- Coordination de prestations de maintenance des bâtiments.'),
    (52, 'Vous aiderez les personnes suivies à comprendre et à coordonner les étapes de leur parcours. La mission porte sur l’organisation et la transmission des informations utiles, dans le respect du rôle des professionnels de santé.', '- Recueillir les besoins d’organisation avec la personne et les interlocuteurs autorisés.
- Planifier les rendez-vous en vérifiant les contraintes et les disponibilités.
- Suivre les étapes et repérer les situations de rupture de coordination.
- Transmettre les informations utiles selon les procédures de confidentialité.
- Préparer les points de suivi avec les professionnels partenaires.
- Documenter les actions et les prochaines étapes du parcours.', 'un suivi de parcours actualisé et des comptes rendus de coordination', '- Expérience d’organisation de rendez-vous ou de parcours.
- Pratique d’outils de suivi de dossiers sensibles.'),
    (53, 'Vous contribuerez à un projet numérique conçu avec des professionnels de santé et des utilisateurs. Les travaux devront rapprocher les besoins observés, les contraintes de confidentialité et les conditions réelles de prise en main.', '- Organiser les ateliers de recueil des besoins et documenter les usages.
- Préparer le périmètre du pilote avec critères d’évaluation.
- Coordonner les échanges entre équipes métier et réalisation.
- Suivre les tests et qualifier les retours des utilisateurs.
- Préparer les supports de prise en main et les sessions d’accompagnement.
- Rédiger le bilan du pilote avec résultats, limites et prochaines actions.', 'un dossier de pilote, des supports de formation et un bilan d’usage', '- Connaissance des usages numériques en santé.
- Animation d’ateliers avec des professionnels de terrain.'),
    (54, 'Vous participerez à un accompagnement qui aide les bénéficiaires à clarifier leurs besoins et à avancer dans leurs démarches. Le suivi doit rester compréhensible, respectueux de leurs choix et coordonné avec les interlocuteurs compétents.', '- Accueillir les demandes et reformuler les besoins exprimés.
- Présenter les ressources et les démarches adaptées au périmètre du service.
- Préparer les prochaines étapes avec la personne accompagnée.
- Organiser les rendez-vous et les orientations vers les partenaires.
- Suivre les actions en respectant les règles de confidentialité.
- Rédiger les comptes rendus et signaler les blocages au référent.', 'un plan d’accompagnement et un suivi des orientations réalisées', '- Médiation et accueil de publics variés.
- Coordination avec un réseau de partenaires.'),
    (55, 'Vous contribuerez à transformer des objectifs de compétences en activités progressives et évaluables. Les parcours devront associer contenus, exercices et retours, avec une attention aux besoins des apprenants.', '- Analyser les objectifs avec les experts et définir les compétences visées.
- Construire une progression avec activités et critères d’évaluation.
- Créer les supports numériques et les exercices interactifs.
- Intégrer les ressources dans le LMS et vérifier leur fonctionnement.
- Organiser une session pilote et recueillir les retours.
- Réviser les contenus et documenter les choix pédagogiques.', 'un parcours pédagogique, ses évaluations et un bilan de session pilote', '- Création de contenus H5P.
- Conception de parcours accessibles à distance.'),
    (56, 'Vous animerez des ateliers qui permettent aux apprenants de pratiquer les outils numériques dans des situations concrètes. Les séances devront tenir compte des niveaux de départ et rendre visibles les progrès réalisés.', '- Évaluer les besoins et préparer les objectifs de la séance.
- Construire des exercices gradués avec consignes et exemples.
- Animer les ateliers et adapter le rythme aux difficultés observées.
- Accompagner la résolution des exercices sans faire à la place des apprenants.
- Vérifier les acquis avec une activité de mise en pratique.
- Partager un bilan et proposer les ressources utiles pour poursuivre.', 'des supports d’atelier, des exercices et un bilan des acquis observés', '- Animation à distance.
- Adaptation des supports à des publics débutants.'),
    (57, 'Vous contribuerez à l’organisation fiable des programmes de formation et à la circulation des informations entre intervenants et apprenants. Le suivi devra anticiper les besoins matériels et les changements de calendrier.', '- Planifier les sessions avec les intervenants et les ressources disponibles.
- Vérifier les inscriptions et les informations nécessaires aux participants.
- Préparer les convocations et les accès aux outils pédagogiques.
- Suivre les présences et traiter les changements d’organisation.
- Recueillir les retours de session et les transmettre aux responsables.
- Actualiser les tableaux de suivi et préparer le bilan du programme.', 'un planning de formation, un suivi des inscriptions et un bilan d’organisation', '- Administration d’un LMS.
- Coordination de plusieurs groupes et intervenants.'),
    (58, 'Vous participerez au développement de mécaniques de jeu avec un objectif de comportement stable et de réglage facile par les designers. Les changements seront évalués dans des scènes de test avant leur intégration au projet.', '- Traduire une règle de gameplay en composants et interactions dans le moteur.
- Implémenter les contrôles, les états et les événements nécessaires.
- Créer des paramètres de réglage accessibles aux designers.
- Déboguer les comportements avec des scénarios de reproduction.
- Mesurer le coût des fonctionnalités et corriger les points de performance.
- Documenter les composants et intégrer les retours des sessions de test.', 'une mécanique jouable, une scène de test et une documentation de réglage', '- Architecture des composants et programmation C#.
- Profiling dans Unity ou Unreal Engine.'),
    (59, 'Vous contribuerez à la création d’assets visuels adaptés au style du projet et à ses contraintes de performance. Les modèles devront être organisés, intégrables et cohérents avec les conventions de l’équipe.', '- Préparer les références et clarifier les contraintes artistiques du livrable.
- Modéliser les objets avec une topologie adaptée à leur usage.
- Créer les UV et les textures selon les conventions du projet.
- Préparer les niveaux de détail et vérifier les budgets de rendu.
- Intégrer les assets dans le moteur et contrôler leur apparence.
- Classer les fichiers sources et appliquer les retours de revue artistique.', 'un ensemble d’assets intégrés avec sources organisées et contrôles de performance', '- Texturing avec Substance Painter.
- Optimisation d’assets pour le temps réel.'),
    (60, 'Vous participerez à la conception de règles et de niveaux qui rendent l’expérience de jeu compréhensible et intéressante. Les décisions seront vérifiées avec des prototypes et des observations de sessions de test.', '- Formaliser les mécaniques avec objectifs, règles et conditions de réussite.
- Créer des prototypes pour comparer plusieurs pistes de conception.
- Préparer les niveaux et les paramètres d’équilibrage.
- Organiser les tests de jeu avec des questions d’observation explicites.
- Analyser les difficultés et proposer des ajustements argumentés.
- Actualiser la documentation de design avec les décisions retenues.', 'un prototype jouable, un document de règles et un bilan de playtest', '- Level design et équilibrage.
- Analyse des événements et des parcours de joueurs.');

CREATE TEMP TABLE seed_ad_map ON COMMIT DROP AS
SELECT j.job_no, v.variant_no, c.id AS company_id, cat.id AS category_id,
       j.title || CASE v.variant_no
           WHEN 1 THEN ' — Junior (F/H)'
           WHEN 2 THEN ' — Confirmé (F/H)'
           WHEN 3 THEN ' — Senior (F/H)'
           WHEN 4 THEN CASE WHEN j.job_no % 2 = 0
                      THEN ' — Alternance (F/H)' ELSE ' — Stage (F/H)' END
       END AS title,
       j.category_name, j.missions, j.profile, j.tools, c.name AS company_name,
       c.description AS company_description,
       sector.sector_context, sector.sector_challenges, sector.team_description,
       sector.education, sector.learning,
       detail.role_context, detail.detailed_missions, detail.deliverables, detail.optional_skills,
       CASE WHEN j.job_no % 8 = 0 AND v.variant_no < 4 THEN NULL
            WHEN v.variant_no = 4 THEN CASE WHEN j.job_no % 2 = 0 THEN 1800 ELSE 1200 END
            ELSE j.base_salary + (v.variant_no - 1) * 10000 END AS salary_min,
       CASE WHEN j.job_no % 8 = 0 AND v.variant_no < 4 THEN NULL
            WHEN v.variant_no = 4 THEN CASE WHEN j.job_no % 2 = 0 THEN 2100 ELSE 1500 END
            ELSE j.base_salary + (v.variant_no - 1) * 10000
                 + 6000 + (v.variant_no - 1) * 2000 END AS salary_max,
       CASE WHEN v.variant_no = 4 THEN 'month' ELSE 'year' END AS salary_period,
       CASE WHEN v.variant_no = 4 THEN
                CASE WHEN j.job_no % 2 = 0 THEN 'apprenticeship' ELSE 'internship' END
            WHEN v.variant_no = 1 AND j.job_no % 5 = 0 THEN 'fixed_term'
            ELSE 'permanent' END AS contract_type,
       CASE WHEN v.variant_no = 1 AND j.job_no % 7 = 0 THEN 'part_time'
            ELSE 'full_time' END AS working_time,
       CASE WHEN (v.variant_no = 4 AND j.job_no % 4 = 0)
                  OR (v.variant_no = 2 AND j.job_no % 4 = 1)
                  OR (v.variant_no = 3 AND j.job_no % 4 = 0) THEN 'closed'
            ELSE 'published' END AS status,
       CASE WHEN j.job_no % 10 = 0 THEN 'Télétravail — France'
            ELSE c.location END AS location,
       CASE WHEN j.job_no % 10 = 0 THEN 'Télétravail depuis la France ; rencontre d’équipe une fois par trimestre.'
            WHEN j.job_no % 3 = 0 THEN 'Poste sur site avec déplacements locaux ponctuels.'
            ELSE 'Organisation hybride : deux jours de télétravail par semaine après intégration.' END AS work_mode,
       CURRENT_TIMESTAMP - (14 + ((j.job_no * 7 + v.variant_no * 13) % 100)) * INTERVAL '1 day' AS created_at
FROM seed_jobs j
JOIN seed_category_details sector ON sector.category_name = j.category_name
JOIN seed_job_details detail ON detail.job_no = j.job_no
CROSS JOIN generate_series(1, 4) AS v(variant_no)
JOIN seed_category_companies employers ON employers.category_name = j.category_name
JOIN seed_company_map c ON c.name = employers.company_names[1 + ((j.job_no + v.variant_no - 2) % 4)]
JOIN categories cat ON cat.name = j.category_name;

INSERT INTO ads (company_id, category_id, title, short_description, description,
                 location, salary_min, salary_max, salary_period,
                 contract_type, working_time, status, created_at)
SELECT company_id, category_id, title,
       left(format('%s recrute en %s. %s. %s', company_name, category_name, missions, work_mode), 500),
       format($description$Contexte et enjeux du poste
%1$s

%2$s

À propos de %3$s
%4$s

Dans ce contexte, nous recherchons un profil pour le poste « %5$s ».
%6$s

Votre équipe et votre accompagnement
%7$s
%8$s

Les missions et tâches confiées
%9$s
%10$s

Livrables et suivi des résultats
Les réalisations attendues comprennent %11$s. Le périmètre est précisé avec votre référent au démarrage, puis ajusté selon les résultats et les besoins du projet. Chaque livrable comporte des éléments de vérification, les choix effectués et les points restant à approfondir. Vous présenterez régulièrement l’avancement afin de recueillir les retours de l’équipe avant de poursuivre.

Notre apport et ce que vous allez développer
%12$s
Un parcours d’intégration vous permettra de découvrir les méthodes de l’équipe, les outils utilisés et les interlocuteurs du projet. Vous disposerez de temps pour préparer vos travaux, demander un retour et approfondir les sujets rencontrés. Le partage de connaissances se fait au travers de revues de livrables, de démonstrations et d’échanges avec les collègues expérimentés.

Votre profil
%13$s
Vous souhaitez approfondir les enjeux du domaine « %14$s » et relier vos compétences à des cas d’usage concrets. Vous êtes capable de décrire votre démarche, de vérifier vos résultats et de préciser les limites de ce que vous proposez. Les expériences acquises en formation, dans un projet personnel ou au sein d’une association peuvent également illustrer votre candidature.

Expertise technique et métier attendue
- %15$s.
- Capacité à utiliser les outils suivants dans un travail documenté : %16$s.
- Aptitude à préparer une vérification, à interpréter son résultat et à expliquer un choix de méthode.
- Attention portée à la qualité des informations manipulées et aux procédures de l’équipe.
Compétences appréciées pour aller plus loin :
%17$s
%18$s

Qualités personnelles et collaboration
Vous faites preuve de curiosité et cherchez à comprendre le besoin avant de proposer une solution. Votre rigueur vous permet d’organiser les informations, de vérifier les points importants et de signaler une difficulté avec son contexte. Vous savez travailler de manière autonome sur un périmètre convenu tout en sollicitant un retour lorsque le sujet le nécessite. Vous appréciez les échanges avec des profils différents et savez rédiger des comptes rendus clairs qui facilitent la poursuite du travail collectif.

Langues
Le français est utilisé pour les échanges quotidiens, les ateliers et la rédaction des livrables ; vous devez pouvoir communiquer clairement à l’oral et à l’écrit dans ces situations. L’anglais permet de consulter des ressources professionnelles et la documentation des outils. Selon les projets, vous pourrez préparer une synthèse courte ou échanger avec un partenaire en anglais ; les besoins précis seront présentés lors de l’entretien.

Conditions et organisation
Lieu : %19$s.
%20$s
%21$s
%22$s

Rémunération et avantages
%23$s
Titres-restaurant, prise en charge de 50 %% de l’abonnement de transport et accès aux ressources de formation de l’équipe. Les modalités de prise de poste et d’organisation sont précisées lors des échanges avec le responsable du recrutement.

Déroulement du recrutement
Le parcours comprend un échange de découverte de 30 minutes, un entretien métier avec une mise en situation courte et une rencontre avec l’équipe. La mise en situation permet de discuter votre raisonnement et vos choix ; les critères et le temps attendu vous sont communiqués à l’avance. Un retour vous est transmis à chaque étape. Pour préparer votre candidature, vous pouvez présenter une réalisation liée au métier en précisant votre contribution, la méthode employée et les enseignements tirés.$description$,
           sector_context, sector_challenges, company_name, company_description,
           title, role_context, team_description,
           CASE variant_no
               WHEN 1 THEN 'Vos premières tâches seront préparées avec votre référent. Des points réguliers vous permettront de consolider vos méthodes avant de prendre progressivement davantage d’autonomie.'
               WHEN 2 THEN 'Vous prendrez en charge un périmètre défini avec votre responsable, avec une autonomie attendue dans l’organisation des travaux. Les décisions qui engagent plusieurs équipes feront l’objet d’une revue collective.'
               WHEN 3 THEN 'Vous serez attendu sur les choix de méthode, la résolution des difficultés complexes et l’accompagnement de collègues moins expérimentés. Vous contribuerez à faire évoluer les pratiques de l’équipe et à partager les retours d’expérience.'
               ELSE 'Un tuteur vous accompagnera pendant toute la période et définira une progression adaptée à votre formation. Les objectifs d’apprentissage et les points de suivi seront préparés avec vous ; les travaux seront relus avant leur diffusion.' END,
           detailed_missions,
           CASE variant_no
               WHEN 1 THEN 'Vous commencerez par un sujet délimité, puis élargirez votre contribution au fur et à mesure de votre prise en main des outils et du contexte.'
               WHEN 2 THEN 'Vous organiserez les tâches de votre périmètre et proposerez les ajustements utiles lorsque les besoins ou les contraintes évolueront.'
               WHEN 3 THEN 'Vous contribuerez également à prioriser les améliorations, à revoir les livrables sensibles et à transmettre les méthodes aux autres membres de l’équipe.'
               ELSE 'Les sujets précis seront définis selon vos acquis, vos intérêts et les objectifs de votre école. La progression de l’apprentissage fait partie intégrante de la mission.' END,
           deliverables, learning,
           CASE variant_no
               WHEN 1 THEN format('Vous avez suivi une formation en %s, ou développé des compétences équivalentes par la pratique. Une première expérience, un stage ou un projet significatif vous a permis de mettre en application les bases du métier.', education)
               WHEN 2 THEN format('Vous disposez d’une formation en %s ou d’une expérience équivalente, avec deux à quatre années de pratique du métier. Vous avez déjà mené un sujet jusqu’à sa restitution et savez organiser les échanges nécessaires à son avancement.', education)
               WHEN 3 THEN format('Votre parcours en %s, acquis en formation ou par une expérience équivalente, vous permet de conduire des sujets complexes. Vous pouvez expliquer vos arbitrages et illustrer une contribution à l’amélioration des méthodes ou à l’accompagnement de collègues.', education)
               ELSE CASE contract_type
                   WHEN 'internship' THEN format('Vous êtes en formation en %s et recherchez un stage de six mois conventionné. Votre niveau d’études doit être cohérent avec les missions ; un projet de formation peut servir de point de départ pour présenter vos acquis.', education)
                   ELSE format('Vous préparez une formation en %s et recherchez une alternance de douze mois. Le calendrier et le rythme seront définis avec votre école afin d’articuler les apprentissages et les missions confiées.', education) END END,
           category_name, profile, tools, optional_skills,
           CASE WHEN variant_no = 4 THEN 'Une maîtrise approfondie de tous les outils n’est pas demandée à l’entrée : votre capacité à apprendre, à pratiquer avec méthode et à partager vos questions compte dans l’évaluation.'
                WHEN variant_no = 1 THEN 'Vous n’avez pas besoin de connaître chaque outil de notre environnement. Nous attendons un socle solide et la capacité à progresser avec les retours de l’équipe.'
                ELSE 'Nous attendons que vous puissiez mobiliser les méthodes essentielles du métier ; les outils propres à notre environnement peuvent être approfondis pendant l’intégration.' END,
           location, work_mode,
           CASE working_time WHEN 'part_time' THEN 'Temps partiel : 28 heures par semaine.'
                             ELSE 'Temps plein : 35 heures par semaine.' END,
           CASE contract_type WHEN 'fixed_term' THEN 'CDD de 12 mois.'
                              WHEN 'internship' THEN 'Stage de 6 mois avec convention obligatoire.'
                              WHEN 'apprenticeship' THEN 'Alternance de 12 mois ; rythme à convenir avec votre école.'
                              ELSE 'Contrat à durée indéterminée.' END,
           CASE WHEN salary_min IS NULL AND salary_max IS NULL THEN 'Montant à discuter lors du premier échange.'
                WHEN salary_period = 'month'
                THEN format('De %s à %s EUR bruts par mois pour le temps de travail indiqué.', salary_min, salary_max)
                ELSE format('De %s à %s EUR bruts annuels pour le temps de travail indiqué.', salary_min, salary_max) END),
       location, salary_min, salary_max, salary_period,
       contract_type, working_time, status, created_at
FROM seed_ad_map
ORDER BY job_no, variant_no;

-- 5. PROJETS : trois réalisations par candidat, adaptées à sa spécialité.
-- Certains profils ont une démo sans dépôt public, d’autres un dépôt seul.
CREATE TEMP TABLE seed_project_map ON COMMIT DROP AS
SELECT p.id AS person_id, c.candidate_no, n.project_no,
       CASE n.project_no WHEN 1 THEN 'Projet métier : ' || j.title
                         WHEN 2 THEN 'Tableau de bord : ' || j.category_name
                         ELSE 'Guide pratique : ' || j.category_name END AS title,
       format(E'Projet de %s %s réalisé dans le domaine %s.

Objectif : %s.
Méthode : %s.
Livrables : %s.
Outils : %s.
Le projet comprend une documentation, une démonstration et un bilan des améliorations possibles.',
              c.first_name, c.last_name, j.category_name,
              CASE n.project_no WHEN 1 THEN 'résoudre un besoin concret à partir d’un cas fictif documenté'
                                WHEN 2 THEN 'suivre cinq indicateurs et rendre les résultats compréhensibles'
                                ELSE 'transmettre une méthode reproductible à de nouveaux collègues' END,
              CASE n.project_no WHEN 1 THEN j.missions
                                WHEN 2 THEN 'recueillir les besoins, préparer les données et vérifier la cohérence des résultats'
                                ELSE 'décrire les étapes, préparer les exemples et recueillir les retours de trois utilisateurs' END,
              CASE n.project_no WHEN 1 THEN 'prototype, scénarios de validation et compte rendu de démonstration'
                                WHEN 2 THEN 'tableau de bord, dictionnaire des indicateurs et note d’analyse'
                                ELSE 'guide illustré, exemples pratiques et liste de vérification' END,
              j.tools) AS description,
       CASE WHEN n.project_no = 2 AND c.candidate_no % 4 = 0 THEN NULL
            ELSE format('https://portfolio.example.com/candidat-%s/projet-%s', c.candidate_no, n.project_no) END AS project_url,
       CASE WHEN j.job_no <= 12 OR j.job_no >= 58
            THEN format('https://code.example.com/candidat-%s/projet-%s', c.candidate_no, n.project_no)
            ELSE NULL END AS repository_url,
       CURRENT_TIMESTAMP - (150 + n.project_no * 25 + c.candidate_no % 20) * INTERVAL '1 day' AS created_at
FROM seed_candidates c
JOIN people p ON p.email = c.email
JOIN seed_jobs j ON j.job_no = c.job_no
CROSS JOIN generate_series(1, 3) AS n(project_no);

INSERT INTO projects (person_id, title, description, project_url, repository_url, created_at)
SELECT person_id, title, description, project_url, repository_url, created_at
FROM seed_project_map
ORDER BY candidate_no, project_no;

-- 6. EXPÉRIENCES : stage, première expérience puis poste récent.
-- Les périodes ne se chevauchent pas. Une partie des candidats occupe
-- encore son dernier poste (end_date NULL), les autres l’ont terminé.
CREATE TEMP TABLE seed_experience_map ON COMMIT DROP AS
SELECT p.id AS person_id, c.candidate_no, n.experience_no, company.name AS company_name,
       CASE n.experience_no WHEN 1 THEN 'Stage — ' || j.title
                            WHEN 2 THEN j.title || ' junior'
                            ELSE j.title END AS job_title,
       format(E'Activité en %s.
Missions : %s.
Environnement : %s.
Contribution : %s.
Compétences développées : organisation, communication et résolution de problèmes.',
              j.category_name, j.missions, j.tools,
              CASE n.experience_no WHEN 1 THEN 'réalisation d’un premier livrable accompagné par un tuteur'
                                   WHEN 2 THEN 'prise en charge autonome d’un périmètre et documentation des méthodes'
                                   ELSE 'coordination d’un sujet avec plusieurs interlocuteurs et accompagnement d’un nouveau collègue' END) AS description,
       CASE n.experience_no WHEN 1 THEN (CURRENT_DATE - INTERVAL '5 years')::date
                            WHEN 2 THEN (CURRENT_DATE - INTERVAL '4 years')::date
                            ELSE (CURRENT_DATE - INTERVAL '2 years')::date END AS start_date,
       CASE n.experience_no WHEN 1 THEN (CURRENT_DATE - INTERVAL '4 years 6 months')::date
                            WHEN 2 THEN (CURRENT_DATE - INTERVAL '2 years 1 month')::date
                            ELSE CASE WHEN c.candidate_no % 3 = 0
                                      THEN (CURRENT_DATE - INTERVAL '6 months')::date ELSE NULL END END AS end_date,
       CURRENT_TIMESTAMP - INTERVAL '180 days' AS created_at
FROM seed_candidates c
JOIN people p ON p.email = c.email
JOIN seed_jobs j ON j.job_no = c.job_no
CROSS JOIN generate_series(1, 3) AS n(experience_no)
JOIN seed_category_companies employers ON employers.category_name = j.category_name
JOIN seed_company_map company ON company.name = employers.company_names[1 + ((c.candidate_no + n.experience_no) % 4)];

INSERT INTO experiences (person_id, company_name, job_title, description, start_date, end_date, created_at)
SELECT person_id, company_name, job_title, description, start_date, end_date, created_at
FROM seed_experience_map
ORDER BY candidate_no, experience_no;

-- 7. CANDIDATURES : six offres de la spécialité du candidat.
-- Sélection déterministe ; pas de doublon personne/offre.
-- Les offres fermées conservent des candidatures avec un statut final.
CREATE TEMP TABLE seed_application_map ON COMMIT DROP AS
SELECT p.id AS person_id, c.candidate_no, chosen.ad_id, chosen.title,
       chosen.company_name, chosen.created_at AS ad_created_at,
       chosen.ad_status, chosen.choice_no::integer,
       CASE WHEN chosen.ad_status = 'closed' THEN
                  (ARRAY['accepted', 'rejected'])[1 + ((c.candidate_no + chosen.choice_no)::integer % 2)]
            ELSE (ARRAY['sent', 'in_progress', 'technical_test', 'accepted', 'rejected'])
                 [1 + ((c.candidate_no + chosen.choice_no)::integer % 5)] END AS status
FROM seed_candidates c
JOIN people p ON p.email = c.email
JOIN seed_jobs j ON j.job_no = c.job_no
CROSS JOIN LATERAL (
    SELECT selected.*, row_number() OVER (ORDER BY selected.selection_key, selected.ad_id) AS choice_no
    FROM (
        SELECT a.id AS ad_id, a.title, a.created_at, a.status AS ad_status,
               company.name AS company_name,
               md5(c.email || ':' || a.title) AS selection_key
        FROM ads a
        JOIN companies company ON company.id = a.company_id
        JOIN categories cat ON cat.id = a.category_id
        WHERE cat.name = j.category_name AND a.status IN ('published', 'closed')
        ORDER BY selection_key, a.id
        LIMIT 6
    ) selected
) chosen;

INSERT INTO applications (person_id, ad_id, message, status, created_at)
SELECT m.person_id, m.ad_id,
       format(E'Bonjour à l’équipe %s,

Je souhaite vous proposer ma candidature pour le poste « %s ». Mon parcours en %s m’a permis de développer les compétences suivantes : %s.

J’ai notamment travaillé sur un projet métier et sur un tableau de bord, dont vous trouverez les réalisations sélectionnées dans cette candidature. Mes expériences m’ont appris à documenter mon travail et à collaborer avec des interlocuteurs de profils différents.

Votre offre retient mon attention pour ses missions : %s. Je serais heureux de vous présenter ma démarche et de discuter des besoins de votre équipe.

Je suis disponible pour un premier échange en visioconférence.
Bien cordialement,
%s %s',
              m.company_name, m.title, j.category_name, j.profile, j.missions, c.first_name, c.last_name),
       m.status,
       -- La candidature est toujours postérieure à l’offre et antérieure à maintenant.
       m.ad_created_at + CASE WHEN m.status = 'sent' THEN
                                 CURRENT_TIMESTAMP - m.ad_created_at - INTERVAL '1 day'
                             ELSE (2 + ((m.candidate_no + m.choice_no) % 10)) * INTERVAL '1 day' END
FROM seed_application_map m
JOIN seed_candidates c ON c.candidate_no = m.candidate_no
JOIN seed_jobs j ON j.job_no = c.job_no
ORDER BY m.candidate_no, m.choice_no;

-- 8. PIÈCES JOINTES : un à trois projets/expériences propres au candidat.
-- person_id est obligatoire : les clés étrangères composites garantissent
-- que la candidature et la pièce jointe appartiennent à la même personne.
INSERT INTO application_projects (application_id, project_id, person_id)
SELECT a.id, p.id, a.person_id
FROM seed_application_map m
JOIN applications a ON a.person_id = m.person_id AND a.ad_id = m.ad_id
CROSS JOIN LATERAL (
    SELECT project.id
    FROM projects project
    WHERE project.person_id = a.person_id
    ORDER BY project.created_at DESC, project.id
    LIMIT (1 + m.choice_no % 3)
) p;

INSERT INTO application_experiences (application_id, experience_id, person_id)
SELECT a.id, e.id, a.person_id
FROM seed_application_map m
JOIN applications a ON a.person_id = m.person_id AND a.ad_id = m.ad_id
CROSS JOIN LATERAL (
    SELECT experience.id
    FROM experiences experience
    WHERE experience.person_id = a.person_id
    ORDER BY experience.start_date DESC, experience.id
    LIMIT (1 + (m.choice_no + 1) % 3)
) e;

-- 9. CONTRÔLES : toute incohérence provoque le rollback de la transaction.
DO $checks$
DECLARE
    item RECORD;
    actual_count BIGINT;
BEGIN
    FOR item IN SELECT * FROM (VALUES
        ('people', 122), ('companies', 30), ('categories', 20), ('ads', 240),
        ('projects', 360), ('experiences', 360), ('applications', 720),
        ('application_projects', 1440), ('application_experiences', 1440)
    ) AS expected(table_name, row_count)
    LOOP
        EXECUTE format('SELECT count(*) FROM %I', item.table_name) INTO actual_count;
        IF actual_count <> item.row_count THEN
            RAISE EXCEPTION 'Volume incorrect pour % : % au lieu de %', item.table_name, actual_count, item.row_count;
        END IF;
    END LOOP;

    IF EXISTS (
        SELECT person_id, ad_id FROM applications
        GROUP BY person_id, ad_id HAVING count(*) > 1
    ) THEN RAISE EXCEPTION 'Candidature en double pour une personne et une offre'; END IF;

    IF EXISTS (
        SELECT 1 FROM application_projects link
        JOIN applications a ON a.id = link.application_id
        JOIN projects p ON p.id = link.project_id
        WHERE link.person_id <> a.person_id OR link.person_id <> p.person_id
           OR p.created_at > a.created_at
    ) THEN RAISE EXCEPTION 'Projet joint incohérent : propriétaire ou chronologie'; END IF;

    IF EXISTS (
        SELECT 1 FROM application_experiences link
        JOIN applications a ON a.id = link.application_id
        JOIN experiences e ON e.id = link.experience_id
        WHERE link.person_id <> a.person_id OR link.person_id <> e.person_id
           OR e.created_at > a.created_at
    ) THEN RAISE EXCEPTION 'Expérience jointe incohérente : propriétaire ou chronologie'; END IF;

    IF EXISTS (
        SELECT 1 FROM applications a
        JOIN ads ad ON ad.id = a.ad_id
        JOIN people p ON p.id = a.person_id
        WHERE p.role <> 'USER'
           OR a.created_at < ad.created_at OR a.created_at < p.created_at
           OR a.created_at > CURRENT_TIMESTAMP
           OR (ad.status = 'closed' AND a.status NOT IN ('accepted', 'rejected'))
    ) THEN RAISE EXCEPTION 'Candidature incohérente : offre, rôle, statut ou chronologie'; END IF;

    IF EXISTS (
        SELECT 1 FROM experiences
        WHERE start_date > CURRENT_DATE OR end_date < start_date OR end_date > CURRENT_DATE
    ) OR EXISTS (
        SELECT 1 FROM experiences e1
        JOIN experiences e2 ON e1.person_id = e2.person_id AND e1.id < e2.id
        WHERE daterange(e1.start_date, e1.end_date, '[]') && daterange(e2.start_date, e2.end_date, '[]')
    ) THEN RAISE EXCEPTION 'Dates des expériences incohérentes ou périodes en chevauchement'; END IF;

    IF EXISTS (
        SELECT 1 FROM ads
        WHERE salary_min <= 0 OR salary_max <= 0 OR salary_min > salary_max
           OR (salary_min IS NULL) <> (salary_max IS NULL)
           OR (contract_type IN ('internship', 'apprenticeship') AND salary_period <> 'month')
           OR (contract_type IN ('permanent', 'fixed_term') AND salary_period <> 'year')
           OR length(description) < 4500
    )
    THEN RAISE EXCEPTION 'Offre incomplète ou rémunération invalide'; END IF;

    IF (SELECT count(*) FROM ads WHERE status = 'published') <> 195
       OR (SELECT count(*) FROM ads WHERE status = 'closed') <> 45
    THEN RAISE EXCEPTION 'Répartition incorrecte des statuts des offres'; END IF;

    IF EXISTS (
        SELECT 1 FROM people p LEFT JOIN applications a ON a.person_id = p.id
        WHERE p.role = 'USER' GROUP BY p.id HAVING count(a.id) <> 6
    ) THEN RAISE EXCEPTION 'Chaque candidat doit avoir six candidatures'; END IF;
END;
$checks$;

COMMIT;

-- Récapitulatif affiché par psql après le chargement.
SELECT 'people' AS table_name, count(*) AS total FROM people
UNION ALL SELECT 'companies', count(*) FROM companies
UNION ALL SELECT 'categories', count(*) FROM categories
UNION ALL SELECT 'ads', count(*) FROM ads
UNION ALL SELECT 'projects', count(*) FROM projects
UNION ALL SELECT 'experiences', count(*) FROM experiences
UNION ALL SELECT 'applications', count(*) FROM applications
UNION ALL SELECT 'application_projects', count(*) FROM application_projects
UNION ALL SELECT 'application_experiences', count(*) FROM application_experiences;

SELECT status, count(*) AS total FROM ads GROUP BY status ORDER BY status;
SELECT status, count(*) AS total FROM applications GROUP BY status ORDER BY status;

-- Exemples pour explorer les données :
-- SELECT a.title, c.name AS company, cat.name AS category, a.location,
--        a.salary_min, a.salary_max, a.salary_period
-- FROM ads a JOIN companies c ON c.id = a.company_id
-- JOIN categories cat ON cat.id = a.category_id WHERE a.status = 'published';
--
-- SELECT p.first_name, p.last_name, ad.title, a.status, a.created_at
-- FROM applications a JOIN people p ON p.id = a.person_id
-- JOIN ads ad ON ad.id = a.ad_id WHERE p.email = 'alice.martin@example.com';
--
-- SELECT a.id AS application_id, project.title FROM applications a
-- JOIN application_projects link ON link.application_id = a.id
-- JOIN projects project ON project.id = link.project_id
-- JOIN people p ON p.id = a.person_id WHERE p.email = 'alice.martin@example.com';
