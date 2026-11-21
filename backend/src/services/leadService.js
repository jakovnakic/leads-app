import pool from '../db/pool.js';
import { calculateLeadScore } from './scoringService.js';
import { getScoringParameters } from './scoringConfigService.js';

const addScoringToLead = (lead, scoringParameters) => {
  const scoring = calculateLeadScore(
    lead,
    scoringParameters.weights,
    scoringParameters.ageScoringRules,
  );

  return {
    ...lead,
    scoring,
  };
};

const sortColumns = {
  score: 'score',
  created_at: 'created_at',
};

const sortDirections = {
  asc: 'ASC',
  desc: 'DESC',
};

export const getAllLeads = async ({
  status = null,
  agentId = null,
  search = null,
  sortBy = 'created_at',
  order = 'desc',
  page = 1,
  limit = 20,
} = {}) => {
  const sortColumn = sortColumns[sortBy];
  const sortDirection = sortDirections[order];

  const orderBy =
    sortBy === 'score'
      ? `${sortColumn} ${sortDirection}, created_at DESC, id ASC`
      : `${sortColumn} ${sortDirection}, id ASC`;

  const offset = (page - 1) * limit;

  const leadsResult = await pool.query(
    `
      WITH lead_data AS (
    SELECT
        l.id,
        l.name,
        l.phone,
        l.status,
        l.assigned_agent_id,
        a.name AS assigned_agent_name,
        l.is_new_customer,
        ci.rating AS commercial_interest_rating,
        ls.rating AS lead_source_rating,
        l.created_at,
        l.updated_at,
        l.version,

        sc.new_customer_weight,
        sc.commercial_interest_weight,
        sc.lead_source_weight,
        sc.age_weight,

        FLOOR(
            EXTRACT(EPOCH FROM (NOW() - l.created_at)) / 86400
        )::INTEGER AS age_in_days,

        age_rule.rating AS age_rating

    FROM leads l

    LEFT JOIN agents a
        ON l.assigned_agent_id = a.id

    INNER JOIN commercial_interest_options ci
        ON l.commercial_interest_option_id = ci.id

    INNER JOIN lead_source_options ls
        ON l.lead_source_option_id = ls.id

    CROSS JOIN scoring_config sc

    CROSS JOIN LATERAL (
        SELECT rating
        FROM age_scoring_rules
        WHERE minimum_days <= FLOOR(
            EXTRACT(EPOCH FROM (NOW() - l.created_at)) / 86400
        )
        ORDER BY minimum_days DESC
        LIMIT 1
    ) age_rule
), scored_leads AS (
    SELECT
        *,

        (CASE WHEN is_new_customer THEN 100 ELSE 0 END
            * new_customer_weight / 100.0) AS new_customer_contribution,

        (commercial_interest_rating
            * commercial_interest_weight / 100.0) AS commercial_interest_contribution,

        (lead_source_rating
            * lead_source_weight / 100.0) AS lead_source_contribution,

        (age_rating
            * age_weight / 100.0) AS age_contribution

    FROM lead_data
), lead_scores AS (
    SELECT
        *,
        (
            new_customer_contribution
            + commercial_interest_contribution
            + lead_source_contribution
            + age_contribution
        ) AS score,

        JSONB_BUILD_OBJECT(
            'newCustomer', JSONB_BUILD_OBJECT(
                'rating', CASE WHEN is_new_customer THEN 100 ELSE 0 END,
                'weight', new_customer_weight,
                'contribution', new_customer_contribution
            ),
            'commercialInterest', JSONB_BUILD_OBJECT(
                'rating', commercial_interest_rating,
                'weight', commercial_interest_weight,
                'contribution', commercial_interest_contribution
            ),
            'leadSource', JSONB_BUILD_OBJECT(
                'rating', lead_source_rating,
                'weight', lead_source_weight,
                'contribution', lead_source_contribution
            ),
            'age', JSONB_BUILD_OBJECT(
                'rating', age_rating,
                'weight', age_weight,
                'contribution', age_contribution
            )
        ) AS breakdown

    FROM scored_leads
), final_scores AS (
  SELECT
    *,
    CASE
        WHEN score >= 75 THEN 'high'
        WHEN score >= 40 THEN 'medium'
        ELSE 'low'
    END AS priority
  FROM lead_scores
), filtered_leads AS (
    SELECT *
    FROM final_scores
    WHERE
        ($1::VARCHAR IS NULL OR status = $1)
          AND ($2::UUID IS NULL OR assigned_agent_id = $2)
          AND (
              $3::VARCHAR IS NULL
              OR name ILIKE '%' || $3 || '%'
              OR phone ILIKE '%' || $3 || '%'
          )
), total_count AS (
    SELECT COUNT(*) AS total
    FROM filtered_leads
),
paginated_leads AS (
    SELECT *
    FROM filtered_leads
    ORDER BY ${orderBy}
    LIMIT $4
    OFFSET $5
)
    SELECT
    total_count.total,
    COALESCE(
        JSONB_AGG(
            TO_JSONB(paginated_leads)
            ORDER BY ${orderBy}
        ) FILTER (WHERE paginated_leads.id IS NOT NULL),
        '[]'::JSONB
    ) AS data
FROM total_count
LEFT JOIN paginated_leads ON TRUE
GROUP BY total_count.total;
    `,
    [status, agentId, search, limit, offset],
  );

  return {
    data: leadsResult.rows[0].data,
    pagination: {
      page,
      limit,
      total: Number(leadsResult.rows[0].total),
      totalPages: Math.ceil(Number(leadsResult.rows[0].total) / limit),
    },
  };
};

export const getLeadById = async (id) => {
  const [result, scoringParameters] = await Promise.all([
    pool.query(
      `
        SELECT
          l.id,
          l.name,
          l.phone,
          l.status,
          l.assigned_agent_id,
          a.name AS assigned_agent_name,
          l.is_new_customer,
          l.commercial_interest_option_id,
          ci.rating AS commercial_interest_rating,
          l.lead_source_option_id,
          ls.rating AS lead_source_rating,
          l.created_at,
          l.updated_at,
          l.version
        FROM leads l
        LEFT JOIN agents a
          ON l.assigned_agent_id = a.id
        INNER JOIN commercial_interest_options ci
          ON l.commercial_interest_option_id = ci.id
        INNER JOIN lead_source_options ls
          ON l.lead_source_option_id = ls.id
        WHERE l.id = $1
      `,
      [id],
    ),

    getScoringParameters(),
  ]);

  const lead = result.rows[0];

  if (!lead) {
    return null;
  }

  return addScoringToLead(lead, scoringParameters);
};

export const createLead = async (leadData) => {
  const {
    name,
    phone,
    status,
    assigned_agent_id,
    is_new_customer,
    commercial_interest_option_id,
    lead_source_option_id,
  } = leadData;

  const result = await pool.query(
    `
      INSERT INTO leads (
        name,
        phone,
        status,
        assigned_agent_id,
        is_new_customer,
        commercial_interest_option_id,
        lead_source_option_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
    [
      name.trim(),
      phone.trim(),
      status,
      assigned_agent_id,
      is_new_customer,
      commercial_interest_option_id,
      lead_source_option_id,
    ],
  );

  const newLeadId = result.rows[0].id;

  return getLeadById(newLeadId);
};
