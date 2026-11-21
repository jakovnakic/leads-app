import pool from '../db/pool.js';

export const getScoringParameters = async () => {
  const [configResult, ageRulesResult] = await Promise.all([
    pool.query(`
      SELECT
        new_customer_weight,
        commercial_interest_weight,
        lead_source_weight,
        age_weight,
        version,
        updated_at
      FROM scoring_config
      LIMIT 1
    `),

    pool.query(`
      SELECT id, minimum_days, rating
      FROM age_scoring_rules
      ORDER BY minimum_days ASC
    `),
  ]);

  return {
    weights: configResult.rows[0],
    ageScoringRules: ageRulesResult.rows,
  };
};

export const getScoringConfig = async () => {
  const [scoringParameters, commercialInterestResult, leadSourceResult] =
    await Promise.all([
      getScoringParameters(),

      pool.query(`
      SELECT id, code, label, rating
      FROM commercial_interest_options
      ORDER BY rating DESC
    `),

      pool.query(`
      SELECT id, code, label, rating
      FROM lead_source_options
      ORDER BY rating DESC
    `),
    ]);

  return {
    ...scoringParameters,
    commercialInterestOptions: commercialInterestResult.rows,
    leadSourceOptions: leadSourceResult.rows,
  };
};
