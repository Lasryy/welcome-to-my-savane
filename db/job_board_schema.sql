
-- ============================================
-- MVP - PLATEFORME DE RECRUTEMENT
-- PostgreSQL
-- ============================================


-- ============================================
-- 1. PEOPLE
-- ============================================

CREATE TABLE people (
    id SERIAL PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'USER'
        CHECK (role IN ('USER', 'ADMIN')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (BTRIM(first_name) <> ''),
    CHECK (BTRIM(last_name) <> ''),
    CHECK (email = BTRIM(email) AND email <> '')
);

CREATE UNIQUE INDEX idx_people_email_unique
ON people (LOWER(email));


-- ============================================
-- 2. COMPANIES
-- ============================================

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    location VARCHAR(255),
    logo_url VARCHAR(500),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (BTRIM(name) <> '')
);


-- ============================================
-- 3. CATEGORIES
-- ============================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) UNIQUE NOT NULL,

    CHECK (BTRIM(name) <> '')
);


-- ============================================
-- 4. ADS
-- ============================================

CREATE TABLE ads (
    id SERIAL PRIMARY KEY,

    company_id INTEGER NOT NULL
        REFERENCES companies(id)
        ON DELETE RESTRICT,

    category_id INTEGER
        REFERENCES categories(id)
        ON DELETE SET NULL,

    title VARCHAR(200) NOT NULL,
    short_description VARCHAR(500),
    description TEXT NOT NULL,

    location VARCHAR(255),

    salary_min INTEGER,
    salary_max INTEGER,

    salary_period VARCHAR(10) NOT NULL DEFAULT 'year'
        CHECK (salary_period IN ('month', 'year')),

    contract_type VARCHAR(50)
        CHECK (contract_type IN (
            'internship',
            'apprenticeship',
            'permanent',
            'fixed_term',
            'other'
        )),

    working_time VARCHAR(50)
        CHECK (working_time IN (
            'full_time',
            'part_time'
        )),

    status VARCHAR(30) NOT NULL DEFAULT 'published'
        CHECK (status IN (
            'published',
            'closed'
        )),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (BTRIM(title) <> ''),

    CHECK (
        salary_min IS NULL
        OR salary_min > 0
    ),

    CHECK (
        salary_max IS NULL
        OR salary_max > 0
    ),

    CHECK (
        salary_min IS NULL
        OR salary_max IS NULL
        OR salary_min <= salary_max
    )
);


-- ============================================
-- 5. APPLICATIONS
-- ============================================

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,

    person_id INTEGER NOT NULL
        REFERENCES people(id)
        ON DELETE CASCADE,

    ad_id INTEGER NOT NULL
        REFERENCES ads(id)
        ON DELETE RESTRICT,

    cv_document_id INTEGER,
    submitted_snapshot JSONB,

    message TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'sent'
        CHECK (status IN (
            'sent',
            'in_progress',
            'technical_test',
            'accepted',
            'rejected'
        )),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (person_id, ad_id),
    UNIQUE (id, person_id),
    CONSTRAINT applications_submitted_snapshot_object_check
        CHECK (submitted_snapshot IS NULL OR jsonb_typeof(submitted_snapshot) = 'object')
);


-- ============================================
-- 6. PROJECTS
-- ============================================

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,

    person_id INTEGER NOT NULL
        REFERENCES people(id)
        ON DELETE CASCADE,

    title VARCHAR(200) NOT NULL,
    description TEXT,

    project_url VARCHAR(500),
    repository_url VARCHAR(500),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (BTRIM(title) <> ''),

    UNIQUE (id, person_id)
);


-- ============================================
-- 7. EXPERIENCES
-- ============================================

CREATE TABLE experiences (
    id SERIAL PRIMARY KEY,

    person_id INTEGER NOT NULL
        REFERENCES people(id)
        ON DELETE CASCADE,

    company_name VARCHAR(200) NOT NULL,
    job_title VARCHAR(200) NOT NULL,

    description TEXT,

    start_date DATE,
    end_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (BTRIM(company_name) <> ''),
    CHECK (BTRIM(job_title) <> ''),

    CHECK (
        end_date IS NULL
        OR (
            start_date IS NOT NULL
            AND end_date >= start_date
        )
    ),

    UNIQUE (id, person_id)
);


-- ============================================
-- 8. APPLICATION_PROJECTS
-- ============================================

CREATE TABLE application_projects (
    application_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,

    PRIMARY KEY (application_id, project_id),

    FOREIGN KEY (application_id, person_id)
        REFERENCES applications(id, person_id)
        ON DELETE CASCADE,

    FOREIGN KEY (project_id, person_id)
        REFERENCES projects(id, person_id)
        ON DELETE CASCADE
);


-- ============================================
-- 9. APPLICATION_EXPERIENCES
-- ============================================

CREATE TABLE application_experiences (
    application_id INTEGER NOT NULL,
    experience_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,

    PRIMARY KEY (application_id, experience_id),

    FOREIGN KEY (application_id, person_id)
        REFERENCES applications(id, person_id)
        ON DELETE CASCADE,

    FOREIGN KEY (experience_id, person_id)
        REFERENCES experiences(id, person_id)
        ON DELETE CASCADE
);


-- ============================================
-- 10. CV_DOCUMENTS
-- ============================================
-- CV versions are stored separately from the candidate profile.
CREATE TABLE cv_documents (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL CHECK (BTRIM(original_name) <> ''),
    storage_key VARCHAR(40) UNIQUE NOT NULL
        CHECK (storage_key ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$'),
    mime_type VARCHAR(50) NOT NULL CHECK (mime_type = 'application/pdf'),
    size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (id, person_id)
);

CREATE INDEX idx_cv_documents_person_created
ON cv_documents(person_id, created_at DESC, id DESC);

CREATE UNIQUE INDEX idx_cv_documents_one_current_per_person
ON cv_documents(person_id) WHERE is_current;

-- The composite reference ensures a dossier can only point to its candidate's CV.
ALTER TABLE applications
ADD CONSTRAINT fk_applications_cv_document_owner
FOREIGN KEY (cv_document_id, person_id)
REFERENCES cv_documents(id, person_id)
ON DELETE RESTRICT;

CREATE INDEX idx_applications_cv_document
ON applications(cv_document_id) WHERE cv_document_id IS NOT NULL;

-- ============================================
-- INDEXES
-- ============================================

-- Annonces par entreprise
CREATE INDEX idx_ads_company
ON ads(company_id);

-- Annonces par categorie
CREATE INDEX idx_ads_category
ON ads(category_id);

-- Annonces publiees, triees par date
CREATE INDEX idx_ads_status_created
ON ads(status, created_at DESC);

-- Historique des candidatures d'un utilisateur
CREATE INDEX idx_applications_person_created
ON applications(person_id, created_at DESC);

-- Candidatures pour une annonce
CREATE INDEX idx_applications_ad
ON applications(ad_id);

-- Projets d'un utilisateur
CREATE INDEX idx_projects_person
ON projects(person_id);

-- Experiences d'un utilisateur
CREATE INDEX idx_experiences_person
ON experiences(person_id);

-- Recherche inverse des projets associes
CREATE INDEX idx_application_projects_project
ON application_projects(project_id);

-- Recherche inverse des experiences associees
CREATE INDEX idx_application_experiences_experience
ON application_experiences(experience_id);
