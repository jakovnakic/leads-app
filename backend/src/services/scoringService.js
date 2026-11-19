const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// Validate that a rating or weight is an integer between 0 and 100
const isValidPercentage = (value) => {
  return Number.isInteger(value) && value >= 0 && value <= 100;
};

export const calculateLeadScore = (
  lead,
  weights,
  ageScoringRules,
  now = new Date(),
) => {
  // Validate lead data.
  if (!lead || typeof lead !== 'object') {
    throw new Error('Invalid lead data');
  }

  if (typeof lead.is_new_customer !== 'boolean') {
    throw new Error('Invalid new customer value');
  }

  if (!lead.created_at || Number.isNaN(new Date(lead.created_at).getTime())) {
    throw new Error('Invalid lead creation date');
  }

  // Validate that the lead creation date is not in the future.
  const createdAt = new Date(lead.created_at);

  if (createdAt.getTime() > now.getTime()) {
    throw new Error('Lead creation date cannot be in the future');
  }

  // Validate scoring ratings.
  if (!isValidPercentage(lead.commercial_interest_rating)) {
    throw new Error('Invalid commercial interest rating');
  }

  if (!isValidPercentage(lead.lead_source_rating)) {
    throw new Error('Invalid lead source rating');
  }

  // Validate scoring weights.
  if (!weights || typeof weights !== 'object') {
    throw new Error('Invalid scoring weights');
  }

  const weightValues = [
    weights.new_customer_weight,
    weights.commercial_interest_weight,
    weights.lead_source_weight,
    weights.age_weight,
  ];

  if (!weightValues.every(isValidPercentage)) {
    throw new Error('Invalid scoring weights');
  }

  const totalWeight = weightValues.reduce((total, weight) => total + weight, 0);

  if (totalWeight !== 100) {
    throw new Error('Scoring weights must sum to 100');
  }

  // Validate the current date.
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error('Invalid current date');
  }

  // Validate age scoring rules.
  if (!Array.isArray(ageScoringRules) || ageScoringRules.length === 0) {
    throw new Error('Invalid age scoring rules');
  }

  if (
    !ageScoringRules.every(
      (rule) =>
        Number.isInteger(rule?.minimum_days) &&
        rule.minimum_days >= 0 &&
        isValidPercentage(rule.rating),
    )
  ) {
    throw new Error('Invalid age scoring rule');
  }

  const minimumDaysValues = ageScoringRules.map((rule) => rule?.minimum_days);

  if (new Set(minimumDaysValues).size !== minimumDaysValues.length) {
    throw new Error('Duplicate age scoring thresholds');
  }

  // Calculate the lead's age in complete 24-hour periods.
  const ageInDays = Math.floor(
    (now.getTime() - createdAt.getTime()) / DAY_IN_MILLISECONDS,
  );

  // Find the applicable age scoring rule.
  const ageRule = ageScoringRules
    .filter((rule) => rule.minimum_days <= ageInDays)
    .sort((a, b) => b.minimum_days - a.minimum_days)[0];

  if (!ageRule) {
    throw new Error('No applicable age scoring rule found');
  }

  // Determine individual criterion ratings.
  const ratings = {
    newCustomer: lead.is_new_customer ? 100 : 0,
    commercialInterest: lead.commercial_interest_rating,
    leadSource: lead.lead_source_rating,
    age: ageRule.rating,
  };

  // Get the corresponding weights.
  const criterionWeights = {
    newCustomer: weights.new_customer_weight,
    commercialInterest: weights.commercial_interest_weight,
    leadSource: weights.lead_source_weight,
    age: weights.age_weight,
  };

  // Calculate each criterion's contribution.
  const breakdown = {};

  for (const criterion of Object.keys(ratings)) {
    const rating = ratings[criterion];
    const weight = criterionWeights[criterion];

    breakdown[criterion] = {
      rating,
      weight,
      contribution: (rating * weight) / 100,
    };
  }

  // Calculate the final score.
  const score = Object.values(breakdown).reduce(
    (total, criterion) => total + criterion.contribution,
    0,
  );

  // Determine priority.
  let priority;

  if (score >= 75) {
    priority = 'high';
  } else if (score >= 40) {
    priority = 'medium';
  } else {
    priority = 'low';
  }

  return {
    score,
    priority,
    ageInDays,
    breakdown,
  };
};
