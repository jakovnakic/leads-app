import { describe, expect, test } from '@jest/globals';
import { calculateLeadScore } from './scoringService.js';

const getPriorityForScore = (commercialInterestRating) => {
  const lead = {
    created_at: '2026-11-19T12:00:00.000Z',
    is_new_customer: false,
    commercial_interest_rating: commercialInterestRating,
    lead_source_rating: 0,
  };

  const weights = {
    new_customer_weight: 0,
    commercial_interest_weight: 100,
    lead_source_weight: 0,
    age_weight: 0,
  };

  const ageScoringRules = [{ minimum_days: 0, rating: 100 }];

  const result = calculateLeadScore(
    lead,
    weights,
    ageScoringRules,
    new Date('2026-11-19T12:00:00.000Z'),
  );

  return result.priority;
};

const getAgeRating = (ageInDays) => {
  const now = new Date('2026-11-19T12:00:00.000Z');

  const lead = {
    created_at: new Date(now.getTime() - ageInDays * 24 * 60 * 60 * 1000),
    is_new_customer: false,
    commercial_interest_rating: 0,
    lead_source_rating: 0,
  };

  const weights = {
    new_customer_weight: 0,
    commercial_interest_weight: 0,
    lead_source_weight: 0,
    age_weight: 100,
  };

  const ageScoringRules = [
    { minimum_days: 0, rating: 100 },
    { minimum_days: 3, rating: 80 },
    { minimum_days: 10, rating: 50 },
    { minimum_days: 30, rating: 0 },
  ];

  return calculateLeadScore(lead, weights, ageScoringRules, now);
};

const getValidScoringInputs = () => ({
  lead: {
    created_at: '2026-11-19T12:00:00.000Z',
    is_new_customer: true,
    commercial_interest_rating: 50,
    lead_source_rating: 80,
  },
  weights: {
    new_customer_weight: 40,
    commercial_interest_weight: 30,
    lead_source_weight: 20,
    age_weight: 10,
  },
  ageScoringRules: [{ minimum_days: 0, rating: 100 }],
  now: new Date('2026-11-19T12:00:00.000Z'),
});

describe('calculateLeadScore', () => {
  test('calculates the lead score correctly', () => {
    const lead = {
      created_at: '2026-11-09T12:00:00.000Z',
      is_new_customer: true,
      commercial_interest_rating: 50,
      lead_source_rating: 80,
    };

    const weights = {
      new_customer_weight: 40,
      commercial_interest_weight: 30,
      lead_source_weight: 20,
      age_weight: 10,
    };

    const ageScoringRules = [
      { minimum_days: 0, rating: 100 },
      { minimum_days: 3, rating: 80 },
      { minimum_days: 10, rating: 50 },
      { minimum_days: 30, rating: 0 },
    ];

    const now = new Date('2026-11-19T12:00:00.000Z');

    const result = calculateLeadScore(lead, weights, ageScoringRules, now);

    expect(result.score).toBe(76);
    expect(result.priority).toBe('high');
    expect(result.ageInDays).toBe(10);

    expect(result.breakdown).toEqual({
      newCustomer: {
        rating: 100,
        weight: 40,
        contribution: 40,
      },
      commercialInterest: {
        rating: 50,
        weight: 30,
        contribution: 15,
      },
      leadSource: {
        rating: 80,
        weight: 20,
        contribution: 16,
      },
      age: {
        rating: 50,
        weight: 10,
        contribution: 5,
      },
    });
  });

  test('assigns high priority when the score is exactly 75', () => {
    expect(getPriorityForScore(75)).toBe('high');
  });

  test('assigns medium priority when the score is below 75', () => {
    expect(getPriorityForScore(74)).toBe('medium');
  });

  test('assigns medium priority when the score is exactly 40', () => {
    expect(getPriorityForScore(40)).toBe('medium');
  });

  test('assigns low priority when the score is below 40', () => {
    expect(getPriorityForScore(39)).toBe('low');
  });

  test('gives an age rating of 100 for a lead that is 0 days old', () => {
    expect(getAgeRating(0).score).toBe(100);
  });

  test('keeps an age rating of 100 for a lead that is 2 days old', () => {
    expect(getAgeRating(2).score).toBe(100);
  });

  test('changes the age rating to 80 at 3 days', () => {
    expect(getAgeRating(3).score).toBe(80);
  });

  test('keeps an age rating of 80 at 9 days', () => {
    expect(getAgeRating(9).score).toBe(80);
  });

  test('changes the age rating to 50 at 10 days', () => {
    expect(getAgeRating(10).score).toBe(50);
  });

  test('changes the age rating to 0 at 30 days', () => {
    expect(getAgeRating(30).score).toBe(0);
  });

  test('throws an error when commercial interest rating is missing', () => {
    const lead = {
      created_at: '2026-11-19T12:00:00.000Z',
      is_new_customer: true,
      lead_source_rating: 80,
    };

    const weights = {
      new_customer_weight: 40,
      commercial_interest_weight: 30,
      lead_source_weight: 20,
      age_weight: 10,
    };

    const ageScoringRules = [{ minimum_days: 0, rating: 100 }];

    expect(() =>
      calculateLeadScore(
        lead,
        weights,
        ageScoringRules,
        new Date('2026-11-19T12:00:00.000Z'),
      ),
    ).toThrow('Invalid commercial interest rating');
  });

  test('throws an error when lead source rating is missing', () => {
    const inputs = getValidScoringInputs();
    delete inputs.lead.lead_source_rating;

    expect(() =>
      calculateLeadScore(
        inputs.lead,
        inputs.weights,
        inputs.ageScoringRules,
        inputs.now,
      ),
    ).toThrow('Invalid lead source rating');
  });

  test('throws an error when scoring weights do not sum to 100', () => {
    const inputs = getValidScoringInputs();
    inputs.weights.age_weight = 5;

    expect(() =>
      calculateLeadScore(
        inputs.lead,
        inputs.weights,
        inputs.ageScoringRules,
        inputs.now,
      ),
    ).toThrow('Scoring weights must sum to 100');
  });

  test('throws an error when an age scoring rule has an invalid rating', () => {
    const inputs = getValidScoringInputs();
    inputs.ageScoringRules[0].rating = 150;

    expect(() =>
      calculateLeadScore(
        inputs.lead,
        inputs.weights,
        inputs.ageScoringRules,
        inputs.now,
      ),
    ).toThrow('Invalid age scoring rule');
  });

  test('throws an error when lead creation date is invalid', () => {
    const inputs = getValidScoringInputs();
    inputs.lead.created_at = 'invalid-date';

    expect(() =>
      calculateLeadScore(
        inputs.lead,
        inputs.weights,
        inputs.ageScoringRules,
        inputs.now,
      ),
    ).toThrow('Invalid lead creation date');
  });
});
