BEGIN;

CREATE TABLE IF NOT EXISTS favorite_ads (
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (person_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_favorite_ads_person_created
    ON favorite_ads (person_id, created_at DESC);

COMMIT;
