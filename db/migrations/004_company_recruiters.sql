BEGIN;

ALTER TABLE people
    ADD COLUMN company_id INTEGER;

ALTER TABLE people
    ADD CONSTRAINT people_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT;

ALTER TABLE people
    DROP CONSTRAINT people_role_check;

ALTER TABLE people
    ADD CONSTRAINT people_role_check
    CHECK (role IN ('USER', 'COMPANY', 'ADMIN'));

ALTER TABLE people
    ADD CONSTRAINT people_company_role_check
    CHECK ((role = 'COMPANY') = (company_id IS NOT NULL));

CREATE INDEX idx_people_company_id ON people(company_id) WHERE company_id IS NOT NULL;

COMMIT;
