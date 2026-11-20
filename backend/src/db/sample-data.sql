
BEGIN;

-- Insert sample agents.
INSERT INTO agents (name, email)
VALUES
    ('Ana García', 'ana.garcia@example.com'),
    ('Carlos López', 'carlos.lopez@example.com'),
    ('María Fernández', 'maria.fernandez@example.com');


-- Insert sample leads.
INSERT INTO leads (
    name,
    phone,
    status,
    assigned_agent_id,
    is_new_customer,
    commercial_interest_option_id,
    lead_source_option_id
)
VALUES
(
    'Juan García',
    '+34600111222',
    'new',
    (SELECT id FROM agents WHERE email = 'ana.garcia@example.com'),
    TRUE,
    (SELECT id FROM commercial_interest_options WHERE code = 'high'),
    (SELECT id FROM lead_source_options WHERE code = 'referral')
),
(
    'María López',
    '+34600222333',
    'in_progress',
    (SELECT id FROM agents WHERE email = 'carlos.lopez@example.com'),
    FALSE,
    (SELECT id FROM commercial_interest_options WHERE code = 'medium'),
    (SELECT id FROM lead_source_options WHERE code = 'website')
),
(
    'Pedro Martínez',
    '+34600333444',
    'contacted',
    NULL,
    TRUE,
    (SELECT id FROM commercial_interest_options WHERE code = 'low'),
    (SELECT id FROM lead_source_options WHERE code = 'social_media')
),
(
    'Lucía Fernández',
    '+34600444555',
    'new',
    (SELECT id FROM agents WHERE email = 'maria.fernandez@example.com'),
    TRUE,
    (SELECT id FROM commercial_interest_options WHERE code = 'high'),
    (SELECT id FROM lead_source_options WHERE code = 'website')
),
(
    'Carlos Sánchez',
    '+34600555666',
    'closed',
    NULL,
    FALSE,
    (SELECT id FROM commercial_interest_options WHERE code = 'low'),
    (SELECT id FROM lead_source_options WHERE code = 'advertisement')
),
(
    'Ana Rodríguez',
    '+34600666777',
    'in_progress',
    (SELECT id FROM agents WHERE email = 'ana.garcia@example.com'),
    FALSE,
    (SELECT id FROM commercial_interest_options WHERE code = 'high'),
    (SELECT id FROM lead_source_options WHERE code = 'referral')
);

COMMIT;
