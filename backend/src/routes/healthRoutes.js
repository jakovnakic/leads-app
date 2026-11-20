import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');

    res.status(200).json({
      status: 'OK',
      database: 'Connected',
      timestamp: result.rows[0].current_time,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
