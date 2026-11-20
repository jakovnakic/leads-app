import { randomUUID } from 'node:crypto';
import request from 'supertest';

import app from '../../src/app.js';
import pool from '../../src/db/pool.js';

describe('Lead API integration tests', () => {
  let validLeadData;
  let createdLeadId;

  beforeAll(async () => {
    const [commercialResult, sourceResult] = await Promise.all([
      pool.query('SELECT id FROM commercial_interest_options WHERE code = $1', [
        'high',
      ]),
      pool.query('SELECT id FROM lead_source_options WHERE code = $1', [
        'referral',
      ]),
    ]);

    validLeadData = {
      name: `Integration Test ${randomUUID()}`,
      phone: `+34123456789`,
      status: 'new',
      assigned_agent_id: null,
      is_new_customer: true,
      commercial_interest_option_id: commercialResult.rows[0].id,
      lead_source_option_id: sourceResult.rows[0].id,
    };
  });

  afterEach(async () => {
    if (createdLeadId) {
      await pool.query('DELETE FROM leads WHERE id = $1', [createdLeadId]);

      createdLeadId = null;
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  test('POST /api/leads creates a lead successfully', async () => {
    const response = await request(app).post('/api/leads').send(validLeadData);

    createdLeadId = response.body.id;

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(validLeadData.name);
    expect(response.body.phone).toBe(validLeadData.phone);
    expect(response.body.status).toBe('new');
    expect(response.body.assigned_agent_id).toBeNull();
  });

  test('POST /api/leads returns 400 when the name is missing', async () => {
    const invalidLeadData = {
      ...validLeadData,
      name: '',
    };

    const response = await request(app)
      .post('/api/leads')
      .send(invalidLeadData);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('Error');
    expect(response.body.message).toBe('Name is required');
  });
});
