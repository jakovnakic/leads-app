CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(300) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(300) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    is_new_customer BOOLEAN NOT NULL,
    commercial_interest_option_id UUID NOT NULL,
    lead_source_option_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT leads_status_check
        CHECK (status IN ('new', 'in_progress', 'contacted', 'closed')),

    CONSTRAINT leads_version_check
        CHECK (version >= 1)
);

CREATE TABLE scoring_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    new_customer_weight INTEGER NOT NULL,
    commercial_interest_weight INTEGER NOT NULL,
    lead_source_weight INTEGER NOT NULL,
    age_weight INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT scoring_config_weights_check
        CHECK (
            new_customer_weight >= 0
            AND commercial_interest_weight >= 0
            AND lead_source_weight >= 0
            AND age_weight >= 0
            AND new_customer_weight
                + commercial_interest_weight
                + lead_source_weight
                + age_weight = 100
        ),

    CONSTRAINT scoring_config_version_check
        CHECK (version >= 1)
);

CREATE TABLE commercial_interest_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(200) NOT NULL,
    rating INTEGER NOT NULL,

    CONSTRAINT commercial_interest_rating_check
        CHECK (rating BETWEEN 0 AND 100)
);

CREATE TABLE lead_source_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(200) NOT NULL,
    rating INTEGER NOT NULL,

    CONSTRAINT lead_source_rating_check
        CHECK (rating BETWEEN 0 AND 100)
);

CREATE TABLE age_scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    minimum_days INTEGER NOT NULL UNIQUE,
    rating INTEGER NOT NULL,

    CONSTRAINT age_scoring_minimum_days_check
        CHECK (minimum_days >= 0),

    CONSTRAINT age_scoring_rating_check
        CHECK (rating BETWEEN 0 AND 100)
);

ALTER TABLE leads
    ADD CONSTRAINT leads_commercial_interest_fk
        FOREIGN KEY (commercial_interest_option_id)
        REFERENCES commercial_interest_options(id),

    ADD CONSTRAINT leads_source_fk
        FOREIGN KEY (lead_source_option_id)
        REFERENCES lead_source_options(id);

CREATE UNIQUE INDEX scoring_config_single_row_idx
    ON scoring_config ((TRUE));

CREATE INDEX leads_status_idx
    ON leads(status);

CREATE INDEX leads_assigned_agent_idx
    ON leads(assigned_agent_id);

CREATE INDEX leads_created_at_idx
    ON leads(created_at);

CREATE INDEX leads_commercial_interest_idx
    ON leads(commercial_interest_option_id);

CREATE INDEX leads_source_idx
    ON leads(lead_source_option_id);