CREATE TABLE people (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    location VARCHAR(255),
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);


CREATE TABLE ads (
    id SERIAL PRIMARY KEY,

    company_id INTEGER NOT NULL
        REFERENCES companies(id),

    category_id INTEGER
        REFERENCES categories(id),

    title VARCHAR(200) NOT NULL,
    short_description VARCHAR(500),
    description TEXT NOT NULL,

    location VARCHAR(255),
    salary INTEGER,

    contract_type VARCHAR(50),
    working_time VARCHAR(50),

    status VARCHAR(30) DEFAULT 'published',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE applications (
    id SERIAL PRIMARY KEY,

    person_id INTEGER NOT NULL
        REFERENCES people(id),

    ad_id INTEGER NOT NULL
        REFERENCES ads(id),

    message TEXT,

    status VARCHAR(30) DEFAULT 'sent',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE projects (
    id SERIAL PRIMARY KEY,

    person_id INTEGER NOT NULL
        REFERENCES people(id)
        ON DELETE CASCADE,

    title VARCHAR(200) NOT NULL,
    description TEXT,

    project_url VARCHAR(500),
    repository_url VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE application_projects (
    application_id INTEGER NOT NULL
        REFERENCES applications(id)
        ON DELETE CASCADE,

    project_id INTEGER NOT NULL
        REFERENCES projects(id)
        ON DELETE CASCADE,

    PRIMARY KEY (application_id, project_id)
);


CREATE TABLE application_experiences (
    application_id INTEGER NOT NULL
        REFERENCES applications(id)
        ON DELETE CASCADE,

    experience_id INTEGER NOT NULL
        REFERENCES experiences(id)
        ON DELETE CASCADE,

    PRIMARY KEY (application_id, experience_id)
);