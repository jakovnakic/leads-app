import pool from '../db/pool.js';

export const getAllAgents = async () => {
  const result = await pool.query(`
    SELECT
      id,
      name,
      email,
      created_at
    FROM agents
    ORDER BY name ASC
  `);

  return result.rows;
};
