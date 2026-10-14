-- D5.1: add CV metadata without changing existing accounts or applications.
BEGIN;

CREATE TABLE IF NOT EXISTS cv_documents (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL CHECK (BTRIM(original_name) <> ''),
    storage_key VARCHAR(40) UNIQUE NOT NULL
        CHECK (storage_key ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$'),
    mime_type VARCHAR(50) NOT NULL CHECK (mime_type = 'application/pdf'),
    size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_cv_documents_person_created
ON cv_documents(person_id, created_at DESC, id DESC);

COMMIT;
