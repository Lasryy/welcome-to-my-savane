-- Keep the CV sent with each application, including older profile CVs.
BEGIN;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS cv_document_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'applications_cv_document_owner_fk'
    ) THEN
        ALTER TABLE applications
        ADD CONSTRAINT applications_cv_document_owner_fk
        FOREIGN KEY (cv_document_id, person_id)
        REFERENCES cv_documents(id, person_id)
        ON DELETE SET NULL (cv_document_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_applications_cv_document
ON applications(cv_document_id);

COMMIT;
