import pool from '../db/pool.js';

export const getAllLeads = async () => {
  const result = await pool.query(`
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
    ORDER BY l.created_at DESC, l.id ASC
  `);

  return result.rows;
};

export const getLeadById = async (id) => {
  const result = await pool.query(
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
  );

  return result.rows[0] || null;
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
