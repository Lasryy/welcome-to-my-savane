-- D5.3: reserve nullable fields for the CV version and frozen dossier snapshot.
-- Existing applications stay intact and remain valid with both fields set to NULL.
BEGIN;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS cv_document_id INTEGER;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS submitted_snapshot JSONB;

DO $$
BEGIN
    -- Replace the earlier Lasry-only foreign key when migrating that branch's database.
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'applications_cv_document_owner_fk'
          AND conrelid = 'applications'::regclass
    ) THEN
        ALTER TABLE applications
        DROP CONSTRAINT applications_cv_document_owner_fk;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'applications_submitted_snapshot_object_check'
          AND conrelid = 'applications'::regclass
    ) THEN
        ALTER TABLE applications
        ADD CONSTRAINT applications_submitted_snapshot_object_check
        CHECK (
            submitted_snapshot IS NULL
            OR jsonb_typeof(submitted_snapshot) = 'object'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_applications_cv_document_owner'
          AND conrelid = 'applications'::regclass
    ) THEN
        ALTER TABLE applications
        ADD CONSTRAINT fk_applications_cv_document_owner
        FOREIGN KEY (cv_document_id, person_id)
        REFERENCES cv_documents(id, person_id)
        ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_applications_cv_document
ON applications(cv_document_id) WHERE cv_document_id IS NOT NULL;

COMMIT;
