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

export const updateScoringConfig = async (configData) => {
  const {
    new_customer_weight,
    commercial_interest_weight,
    lead_source_weight,
    age_weight,
    version,
  } = configData;

  const weights = [
    new_customer_weight,
    commercial_interest_weight,
    lead_source_weight,
    age_weight,
  ];

  if (!Number.isInteger(version) || version < 1) {
    const error = new Error(
      'A valid scoring configuration version is required',
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !weights.every(
      (weight) => Number.isInteger(weight) && weight >= 0 && weight <= 100,
    )
  ) {
    const error = new Error('All weights must be integers between 0 and 100');
    error.statusCode = 400;
    throw error;
  }

  const totalWeight = weights.reduce((total, weight) => total + weight, 0);

  if (totalWeight !== 100) {
    const error = new Error('Scoring weights must add up to exactly 100');
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `
      UPDATE scoring_config
      SET
        new_customer_weight = $1,
        commercial_interest_weight = $2,
        lead_source_weight = $3,
        age_weight = $4,
        version = version + 1,
        updated_at = NOW()
      WHERE version = $5
      RETURNING *
    `,
    [
      new_customer_weight,
      commercial_interest_weight,
      lead_source_weight,
      age_weight,
      version,
    ],
  );

  if (result.rowCount === 0) {
    return { conflict: true };
  }

  return getScoringConfig();
};
