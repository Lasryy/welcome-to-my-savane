-- ============================================================
-- JOB BOARD - DONNEES DE TEST / SEED MVP
-- Compatible avec le schema MVP simplifie
-- ============================================================

-- ATTENTION : supprime toutes les donnees existantes.
TRUNCATE TABLE
    application_experiences,
    application_projects,
    experiences,
    projects,
    applications,
    ads,
    categories,
    companies,
    people
RESTART IDENTITY CASCADE;

-- ============================================================
-- 1. UTILISATEURS
-- ============================================================
-- password_hash est laisse a NULL pour ce seed.
-- Pour tester le login, creez plutot les comptes via /api/auth/register.

INSERT INTO people (first_name, last_name, email, phone, password_hash, role) VALUES
('Alice', 'Martin', 'alice.martin@example.com', '0611111111', NULL, 'USER'),
('Lucas', 'Bernard', 'lucas.bernard@example.com', '0622222222', NULL, 'USER'),
('Emma', 'Dubois', 'emma.dubois@example.com', '0633333333', NULL, 'USER'),
('Admin', 'JobBoard', 'admin@jobboard.local', '0600000000', NULL, 'ADMIN');

-- ============================================================
-- 2. ENTREPRISES
-- ============================================================

INSERT INTO companies (name, description, website, location, logo_url) VALUES
('NovaTech', 'Startup specialisee dans les applications web et les services cloud.', 'https://novatech.example.com', 'Paris', NULL),
('DataForge', 'Entreprise specialisee dans la data et la BI.', 'https://dataforge.example.com', 'Lyon', NULL),
('CyberShield', 'Societe de conseil en cybersecurite.', 'https://cybershield.example.com', 'Lille', NULL),
('GreenCode', 'Editeur de logiciels et produits numeriques responsables.', 'https://greencode.example.com', 'Bordeaux', NULL);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================

INSERT INTO categories (name) VALUES
('Development'),
('Data'),
('Cybersecurity'),
('DevOps'),
('Design');

-- ============================================================
-- 4. ANNONCES
-- ============================================================

INSERT INTO ads (
    company_id,
    category_id,
    title,
    short_description,
    description,
    location,
    salary,
    contract_type,
    working_time,
    status
) VALUES
(1, 1, 'Developpeur Backend Node.js',
 'Developpement d APIs REST avec Node.js et Express.',
 'Nous recherchons un developpeur backend pour travailler sur nos services Node.js, Express et PostgreSQL.',
 'Paris', 42000, 'CDI', 'FULL_TIME', 'published'),

(1, 1, 'Stage Developpeur React',
 'Stage de 6 mois sur une application SaaS en React.',
 'Tu participeras a la creation de composants React et a l integration des APIs du produit.',
 'Paris', 1200, 'INTERNSHIP', 'FULL_TIME', 'published'),

(2, 2, 'Data Analyst Junior',
 'Analyse de donnees et creation de tableaux de bord.',
 'Tu travailleras avec SQL pour produire des analyses et des indicateurs utiles aux equipes metier.',
 'Lyon', 38000, 'CDI', 'FULL_TIME', 'published'),

(2, 2, 'Stage Data Engineer',
 'Stage autour de PostgreSQL et de pipelines de donnees.',
 'Tu aideras l equipe data a nettoyer, transformer et exploiter differents jeux de donnees.',
 'Lyon', 1100, 'INTERNSHIP', 'FULL_TIME', 'published'),

(3, 3, 'Analyste Cybersecurite',
 'Suivi des incidents et securisation des systemes.',
 'Tu rejoindras notre equipe securite afin d analyser les alertes et participer aux audits.',
 'Lille', 41000, 'CDI', 'FULL_TIME', 'published'),

(4, 1, 'Developpeur Full Stack',
 'Developpement React et Node.js sur une plateforme web.',
 'Tu interviendras sur le frontend React et le backend Express avec une base PostgreSQL.',
 'Bordeaux', 40000, 'CDI', 'FULL_TIME', 'published'),

(4, 4, 'DevOps Junior',
 'Automatisation et conteneurisation Docker.',
 'Tu aideras a maintenir les environnements Docker et les outils de deploiement.',
 'Bordeaux', 39000, 'CDI', 'FULL_TIME', 'published'),

(1, 5, 'UI Designer',
 'Conception d interfaces pour une application SaaS.',
 'Tu travailleras avec l equipe produit sur les maquettes et les parcours utilisateurs.',
 'Paris', 36000, 'CDD', 'FULL_TIME', 'closed');

-- ============================================================
-- 5. CANDIDATURES
-- ============================================================

INSERT INTO applications (person_id, ad_id, message, status) VALUES
(1, 1, 'Bonjour, je souhaite candidater au poste de Developpeur Backend Node.js.', 'interview'),
(1, 3, 'Bonjour, le poste de Data Analyst Junior m interesse beaucoup.', 'sent'),
(2, 6, 'Bonjour, ce poste Full Stack correspond bien a mon profil React et Node.js.', 'technical_test'),
(3, 5, 'Bonjour, je souhaite rejoindre votre equipe cybersecurite.', 'in_progress');

-- ============================================================
-- 6. PROJETS UTILISATEURS
-- ============================================================

INSERT INTO projects (person_id, title, description, project_url, repository_url) VALUES
(1, 'Job Board', 'Application full stack React, Express et PostgreSQL.', 'https://portfolio.example.com/alice/job-board', 'https://github.com/example/alice-job-board'),
(1, 'API E-commerce', 'API REST Node.js pour gerer des produits et commandes.', NULL, 'https://github.com/example/alice-ecommerce-api'),
(1, 'Dashboard SQL', 'Projet d analyse de donnees avec SQL.', 'https://portfolio.example.com/alice/dashboard', NULL),
(2, 'Portfolio React', 'Portfolio personnel construit avec React et Vite.', 'https://lucas.example.com', 'https://github.com/example/lucas-portfolio'),
(2, 'Application de reservation', 'Application full stack React, Express et PostgreSQL.', 'https://portfolio.example.com/lucas/booking-app', 'https://github.com/example/lucas-booking'),
(3, 'Home Lab Cyber', 'Laboratoire personnel autour de la supervision et de la securite.', NULL, 'https://github.com/example/emma-cyber-lab');

-- ============================================================
-- 7. EXPERIENCES UTILISATEURS
-- ============================================================

INSERT INTO experiences (
    person_id,
    company_name,
    job_title,
    description,
    start_date,
    end_date
) VALUES
(1, 'WebFactory', 'Stagiaire Developpeuse Web', 'Developpement backend et correction de bugs.', '2025-04-01', '2025-08-31'),
(1, 'Freelance', 'Developpeuse Full Stack', 'Creation de petits sites web et APIs.', '2025-09-01', NULL),
(2, 'DigitalLab', 'Stagiaire Frontend', 'Creation de composants React et integration d APIs REST.', '2025-02-01', '2025-07-31'),
(3, 'SecureIT', 'Stagiaire Support Securite', 'Participation a la surveillance des alertes et a la documentation des incidents.', '2025-05-01', '2025-09-30');

-- ============================================================
-- 8. PROJETS SELECTIONNES DANS LES CANDIDATURES
-- ============================================================

INSERT INTO application_projects (application_id, project_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 4),
(3, 5),
(4, 6);

-- ============================================================
-- 9. EXPERIENCES SELECTIONNEES DANS LES CANDIDATURES
-- ============================================================

INSERT INTO application_experiences (application_id, experience_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(3, 3),
(4, 4);

-- ============================================================
-- REQUETES DE VERIFICATION
-- ============================================================

-- Voir toutes les annonces publiees :
-- SELECT * FROM ads WHERE status = 'published';

-- Voir les annonces avec leur entreprise :
-- SELECT ads.title, companies.name
-- FROM ads
-- JOIN companies ON ads.company_id = companies.id;

-- Voir les candidatures avec utilisateur + annonce :
-- SELECT
--     applications.id,
--     people.first_name,
--     people.last_name,
--     ads.title,
--     applications.status
-- FROM applications
-- JOIN people ON applications.person_id = people.id
-- JOIN ads ON applications.ad_id = ads.id;

-- Voir les projets envoyes avec la candidature 1 :
-- SELECT projects.title
-- FROM application_projects
-- JOIN projects ON application_projects.project_id = projects.id
-- WHERE application_projects.application_id = 1;

-- Voir les experiences envoyees avec la candidature 1 :
-- SELECT experiences.company_name, experiences.job_title
-- FROM application_experiences
-- JOIN experiences ON application_experiences.experience_id = experiences.id
-- WHERE application_experiences.application_id = 1;
