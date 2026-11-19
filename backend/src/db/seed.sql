BEGIN;

INSERT INTO scoring_config (
    new_customer_weight,
    commercial_interest_weight,
    lead_source_weight,
    age_weight
)
VALUES (40, 30, 20, 10);

INSERT INTO commercial_interest_options (code, label, rating)
VALUES
    ('high', 'Alto', 100),
    ('medium', 'Medio', 50),
    ('low', 'Bajo', 20);

INSERT INTO lead_source_options (code, label, rating)
VALUES
    ('referral', 'Recomendación', 100),
    ('website', 'Página web', 90),
    ('social_media', 'Redes sociales', 80),
    ('advertisement', 'Publicidad', 60);

INSERT INTO age_scoring_rules (minimum_days, rating)
VALUES
    (0, 100),
    (3, 80),
    (10, 50),
    (30, 0);

COMMIT;