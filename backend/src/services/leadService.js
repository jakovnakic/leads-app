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

export const getAllLeads = async ({
  sortBy = 'created_at',
  order = 'desc',
} = {}) => {
  const [leadsResult, scoringParameters] = await Promise.all([
    pool.query(`
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
        l.version
      FROM leads l
      LEFT JOIN agents a
        ON l.assigned_agent_id = a.id
      INNER JOIN commercial_interest_options ci
        ON l.commercial_interest_option_id = ci.id
      INNER JOIN lead_source_options ls
        ON l.lead_source_option_id = ls.id
    `),

    getScoringParameters(),
  ]);

  const leads = leadsResult.rows.map((lead) =>
    addScoringToLead(lead, scoringParameters),
  );

  return leads.sort((a, b) => {
    if (sortBy === 'score') {
      if (order === 'asc') {
        const difference = a.scoring.score - b.scoring.score;

        if (difference !== 0) return difference;
      } else if (order === 'desc') {
        const difference = b.scoring.score - a.scoring.score;

        if (difference !== 0) return difference;
      }
    } else {
      if (order === 'asc') {
        const dateDifference =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

        if (dateDifference !== 0) {
          return dateDifference;
        }
      } else if (order === 'desc') {
        const dateDifference =
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

        if (dateDifference !== 0) {
          return dateDifference;
        }
      }
    }

    // Deterministic tie-breaking: newest first, then UUID ascending.
    const dateDifference =
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return a.id.localeCompare(b.id);
  });
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
