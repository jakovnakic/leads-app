import express from 'express';
import pool from './db/pool.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');

    res.status(200).json({
      status: 'OK',
      database: 'Connected',
      timestamp: result.rows[0].current_time,
    });
  } catch (error) {
    console.error('Database connection failed:', error);

    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
