-- D5.2: mark the selected CV without changing prior upload records.
BEGIN;

ALTER TABLE cv_documents
ADD COLUMN IF NOT EXISTS is_current BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cv_documents_one_current_per_person
ON cv_documents(person_id) WHERE is_current;

COMMIT;
